import { OrderItem } from './order-item';

export interface Order {
  id: string;
  orderItems: OrderItem[];
  shippingAddress1?: string;
  shippingAddress2?: string;
  city?: string;
  zip?: string;
  country?: string;
  phone?: string;
  status?: number;
  totalPrice?: string;
  user?: any;
  dateOrdered?: string;
}

export interface OrderForm {
  id?: string;
  orderItems?: OrderItem[];
  name: string;
  shippingAddress1?: string;
  shippingAddress2?: string;
  city?: string;
  zip?: string;
  country?: string;
  phone?: string;
  status?: number;
  delivery?: number;
  totalPrice?: string;
  user?: any;
  dateOrdered?: string;
}
