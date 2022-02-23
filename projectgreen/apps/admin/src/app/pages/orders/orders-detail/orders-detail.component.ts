import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Order, OrdersService, ORDER_STATUS } from '@projectgreen/orders';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'admin-orders-detail',
  templateUrl: './orders-detail.component.html',
  styles: []
})
export class OrdersDetailComponent implements OnInit, OnDestroy {
  order!: Order;
  orderStatuses: any[] = [];
  selectedStatus: any;
  endsubs$: Subject<any> = new Subject();

  name: string = '';
  totalPrice: number = 0;
  orderIdDecimal!: number;

  constructor(
    private orderService: OrdersService,
    private messageService: MessageService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this._mapOrderStatus();
    this._getOrder();
  }

  ngOnDestroy() {
    this.endsubs$.next(null);
    this.endsubs$.complete();
  }

  private _mapOrderStatus() {
    this.orderStatuses = Object.keys(ORDER_STATUS).map((key) => {
      return {
        id: key,
        name: ORDER_STATUS[key].label
      };
    });
  }

  private _getOrder() {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.orderService
          .getOrder(params['id'])
          .pipe(takeUntil(this.endsubs$))
          .subscribe((order: Order) => {
            this.order = order;
            console.log('file: orders-detail.component.ts ~ line 55 ~ OrdersDetailComponent ~ .subscribe ~ this.order', this.order);
            this.name = this.order.name;
            this.orderIdDecimal = parseInt(this.order.id, 10);
            this.selectedStatus = order.status;
            if (this.order.orderItems.length > 0) {
              this.order.orderItems.forEach(item => {
                const priceRef: any = {};
                console.log('****** ', `|${item.product.price}|`, item.product.prices.length)
                if (item.product.price !== null && item.product.price.toString() !== '') {
                  this.totalPrice += item.product.price * item.amount;
                  console.log('file: orders-detail.component.ts ~ line 67 ~ OrdersDetailComponent ~ .subscribe ~ this.totalPrice', this.totalPrice);
                  item.product.amountName = item.amount.toString();
                }
                else if (item.product.prices.length > 0) {
                  let prices = item.product.prices;
                  console.log('prices: ', prices)

                  prices.forEach(pr => {
                    console.log(pr.amount, pr.price, pr.name)
                    priceRef[pr.amount] = { price: pr.price, name: pr.name }
                  });

                  console.log('item.amount: ', item.amount, priceRef[item.amount])
                  this.totalPrice += priceRef[item.amount].price;
                  console.log('item.amount: ', item.amount, priceRef[item.amount], this.totalPrice)

                  if (item.product.category.name === 'Flower' || item.product.category.name === 'Designer Flower') {
                    item.product.amountName = priceRef[item.amount].name;
                    item.product.price = priceRef[item.amount].price;
                    item.amount = 1;
                  }
                }
              });
            }
          });
      }
    });
  }

  onStatusChange(event: HTMLInputElement) {
    this.orderService
      .updateOrder({ status: event.value }, this.order.id)
      .pipe(takeUntil(this.endsubs$))
      .subscribe(
        () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Order is updated!'
          });
        },
        () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Order is not updated!'
          });
        }
      );
  }
}
