import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User, UsersService } from '@projectgreen/users';
import { AuthService } from '@projectgreen/ui'
import { DeliveryService } from '@projectgreen/orders';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Cart } from '../../models/cart';
import { OrderForm } from '../../models/order';
import { OrderItem } from '../../models/order-item';
import { CartService } from '../../services/cart.service';
import { OrdersService } from '../../services/orders.service';

@Component({
  selector: 'orders-checkout-page',
  templateUrl: './checkout-page.component.html'
})
export class CheckoutPageComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private usersService: UsersService,
    private authService: AuthService,
    private deliveryService: DeliveryService,
    private formBuilder: FormBuilder,
    private cartService: CartService,
    private ordersService: OrdersService
  ) { }
  checkoutFormGroup!: FormGroup;
  isSubmitted = false;
  orderItems: any[] = [];  // OrderItem[] = [];
  userId!: string;
  countries: { id: string; name: string }[] = [];
  unsubscribe$: Subject<any> = new Subject();
  endSubs$: Subject<any> = new Subject();

  readyForCheckout: boolean = false;

  zip: string = '';
  delivery: any = 'Fee based on location';


  private authStatusSub!: Subscription;
  userData!: User;

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      console.log('file: checkout-page.component.ts ~ line 48 ~ CheckoutPageComponent ~ this.authService.user$.subscribe ~ user', user);
      this._initCheckoutForm();
      this._autoFillUserData();
      //this._getCartItems();
      this._getCartDetails();
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next(null);
    this.unsubscribe$.complete();
    this.endSubs$.next(null);
    this.endSubs$.complete();
  }

  private _initCheckoutForm() {

    this._autoFillUserData();

    this.checkoutFormGroup = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.email, Validators.required]],
      phone: ['', Validators.required],
      city: ['', Validators.required],
      zip: ['', [Validators.required, Validators.pattern("^[0-9]{5}$")]],
      street: ['', Validators.required],
      apartment: ['']
    });


  }

  private _autoFillUserData() {



    /*
    this.usersService
      .observeCurrentUser()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((user) => {
        console.log('file: checkout-page.component.ts ~ line 73 ~ CheckoutPageComponent ~ .subscribe ~ user', user);

      }); */
    /*     this.authService.autoUserData()
        const results =
        console.log('file: checkout-page.component.ts ~ line 87 ~ CheckoutPageComponent ~ _autoFillUserData ~ results', results);
     */

  }
  private _getCartItems() {
    const cart: Cart = this.cartService.getCart();
    if (cart.items !== undefined) {
      this.orderItems = cart.items.map((item) => {
        return {
          product: item.productId,
          amount: item.amount,
          amountName: item.amountName,
          unitType: item.unitType,
          price: item.price
        };
      });
    }
  }

  private async _getCartDetails() {
    this.cartService.cart$.pipe(takeUntil(this.endSubs$)).subscribe((respCart) => {
      this.orderItems = [];

      if (respCart.items !== undefined) {
        respCart.items.forEach((cartItem) => {
          if (cartItem.productId !== undefined) {
            this.ordersService.getProduct(cartItem.productId).subscribe((respProduct) => {
              this.orderItems.push({
                product: cartItem.productId,
                amount: cartItem.amount
              });
            });
          }
        });
      }
    });
  }

  /*   if (respProduct.category.name === 'Flower' || respProduct.category.name === 'Designer Flower') {
      this.orderItems.push({
        productId: cartItem.productId,
        amount: cartItem.amount
      });
    }
    else if (respProduct.price !== undefined && cartItem.amount !== undefined) {
      const unitPrice = respProduct.price ?? 0;
      const amount = cartItem.amount ?? 0;

      this.orderItems.push({
        productId: cartItem.productId,
        amount: cartItem.amount
      });
    } */


  backToCart() {
    this.router.navigate(['/cart']);
  }


  onKey(event: any) {
    if (event.key.match(/[0-9]/)) {
      this.zip += event.key;
    }

    if (event.key === 'Backspace' && this.zip.length > 0) {
      this.zip = this.zip.slice(0, -1);
    }

    if (this.zip.length === 5) {
      this.deliveryService.deliveryFee(this.zip).subscribe((res: any) => {
        if (res === null) {
          this.delivery = '';
          this.readyForCheckout = false
        }
        else {
          this.delivery = res.price;
          this.readyForCheckout = true
        }

      });
    }
  }
  placeOrder() {

    this.isSubmitted = true;
    if (this.checkoutFormGroup.invalid && this.readyForCheckout !== true) {
      return;
    }

    const order: OrderForm = {
      orderItems: this.orderItems,
      name: this.checkoutForm['name'].value,
      shippingAddress1: this.checkoutForm['street'].value,
      shippingAddress2: this.checkoutForm['apartment'].value,
      city: this.checkoutForm['city'].value,
      zip: this.checkoutForm['zip'].value,
      phone: this.checkoutForm['phone'].value,
      status: 0,
      delivery: this.delivery,
      dateOrdered: `${Date.now()}`
    };

    this.ordersService.createOrder(order).subscribe(
      () => {
        //redirect to thank you page // payment
        this.cartService.emptyCart();
        this.router.navigate(['/success']);
      },
      () => {
        //display some message to user
      }
    );
  }

  get checkoutForm() {
    return this.checkoutFormGroup.controls;
  }
}
