import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FAQ, FAQS, FAQService } from '@projectgreen/ui';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Table } from 'primeng/table';
import { environment } from '@env/environment';

@Component({
  selector: 'admin-faq-list',
  templateUrl: './faq-list.component.html',
  styles: []
})
export class FAQListComponent implements OnInit, OnDestroy {
  faqs: any = [];
  endsubs$: Subject<any> = new Subject();
  totalFAQs!: number;

  FAQs!: FAQ[];
  selectedFAQs!: FAQ[];

  @ViewChild('dt') dt: Table | undefined;

  constructor(
    private faqService: FAQService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this._getFAQs();
  }


  ngOnDestroy() {
    this.endsubs$.next(null);
    this.endsubs$.complete();
  }

  private _getFAQs() {
    this.faqService
      .getFAQs()
      .pipe(takeUntil(this.endsubs$))
      .subscribe((faqs: any) => {
        this.faqs = faqs;
        this.totalFAQs = this.faqs.length;
        this.selectedFAQs = this.faqs
      });
  }

  applyFilterGlobal($event: any, stringVal: any) {
    this.dt!.filterGlobal(($event.target as HTMLInputElement).value, 'contains');
  }

  updateFAQ(faqId: string) {
    this.router.navigateByUrl(`faqs/form/${faqId}`);
  }

  updateFAQorder() {
    console.log(this.faqs);
    this.faqService
      .reorderFAQs(this.faqs).subscribe((faqs: FAQS) => {
        this.faqs = faqs;
        console.log('this.faqs: ', faqs)
      })
  }

  deleteFAQ(faqId: string) {
    this.confirmationService.confirm({
      message: 'Do you want to delete this FAQ?',
      header: 'Delete FAQ',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.faqService
          .deleteFAQ(faqId)
          .pipe(takeUntil(this.endsubs$))
          .subscribe(
            () => {
              this._getFAQs();
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'FAQ is deleted!'
              });
            },
            () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'FAQ is not deleted!'
              });
            }
          );
      }
    });
  }
}
