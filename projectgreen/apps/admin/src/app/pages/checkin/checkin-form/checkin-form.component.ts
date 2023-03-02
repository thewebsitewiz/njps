import { MessageService, PrimeNGConfig, SelectItem } from 'primeng/api';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { environment } from '@env/environment';
import {
    Categories, CategoriesService, Category, CheckIn, CheckInService, FLOWER_AMOUNTS, FLOWER_GRAMS,
    GRAMS, Product, ProductsService, Strain, Strains, UNIT_TYPES
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
  categoryMap: { [key: string]: string } = {};
  selectedCategory: string = '';

  inStockSimple: boolean = true;
  inStockPounds: boolean = false;

  totalInGrams: number = 0;
  enteredLbs: number = 0;
  enteredOzs: number = 0;
  enteredGms: number = 0;

  imageDisplay!: string | ArrayBuffer | null | undefined;
  currentCheckInId!: string;
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

  productNameTypes: any = [];
  productNameType: string = 'new';

  constructor(
    private formBuilder: FormBuilder,
    private productsService: ProductsService,
    private checkInService: CheckInService,
    private categoriesService: CategoriesService,
    private messageService: MessageService,
    private location: Location,
    private route: ActivatedRoute,
    private primeNGConfig: PrimeNGConfig
  ) { }

  ngOnInit(): void {
    this.primeNGConfig.ripple = true;

    this.productNameTypes = [
      { label: 'New', value: 'new' },
      { label: 'Existing', value: 'existing' }
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

  ngOnDestroy(): void {
    this.endsubs$.next(null);
    this.endsubs$.complete();
  }

  /*   private _initFormDev() {
      this.productNameType = 'new';
      this.selectedStrain = 'Sativa';

      this.productForm = this.formBuilder.group({
        category: ['', Validators.required],
        selectedName: [''],
        enteredName: ['Blue Gelato'],
        unitType: ['Gram', Validators.required],
        isFeatured: [true],
        brand: ['Smuckers',],
        flavor: ['Strawberry'],
        countInStock: ['452'],
        cost: ['1500'],
        price: ['', Validators.required],
        description: ['Blue Gelato, also known as Blue Gelato #41, is a deliciously sweet hybrid marijuana strain made by crossing DJ Shorts old school Blueberry with GSC and Sherbert. With so many delicious strains at play, Blue Gelato puts out a smooth earthy, citrus, and fruity terpene profile that tastes as good as it smells. As for the high, you can expect to feel lofty and free in a state of euphoric bliss. Blue Gelato was originally bred by Barnys Farm.', Validators.required],
        richDescription: [''],
        image: [''],
        eighth: ['25'],
        quarter: ['50'],
        half: ['100'],
        ounce: ['200'],
        quarterPound: ['800'],
        halfPound: ['1600'],
        pound: ['3200']
      });
    } */

  private _initForm(): void {

    this.productForm = this.formBuilder.group({
      category: ['', [Validators.required]],
      productNameType: ['new', [Validators.required]],
      selectedName: [''],
      enteredName: [''],
      unitType: ['', [Validators.required]],
      isFeatured: [],
      brand: ['',],
      flavor: [''],
      strain: [''],
      countInStock: [''],
      cost: [''],
      price: ['', [Validators.required]],
      description: ['', [Validators.required]],
      richDescription: [''],
      image: [''],
      eighth: [''],
      quarter: [''],
      half: [''],
      ounce: [''],
      quarterPound: [''],
      halfPound: [''],
      pound: ['']
    });
  }

  private _mapUnitType(): void {
    this.unitTypes = Object.keys(UNIT_TYPES).map((key) => {
      return {
        label: UNIT_TYPES[key].label,
        value: UNIT_TYPES[key].value
      };
    });
  }

  private _getCategories(): void {
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
          this.categoryMap[cat.name] = cat.id;

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

  private _checkEditMode(): void {
    this.route.params.pipe(takeUntil(this.endsubs$)).subscribe((params) => {
      if (params['id']) {
        this.editmode = true;
        this.currentCheckInId = params['id'];
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
                countInStock: product.countInStock,
                isFeatured: product.isFeatured,
                description: product.description,
                richDescription: product.richDescription,

              });

              if (product.category?.name === 'Flower' ||
                product.category?.name === 'Designer Flower') {
                this.productForm.patchValue({ prices: product.prices });
                if (!!product.countInStock) this.totalInGrams = product.countInStock;
                this.countInStockChange(product.category?.name);
              }
              else {
                this.productForm.patchValue({ price: product.price });
              }

              this.selectedStrain = product.strain;

              this.imageDisplay = `${environment.imageUrl}${product.image}`;
              this.productForm.patchValue({ image: this.imageDisplay });
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

  categoryChanged(event: HTMLInputElement): void {
    const categoryName = this.categories[event.value]?.name;

    this.productsService.getProducts([this.categoryMap[categoryName]]).subscribe((results: Product[]) => {
      results.forEach((product: Product) => {
        this.productNames.push(product);
      });

      this.priceFormatChanged(event);
      this.countInStockChange(categoryName);

      if (categoryName === 'Flower' || categoryName === 'Designer Flower') {
        this.unitTypes = [{ label: 'Gram', value: 'Gram' }];

        this.inStockSimple = false;
        this.inStockPounds = true;

      }
      else {
        this.inStockSimple = true;
        this.inStockPounds = false;
        this._mapUnitType();
      }

    });
  }

  existingProductSelected(event: HTMLInputElement): void {
    this.productsService.getProduct(event.value).subscribe((productInfo: Product) => {
      this.patchForm(productInfo)
    })
  }

  patchForm(productInfo: Product): void {

  }


  updateAmt(type: string): void {
    let amt: number = Number(this.prodForm[type].value);

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

      this.productForm.addControl('price', this.formBuilder.control(''));
    }
  }

  strainSelected(event: any): void {
    this.selectedStrain = event.value;
  }

  productNameTypeSelected(event: any) {
    this.productNameType = event.value;
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.productForm.invalid) return;

    if (!(this.prodForm['selectedName'].value || this.prodForm['enteredName'].value)) {
      return;
    }

    // const productFormData: any = {};
    const productFormData = new FormData();
    const skipFields = ['prices', 'selectedName', 'enteredName', 'pounds', 'ounces', 'grams'];

    for (const field in this.productForm.controls) {
      if (!skipFields.includes(field) && this.prodForm[field] !== undefined) {
        console.log(field);
        productFormData.append(field, this.prodForm[field].value);
      }
    }

    productFormData.append('countReceived', this.totalInGrams.toString());
    productFormData.append('strain', this.selectedStrain);
    productFormData.append('name', this.prodForm['selectedName'].value || this.prodForm['enteredName'].value);

    const priceData: { name: string, amount: number, price: number }[] = [];


    FLOWER_AMOUNTS.forEach(name => {
      if (!!this.prodForm[name]?.value) {
        priceData.push({ name: name, amount: FLOWER_GRAMS[name], price: this.prodForm[name]?.value })
      }
    });

    productFormData.append('prices', JSON.stringify(priceData));

    console.log(productFormData)
    if (this.editmode) {
      this._updateCheckIn(productFormData);
    } else {
      this._addCheckIn(productFormData);
    }
  }

  private _addCheckIn(checkInData: FormData) {
    this.checkInService
      .createCheckIn(checkInData)
      .pipe(takeUntil(this.endsubs$))
      .subscribe(
        (checkIn: CheckIn) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `CheckIn ${checkIn.name} is created!`
          });
          timer(10000)
            .toPromise()
            .then(() => {
              this.location.back();
            });
        },
        (e) => {
          this.messageService.add({
            severity: 'error',
            summary: `Success: ${e.success}`,
            detail: `CheckIn is not created!\n${e.message}`
          });
        }
      );
  }

  private _updateCheckIn(productFormData: FormData) {
    this.checkInService
      .updateCheckIn(productFormData, this.currentCheckInId)
      .pipe(takeUntil(this.endsubs$))
      .subscribe(
        () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'CheckIn is updated!'
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
            detail: 'CheckIn is not updated!'
          });
        }
      );
  }

  onCancel() {
    this.location.back();
  }

  onImageUpload(event: any) {
    const file = event.target.files[0];
    console.log('file: ', file);
    if (file && this.productForm !== null) {
      console.log('in here')
      this.productForm.patchValue({ image: file });
      if (this.productForm.get('image')) {
        console.log('in here 2')
        this.productForm.get('image')!.updateValueAndValidity();
      }

      const fileReader = new FileReader();
      fileReader.onload = () => {

        console.log('in here 3')
        this.imageDisplay = fileReader.result;
      };
      fileReader.readAsDataURL(file);

      console.log('in here 2')
    }
  }

  get prodForm() {
    return this.productForm.controls;
  }
}
