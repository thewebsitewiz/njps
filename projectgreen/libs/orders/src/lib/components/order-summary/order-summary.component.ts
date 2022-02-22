import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { CartService } from '../../services/cart.service';
import { OrdersService } from '../../services/orders.service';

@Component({
  selector: 'orders-order-summary',
  templateUrl: './order-summary.component.html',
  styles: []
})
export class OrderSummaryComponent implements OnInit, OnDestroy {

  private _delivery: any;
  @Input() set delivery(value: any) {
    if (this._delivery !== value) {
      this._delivery = value;
      this.updateDelivery(this._delivery);
    }


  }

  deliveryMsg: string = 'Based on location';
  displayMsgAlert: boolean = false;

  endSubs$: Subject<any> = new Subject();
  totalPrice!: number;
  isCheckout = false;
  constructor(
    private router: Router,
    private cartService: CartService,
    private ordersService: OrdersService
  ) {
    this.router.url.includes('checkout') ? (this.isCheckout = true) : (this.isCheckout = false);
  }

  get delivery(): any {
    return this._delivery;
  }

  ngOnInit(): void {
    this._getOrderSummary();
  }

  ngOnDestroy(): void {
    this.endSubs$.next(null);
    this.endSubs$.complete();
  }

  _getOrderSummary() {
    this.cartService.cart$.pipe(takeUntil(this.endSubs$)).subscribe((cart) => {
      this.totalPrice = 0;
      if (cart && cart.items !== undefined) {
        cart.items.map((item) => {
          if (item.productId !== undefined) {
            this.ordersService
              .getProduct(item.productId)
              .pipe(take(1))
              .subscribe((product) => {
                if (item.unitType === 'gram' && item.price !== undefined) {
                  this.totalPrice += item.price
                }
                else {
                  if (item.amount !== undefined) {
                    this.totalPrice += product.price * item.amount;
                  }
                }

              });
          }
        });
      }
    });
  }

  updateDelivery(delivery: any) {
    if (delivery === null || delivery === '') {
      this._getOrderSummary();
      this.deliveryMsg = 'Delivery not available';
      this.displayMsgAlert = true;
    }
    else if (delivery.toString().match(/^[0-9]*$/)) {
      this.totalPrice += delivery;
      this.deliveryMsg = `$${delivery}.00`
    }
  }
  emptyCart() {
    this.cartService.emptyCart();
  }

  navigateToCheckout() {
    this.router.navigate(['/checkout']);
  }
}
