import { GoogleGenAI, Type } from "@google/genai";
import { VoiceIntent } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseVoiceCommand = async (transcript: string): Promise<VoiceIntent> => {
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
  } catch (error) {
    console.error("Gemini Parse Error:", error);
    return { action: 'UNKNOWN' };
  }
};