export interface Cart {
  items?: CartItem[];
}

export interface CartItem {
  productId?: string;
  amount?: number;
  unitType?: string;
  type?: string;
  price?: number;
}

export interface CartItemDetailed {
  product?: any;
  image?: string;
  name?: string;
  amount?: number;
  unitType?: string;
  unitPrice?: number;
  subTotal?: number;
}
