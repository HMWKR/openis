import { GoogleGenAI, Type } from "@google/genai";
import { VoiceIntent } from '../types';

// API 키가 없으면 null로 설정 (앱은 계속 작동, 음성 인식만 비활성화)
const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const parseVoiceCommand = async (transcript: string): Promise<VoiceIntent> => {
  // API 키가 없으면 기본 키워드 매칭으로 폴백
  if (!ai) {
    return fallbackParse(transcript);
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `User said: "${transcript}".
      Identify the intent for a coffee ordering app for seniors.

      Menu items are: "아메리카노" (Americano), "카페라떼" (Latte), "유자차" (Citron Tea), "쌍화차" (Ssanghwa Tea).

      Intent types:
      - "ADD_ORDER": User wants to order/buy something (e.g., "아메리카노 주세요", "커피 한잔")
      - "CHECKOUT": User wants to pay/checkout/finish (e.g., "결제해줘", "계산", "주문 완료")
      - "SELECT_HOT": User wants hot temperature (e.g., "따뜻한거", "핫으로", "뜨거운거")
      - "SELECT_ICE": User wants cold temperature (e.g., "차가운거", "아이스로", "시원한거")
      - "ADD_TO_CART": User wants to add current item to cart (e.g., "담아줘", "장바구니에 넣어", "이걸로")
      - "GO_BACK": User wants to go back (e.g., "뒤로가기", "메뉴로", "돌아가기", "취소")
      - "UNKNOWN": Cannot determine intent

      For "ADD_ORDER", extract the item name (normalize to korean menu name) and temperature (Hot or Ice) if mentioned.
      Default temperature is Hot if not specified.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING, enum: ["ADD_ORDER", "CHECKOUT", "SELECT_HOT", "SELECT_ICE", "ADD_TO_CART", "GO_BACK", "UNKNOWN"] },
            item: { type: Type.STRING, nullable: true },
            temperature: { type: Type.STRING, enum: ["Hot", "Ice"], nullable: true }
          },
          required: ["action"]
        }
      }
    });

    const text = response.text;
    if (!text) return { action: 'UNKNOWN' };

    return JSON.parse(text) as VoiceIntent;
  } catch {
    return fallbackParse(transcript);
  }
};

// API 키 없을 때 기본 키워드 매칭 (폴백)
const fallbackParse = (transcript: string): VoiceIntent => {
  const text = transcript.toLowerCase();

  // 결제/주문완료
  if (text.includes('결제') || text.includes('계산') || text.includes('주문 완료') || text.includes('끝')) {
    return { action: 'CHECKOUT' };
  }

  // 뒤로가기
  if (text.includes('뒤로') || text.includes('취소') || text.includes('돌아가')) {
    return { action: 'GO_BACK' };
  }

  // 온도 선택
  if (text.includes('따뜻') || text.includes('뜨거') || text.includes('핫')) {
    return { action: 'SELECT_HOT' };
  }
  if (text.includes('차가') || text.includes('아이스') || text.includes('시원')) {
    return { action: 'SELECT_ICE' };
  }

  // 장바구니 담기
  if (text.includes('담아') || text.includes('장바구니') || text.includes('이걸로')) {
    return { action: 'ADD_TO_CART' };
  }

  // 메뉴 주문
  const menuItems = [
    { keywords: ['아메리카노', '아메리', '커피'], name: '아메리카노' },
    { keywords: ['라떼', '카페라떼', '라테'], name: '카페라떼' },
    { keywords: ['유자', '유자차'], name: '유자차' },
    { keywords: ['쌍화', '쌍화차'], name: '쌍화차' },
  ];

  for (const menu of menuItems) {
    if (menu.keywords.some(k => text.includes(k))) {
      const isIce = text.includes('아이스') || text.includes('차가') || text.includes('시원');
      return {
        action: 'ADD_ORDER',
        item: menu.name,
        temperature: isIce ? 'Ice' : 'Hot'
      };
    }
  }

  return { action: 'UNKNOWN' };
};