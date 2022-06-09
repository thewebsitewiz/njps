import { MessageService, PrimeNGConfig, SelectItem } from 'primeng/api';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { environment } from '@env/environment';
import {
    Categories, CategoriesService, Category, FLOWER_AMOUNTS, FLOWER_GRAMS, GRAMS, Product,
    ProductsService, Strain, Strains, UNIT_TYPES
} from '@projectgreen/products';

@Component({
  selector: 'admin-checkin-form',
  templateUrl: './checkIn-form.component.html',
  styles: []
})
export class CheckinFormComponent implements OnInit, OnDestroy {
  editmode = false;
  productForm!: FormGroup;
  isSubmitted = false;
  newProduct: boolean = false;

  categories: { [key: string]: Category } = {};
  categoryList!: Categories;
  selectedCategory: string = '';

  inStockSimple: boolean = true;
  inStockPounds: boolean = false;

  totalInGrams: number = 0;
  enteredLbs: number = 0;
  enteredOzs: number = 0;
  enteredGms: number = 0;

  imageDisplay!: string | ArrayBuffer | null | undefined;
  currentProductId!: string;
  endsubs$: Subject<any> = new Subject();
  unitTypes!: { label: string, value: string }[];

  priceField: boolean = true;
  pricesField: boolean = false;

  amtPrices: { [key: string]: number } = {};

  product!: Product;
  productList!: any;

  priceList: { name: string, displayName: string }[] = [];
  priceLists: { [key: string]: { name: string, displayName: string }[] } = {};
  strains!: any[]; //Strains;
  selectedStrain!: any;

  selectedName!: string;
  showProductDropdown: boolean = true;
  productNames: Product[] = [];

  productNameTypes!: any;
  productNameType!: string;

  constructor(
    private formBuilder: FormBuilder,
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
    private messageService: MessageService,
    private location: Location,
    private route: ActivatedRoute,
    private primeNGConfig: PrimeNGConfig
  ) { }

  ngOnInit(): void {
    this.primeNGConfig.ripple = true;
    this.productNameTypes = [
      { label: 'Existing', value: 'existing' },
      { label: 'New', value: 'new' }
    ];

    this.strains = [
      { label: 'Indica', value: 'Indica' },
      { label: 'Sativa', value: 'Sativa' },
      { label: 'Hybrid', value: 'Hybrid' },
      { label: 'N/A', value: 'NA' }
    ];


    this._getCategories();
    this._mapUnitType();
    this._initForm();
    this._checkEditMode();
  }

  ngOnDestroy() {
    this.endsubs$.next(null);
    this.endsubs$.complete();
  }

