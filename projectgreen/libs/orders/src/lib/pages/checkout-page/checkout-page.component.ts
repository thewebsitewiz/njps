import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@projectgreen/users';
import { AuthService } from '@projectgreen/ui'
import { Delivery, DeliveryService } from '@projectgreen/orders';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Cart } from '../../models/cart';
import { OrderForm } from '../../models/order';
import { CartService } from '../../services/cart.service';
import { OrdersService } from '../../services/orders.service';

@Component({
  selector: 'orders-checkout-page',
  templateUrl: './checkout-page.component.html'
})
export class CheckoutPageComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private authService: AuthService,
    private deliveryService: DeliveryService,
    private cartService: CartService,
    private ordersService: OrdersService
  ) { }

  isSubmitted = false;
  orderItems: any[] = [];  // OrderItem[] = [];
  id!: string;
  countries: { id: string; name: string }[] = [];
  unsubscribe$: Subject<any> = new Subject();
  endSubs$: Subject<any> = new Subject();
  userDataSub!: Subscription | undefined;
  readyForCheckout: boolean = false;
  user!: User | null;

  zip: string = '';
  delivery: any = 'Fee based on location';


  itemsTotal: number = 0;
  deliveryFee!: number | null;
  deliveryMsg!: string | null;

  private authStatusSub!: Subscription;
  userData!: User;


  fullName!: string;
  streetAddress!: string;
  aptOrUnit!: string;
  city!: string;
  zipCode!: string;
  phoneNumber!: string;
  password!: string;

  ngOnInit() {
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
          });
        } else {
          this.deliveryFee = null;
          this.deliveryMsg = 'Based on location'
        }

        console.log(this.deliveryFee, this.deliveryMsg);
      });
    }
  }








  ngOnDestroy() {
    this.unsubscribe$.next(null);
    this.unsubscribe$.complete();
    this.endSubs$.next(null);
    this.endSubs$.complete();
  }

  private _initCheckoutForm() {
    /*  this.checkoutFormGroup = this.formBuilder.group({
       fullName: [this.user.fullName, Validators.required],
       phoneNumber: [this.user.phoneNumber, Validators.required],
       city: [this.user.city, Validators.required],
       zipCode: [this.user.zipCode, [Validators.required, Validators.pattern("^[0-9]{5}$")]],
       streetAddress: [this.user.streetAddress, Validators.required],
       aptOrUnit: [this.user.aptOrUnit]
     }); */

    this.cartService.initCartLocalStorage();

  }

  private _autoFillUserData() {




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
    /*  if (this.checkoutFormGroup.invalid && this.readyForCheckout !== true) {
       return;
     } */

    /* const order: OrderForm = {
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
    }; */

    /* this.ordersService.createOrder(order).subscribe(
      () => {
        //redirect to thank you page // payment
        this.cartService.emptyCart();
        this.router.navigate(['/success']);
      },
      () => {
        //display some message to user
      }
    ); */
  }

  /* get checkoutForm() {
    return this.checkoutFormGroup.controls;
  } */
}
