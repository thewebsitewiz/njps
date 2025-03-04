import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';

import { Order, OrderForm } from '../models/order';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  apiURLOrders = environment.apiUrl + 'orders';
  apiURLProducts = environment.apiUrl + 'products';

  constructor(private http: HttpClient) {
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiURLOrders);
  }

  getOrder(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiURLOrders}/${orderId}`);
  }

  createOrder(order: OrderForm): Observable<Order> {
    console.log('order ');
    return this.http.post<Order>(this.apiURLOrders, order);
  }

  updateOrder(orderStatus: { status: string }, orderId: string): Observable<Order> {
    console.log('file: orders.service.ts ~ line 31 ~ OrdersService ~ updateOrder ~ orderStatus', orderStatus);
    return this.http.put<Order>(`${this.apiURLOrders}/${orderId}`, orderStatus);
  }

  deleteOrder(orderId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiURLOrders}/${orderId}`);
  }

  getOrdersCount(): Observable<number> {
    return this.http
      .get<number>(`${this.apiURLOrders}/get/count`)
      .pipe(map((objectValue: any) => objectValue.orderCount));
  }

  getTotalSales(): Observable<number> {
    return this.http
      .get<number>(`${this.apiURLOrders}/get/totalsales`)
      .pipe(map((objectValue: any) => objectValue.totalsales));
  }

  getProduct(productId: string): Observable<any> {
    return this.http.get<any>(`${this.apiURLProducts}/${productId}`);
  }
}
