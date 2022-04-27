import { OrderItem } from './order-item';

export interface Order {
  id: string;
  orderItems: OrderItem[];
  fullName: string;
  streetAddress?: string;
  aptOrUnit?: string;
  city?: string;
  zipCode?: string;
  email?: string;
  phoneNumber?: string;
  status: number;
  totalPrice?: number;
  delivery?: number | null;
  user?: any;
  dateOrdered?: string;
}

export interface OrderForm {
  id?: string;
  orderItems?: OrderItem[];
  fullName: string;
  streetAddress?: string;
  aptOrUnit?: string;
  city?: string;
  zipCode?: string;
  email?: string;
  phoneNumber?: string;
  status?: number;
  delivery?: number | null;
  totalPrice?: number;
  user?: any;
  dateOrdered?: string;
}
