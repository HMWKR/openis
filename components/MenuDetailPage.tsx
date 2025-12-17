import React, { useState, useEffect } from 'react';
import { ArrowLeft, Flame, Snowflake } from 'lucide-react';
import { MenuItem } from '../types';
import { speak } from '../services/voiceService';

interface MenuDetailPageProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, temperature: 'Hot' | 'Ice') => void;
  onBack: () => void;
}

const MenuDetailPage: React.FC<MenuDetailPageProps> = ({ item, onAddToCart, onBack }) => {
  const [temperature, setTemperature] = useState<'Hot' | 'Ice'>('Hot');
  const isSoldOut = item.isSoldOut;

  useEffect(() => {
    if (!isSoldOut) {
      speak(`${item.name}입니다. 가격은 ${item.price.toLocaleString()}원입니다. 온도를 선택해주세요.`);
    } else {
      speak(`${item.name}는 품절입니다.`);
    }
  }, [item, isSoldOut]);

  const handleTemperatureSelect = (temp: 'Hot' | 'Ice') => {
    setTemperature(temp);
    speak(temp === 'Hot' ? '따뜻한것으로 선택했습니다.' : '차가운것으로 선택했습니다.');
  };

  const handleAddToCart = () => {
    if (isSoldOut) return;
    onAddToCart(item, temperature);
    speak(`${temperature === 'Ice' ? '차가운' : '따뜻한'} ${item.name}를 장바구니에 담았습니다.`);
  };

  const handleBack = () => {
    speak('메뉴판으로 돌아갑니다.');
    onBack();
  };

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-stone-800 border-b-4 border-amber-500 p-6 flex items-center shadow-lg">
        <button
          onClick={handleBack}
          className="mr-4 p-2 rounded-xl active:bg-stone-700"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="w-10 h-10 text-stone-50" />
        </button>
        <h1 className="text-4xl font-extrabold text-stone-50">메뉴 상세</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Image Section */}
        <div className="relative mb-6">
          <img
            src={item.imageUrl}
            alt={item.name}
            className={`w-full aspect-square object-cover rounded-3xl border-4 ${
              isSoldOut ? 'border-stone-600 grayscale opacity-60' : 'border-amber-500'
            }`}
          />
          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-bold text-red-500 bg-black/80 px-8 py-4 rounded-2xl border-4 border-red-500">
                품절
              </span>
            </div>
          )}
        </div>

        {/* Item Info */}
        <div className="text-center mb-8">
          <h2 className="text-5xl font-bold text-stone-50 mb-3">{item.name}</h2>
          {item.description && (
            <p className="text-2xl text-stone-300 mb-4">{item.description}</p>
          )}
          <p className="text-4xl font-bold text-amber-400">
            {item.price.toLocaleString()}원
          </p>
        </div>

        {/* Temperature Selection */}
        {!isSoldOut && (
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-stone-50 text-center mb-6">
              온도 선택
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleTemperatureSelect('Hot')}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border-4 transition-all ${
                  temperature === 'Hot'
                    ? 'bg-orange-900/50 border-orange-500 ring-4 ring-orange-500/30 scale-105'
                    : 'bg-stone-800 border-stone-600 active:bg-stone-700'
                }`}
                aria-label="따뜻한것 선택"
                aria-pressed={temperature === 'Hot'}
              >
                <Flame className={`w-16 h-16 mb-3 ${temperature === 'Hot' ? 'text-orange-400' : 'text-stone-400'}`} />
                <span className={`text-3xl font-bold ${temperature === 'Hot' ? 'text-orange-300' : 'text-stone-300'}`}>
                  따뜻한것
                </span>
              </button>

              <button
                onClick={() => handleTemperatureSelect('Ice')}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border-4 transition-all ${
                  temperature === 'Ice'
                    ? 'bg-sky-900/50 border-sky-500 ring-4 ring-sky-500/30 scale-105'
                    : 'bg-stone-800 border-stone-600 active:bg-stone-700'
                }`}
                aria-label="차가운것 선택"
                aria-pressed={temperature === 'Ice'}
              >
                <Snowflake className={`w-16 h-16 mb-3 ${temperature === 'Ice' ? 'text-sky-400' : 'text-stone-400'}`} />
                <span className={`text-3xl font-bold ${temperature === 'Ice' ? 'text-sky-300' : 'text-stone-300'}`}>
                  차가운것
                </span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer - Add to Cart */}
      <div className="sticky bottom-0 bg-stone-900 p-6 border-t-2 border-stone-700">
        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl text-stone-300">총 금액</span>
          <span className="text-4xl font-bold text-amber-400">
            {item.price.toLocaleString()}원
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isSoldOut}
          className={`w-full py-6 rounded-2xl text-3xl font-bold transition-transform active:scale-95 ${
            isSoldOut
              ? 'bg-stone-600 text-stone-400 cursor-not-allowed'
              : 'bg-amber-500 text-stone-900'
          }`}
          aria-label={isSoldOut ? '품절된 상품입니다' : '장바구니에 담기'}
        >
          {isSoldOut ? '품절된 상품입니다' : '장바구니에 담기'}
        </button>
      </div>
    </div>
  );
};

export default MenuDetailPage;
