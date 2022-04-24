
export interface Delivery {
  id?: string;
  zipCode?: string;
  city?: string;
  price?: number;
  message?: string;
}


export interface DeliveryForm {
  id?: string;
  zipCode: string;
  city: string;
  price: number;
}
