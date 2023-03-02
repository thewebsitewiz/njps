import { Category } from './category';
import { Price, ProductPrices, Strain, Strains } from './product';

export interface CheckIn {
  id: string;
  name?: string;
  description?: string;
  richDescription?: string;
  image: string;
  images: string[];
  brand?: string;
  flavor?: string;
  strain?: string;
  price: number | undefined;
  prices: Price[] | undefined;
  category?: Category;
  countInStock: number;
  unitType: string;
  rating?: number;
  numReviews?: number;
  isFeatured?: boolean;
  dateCreated?: string;
  cost?: string
}
