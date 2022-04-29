import { Subject, takeUntil } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { FAQ, FAQService } from '@projectgreen/ui';

@Component({
  selector: 'njps-faq',
  templateUrl: './faq.component.html'
})
export class FAQPageComponent implements OnInit {
  faqs: FAQ[] = [];

  endSubs$: Subject<any> = new Subject();

  constructor(private faqService: FAQService) { }

  ngOnInit(): void {
    this._getFAQs();

  }

  private _getFAQs() {
    this.faqService
      .getFAQs()
      .pipe(takeUntil(this.endSubs$))
      .subscribe((results: FAQ[]) => {
        results.forEach((faq: FAQ) => {

          this.faqs.push(faq)
        });

        console.log(this.faqs)
      });
  }

}
