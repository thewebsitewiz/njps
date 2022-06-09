import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { GRAMS, Product, ProductsService } from '@projectgreen/products';

@Component({
  selector: 'admin-products-list',
  templateUrl: './products-list.component.html',
  styles: []
})
export class ProductsListComponent implements OnInit, OnDestroy {
  products: any = [];
  endsubs$: Subject<any> = new Subject();
  protocol: string = '';
  host: string = '';
  first: number = 0;
  totalRecords!: number;

  @ViewChild('dt') dt: Table | undefined;

  constructor(
    private productsService: ProductsService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this._getProducts();
  }

  ngOnDestroy() {
    this.endsubs$.next(null);
    this.endsubs$.complete();
  }

  private _getProducts() {
    this.productsService
      .getProducts()
      .pipe(takeUntil(this.endsubs$))
      .subscribe((products: any) => {
        products.forEach((product: Product) => {
          product.image = `${environment.imageUrl}${product.image}`;
          if (product.unitType === 'Gram' && (product.category?.name == 'Flower' || product.category?.name == 'Designer Flower')) {
            if (!!product.countInStock) product.displayCount = this.convertFromGrams(product.countInStock);
            product.price = undefined;
            let prices: string = '';
            if (product.prices !== undefined) {
              product.prices.forEach(pr => {
                if (pr.price !== undefined && pr.price !== null)
                  prices += (`${pr.name}: $${pr.price}<br/>`)
              })
            }
            product.displayCost = prices;

          }
          this.products.push(product);
        })
        this.totalRecords = this.products.length;
      });
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




  reset() {
    this.first = 0;
  }
  applyFilterGlobal($event: any, stringVal: any) {
    this.dt!.filterGlobal(($event.target as HTMLInputElement).value, 'contains');
  }

  updateProduct(productid: string) {
    this.router.navigateByUrl(`products/form/${productid}`);
  }

  deleteProduct(productId: string) {
    this.confirmationService.confirm({
      message: 'Do you want to delete this Product?',
      header: 'Delete Product',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.productsService
          .deleteProduct(productId)
          .pipe(takeUntil(this.endsubs$))
          .subscribe(
            () => {
              this._getProducts();
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Product is deleted!'
              });
            },
            () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Product is not deleted!'
              });
            }
          );
      }
    });
  }
}
