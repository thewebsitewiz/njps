import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomePageComponent } from './pages/home-page/home-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { LogoutPageComponent } from './pages/logout-page/logout-page.component';
import { RegistrationPageComponent } from './pages/registration-page/registration-page.component';

import { ProductsModule } from '@projectgreen/products';
import { OrdersModule } from '@projectgreen/orders';

const routes: Routes = [
  {
    path: 'login',
    component: LoginPageComponent
  },
  {
    path: 'register',
    component: RegistrationPageComponent
  },
  {
    path: 'logout',
    component: LogoutPageComponent
  },
  {
    path: '',
    component: HomePageComponent
  },
  {
    path: '**',
    component: HomePageComponent
  }
];


@NgModule({
  imports: [ProductsModule,
    OrdersModule,
    RouterModule.forRoot(routes, { initialNavigation: 'enabled', anchorScrolling: 'enabled', enableTracing: false })],
  exports: [RouterModule],
  declarations: [],
  providers: []
})
export class AppRoutingModule { }


/*
const routesAdm: Routes = [
  {
    path: '',
    component: HomePageComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: HomePageComponent
      },
      {
        path: 'products/form',
        component: ProductsFormComponent
      },
      {
        path: 'products/form/:id',
        component: ProductsFormComponent
      },
      {
        path: 'delivery',
        component: DeliveryListComponent
      },
      {
        path: 'delivery/form',
        component: DeliveryFormComponent
      },
      {
        path: 'delivery/form/:id',
        component: DeliveryFormComponent
      },
      {
        path: 'inventory',
        component: InventoryListComponent
      },
      {
        path: 'inventory/form',
        component: InventoryFormComponent
      },
      {
        path: 'inventory/form/:id',
        component: InventoryFormComponent
      },
      {
        path: 'users',
        component: UsersListComponent
      },
      {
        path: 'users/form',
        component: UsersFormComponent
      },
      {
        path: 'users/form/:id',
        component: UsersFormComponent
      },
      {
        path: 'orders',
        component: OrdersListComponent
      },
      {
        path: 'orders/:id',
        component: OrdersDetailComponent
      },
      {
        path: 'faq',
        component: FAQListComponent
      },
      {
        path: 'faq/form',
        component: FAQFormComponent
      },
      {
        path: 'faq/form/:id',
        component: FAQFormComponent
      }
    ]
  }
];
 */
