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
    if (!cart) {
      const intialCart = {
        items: []
      };
      const intialCartJson = JSON.stringify(intialCart);
      localStorage.setItem(CART_KEY, intialCartJson);
    }
  }

  emptyCart() {
    const intialCart = {
      items: []
    };
    const intialCartJson = JSON.stringify(intialCart);
    localStorage.setItem(CART_KEY, intialCartJson);
    this.cart$.next(intialCart);
  }

  getCart(): Cart {
    const cartJsonString: string | null = localStorage.getItem(CART_KEY);
    if (cartJsonString !== null) {
      return JSON.parse(cartJsonString);
    }
    return {};
  }

  setCartItem(cartItem: CartItem, updateCartItem?: boolean): Cart {
    const cart = this.getCart();
    if (cart.items !== undefined) {
      const cartItemExist = cart.items.find((item) => item.productId === cartItem.productId);
      if (cartItemExist && cart.items !== undefined) {
        cart.items.map((item) => {
          if (item.productId === cartItem.productId) {
            if (updateCartItem) {
              item.quantity = cartItem.quantity;
            } else {
              if (item.quantity !== undefined && cartItem.quantity !== undefined) {
                item.quantity = item.quantity + cartItem.quantity;
              }
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
