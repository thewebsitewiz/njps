import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'orders-cart-icon',
  templateUrl: './cart-icon.component.html',
  styles: []
})
export class CartIconComponent implements OnInit {
  cartCountLength = 0;
  cartCount: string = '0'
  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.cartService.cart$.subscribe((cart) => {
      this.cartCountLength = cart?.items?.length ?? 0;
      this.cartCount = this.cartCountLength.toString();
    });
  }
}
