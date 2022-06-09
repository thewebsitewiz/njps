import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '@env/environment';
import { CartItem, CartService } from '@projectgreen/orders';

import { Product } from '../../models/product';
import { FLOWER_AMOUNTS, FLOWER_DISPLAY } from '../../products.constants';
import { ProductsService } from '../../services/products.service';

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

          const displayAmt = FLOWER_DISPLAY[name]
          this.selectedAmountDisplay = `${displayAmt} @ $${price}<br/>added to cart`;

          const cartItem: CartItem = {
            productId: this.product.id,
            amount: parseInt(amount, 10),
            unitType: this.product.unitType,
            amountName: name,
            price: parseInt(price, 10)
          };

          console.log(cartItem)

          this.cartService.setCartItem(cartItem, false);

          this.selectedAmount = '';
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

        if (!!this.product.countInStock) this.max = this.product.countInStock;
        if (!!this.product.countInStock && this.product.countInStock < 1) {
          this.fieldDisabled = true;
        }
        if ((this.product.category?.name === 'Flower' || this.product.category?.name === 'Designer Flower') &&
          !!this.product.countInStock &&
          this.product.countInStock <= 28) {
          this.limitedQuantityMessage = 'Limited quantity available!';
        }
        else if (this.product.category?.name !== 'Flower' &&
          this.product.category?.name !== 'Designer Flower' &&
          !!this.product.countInStock &&
          this.product.countInStock <= 5) {
          this.limitedQuantityMessage = 'Limited quantity available!';
        }

        if (this.product.category?.name !== 'Flower' &&
          this.product.category?.name !== 'Designer Flower' &&
          !!this.product.countInStock &&
          this.product.countInStock < 1) {
          this.limitedQuantityMessage = 'Sold out!';
        }
        const priceInfo: any = {};
        if (this.product.prices !== undefined) {
          this.product.prices.forEach(pr => {
            const name = pr.name;
            priceInfo[name] = pr;
          })
        }

        FLOWER_AMOUNTS.forEach(pr => {
          let inactive: boolean = false;
          if (priceInfo[pr] !== undefined && priceInfo[pr].price !== null) {
            let name;
            if (this.product.countInStock !== undefined && this.product.countInStock < priceInfo[pr].amount) {
              inactive = true;
            }
            else {
              if (priceInfo[pr].price !== undefined &&
                !!this.product.countInStock &&
                this.product.countInStock >= priceInfo[pr].amount) {
                inactive = false;
                const displayAmt = FLOWER_DISPLAY[priceInfo[pr].name];
                name = `${displayAmt}: $${priceInfo[pr].price}`;
              } else {
                inactive = true;
              }
            }
            if (name !== '' && name !== undefined) {
              this.prices.push({ name: name, code: `${priceInfo[pr].name}:${priceInfo[pr].amount}:${priceInfo[pr].price}`, unavailable: inactive })
              inactive = false;
            }
          }
        });

        if (!!this.product.image &&
          !!this.product &&
          !!this.product.images) { this.product.images.unshift(this.product.image); }
        if (!!this.product.images) this.product.images.forEach((image: any) => {
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


