export interface OrderItem {
  product: Product;
  quantity: number;
}


export interface Product {
  name: string;
  brand: string;
  price: number;
  category: Category;
}

export interface Category {
  name: string;
}
