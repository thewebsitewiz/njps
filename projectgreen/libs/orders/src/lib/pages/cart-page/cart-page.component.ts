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

      if (respCart.items !== undefined) {
        // this.cartCount = respCart.items.length ?? 0;
        respCart.items.forEach((cartItem) => {
          console.log(cartItem);
          if (cartItem.productId !== undefined) {
            this.ordersService.getProduct(cartItem.productId).subscribe((respProduct) => {
              console.log(respProduct);
              respProduct.image = `${environment.imageUrl}${respProduct.image}`;
              if (respProduct.category.name === 'Flower' || respProduct.category.name === 'Designer Flower') {
                this.cartCount++;
                // console.log('file: cart-page.component.ts ~ line 47 ~ CartPageComponent ~ this.ordersService.getProduct ~ this.cartCount', this.cartCount);
                this.cartItemsDetailed.push({
                  image: respProduct.image,
                  name: respProduct.name,
                  amountName: cartItem.amountName,
                  subTotal: cartItem.price
                });
              }
              else if (respProduct.price !== undefined && cartItem.amount !== undefined) {
                const unitPrice = respProduct.price ?? 0;
                const amount = cartItem.amount ?? 0;
                let subTotal = unitPrice * amount;

                this.cartCount += cartItem.amount;
                // console.log('file: cart-page.component.ts ~ line 61 ~ CartPageComponent ~ this.ordersService.getProduct ~ this.cartCount', this.cartCount);

                this.cartItemsDetailed.push({
                  image: respProduct.image,
                  name: respProduct.name,
                  amountName: cartItem.amount,
                  subTotal: subTotal
                });
              }
            });
          }
        });
      }

    });
  }

  backToShop() {
    this.router.navigate(['/']);
  }

}
