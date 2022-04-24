import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CartItemDetailed } from '../../models/cart';
import { CartService } from '../../services/cart.service';
import { OrdersService } from '../../services/orders.service';
import { environment } from '@env/environment';

import { FLOWER_DISPLAY } from '@projectgreen/products';
import { AuthService } from '@projectgreen/ui';
import { User } from '@projectgreen/users';
import { DeliveryService } from '../../services/delivery.service';
import { Delivery } from '../../models/delivery';

@Component({
  selector: 'orders-cart-page',
  templateUrl: './cart-page.component.html',
  styles: []
})
export class CartPageComponent implements OnInit, OnDestroy {
  cartItemsDetailed: CartItemDetailed[] = [];
  cartCount = 0;

  endSubs$: Subject<any> = new Subject();

  user!: User | null;
  userDataSub!: Subscription | undefined;

  itemsTotal: number = 0;
  deliveryFee!: number | null;
  deliveryMsg!: string | null;

  constructor(
    private router: Router,
    private cartService: CartService,
    private ordersService: OrdersService,
    private deliveryService: DeliveryService,
    private authService: AuthService,
  ) { }

  ngOnInit() {

    this._getCartDetails();
  }

  private _getCartDetails(): void {
    this.cartService.cart$.pipe(takeUntil(this.endSubs$)).subscribe((respCart) => {
      this.cartItemsDetailed = [];
      let cartTotal = 0;
      if (respCart.items !== undefined) {
        respCart.items.forEach((cartItem) => {
          if (cartItem.productId !== undefined) {
            this.ordersService.getProduct(cartItem.productId).subscribe((respProduct) => {
              console.log(respProduct);
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
                  cartTotal = cartTotal + cartItem.price!;
                  console.log(cartItem.price, cartTotal)
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
                cartTotal = cartTotal + subTotal;
              }
            });
          }
        });
      }

      this._getDeliveryCost(cartTotal);
    });
  }


  private _getDeliveryCost(cartTotal: number): void {
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
              this.deliveryMsg = null;
            }
            else if (!!results.message) {
              this.deliveryFee = null;
              this.deliveryMsg = results.message;
            }
            this.itemsTotal = cartTotal;
          });
        }
      });
    }
    else {
      this.deliveryFee = null;
      this.deliveryMsg = 'Based on location';
      this.itemsTotal = cartTotal;
    }


  }

  backToShop() {
    this.router.navigate(['/']);
  }


  ngOnDestroy() {/*
    this.endSubs$.next(null);
    this.endSubs$.complete(); */
  }


}
