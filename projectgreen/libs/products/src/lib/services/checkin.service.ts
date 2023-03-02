import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';

import { CheckIn } from '../models/checkIn';

@Injectable({
  providedIn: 'root'
})
export class CheckInService {
  apiURLCheckin = environment.apiUrl + 'checkin';

  constructor(private http: HttpClient) { }

  getCheckIns(categoriesFilter?: string[]): Observable<CheckIn[]> {
    let params = new HttpParams();
    if (categoriesFilter) {
      params = params.append('categories', categoriesFilter.join(','));
    }
    return this.http.get<CheckIn[]>(this.apiURLCheckin, { params: params });
  }

  createCheckIn(checkinData: FormData): Observable<CheckIn> {
    return this.http.post<CheckIn>(this.apiURLCheckin, checkinData);
  }

  getCheckIn(checkInId: string): Observable<CheckIn> {
    return this.http.get<CheckIn>(`${this.apiURLCheckin}/${checkInId}`);
  }

  updateCheckIn(productData: {}, checkInId: string): Observable<CheckIn> {
    return this.http.put<CheckIn>(`${this.apiURLCheckin}/${checkInId}`, productData);
  }

  deleteCheckIn(checkInId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiURLCheckin}/${checkInId}`);
  }

  getCheckInsCount(): Observable<number> {
    return this.http
      .get<number>(`${this.apiURLCheckin}/get/count`)
      .pipe(map((objectValue: any) => objectValue.productCount));
  }

}
