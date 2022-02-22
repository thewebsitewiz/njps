export interface Cart {
  items?: CartItem[];
}

export interface CartItem {
  productId?: string;
  amount?: number;
  amountName?: string;
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
  amountName?: string | number;
  unitPrice?: number;
  subTotal?: number;
}
