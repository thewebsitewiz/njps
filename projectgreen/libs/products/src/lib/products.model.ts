export interface Category {
  color?: string;
  id: string;
  image: string;
  name: string;
  order: number;
}


export interface Categories extends Array<Category> { }
