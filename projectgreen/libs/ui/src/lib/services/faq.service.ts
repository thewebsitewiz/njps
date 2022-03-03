import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FAQ, FAQS } from '../models/faq';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class FAQService {
  apiURLFAQ = environment.apiUrl + 'faq';

  constructor(private http: HttpClient) { }

  getFAQs(): Observable<FAQ[]> {
    return this.http.get<FAQ[]>(this.apiURLFAQ);
  }

  getFAQ(categoryId: string): Observable<FAQ> {
    return this.http.get<FAQ>(`${this.apiURLFAQ}/${categoryId}`);
  }

  createFAQ(faq: FormData): Observable<FAQ> {
    return this.http.post<FAQ>(this.apiURLFAQ, faq);
  }

  updateFAQ(faq: FormData, faqid: string): Observable<FAQ> {
    return this.http.put<FAQ>(`${this.apiURLFAQ}/${faqid}`, faq);
  }

  reorderFAQs(faqs: FAQS): Observable<FAQS> {
    return this.http.post<FAQS>(`${this.apiURLFAQ}/reorder`, faqs);
  }

  deleteFAQ(faqId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiURLFAQ}/${faqId}`);
  }
}
