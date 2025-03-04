import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Cart, CartItem } from '../models/cart';

export const CART_KEY = 'cart';
@Injectable({
  providedIn: 'root'
})
export class CartService {
  cart$: BehaviorSubject<Cart> = new BehaviorSubject(this.getCart());

  constructor() { }

  initCartLocalStorage() {
    const cart: Cart = this.getCart();
    if (!cart || !cart.items) {
      const initalCart = {
        items: []
      };
      const initalCartJson = JSON.stringify(initalCart);
      localStorage.setItem(CART_KEY, initalCartJson);
    }
  }

  emptyCart() {
    const initalCart = {
      items: []
    };
    const initalCartJson = JSON.stringify(initalCart);
    localStorage.setItem(CART_KEY, initalCartJson);
    this.cart$.next(initalCart);
  }

  getCart(): Cart {
    const cartJsonString: string | null = localStorage.getItem(CART_KEY);
    if (cartJsonString !== null) {
      const cartInfo = JSON.parse(cartJsonString);
      return cartInfo;
    }
    return {};
  }

  /*
    const cartItem: CartItem = {
      productId: this.product.id,
      amount: parseInt(amount, 10),
      amountName: name,
      type: type,
      price: parseInt(price, 10)
    }; */


  setCartItem(cartItem: CartItem, updateCartItem: boolean = true): Cart {
    const cart = this.getCart();
    if (cart.items === undefined) {
      this.initCartLocalStorage();
    }
    if (cart.items !== undefined) {
      const cartItemExist = cart.items.find((item) => item.productId === cartItem.productId);
      if (cartItemExist && cart.items !== undefined) {
        cart.items.map((item) => {
          if (item.productId === cartItem.productId) {
            if (updateCartItem) {
              if (item.amount !== undefined && cartItem.amount !== undefined) {
                item.amount = item.amount + cartItem.amount;
              }
            } else {
              item.amount = cartItem.amount;
            }
            return item;
          }
          return;
        });
      } else {
        cart.items.push(cartItem);
      }

    }

    const cartJson = JSON.stringify(cart) ?? '';
    localStorage.setItem(CART_KEY, cartJson);
    this.cart$.next(cart);
    return cart;
  }

  deleteCartItem(productId: string) {
    const cart = this.getCart();
    let newCart;
    if (cart.items !== undefined) {
      newCart = cart.items.filter((item) => item.productId !== productId);
    }

    cart.items = newCart;

    const cartJsonString = JSON.stringify(cart);
    localStorage.setItem(CART_KEY, cartJsonString);

    this.cart$.next(cart);
  }
}
