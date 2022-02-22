import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem, CartService } from '@projectgreen/orders';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Product } from '../../models/product';
import { ProductsService } from '../../services/products.service';
import { environment } from '@env/environment';

@Component({
  selector: 'products-product-page',
  templateUrl: './product-page.component.html',
  styles: []
})
export class ProductPageComponent implements OnInit, OnDestroy {
  product!: Product;
  endSubs$: Subject<any> = new Subject();
  productImages: string[] = [];

  prices: PriceType[] = [];
  selectedAmount!: string;
  selectedAmountDisplay!: string;

  qty: number = 1;
  min: number = 1;
  max!: number;
  addToCartBtn: boolean = true;
  qtyField: boolean = true;
  fieldDisabled: boolean = false;
  limitedQuantityMessage: string = '';

  constructor(
    private prodService: ProductsService,
    private route: ActivatedRoute,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['productid']) {
        this._getProduct(params['productid']);
      }
    });

  }

  ngOnDestroy(): void {
    this.endSubs$.next(null);
    this.endSubs$.complete();
  }

  addToCart(qty: number | null, price?: number) {
    if (!this.fieldDisabled) {
      if (qty === null) {
        // ${pr.name}:${pr.amount}:${pr.type}:${pr.price}
        if (this.selectedAmount !== undefined) {
          const [name, amount, price] = this.selectedAmount.split(':');
          this.selectedAmountDisplay = `${name} @ $${price}<br/>added to cart`;

          const cartItem: CartItem = {
            productId: this.product.id,
            amount: parseInt(amount, 10),
            unitType: this.product.unitType,
            amountName: name,
            price: parseInt(price, 10)
          };

          this.cartService.setCartItem(cartItem, false);
        }
      }
      else if (qty !== null && qty > 0) {
        const cartItem: CartItem = {
          productId: this.product.id,
          amount: qty,
          unitType: this.product.unitType
        };

        if (price !== undefined && price > 0) {
          cartItem['price'] = price;
        }

        this.cartService.setCartItem(cartItem, true);
      }

    }
  }

  private _getProduct(id: string) {
    this.prodService
      .getProduct(id)
      .pipe(takeUntil(this.endSubs$))
      .subscribe((resProduct) => {
        this.product = resProduct;

        this.max = this.product.countInStock;
        if (this.product.countInStock < 1) {
          this.fieldDisabled = true;
        }
        if (this.product.countInStock < 5) {
          this.limitedQuantityMessage = 'Limited quantity available!';
        }
        if (this.product.countInStock < 1) {
          this.limitedQuantityMessage = 'Sold out!';
        }

        if (this.product.prices !== undefined && this.product.prices.length > 0) {
          this.product.prices.forEach(pr => {
            let inactive: boolean = false;
            let name = pr.name;
            if (this.product.countInStock === undefined || this.product.countInStock < pr.amount) {
              inactive = true;
              name += ': NA';
            }
            else {
              name += `: $${pr.price}`
            }
            this.prices.push({ name: name, code: `${pr.name}:${pr.amount}:${pr.price}`, unavailable: inactive })
          });

        }

        this.product.images.unshift(this.product.image);
        this.product.images.forEach((image: any) => {
          image = `${environment.imageUrl}${image}`;
          this.productImages.push(image)
        });
      });
  }
}

export interface PriceType {
  name: string;
  code: string;
  unavailable: boolean;
}


