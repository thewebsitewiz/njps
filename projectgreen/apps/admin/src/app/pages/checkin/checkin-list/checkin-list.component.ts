import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { ProductsService } from '@projectgreen/products';

@Component({
  selector: 'admin-checkin-list',
  templateUrl: './checkin-list.component.html',
  styles: []
})
export class CheckinListComponent implements OnInit, OnDestroy {
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
        products.forEach((product: any) => {
          product.image = `${environment.imageUrl}${product.image}`;
          this.products.push(product)
        })
        this.totalRecords = this.products.length;
        console.log(this.products)
      });
  }

  reset() {
    this.first = 0;
  }
  applyFilterGlobal($event: any, stringVal: any) {
    this.dt!.filterGlobal(($event.target as HTMLInputElement).value, 'contains');
  }

  updateProduct(productid: string) {
    this.router.navigateByUrl(`inventory/form/${productid}`);
  }

}
