import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, ArrowLeft, Trash2, XCircle } from 'lucide-react';
import { AppState, MenuItem, CartItem } from './types';
import { speak, startListening } from './services/voiceService';
import { parseVoiceCommand } from './services/geminiService';
import { generateOrderNumber } from './utils/orderUtils';
import { logger } from './utils/logger';
import VoiceButton from './components/VoiceButton';
import MenuCard from './components/MenuCard';
import MenuDetailPage from './components/MenuDetailPage';
import OrderReceipt from './components/OrderReceipt';

// Mock Data
const MENU_ITEMS: MenuItem[] = [
  { id: '1', name: '아메리카노', price: 3000, imageUrl: 'https://picsum.photos/400/400?random=1', description: '진한 에스프레소와 물의 깔끔한 조화' },
  { id: '2', name: '카페라떼', price: 3500, imageUrl: 'https://picsum.photos/400/400?random=2', description: '부드러운 우유와 에스프레소의 조화' },
  { id: '3', name: '유자차', price: 4000, imageUrl: 'https://picsum.photos/400/400?random=3', description: '달콤하고 상큼한 유자의 향기' },
  { id: '4', name: '쌍화차', price: 5000, imageUrl: 'https://picsum.photos/400/400?random=4', description: '건강에 좋은 전통 한방차', isSoldOut: true },
];

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [soldOutAlert, setSoldOutAlert] = useState<string | null>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [completedOrder, setCompletedOrder] = useState<CartItem[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  // --- Landing / Camera Logic ---
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (appState === AppState.LANDING) {
      // Start Camera
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => logger.warn("Camera access denied or unavailable", { error: err?.message }));

      // Simulate Face Detection Delay (2 seconds)
      timeout = setTimeout(() => {
        setAppState(AppState.MENU);
        speak("안녕하세요. 시니어 모드로 주문을 도와드릴게요. 무엇을 드시겠어요?");
        // Stop all tracks to release camera
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }
      }, 2500);
    }
    return () => clearTimeout(timeout);
  }, [appState]);

  // --- Voice Logic ---
  const handleVoiceButtonClick = () => {
    if (isListening || isProcessing) return;

    setIsListening(true);
    startListening(
      async (transcript) => {
        setIsListening(false);
        setIsProcessing(true);
        logger.debug("Voice transcript received", { transcript });

        // Use Gemini to understand intent
        const intent = await parseVoiceCommand(transcript);
        logger.debug("Parsed intent", { action: intent.action });

        if (intent.action === 'ADD_ORDER' && intent.item) {
          // Find item in menu
          const foundItem = MENU_ITEMS.find(m => m.name.includes(intent.item!) || intent.item!.includes(m.name));
          
          if (foundItem) {
            if (foundItem.isSoldOut) {
               speak(`죄송합니다. ${foundItem.name}는 다 팔렸습니다.`);
               // Trigger Visual Alert
               setSoldOutAlert(foundItem.name);
               setTimeout(() => setSoldOutAlert(null), 3000);
            } else {
              addToCart(foundItem, intent.temperature);
              speak(`${intent.temperature === 'Ice' ? '차가운' : '따뜻한'} ${foundItem.name}를 담았습니다. 더 필요하시면 말씀해주세요.`);
            }
          } else {
             speak("메뉴를 찾지 못했습니다. 다시 말씀해 주세요.");
          }
        } else if (intent.action === 'CHECKOUT') {
           if (cart.length > 0) {
             const newOrderNumber = generateOrderNumber();
             setOrderNumber(newOrderNumber);
             setCompletedOrder([...cart]);
             setAppState(AppState.SUCCESS);
             speak(`주문이 완료되었습니다. 주문번호는 ${newOrderNumber}번입니다.`);
           } else {
             speak("장바구니가 비어있습니다. 메뉴를 먼저 골라주세요.");
           }
        } else {
          speak("잘 못 들었습니다. 다시 말씀해 주세요.");
        }
        
        setIsProcessing(false);
      },
      () => {
        // On End / Error
        setIsListening(false);
        setIsProcessing(false);
      }
    );
  };

  const addToCart = (item: MenuItem, temp: 'Hot' | 'Ice' = 'Hot') => {
    setCart(prev => [...prev, { ...item, quantity: 1, temperature: temp }]);
  };

  const removeFromCart = (index: number) => {
    const item = cart[index];
    speak(`${item.name}를 뺐습니다.`);
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = () => cart.reduce((acc, item) => acc + item.price, 0);

  // --- Renderers ---
  
  if (appState === AppState.LANDING) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-stone-950 relative overflow-hidden">
         <video
           ref={videoRef}
           autoPlay
           playsInline
           muted
           className="absolute inset-0 w-full h-full object-cover opacity-60"
         />
         <div className="z-10 bg-amber-500 text-stone-900 px-8 py-6 rounded-3xl shadow-2xl animate-bounce">
           <h1 className="text-4xl font-bold text-center">얼굴 인식 중...</h1>
         </div>
         <p className="z-10 mt-8 text-2xl text-stone-50 font-bold drop-shadow-md">
           고객님을 인식하고 있습니다.
         </p>
      </div>
    );
  }

  // CART VIEW STATE
  if (appState === AppState.CART_VIEW) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col pb-6 relative">
        <header className="sticky top-0 z-40 bg-stone-800 border-b-4 border-amber-500 p-6 flex items-center shadow-lg">
          <button
            onClick={() => {
              speak("메뉴판으로 돌아갑니다.");
              setAppState(AppState.MENU);
            }}
            className="mr-4 p-2 rounded-xl active:bg-stone-700"
          >
            <ArrowLeft className="w-10 h-10 text-stone-50" />
          </button>
          <h1 className="text-4xl font-extrabold text-stone-50">장바구니</h1>
        </header>

        <main className="flex-1 p-4 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6 mt-20">
              <ShoppingCart className="w-32 h-32 text-stone-600" />
              <p className="text-3xl text-stone-400">담은 메뉴가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item, idx) => (
                <div key={idx} className="bg-stone-800 rounded-3xl p-4 flex items-center border-2 border-stone-600">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-stone-500"
                  />
                  <div className="ml-4 flex-1">
                    <h3 className="text-3xl font-bold text-stone-50 mb-1">{item.name}</h3>
                    <div className="flex items-center space-x-2 text-xl text-stone-300">
                      <span className={`px-2 py-1 rounded-lg font-bold ${item.temperature === 'Ice' ? 'bg-sky-900 text-sky-300' : 'bg-orange-900 text-orange-300'}`}>
                        {item.temperature === 'Ice' ? '차가운것' : '따뜻한것'}
                      </span>
                      <span>{item.price.toLocaleString()}원</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(idx)}
                    className="p-4 bg-stone-700 rounded-2xl active:bg-red-900 ml-2"
                    aria-label={`${item.name} 삭제`}
                  >
                    <Trash2 className="w-8 h-8 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>

        <div className="sticky bottom-0 bg-stone-900 p-6 border-t-2 border-stone-700 space-y-4">
           <div className="flex justify-between items-center text-3xl font-bold text-stone-50 mb-2">
             <span>총 결제금액</span>
             <span className="text-amber-400 text-4xl">{calculateTotal().toLocaleString()}원</span>
           </div>

           <div className="grid grid-cols-2 gap-4 h-24">
             <button
               onClick={() => {
                 speak("메뉴를 더 고르러 갑니다.");
                 setAppState(AppState.MENU);
               }}
               className="bg-stone-700 text-stone-50 rounded-2xl text-2xl font-bold active:scale-95 transition-transform"
             >
               더 담기
             </button>
             <button
               onClick={() => {
                 if (cart.length === 0) {
                   speak("메뉴를 먼저 담아주세요.");
                   return;
                 }
                 const newOrderNumber = generateOrderNumber();
                 setOrderNumber(newOrderNumber);
                 setCompletedOrder([...cart]);
                 setAppState(AppState.SUCCESS);
                 speak(`결제가 완료되었습니다. 주문번호는 ${newOrderNumber}번입니다.`);
               }}
               className={`rounded-2xl text-2xl font-bold text-stone-900 active:scale-95 transition-transform ${cart.length === 0 ? 'bg-stone-500' : 'bg-amber-500'}`}
               disabled={cart.length === 0}
             >
               결제하기
             </button>
           </div>
        </div>
      </div>
    );
  }

  if (appState === AppState.SUCCESS && orderNumber) {
    return (
      <OrderReceipt
        orderNumber={orderNumber}
        cart={completedOrder}
        onReturnHome={() => {
          setCart([]);
          setCompletedOrder([]);
          setOrderNumber(null);
          setAppState(AppState.MENU);
        }}
      />
    );
  }

  // MENU_DETAIL STATE
  if (appState === AppState.MENU_DETAIL && selectedMenuItem) {
    return (
      <MenuDetailPage
        item={selectedMenuItem}
        onAddToCart={(item, temperature) => {
          addToCart(item, temperature);
          setSelectedMenuItem(null);
          setAppState(AppState.MENU);
        }}
        onBack={() => {
          setSelectedMenuItem(null);
          setAppState(AppState.MENU);
        }}
      />
    );
  }

  // MENU STATE
  return (
    <div className="min-h-screen pb-40 bg-stone-900 relative">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-stone-800 border-b-4 border-amber-500 p-6 flex justify-between items-center shadow-lg">
        <h1 className="text-4xl font-extrabold text-stone-50">주문하기</h1>
        <div
          onClick={() => {
            speak("장바구니를 확인합니다.");
            setAppState(AppState.CART_VIEW);
          }}
          className="flex items-center space-x-2 bg-stone-700 px-4 py-2 rounded-xl cursor-pointer active:bg-stone-600 border-2 border-transparent active:border-amber-500 transition-all"
        >
          <ShoppingCart className="w-8 h-8 text-amber-400" />
          <span className="text-3xl font-bold text-amber-400">{cart.length}개</span>
        </div>
      </header>

      {/* Main Grid */}
      <main className="p-4 grid grid-cols-2 gap-4">
        {MENU_ITEMS.map((item) => (
          <MenuCard
            key={item.id}
            item={item}
            onSelect={(selected) => {
              if (selected.isSoldOut) {
                setSoldOutAlert(selected.name);
                speak(`${selected.name}는 품절입니다.`);
                setTimeout(() => setSoldOutAlert(null), 3000);
                return;
              }
              setSelectedMenuItem(selected);
              setAppState(AppState.MENU_DETAIL);
            }}
          />
        ))}
      </main>

      {/* Helper Text */}
      <div className="px-6 py-4 text-center">
        <p className="text-xl text-stone-400">
          "결제해줘" 라고 말하거나<br/>상단 장바구니를 눌러주세요.
        </p>
      </div>

      {/* Voice FAB */}
      <VoiceButton
        isListening={isListening}
        isProcessing={isProcessing}
        onClick={handleVoiceButtonClick}
      />

      {/* SOLD OUT ALERT OVERLAY */}
      {soldOutAlert && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/90 p-6">
          <div className="w-full max-w-sm bg-stone-800 border-8 border-red-600 rounded-3xl p-10 flex flex-col items-center space-y-6 shadow-2xl animate-pulse">
            <XCircle className="w-32 h-32 text-red-600" />
            <h2 className="text-6xl font-extrabold text-red-500 tracking-tighter">품절</h2>
            <div className="text-center">
              <p className="text-4xl text-amber-400 font-bold mb-2 break-keep">{soldOutAlert}</p>
              <p className="text-3xl text-stone-50 font-medium">다 팔렸습니다</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;