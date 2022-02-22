
export interface Delivery {
  id: string;
  zipCode: string;
  city: string;
  price: number;
}


export interface DeliveryForm {
  id?: string;
  zipCode: string;
  city: string;
  price: number;
}
