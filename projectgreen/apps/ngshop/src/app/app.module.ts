import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { ProductsModule } from '@projectgreen/products';
import { OrdersModule } from '@projectgreen/orders';
import { UiModule } from '@projectgreen/ui';
import { JwtInterceptor, UsersModule } from '@projectgreen/users';

import { AppRoutingModule } from './app-routing.module';

import { HomePageComponent } from './pages/home-page/home-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { LogoutPageComponent } from './pages/logout-page/logout-page.component';
import { RegistrationPageComponent } from './pages/registration-page/registration-page.component';

import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { NavComponent } from './shared/nav/nav.component';

import { AccordionModule } from 'primeng/accordion';
import { ToastModule } from 'primeng/toast';
import { MessageService, MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

import { AppComponent } from './app.component';
import { MessagesComponent } from './shared/messages/messages.component';

/* const routes: Routes = [
  { path: '', component: HomePageComponent },
  {
    path: 'userlogin',
    component: LoginPageComponent
  },
  {
    path: 'register',
    component: RegistrationPageComponent
  }];

  RouterModule.forRoot(routes, { initialNavigation: 'enabled', anchorScrolling: 'enabled', enableTracing: false }),


*/



@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    UiModule,
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    ProductsModule,
    AccordionModule,
    BrowserAnimationsModule,
    OrdersModule,
    ToastModule,
    UsersModule,
    MenuModule,
    ButtonModule,
    RippleModule
  ],
  declarations: [
    AppComponent,
    HomePageComponent,
    HeaderComponent,
    FooterComponent,
    NavComponent,
    MessagesComponent,
    LoginPageComponent,
    LogoutPageComponent,
    RegistrationPageComponent
  ],
  providers: [
    MessageService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class AppModule { }
