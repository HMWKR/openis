export interface MenuItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  isSoldOut?: boolean;
  description?: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
  temperature?: 'Hot' | 'Ice';
}

export enum AppState {
  LANDING = 'LANDING',
  MENU = 'MENU',
  MENU_DETAIL = 'MENU_DETAIL',
  CART_VIEW = 'CART_VIEW',
  SUCCESS = 'SUCCESS',
}

export interface VoiceIntent {
  action: 'ADD_ORDER' | 'CHECKOUT' | 'SELECT_HOT' | 'SELECT_ICE' | 'ADD_TO_CART' | 'GO_BACK' | 'UNKNOWN';
  item?: string;
  temperature?: 'Hot' | 'Ice';
}