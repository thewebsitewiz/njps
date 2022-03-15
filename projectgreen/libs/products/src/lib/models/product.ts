import { Category } from './category';

export interface Product {
  id: string;
  name?: string;
  description?: string;
  richDescription?: string;
  image: string;
  images: string[];
  brand?: string;
  flavor?: string;
  price: number;
  prices: Price[];
  category?: Category;
  countInStock: number;
  unitType: string;
  rating?: number;
  numReviews?: number;
  isFeatured?: boolean;
  dateCreated?: string;
  displayCount?: {
    pounds?: number;
    ounces?: number,
    grams?: number
  }
}


export interface Price {
  name: string;
  amount: number;
  type: string;
  price: number;
}
