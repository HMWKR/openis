import React from 'react';
import { MenuItem } from '../types';

interface MenuCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

const MenuCard: React.FC<MenuCardProps> = ({ item, onSelect }) => {
  const isSoldOut = item.isSoldOut;

  return (
    <div
      onClick={() => !isSoldOut && onSelect(item)}
      className={`
        relative flex flex-col rounded-3xl overflow-hidden border-4
        ${isSoldOut ? 'border-stone-600 opacity-60 grayscale' : 'border-amber-500 bg-stone-800'}
      `}
    >
      <img
        src={item.imageUrl}
        alt={item.name}
        className="w-full h-40 object-cover"
      />

      {isSoldOut && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <span className="text-3xl font-bold text-red-500 bg-black px-4 py-2 rounded-lg border-2 border-red-500">
            다 팔림
          </span>
        </div>
      )}

      <div className="p-4 flex flex-col items-center text-center space-y-2">
        <h3 className="text-3xl font-bold text-stone-50 break-keep leading-tight">
          {item.name}
        </h3>
        <p className="text-2xl text-amber-300 font-bold">
          {item.price.toLocaleString()}원
        </p>
      </div>
    </div>
  );
};

export default MenuCard;