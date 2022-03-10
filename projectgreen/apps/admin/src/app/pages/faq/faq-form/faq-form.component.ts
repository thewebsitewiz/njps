import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FAQ, FAQService } from '@projectgreen/ui';
import { MessageService } from 'primeng/api';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'admin-faq-form',
  templateUrl: './faq-form.component.html',
  styles: []
})
export class FAQFormComponent implements OnInit, OnDestroy {
  editmode = false;
  FAQform!: FormGroup;
  isSubmitted = false;
  categories = [];
  currentDeliveryId!: string;
  endsubs$: Subject<any> = new Subject();

  constructor(
    private formBuilder: FormBuilder,
    private faqService: FAQService,
    private messageService: MessageService,
    private location: Location,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this._initForm();
    this._checkEditMode();
  }

  ngOnDestroy() {
    this.endsubs$.next(null);
    this.endsubs$.complete();
  }

  private _initForm() {
    this.FAQform = this.formBuilder.group({
      question: ['', Validators.required],
      answer: ['', Validators.required]
    });
  }

  private _addFAQ(faqData: FormData) {
    this.faqService
      .createFAQ(faqData)
      .pipe(takeUntil(this.endsubs$))
      .subscribe({
        next: (faq: FAQ) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `FAQ ${faq.question} is created!`
          });

          timer(2000)
            .toPromise()
            .then(() => {
              this.location.back();
            });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Delivery is not created!'
          })
        }
      });
  }

  private _updateFAQ(productFormData: FormData) {
    this.faqService
      .updateFAQ(productFormData, this.currentDeliveryId)
      .pipe(takeUntil(this.endsubs$))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'FAQ is updated!'
          });
          timer(2000)
            .toPromise()
            .then(() => {
              this.location.back();
            });

        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'FAQ is not updated!'
          });
        }
      });
  }

  private _checkEditMode() {
    this.route.params.pipe(takeUntil(this.endsubs$)).subscribe((params) => {
      if (params['id']) {
        this.editmode = true;
        this.currentDeliveryId = params['id'];
        this.faqService
          .getFAQ(params['id'])
          .pipe(takeUntil(this.endsubs$))
          .subscribe((delivery) => {
            this.faqForm['question'].setValue(delivery.question);
            this.faqForm['answer'].setValue(delivery.answer);
          });
      }
    });
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.FAQform.invalid) return;

    const faqFormData: any = {};
    Object.keys(this.faqForm).map((key) => {
      faqFormData[key] = this.faqForm[key].value;
    });

    if (this.editmode) {
      this._updateFAQ(faqFormData);
    } else {
      this._addFAQ(faqFormData);
    }
  }
  onCancel() {
    this.location.back();
  }



  get faqForm() {
    return this.FAQform.controls;
  }
}
