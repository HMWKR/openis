import React, { useEffect } from 'react';
import { CheckCircle, Clock, Home, Receipt } from 'lucide-react';
import { CartItem } from '../types';
import { speak } from '../services/voiceService';
import { calculatePrepTime } from '../utils/orderUtils';

interface OrderReceiptProps {
  orderNumber: number;
  cart: CartItem[];
  onReturnHome: () => void;
}

const OrderReceipt: React.FC<OrderReceiptProps> = ({ orderNumber, cart, onReturnHome }) => {
  const prepTime = calculatePrepTime(cart.length);
  const total = cart.reduce((acc, item) => acc + item.price, 0);

  const orderTime = new Date().toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const orderDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    speak(`주문이 완료되었습니다. 주문번호는 ${orderNumber}번입니다. 약 ${prepTime}분 후에 준비됩니다.`);
  }, [orderNumber, prepTime]);

  const handleReturnHome = () => {
    speak('처음 화면으로 돌아갑니다.');
    onReturnHome();
  };

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col">
      {/* Success Header */}
      <div className="bg-emerald-900/30 p-8 text-center border-b-4 border-emerald-500">
        <CheckCircle className="w-24 h-24 text-emerald-500 mx-auto mb-4" />
        <h1 className="text-5xl font-bold text-stone-50 mb-2">
          주문 완료!
        </h1>
        <p className="text-2xl text-stone-300">
          결제가 정상적으로 처리되었습니다
        </p>
      </div>

      {/* Order Number - Prominent Display */}
      <div className="bg-amber-500 py-8 text-center">
        <p className="text-2xl text-stone-900/70 mb-2">주문 번호</p>
        <p className="text-8xl font-black text-stone-900">{orderNumber}</p>
      </div>

      {/* Preparation Time */}
      <div className="bg-stone-800 p-6 flex items-center justify-center gap-4 border-b border-stone-700">
        <Clock className="w-10 h-10 text-amber-400" />
        <div>
          <p className="text-xl text-stone-400">예상 준비 시간</p>
          <p className="text-3xl font-bold text-stone-50">약 {prepTime}분</p>
        </div>
      </div>

      {/* Receipt Details */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-stone-800 rounded-2xl p-6 border border-stone-700">
          {/* Receipt Header */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-stone-600">
            <Receipt className="w-8 h-8 text-amber-400" />
            <h2 className="text-2xl font-bold text-stone-50">주문 내역</h2>
          </div>

          {/* Order Meta */}
          <div className="text-lg text-stone-400 mb-4 space-y-1">
            <p>주문일시: {orderDate} {orderTime}</p>
            <p>주문번호: #{orderNumber}</p>
          </div>

          {/* Items List */}
          <div className="space-y-4 mb-6">
            {cart.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between py-3 border-b border-stone-700 last:border-0">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-stone-50">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-lg px-2 py-1 rounded ${
                      item.temperature === 'Ice'
                        ? 'bg-sky-900 text-sky-300'
                        : 'bg-orange-900 text-orange-300'
                    }`}>
                      {item.temperature === 'Ice' ? '아이스' : '따뜻한'}
                    </span>
                    <span className="text-lg text-stone-400">x {item.quantity}</span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-stone-50">
                  {item.price.toLocaleString()}원
                </p>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="border-t-2 border-dashed border-stone-600 pt-4 space-y-2">
            <div className="flex justify-between text-xl text-stone-300">
              <span>소계</span>
              <span>{total.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-xl text-stone-300">
              <span>부가세 (포함)</span>
              <span>0원</span>
            </div>
            <div className="flex justify-between text-4xl font-bold text-amber-400 pt-4 border-t border-stone-600 mt-4">
              <span>총 결제금액</span>
              <span>{total.toLocaleString()}원</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="p-6 bg-stone-800 border-t border-stone-700">
        <button
          onClick={handleReturnHome}
          className="w-full py-6 bg-amber-500 text-stone-900 text-3xl font-bold rounded-2xl flex items-center justify-center gap-4 active:scale-95 transition-transform"
        >
          <Home className="w-10 h-10" />
          처음으로
        </button>
      </div>
    </div>
  );
};

export default OrderReceipt;
