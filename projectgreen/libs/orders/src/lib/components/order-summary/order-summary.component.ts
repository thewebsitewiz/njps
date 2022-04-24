import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@projectgreen/ui';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/operators';
import { CartService } from '../../services/cart.service';
import { DeliveryService } from '../../services/delivery.service';
import { OrdersService } from '../../services/orders.service';

import { environment } from '@env/environment';
import { FLOWER_DISPLAY } from '@projectgreen/products';
import { CartItemDetailed } from '../../models/cart';
import { User } from '@projectgreen/users';
import { Subscription } from 'rxjs/internal/Subscription';
import { Delivery } from '../../models/delivery';

@Component({
  selector: 'orders-order-summary',
  templateUrl: './order-summary.component.html',
  styles: []
})
export class OrderSummaryComponent implements OnInit {

  cartItemsDetailed: CartItemDetailed[] = [];
  cartCount = 0;

  displayMsgAlert: boolean = false;

  totalPrice: number | null = 0;
  isCheckout = false;

  endSubs$: Subject<any> = new Subject();
  user!: User | null;
  userDataSub!: Subscription | undefined;

  itemsTotal: number = 0;
  deliveryFee: number | null = 8000;
  deliveryMsg!: string | null;

  constructor(
    private router: Router,
    private cartService: CartService,
    private ordersService: OrdersService,
    private deliveryService: DeliveryService,
    private authService: AuthService,
  ) {
    this.router.url.includes('checkout') ? (this.isCheckout = true) : (this.isCheckout = false);
  }

  ngOnInit() {
    this._getCartDetails();
  }

  private _getCartDetails(): void {
    this.cartService.cart$.pipe(takeUntil(this.endSubs$)).subscribe((respCart) => {
      this.cartItemsDetailed = [];

      if (respCart.items !== undefined) {
        respCart.items.forEach((cartItem) => {
          if (cartItem.productId !== undefined) {
            this.ordersService.getProduct(cartItem.productId).subscribe((respProduct) => {
              respProduct.image = `${environment.imageUrl}${respProduct.image}`;
              if (respProduct.category.name === 'Flower' || respProduct.category.name === 'Designer Flower') {
                this.cartCount++;
                if (cartItem !== undefined &&
                  cartItem.amountName !== undefined &&
                  FLOWER_DISPLAY[cartItem.amountName] !== undefined) {
                  this.cartItemsDetailed.push({
                    image: respProduct.image,
                    name: respProduct.name,
                    amountName: `${FLOWER_DISPLAY[cartItem.amountName]}`,
                    subTotal: cartItem.price
                  });
                  this.itemsTotal = this.itemsTotal + cartItem.price!;
                  console.log(cartItem.price, this.itemsTotal)
                }
              }
              else if (respProduct.price !== undefined && cartItem.amount !== undefined) {
                const unitPrice = respProduct.price ?? 0;
                const amount = cartItem.amount ?? 0;
                let subTotal = unitPrice * amount;

                this.cartCount += cartItem.amount;
                this.cartItemsDetailed.push({
                  image: respProduct.image,
                  name: respProduct.name,
                  amountName: cartItem.amount,
                  subTotal: subTotal
                });
                this.itemsTotal = this.itemsTotal + subTotal;
              }
            });
          }
        });
      }
      this._getDeliveryCost();
    });
  }


  private _getDeliveryCost(): void {
    const id = this.authService.getLocalId();
    if (!!id) {
      this.user = this.authService.getUserData();
      this.authService.autoAuthUser();
      this.userDataSub = this.authService.autoUserData(id).subscribe(results => {
        this.user = results;
        if (!!this.user && !!this.user.zipCode) {
          this.deliveryService.deliveryFee(this.user.zipCode).subscribe((results: Delivery) => {
            if (!!results.price) {
              this.deliveryFee = results.price;
              this.totalPrice = this.itemsTotal + this.deliveryFee;
              this.deliveryMsg = null;
            }
            else if (!!results.message) {
              this.deliveryFee = null;
              this.deliveryMsg = results.message;
              this.totalPrice = null;
            }

          });
        }
      });
    }
    else {
      this.deliveryFee = null;
      this.deliveryMsg = 'Based on location';
      this.totalPrice = null;
    }
  }


  emptyCart() {
    this.cartService.emptyCart();
  }

  navigateToCheckout() {
    this.router.navigate(['/checkout']);
  }
}
