import { DialogModule } from 'primeng/dialog';
import { Subject, Subscription, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { Delivery, DeliveryService, OrderForm } from '@projectgreen/orders';
import { FLOWER_DISPLAY, FLOWER_GRAMS } from '@projectgreen/products';
import { AuthService } from '@projectgreen/ui';
import { User } from '@projectgreen/users';

import { CartItemDetailed } from '../../models/cart';
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

  cartItemsDetailed: CartItemDetailed[] = [];
  cartCount = 0;
  cartDetailsSub!: Subscription | undefined;
  endSubs$: Subject<any> = new Subject();

  user!: User | null;
  userDataSub!: Subscription | undefined;
  notRegistered: boolean = false;
  displayPasswordDialog: boolean = false;

  itemsTotal: number = 0;
  totalPrice: number = 0;
  deliveryFee!: number | null;
  deliveryMsg!: string | null;

  delivery = null;
  readyForCheckout = false

  isSubmitted = false;

  formBuilder!: FormBuilder;
  checkoutFormGroup!: FormGroup;

  fullName!: string;
  streetAddress!: string;
  aptOrUnit!: string;
  city!: string;
  zipCode!: string;
  phoneNumber!: string;
  password!: string;

  orderItems: any[] = [];

  ngOnInit() {
    this._initCheckoutForm();
    this._getCartDetails();
  }

  private _getCartDetails(): void {
    this.cartDetailsSub = this.cartService.cart$.pipe(takeUntil(this.endSubs$)).subscribe((respCart) => {
      this.cartItemsDetailed = [];
      if (respCart.items !== undefined) {
        respCart.items.forEach((cartItem) => {
          if (cartItem.productId !== undefined) {
            this.ordersService.getProduct(cartItem.productId).subscribe((respProduct) => {
              respProduct.image = `${environment.imageUrl}${respProduct.image}`;
              if (respProduct.category.name === 'Flower' || respProduct.category.name === 'Designer Flower') {
                this.cartCount++;
                if (cartItem !== undefined &&
                  cartItem.amountName !== undefined &&
                  FLOWER_DISPLAY[cartItem.amountName] !== undefined) {
                  this.cartItemsDetailed.push({
                    productId: cartItem.productId,
                    image: respProduct.image,
                    name: respProduct.name,
                    amountName: `${FLOWER_DISPLAY[cartItem.amountName]}`,
                    subTotal: cartItem.price
                  });
                  this.orderItems.push({ product: cartItem.productId, amount: `${FLOWER_GRAMS[cartItem.amountName]}` })
                  this.itemsTotal = this.itemsTotal + cartItem.price!;
                }
              }
              else if (respProduct.price !== undefined && cartItem.amount !== undefined) {
                const unitPrice = respProduct.price ?? 0;
                const amount = cartItem.amount ?? 0;
                let subTotal = unitPrice * amount;

                this.cartCount += cartItem.amount;
                this.cartItemsDetailed.push({
                  productId: cartItem.productId,
                  image: respProduct.image,
                  name: respProduct.name,
                  amountName: cartItem.amount,
                  subTotal: subTotal
                });
                this.orderItems.push({ product: cartItem.productId, amount: amount })
                this.itemsTotal = this.itemsTotal + subTotal;
              }


            });
          }
        });
      }

      this._getDeliveryCost();

    });
  }

  private _getDeliveryCost(zipChanged = false) {
    const id = this.authService.getLocalId();
    if (!!id) {
      this.user = this.authService.getUserData();
      this.authService.autoAuthUser();
      this.userDataSub = this.authService.autoUserData(id).subscribe(results => {
        this.user = results;
        if (!!results && !zipChanged) {
          this._autoFillUserData(results);
        }
        else {
          console.log('notRegistered = true')
          this.notRegistered = true;
        }

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
            this._orderSummaryTotals()
          });
        }
      });
    }
    else {
      this.deliveryFee = null;
      this.deliveryMsg = 'Based on location';
      this._orderSummaryTotals()
    }
  }

  private _orderSummaryTotals() {
    if (!!this.deliveryMsg) {
      this.totalPrice = this.itemsTotal;
    }
    else {
      this.totalPrice = this.itemsTotal + this.deliveryFee!;
    }
  }

  private _initCheckoutForm() {
    this.checkoutFormGroup = new FormGroup({
      fullName: new FormControl('', Validators.required),
      phoneNumber: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      zipCode: new FormControl('', [Validators.required, Validators.pattern("^0-9]{5}$")]),
      streetAddress: new FormControl('', Validators.required),
      aptOrUnit: new FormControl('')
    });

    this.checkoutFormGroup.controls['zipCode'].valueChanges.subscribe(value => {
      this._getDeliveryCost(true);
    });

    this.checkoutFormGroup.statusChanges.subscribe((status) => {
      //status will be "VALID", "INVALID", "PENDING" or "DISABLED"
      if (status === 'VALID' && this.notRegistered) {
        this._autoRegister();
      }
    })

  }

  private _autoRegister() {
    this.displayPasswordDialog = true;
  }

  private _autoFillUserData(user: any) {
    this.checkoutForm['fullName'].setValue(user['fullName']!);
    this.checkoutForm['phoneNumber'].setValue(user['phoneNumber']!);
    this.checkoutForm['city'].setValue(user['city']!);
    this.checkoutForm['streetAddress'].setValue(user['streetAddress']!);
    this.checkoutForm['zipCode'].setValue(user['zipCode']!);
    this.checkoutForm['aptOrUnit'].setValue(user['aptOrUnit']!);
  }


  backToCart() {
    this.router.navigate(['/cart']);
  }


  onKey(event: any) {
    if (event.key.match(/[0-9]/)) {
      this.zipCode += event.key;
    }

    if (event.key === 'Backspace' && this.zipCode.length > 0) {
      this.zipCode = this.zipCode.slice(0, -1);
    }

    if (this.zipCode.length === 5) {
      this.deliveryService.deliveryFee(this.zipCode).subscribe((res: any) => {
        if (res === null) {
          this.delivery = null;
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
    /* if (this.notRegistered === true) {
      console.log('msg service');

      this.displayPasswordDialog = true;
    } */

    console.log('foo',
      this.checkoutForm['fullName'].value,
      this.checkoutForm['phoneNumber'].value,
      this.checkoutForm['city'].value,
      this.checkoutForm['streetAddress'].value,
      this.checkoutForm['zipCode'].value,
      this.checkoutForm['aptOrUnit'].value);
    /*    if (this.checkoutFormGroup.invalid) {
         return;
       } */

    const order: OrderForm = {
      orderItems: this.orderItems,
      fullName: this.checkoutForm['fullName'].value,
      streetAddress: this.checkoutForm['streetAddress'].value,
      aptOrUnit: this.checkoutForm['aptOrUnit'].value,
      city: this.checkoutForm['city'].value,
      zipCode: this.checkoutForm['zipCode'].value,
      phoneNumber: this.checkoutForm['phoneNumber'].value,
      delivery: this.deliveryFee,
      status: 0,
      totalPrice: this.totalPrice,
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


  ngOnDestroy() {
    if (!!this.userDataSub) this.userDataSub.unsubscribe();
    if (!!this.cartDetailsSub) this.cartDetailsSub.unsubscribe();
  }

}
