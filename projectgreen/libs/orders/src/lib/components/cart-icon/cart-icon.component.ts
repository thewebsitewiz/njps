import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';

import { OrdersService } from '../../services/orders.service';

@Component({
  selector: 'orders-cart-icon',
  templateUrl: './cart-icon.component.html',
  styles: []
})
export class CartIconComponent implements OnInit {
  cartInfo: any;
  cartCountLength = 0;
  cartCount: string = '0';

  constructor(private cartService: CartService,
    private ordersService: OrdersService) { }

  ngOnInit(): void {
    console.log('HERE');
    this._getCartDetails();
  }

  private _getCartDetails() {
    console.log('here');
    this.cartInfo = this.cartService.getCart();
    console.log('file: cart-icon.component.ts ~ line 25 ~ CartIconComponent ~ _getCartDetails ~ this.cartInfo', this.cartInfo);
    this.cartInfo.items.forEach((cartItem: any) => {
      console.log('file: cart-icon.component.ts ~ line 26 ~ CartIconComponent ~ this.cartInfo.items.forEach ~ cartItem', cartItem);
      if (cartItem.productId !== undefined) {
        this.ordersService.getProduct(cartItem.productId).subscribe((respProduct) => {
          if (respProduct.category.name === 'Flower' || respProduct.category.name === 'Designer Flower') {
            this.cartCountLength++;
          }
          else if (respProduct.price !== undefined && cartItem.amount !== undefined) {
            const unitPrice = respProduct.price ?? 0;
            const amount = cartItem.amount ?? 0;
            let subTotal = unitPrice * amount;

            this.cartCountLength += cartItem.amount;
          }
        });
      }
    });

    this.cartCount = `${this.cartCountLength}`;
  }


}
