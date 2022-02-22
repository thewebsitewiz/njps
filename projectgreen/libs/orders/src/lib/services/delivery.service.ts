import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Delivery, DeliveryForm } from '../models/delivery';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  apiURLDelivery = environment.apiUrl + 'delivery';

  constructor(private http: HttpClient) { }

  getDeliveries(): Observable<Delivery[]> {
    return this.http.get<Delivery[]>(this.apiURLDelivery);
  }

  getDelivery(deliveryId: string): Observable<Delivery> {
    return this.http.get<Delivery>(`${this.apiURLDelivery}/${deliveryId}`);
  }

  createDelivery(deliveryForm: FormData): Observable<Delivery> {
    return this.http.post<Delivery>(this.apiURLDelivery, deliveryForm);
  }

  updateDelivery(deliveryData: FormData, deliveryid: string): Observable<Delivery> {
    return this.http.put<Delivery>(`${this.apiURLDelivery}/${deliveryid}`, deliveryData);
  }

  deleteDelivery(deliveryId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiURLDelivery}/${deliveryId}`);
  }

  deliveryFee(zip: string): Observable<any> {
    return this.http.get<any>(`${this.apiURLDelivery}/fee/${zip}`);
  }

}
