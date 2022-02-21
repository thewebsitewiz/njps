import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CartItemDetailed } from '../../models/cart';
import { CartService } from '../../services/cart.service';
import { OrdersService } from '../../services/orders.service';
import { environment } from '@env/environment';

@Component({
  selector: 'orders-cart-page',
  templateUrl: './cart-page.component.html',
  styles: []
})
export class CartPageComponent implements OnInit, OnDestroy {
  cartItemsDetailed: CartItemDetailed[] = [];
  cartCount = 0;
  endSubs$: Subject<any> = new Subject();

  constructor(
    private router: Router,
    private cartService: CartService,
    private ordersService: OrdersService
  ) { }

  ngOnInit(): void {
    this._getCartDetails();
  }

  ngOnDestroy() {
    this.endSubs$.next(null);
    this.endSubs$.complete();
  }

  private _getCartDetails() {
    this.cartService.cart$.pipe(takeUntil(this.endSubs$)).subscribe((respCart) => {
      this.cartItemsDetailed = [];

      console.log('respCart: ', respCart)

      if (respCart.items !== undefined) {
        this.cartCount = respCart.items.length ?? 0;
        respCart.items.forEach((cartItem) => {
          if (cartItem.productId !== undefined) {
            this.ordersService.getProduct(cartItem.productId).subscribe((respProduct) => {
              respProduct.image = `${environment.imageUrl}${respProduct.image}`;
              if (respProduct.category.name === 'Flower' || respProduct.category.name === 'Designer Flower') {
                this.cartItemsDetailed.push({
                  image: respProduct.image,
                  name: respProduct.name,
                  unitType: cartItem.unitType,
                  subTotal: cartItem.price
                });
              }
              else if (respProduct.product?.price !== undefined && cartItem.amount !== undefined) {
                const unitPrice = respProduct.price ?? 0;
                const amount = cartItem.amount ?? 0;
                let subTotal = unitPrice * amount;

                this.cartItemsDetailed.push({
                  image: respProduct.image,
                  product: respProduct,
                  amount: cartItem.amount,
                  unitType: cartItem.unitType,
                  subTotal: subTotal
                });
              }
            });
          }
        });
      }

      console.log('this.cartItemsDetailed: ', this.cartItemsDetailed);
    });
  }

  backToShop() {
    this.router.navigate(['/products']);
  }

  /*   deleteCartItem(cartItem: CartItemDetailed) {
      this.cartService.deleteCartItem(cartItem.product.id);
    } */

  /* updateCartItemQuantity(event: any, cartItem: CartItemDetailed) {
    this.cartService.setCartItem(
      {
        productId: cartItem.product.id,
        amount: event.value
      },
      true
    );
  } */
}
