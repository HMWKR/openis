import React from 'react';
import { Mic, Loader2 } from 'lucide-react';

interface VoiceButtonProps {
  isListening: boolean;
  isProcessing: boolean;
  onClick: () => void;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ isListening, isProcessing, onClick }) => {
  return (
    <div className="fixed bottom-8 left-0 right-0 flex justify-center z-50">
      <button
        onClick={onClick}
        className={`
          relative flex items-center justify-center
          w-28 h-28 rounded-full shadow-2xl
          transition-all duration-300 transform active:scale-95
          ${isListening
            ? 'bg-red-600 animate-pulse ring-8 ring-red-900/50'
            : isProcessing
              ? 'bg-sky-600'
              : 'bg-amber-500 text-stone-900'}
        `}
        aria-label="음성 주문하기"
      >
        {isProcessing ? (
          <Loader2 className="w-12 h-12 animate-spin text-white" />
        ) : (
          <Mic className={`w-14 h-14 ${isListening ? 'text-white' : 'text-stone-900'}`} />
        )}

        {!isListening && !isProcessing && (
          <span className="absolute -top-12 bg-stone-800 text-amber-400 px-4 py-2 rounded-xl text-xl font-bold border border-amber-500/30">
            눌러서 말하기
          </span>
        )}
      </button>
    </div>
  );
};

export default VoiceButton;