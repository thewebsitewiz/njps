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
  price: number | undefined;
  prices: Price[] | undefined;
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
  cost?: string
}


export interface Price {
  name: string;
  amount: number;
  type: string;
  price: number;
}

export interface ProductPrices {
  _id: string;
  name: string;
  amount: number;
  price: number;
}
