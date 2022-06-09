import { Category } from './category';

export interface Strain { label: string, value: string };

export interface Strains extends Array<Strain> { }

export interface Product {
  id: string;
  name?: string;
  description?: string;
  richDescription?: string;
  image?: string;
  images?: string[];
  brand?: string;
  flavor?: string;
  strain?: string;
  price?: number | undefined;
  prices?: Price[] | undefined;
  category?: Category;
  countInStock?: number;
  unitType?: string;
  isFeatured?: boolean;
  dateCreated?: string;
  displayCost?: string;
  displayCount?: DisplayCount;
}

interface DisplayCount {
  pounds?: number;
  grams?: number;
  ounces?: number;
}

export interface Price {
  name: string;
  displayName?: string;
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
