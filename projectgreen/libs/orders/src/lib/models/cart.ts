export interface Cart {
  items?: CartItem[];
}

export interface CartItem {
  productId?: string;
  quantity?: number;
}

export interface CartItemDetailed {
  product: any;
  quantity: number;
  subTotal: number;
}
