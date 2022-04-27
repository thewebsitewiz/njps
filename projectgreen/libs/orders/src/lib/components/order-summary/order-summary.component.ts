import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@projectgreen/ui';
import { Subject } from 'rxjs/internal/Subject';
import { CartService } from '../../services/cart.service';
import { DeliveryService } from '../../services/delivery.service';
import { OrdersService } from '../../services/orders.service';

import { environment } from '@env/environment';
import { FLOWER_DISPLAY } from '@projectgreen/products';
import { CartItemDetailed } from '../../models/cart';
import { User } from '@projectgreen/users';
import { Subscription } from 'rxjs/internal/Subscription';
import { Delivery } from '../../models/delivery';

@Component({
  selector: 'orders-order-summary',
  templateUrl: './order-summary.component.html',
  styles: []
})
export class OrderSummaryComponent {

  /*   cartItemsDetailed: CartItemDetailed[] = [];
    cartCount = 0;

    displayMsgAlert: boolean = false;

    totalPrice: number | null = 0;


    endSubs$: Subject<any> = new Subject();
    user!: User | null;
    userDataSub!: Subscription | undefined; */

  @Input() isCheckout: boolean = false;

  @Input() itemsTotal!: number;
  @Input() deliveryFee!: number | null;
  @Input() deliveryMsg!: string | null;

  @Input() totalPrice!: number | null;

  constructor(
    private router: Router,
    private cartService: CartService,
    private ordersService: OrdersService,
    private deliveryService: DeliveryService,
    private authService: AuthService,
  ) {
    this.router.url.includes('checkout') ? (this.isCheckout = true) : (this.isCheckout = false);
  }

  emptyCart() {
    this.cartService.emptyCart();
  }

  navigateToCheckout() {
    this.router.navigate(['/checkout']);
  }
}