  private _initForm() {
    this.productForm = this.formBuilder.group({
      category: ['', Validators.required],
      selectedName: [''],
      enteredName: [''],
      unitType: ['', Validators.required],
      isFeatured: [false],
      brand: ['',],
      flavor: [''],
      countInStock: [''],
      price: ['', Validators.required],
      description: ['', Validators.required],
      richDescription: [''],
      image: [''],
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

          this.productsService.getCategoryPriceList(cat.name).subscribe(results => {
            results.forEach((price: any) => {
              if (!this.priceLists[cat.name]) {
                this.priceLists[cat.name] = [];
              }
              this.priceLists[cat.name].push({ name: price.name, displayName: price.displayName })
            });
          });
        });



      });
  }

  nameChanged(event: any) {

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
            if (product !== undefined) {
              this.product = product;
              if (product.category !== undefined) {
                this.countInStockChange(product.category.name);
              }
              this.productForm.patchValue({
                name: product.name,
                category: product?.category?.id,
                brand: product.brand,
                flavor: product.flavor,
                unitType: product.unitType,
                price: product.price,
                countInStock: product.countInStock,
                isFeatured: product.isFeatured,
                description: product.description,
                richDescription: product.richDescription,
              });

              this.selectedStrain = product.strain;

              if (!!product.countInStock) this.totalInGrams = product.countInStock;

              this.imageDisplay = `${environment.imageUrl}${product.image}`;
              this.productForm.controls['image'].setValidators([]);
              this.productForm.controls['image'].updateValueAndValidity();
            }
          });
      }
    });
  }

  countInStockChange(categoryName: string): void {

    if (categoryName === 'Flower' || categoryName === 'Designer Flower') {
      this.unitTypes = [{ label: 'Gram', value: 'Gram' }];

      const grams: number = this.product?.countInStock || 0;

      const results = this.convertFromGrams(grams);

      this.enteredLbs = results['pounds'] || 0;
      this.enteredOzs = results['ounces'] || 0;
      this.enteredGms = results['grams'] || 0;

      this.productForm.addControl('pounds', this.formBuilder.control(this.enteredLbs));
      this.productForm.addControl('ounces', this.formBuilder.control(this.enteredOzs));
      this.productForm.addControl('grams', this.formBuilder.control(this.enteredGms));

      this.inStockSimple = false;
      this.inStockPounds = true;
    }
    else {
      const countInStock = this.product?.countInStock || '';

      this.productForm.removeControl('pounds');
      this.productForm.removeControl('ounces');
      this.productForm.removeControl('grams');

      this.inStockSimple = true;
      this.inStockPounds = false;
    }
  }

  categoryChanged(event: HTMLInputElement) {
    const categoryName = this.categories[event.value]?.name;

    this.productsService.getProducts([categoryName]).subscribe((results: Product[]) => {
      results.forEach((product: Product) => {
        this.productNames.push(product);
      });

    });

    this.priceFormatChanged(event);
    this.countInStockChange(categoryName);

    if (categoryName === 'Flower' || categoryName === 'Designer Flower') {
      this.unitTypes = [{ label: 'Gram', value: 'gram' }];

      this.inStockSimple = false;
      this.inStockPounds = true;

    }
    else {
      this.inStockSimple = true;
      this.inStockPounds = false;
      this._mapUnitType();
    }

  }

  updateAmt(type: string): void {
    let amt: number = Number(this.prodForm[type].value);

    console.log(`type: ${type}  amt: ${amt}`)

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

    let category: string = '';

    if (this.product && this.product.category) {
      category = this.product?.category?.name;
    }
    else if (event !== undefined && event.value !== undefined) {
      const key = event.value;
      if (this.categories !== undefined &&
        key !== undefined &&
        this.categories[key] !== undefined) {
        category = this.categories[key].name;
      }
    }

    if (category === 'Flower' || category === 'Designer Flower') {

      const pricesGroup: { [key: string]: FormControl } = {};
      this.priceList = this.priceLists[category];

      if (this.product !== undefined && this.product.prices !== undefined) {
        this.product.prices.forEach((priceInfo) => {
          this.amtPrices[priceInfo.name] = priceInfo.price;
        });
      }

      this.productForm.removeControl('price');

      this.priceField = false;
      this.pricesField = true;

      FLOWER_AMOUNTS.forEach((amtName: string) => {
        const price = this.amtPrices[amtName] || '';
        this.productForm.addControl(amtName, this.formBuilder.control(price, []));
      });

    }
    else {
      FLOWER_AMOUNTS.forEach((amtName: string) => {
        this.productForm.removeControl(amtName);
      });


      this.priceField = true;
      this.pricesField = false;

      this.productForm.addControl('price', this.formBuilder.control('', Validators.required));

    }
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.productForm.invalid) return;

    const productFormData: any = {};

    productFormData['strain'] = this.selectedStrain;

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

  strainSelected(event: any): void {
    this.selectedStrain = event.option.value;
  }

  clearStrain(): void {
    console.log(this.selectedStrain);
    this.selectedStrain = '';
  }
  /*
    clear(field: string): void {
      if (this.productForm.contains(field)) {
        const formField = this.productForm.get(field) as FormControl;
        formField.setValue('');
      }
    } */
  productNameTypeSelected(event: any) {
    this.productNameType = event.option.value;
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
