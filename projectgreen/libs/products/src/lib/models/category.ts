export interface Category {
  id: string;
  name: string;
  order: number;
  image: string;
  color?: string;
  checked?: boolean;
}

export interface Categories extends Array<Category> { }
