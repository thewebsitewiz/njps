import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Delivery, DeliveryService } from '@projectgreen/orders';
import { MessageService } from 'primeng/api';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'admin-delivery-form',
  templateUrl: './delivery-form.component.html',
  styles: []
})
export class DeliveryFormComponent implements OnInit, OnDestroy {
  editmode = false;
  form!: FormGroup;
  isSubmitted = false;
  catagories = [];
  imageDisplay!: string | ArrayBuffer | null | undefined;
  currentDeliveryId!: string;
  endsubs$: Subject<any> = new Subject();

  constructor(
    private formBuilder: FormBuilder,
    private deliveryService: DeliveryService,
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
    this.form = this.formBuilder.group({
      zipCode: ['', Validators.required],
      city: ['', Validators.required],
      price: ['', Validators.required]
    });
  }

  private _addDelivery(deliveryData: FormData) {
    this.deliveryService
      .createDelivery(deliveryData)
      .pipe(takeUntil(this.endsubs$))
      .subscribe(
        (delivery: Delivery) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Product ${delivery.zipCode} ${delivery.city} is created!`
          });
          timer(2000)
            .toPromise()
            .then(() => {
              this.location.back();
            });
        },
        () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Delivery is not created!'
          });
        }
      );
  }

  private _updateProduct(productFormData: FormData) {
    this.deliveryService
      .updateDelivery(productFormData, this.currentDeliveryId)
      .pipe(takeUntil(this.endsubs$))
      .subscribe(
        () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Delivery is updated!'
          });
          timer(2000)
            .toPromise()
            .then(() => {
              this.location.back();
            });
        },
        () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Delivery is not updated!'
          });
        }
      );
  }

  private _checkEditMode() {
    this.route.params.pipe(takeUntil(this.endsubs$)).subscribe((params) => {
      if (params['id']) {
        this.editmode = true;
        this.currentDeliveryId = params['id'];
        this.deliveryService
          .getDelivery(params['id'])
          .pipe(takeUntil(this.endsubs$))
          .subscribe((delivery) => {
            this.deliveryForm['zipCode'].setValue(delivery.zipCode);
            this.deliveryForm['city'].setValue(delivery.city);
            this.deliveryForm['price'].setValue(delivery.price);
          });
      }
    });
  }

  onSubmit() {
    this.isSubmitted = true;
    console.log(this.form.value)
    if (this.form.invalid) return;

    const deliveryFormData: any = {};
    Object.keys(this.deliveryForm).map((key) => {
      console.log(key, this.deliveryForm[key].value)
      deliveryFormData[key] = this.deliveryForm[key].value;
    });

    if (this.editmode) {
      this._updateProduct(deliveryFormData);
    } else {
      this._addDelivery(deliveryFormData);
    }
  }
  onCancel() {
    this.location.back();
  }

  onImageUpload(event: any) {
    const file = event.target.files[0];
    if (file && this.form !== null) {
      this.form.patchValue({ image: file });
      if (this.form.get('image')) {
        this.form.get('image')!.updateValueAndValidity();
      }

      const fileReader = new FileReader();
      fileReader.onload = () => {
        this.imageDisplay = fileReader.result;
      };
      fileReader.readAsDataURL(file);
    }
  }

  get deliveryForm() {
    return this.form.controls;
  }
}
