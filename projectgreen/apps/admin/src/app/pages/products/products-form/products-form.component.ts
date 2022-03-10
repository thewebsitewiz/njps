import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  CategoriesService,
  ProductsService,
  UNIT_TYPES,
  FLOWER_AMOUNTS,
  Product,
  Category,
  Categories
} from '@projectgreen/products';
import { MessageService } from 'primeng/api';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '@env/environment';

@Component({
  selector: 'admin-products-form',
  templateUrl: './products-form.component.html',
  styles: []
})
export class ProductsFormComponent implements OnInit, OnDestroy {
  editmode = false;
  productForm!: FormGroup;
  isSubmitted = false;
  categories: { [key: string]: Category | undefined } = {};
  categoryList!: Categories;
  imageDisplay!: string | ArrayBuffer | null | undefined;
  currentProductId!: string;
  endsubs$: Subject<any> = new Subject();
  unitTypes!: { label: string, value: string }[];

  priceField: boolean = true;
  pricesField: boolean = false;

  pricesAdded = false;

  editProduct!: Product;

  priceList: { name: string, displayName: string }[] = [];

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
    this._mapUnitType();
    this._getCategories();
    this._checkEditMode();
  }

  ngOnDestroy() {
    this.endsubs$.next(null);
    this.endsubs$.complete();
  }

  private _initForm() {
    this.productForm = this.formBuilder.group({
      name: ['', Validators.required],
      brand: ['', Validators.required],
      flavor: [''],
      price: ['', Validators.required],
      unitType: ['', Validators.required],
      category: ['', Validators.required],
      countInStock: ['', Validators.required],
      description: ['', Validators.required],
      richDescription: [''],
      image: ['', Validators.required],
      isFeatured: [false]
    });
  }



  private _mapUnitType() {
    this.unitTypes = Object.keys(UNIT_TYPES).map((key) => {
      return {
        label: UNIT_TYPES[key].label,
        value: UNIT_TYPES[key].value
      };
    });
  }

  private _getCategories() {
    this.categoriesService
      .getCategories()
      .pipe(takeUntil(this.endsubs$))
      .subscribe((categories: any) => {
        this.categoryList = categories;
        this.categoryList.forEach((cat: Category) => {
          this.categories[cat['id']] = {
            id: cat.id,
            name: cat.name,
            order: cat.order,
            image: cat.image,
          };
        });
      });
  }

  private _addProduct(productData: FormData) {
    this.productsService
      .createProduct(productData)
      .pipe(takeUntil(this.endsubs$))
      .subscribe(
        (product: Product) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Product ${product.name} is created!`
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
            detail: 'Product is not created!'
          });
        }
      );
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
          .subscribe((product: Product) => {
            this.editProduct = product;

            this.checkCategory(product);

            this.prodForm['name'].setValue(product.name);
            this.prodForm['category'].setValue(product?.category?.id);
            this.prodForm['brand'].setValue(product.brand);
            this.prodForm['flavor'].setValue(product.flavor);
            this.prodForm['unitType'].setValue(product.unitType);
            this.prodForm['price'].setValue(product.price);
            this.prodForm['countInStock'].setValue(product.countInStock);
            this.prodForm['isFeatured'].setValue(product.isFeatured);
            this.prodForm['description'].setValue(product.description);
            this.prodForm['richDescription'].setValue(product.richDescription);
            this.imageDisplay = `${environment.imageUrl}${product.image}`;
            this.prodForm['image'].setValidators([]);
            this.prodForm['image'].updateValueAndValidity();
          });
      }
    });
  }

  checkCategory(product: Product) {
    if (product?.category?.name === 'Flower' || product?.category?.name === 'Designer Flower') {
      this.unitTypes = [{ label: 'Gram', value: 'gram' }];
      this.priceFormatChanged({ product: product });
    }
  }

  categoryChanged(event: HTMLInputElement) {
    if (this.categories[event.value]?.name === 'Flower' || this.categories[event.value]?.name === 'Designer Flower') {
      this.unitTypes = [{ label: 'Gram', value: 'gram' }];
      this.priceFormatChanged({ product: this.editProduct, event: event });
    }
    else {
      this._mapUnitType();
    }
  }

  priceFormatChanged(passed?: { product: Product, event?: HTMLInputElement }): void {
    const product = passed?.product;
    const event = passed?.event;

    let category;

    if (passed?.product) {
      category = product?.category?.name;
    }
    else if (event !== undefined && event.value !== undefined) {
      const key = event.value;
      if (this.categories !== undefined &&
        key !== undefined &&
        this.categories[key] !== undefined) {
        category = this.categories[key]?.name;
      }
    }


    if (category === 'Flower' ||
      category === 'Designer Flower') {
      if (!this.pricesField) {
        this.priceField = false;
        this.pricesField = true;

        this.productsService.getCategoryPriceList(category).subscribe((results: any) => {
          const pricesGroup: { [key: string]: AbstractControl } = {};
          const amtPrices: { [key: string]: number } = {};
          results.forEach((price: any) => {
            this.priceList.push({ name: price.name, displayName: price.displayName })
          });


          product?.prices.forEach((priceInfo) => {
            amtPrices[priceInfo.name] = priceInfo.price;
          });

          console.log(amtPrices);

          FLOWER_AMOUNTS.forEach((amtName: string) => {
            pricesGroup[amtName] = new FormControl();

            console.log(amtName, amtPrices[amtName]);
            if (amtPrices[amtName] !== undefined) {
              pricesGroup[amtName].setValue(amtPrices[amtName]);
            }
          });

          this.productForm.removeControl('price');
          this.productForm.addControl('prices', new FormGroup(pricesGroup));

          /* FLOWER_AMOUNTS.forEach((amtName: string) => {
            if (amtPrices[amtName] !== undefined) {
              pricesGroup[amtName].setValue(amtPrices[amtName]);
            }
          }); */
        })
      }
    }
    else {
      if (this.productForm.get('price') === null) {

        this.productForm.removeControl('prices');
        this.pricesField = false;

        this.productForm.addControl('price', new FormControl('', Validators.required));
        this.priceField = true;
      }
    }
    return;
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.productForm.invalid) return;

    const productFormData = new FormData();
    for (const field in this.prodForm) {

      console.log(field)
      console.log(this.prodForm[field].value);

      productFormData.append(field, this.prodForm[field].value);
    }
    if (this.editmode) {
      this._updateProduct(productFormData);
    } else {
      this._addProduct(productFormData);
    }
  }

  onCancel() {
    this.location.back();
  }

  onImageUpload(event: any) {
    const file = event.target.files[0];
    if (file && this.productForm !== null) {
      this.productForm.patchValue({ image: file });
      if (this.productForm.get('image')) {
        this.productForm.get('image')!.updateValueAndValidity();
      }

      const fileReader = new FileReader();
      fileReader.onload = () => {
        this.imageDisplay = fileReader.result;
      };
      fileReader.readAsDataURL(file);
    }
  }

  get prodForm() {
    return this.productForm.controls;
  }
}
