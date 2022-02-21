import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CartService, CartItem } from '@projectgreen/orders';
import { Product } from '../../models/product';

@Component({
  selector: 'products-product-item',
  templateUrl: './product-item.component.html',
  styles: []
})
export class ProductItemComponent implements OnInit {
  @Input() product!: Product;

  constructor(private cartService: CartService, private router: Router) { }

  ngOnInit(): void { }

  /*   addProductToCart() {
      const cartItem: CartItem = {
        productId: this.product.id,
        amount: 1
      };
      this.cartService.setCartItem(cartItem);
    } */


  productDetail(id: string) {
    this.router.navigateByUrl(`products/${id}`);
  }
}
