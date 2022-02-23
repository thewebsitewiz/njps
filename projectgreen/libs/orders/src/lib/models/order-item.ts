export interface OrderItem {
  product: Product;
  amount: number;
}

export interface price {
  name: string;
  amount: number;
  price: number;
}

export interface Product {
  name: string;
  brand?: string;
  flavor?: string;
  price: number;
  prices: [price];
  category: Category;
  amountName: string;
}

export interface Category {
  name: string;
}
