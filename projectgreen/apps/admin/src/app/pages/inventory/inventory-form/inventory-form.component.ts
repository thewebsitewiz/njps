import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CategoriesService, Product, ProductsService } from '@projectgreen/products';
import { MessageService } from 'primeng/api';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'admin-inventory-form',
  templateUrl: './inventory-form.component.html',
  styles: []
})
export class InventoryFormComponent implements OnInit, OnDestroy {
  editmode = false;
  prodForm!: FormGroup;
  isSubmitted = false;
  categories = [];
  imageDisplay!: string | ArrayBuffer | null | undefined;
  currentProductId!: string;
  endsubs$: Subject<any> = new Subject();
  productName!: string | undefined;
  unitType!: string;

  inStockSimple: boolean = true;
  inStockPounds: boolean = false;
  totalInGrams: number = 0;
  enteredLbs: number = 0;
  enteredOzs: number = 0;
  enteredGms: number = 0;

  constructor(
    private formBuilder: FormBuilder,
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
    private messageService: MessageService,
    private location: Location,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this._initForm();
    this._getCategories();
    this._checkEditMode();
  }

  ngOnDestroy() {
    this.endsubs$.next(null);
    this.endsubs$.complete();
  }

  private _initForm() {
    this.prodForm = this.formBuilder.group({
      countInStock: ['', Validators.required]
    });
  }

  private _getCategories() {
    this.categoriesService
      .getCategories()
      .pipe(takeUntil(this.endsubs$))
      .subscribe((categories: any) => {
        this.categories = categories;
      });
  }

  private _updateProduct(productFormData: FormData) {
    this.productsService
      .updateProduct(productFormData, this.currentProductId)
      .pipe(takeUntil(this.endsubs$))
      .subscribe(
        () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Product is updated!'
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
            detail: 'Product is not updated!'
          });
        }
      );
  }

  private _checkEditMode() {
    this.route.params.pipe(takeUntil(this.endsubs$)).subscribe((params) => {
      if (params['id']) {
        this.editmode = true;
        this.currentProductId = params['id'];
        this.productsService
          .getProduct(params['id'])
          .pipe(takeUntil(this.endsubs$))
          .subscribe((product) => {
            console.log(product)
            this.productName = product.name;
            this.unitType = `${product.unitType}s`;
            this.productForm['countInStock'].setValue(product.countInStock);
          });
      }
    });
  }


  updateAmt(type: string, evt: HTMLInputElement): void {
    console.log(type, evt);
    let amt;
    if (evt.value === null) {
      if (type === 'lbs') {
        this.enteredLbs = 0;
      }
      else if (type === 'ozs') {
        this.enteredOzs = 0;
      } else if (type === 'gms') {
        this.enteredGms = 0;
      }
      amt = 0;
    }
    amt = parseInt(evt.value, 10);
    if (type === 'lbs') {
      if (amt !== this.enteredLbs) {
        this.totalInGrams = this.round((amt * 453.592) + (this.enteredOzs * 28.3495) + (this.enteredGms));
        this.enteredLbs = amt;
      }
    }
    if (type === 'ozs') {
      if (amt !== this.enteredOzs) {
        this.totalInGrams = this.round((this.enteredLbs * 453.592) + (amt * 28.3495) + (this.enteredGms));
        this.enteredOzs = amt;
      }
    } if (type === 'gms') {
      if (amt !== this.enteredGms) {
        this.totalInGrams = this.round((this.enteredLbs * 453.592) + (this.enteredOzs * 28.3495) + (amt));
        this.enteredGms = amt;
      }
    }

    this.productForm['countInStock'].setValue(this.totalInGrams);

  }

  round(num: number) {
    var m = Number((Math.abs(num) * 100).toPrecision(15));
    return Math.round(m) / 100 * Math.sign(num);
  }


  onSubmit() {
    this.isSubmitted = true;
    if (this.prodForm.invalid) return;

    const productFormData = new FormData();
    Object.keys(this.productForm).map((key) => {
      productFormData.append(key, this.productForm[key].value);
    });
    if (this.editmode) {
      this._updateProduct(productFormData);
    } else {

    }
  }
  onCancel() {
    this.location.back();
  }


  get productForm() {
    return this.prodForm.controls;
  }
}
