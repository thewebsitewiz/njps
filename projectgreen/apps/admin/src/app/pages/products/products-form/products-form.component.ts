import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  CategoriesService,
  ProductsService,
  UNIT_TYPES,
  FLOWER_AMOUNTS,
  FLOWER_GRAMS,
  GRAMS,
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

  amtPrices: { [key: string]: number } = {};

  product!: Product;

  priceList: { name: string, displayName: string }[] = [];

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
      brand: ['',],
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
            this.product = product;
            this.checkCategory();

            this.prodForm['name'].setValue(product.name);
            this.prodForm['category'].setValue(product?.category?.id);
            this.prodForm['brand'].setValue(product.brand);
            this.prodForm['flavor'].setValue(product.flavor);
            this.prodForm['unitType'].setValue(product.unitType);
            this.prodForm['price'].setValue(product.price);
            this.prodForm['countInStock'].setValue(product.countInStock);
            this.totalInGrams = product.countInStock;
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

  checkCategory() {

    if (this.product?.category?.name === 'Flower' || this.product?.category?.name === 'Designer Flower') {
      this.unitTypes = [{ label: 'Gram', value: 'Gram' }];
      this.priceFormatChanged();

      const results = this.convertFromGrams(this.product.countInStock);

      this.enteredLbs = results['pounds'] || 0;
      this.enteredOzs = results['ounces'] || 0;
      this.enteredGms = results['grams'] || 0;

      this.inStockSimple = false;
      this.inStockPounds = true;

      this.productForm.addControl('pounds', new FormControl(this.enteredLbs));
      this.productForm.addControl('ounces', new FormControl(this.enteredOzs));
      this.productForm.addControl('grams', new FormControl(this.enteredGms));

    }
    else {
      this.inStockSimple = true;
      this.inStockPounds = false;

      if (this.productForm.contains('pounds')) {
        this.productForm.removeControl('pounds');
      }
      if (this.productForm.contains('ounces')) {
        this.productForm.removeControl('ounces');
      }
      if (this.productForm.contains('grams')) {
        this.productForm.removeControl('grams');
      }

      this.productForm.addControl('price', new FormControl(this.product.price, Validators.required));

    }
  }

  categoryChanged(event: HTMLInputElement) {
    if (this.categories[event.value]?.name === 'Flower' || this.categories[event.value]?.name === 'Designer Flower') {
      this.unitTypes = [{ label: 'Gram', value: 'gram' }];
      this.priceFormatChanged(event);
    }
    else {
      this._mapUnitType();
    }
  }

  updateAmt(type: string): void {
    let amt: number = Number(this.prodForm[type].value);
    console.log(type, amt)

    console.log(type, amt)
    if (type === 'pounds') {
      if (amt !== this.enteredLbs) {
        this.totalInGrams = this.round((amt * GRAMS['pound']) + (this.enteredOzs * GRAMS['ounce']) + (this.enteredGms));
        this.enteredLbs = Number(amt);
        this.enteredLbs = Number(this.enteredLbs);
      }
    }
    if (type === 'ounces') {
      if (amt !== this.enteredOzs) {
        this.totalInGrams = this.round((this.enteredLbs * GRAMS['pound']) + (amt * GRAMS['ounce']) + (this.enteredGms));
        this.enteredOzs = Number(amt);
        this.enteredOzs = Number(this.enteredOzs);
      }
    }
    if (type === 'grams') {
      if (amt !== this.enteredGms) {
        this.totalInGrams = this.round((this.enteredLbs * GRAMS['pound']) + (this.enteredOzs * GRAMS['ounce']) + (amt));
        this.enteredGms = Number(amt);
        this.enteredGms = Number(this.enteredGms);
      }
    }

    console.log(this.totalInGrams);
    console.log(typeof this.totalInGrams);

    this.prodForm['countInStock'].setValue(this.totalInGrams);

  }

  round(num: number) {
    var m = Number((Math.abs(num) * 100).toPrecision(15));
    return Math.round(m) / 100 * Math.sign(num);
  }


  convertFromGrams(amt: number) {
    const pounds = Math.trunc(amt / GRAMS['pound']);
    const remainderGramsPounds = amt % GRAMS['pound'];
    if (remainderGramsPounds <= 0) return { pounds: pounds }
    if (remainderGramsPounds < GRAMS['ounce']) return { pounds: pounds, grams: remainderGramsPounds }
    const ounces = Math.trunc(remainderGramsPounds / GRAMS['ounce']);
    const remainderGramsOunces = Math.trunc(amt % GRAMS['ounce']);

    return {
      pounds: pounds,
      ounces: ounces,
      grams: remainderGramsOunces
    }

  }

  priceFormatChanged(event?: HTMLInputElement): void {
    let category;

    if (this.product) {
      category = this.product?.category?.name;
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
      if (this.pricesField === false) {
        this.productsService.getCategoryPriceList(category).subscribe((results: any) => {
          const pricesGroup: { [key: string]: FormControl } = {};
          results.forEach((price: any) => {
            this.priceList.push({ name: price.name, displayName: price.displayName })
          });
          if (this.product.prices !== undefined) {
            this.product.prices.forEach((priceInfo) => {
              this.amtPrices[priceInfo.name] = priceInfo.price;
            });
          }
          FLOWER_AMOUNTS.forEach((amtName: string) => {
            if (this.amtPrices[amtName] !== undefined) {
              pricesGroup[amtName] = new FormControl(this.amtPrices[amtName]);
            }
            else {
              pricesGroup[amtName] = new FormControl('');
            }
          });

          this.priceField = false;

          if (this.productForm.contains('price')) {
            this.productForm.removeControl('price');
          }

          this.productForm.addControl('prices', this.formBuilder.group(pricesGroup));

          this.pricesField = true;
        });
      }

    }
    else {
      if (this.productForm.get('price') === null) {
        if (this.productForm.contains('prices')) {
          this.productForm.removeControl('prices');
        }
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

    const productFormData: any = {};



    for (const field in this.prodForm) {
      if (field !== 'prices') {
        productFormData[field] = this.prodForm[field].value;
      }
    }

    const priceData: { name: string, amount: number, price: number }[] = [];
    if (this.prodForm['prices']?.value !== undefined) {
      const prices = this.prodForm['prices'].value;

      FLOWER_AMOUNTS.forEach(name => {
        console.log('price: ', name, prices[name])
        priceData.push({ name: name, amount: FLOWER_GRAMS[name], price: prices[name] })
      });

      productFormData['prices'] = priceData;
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
