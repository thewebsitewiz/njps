import { AccordionModule } from 'primeng/accordion';
import { MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { OrdersModule } from '@projectgreen/orders';
import { ProductsModule } from '@projectgreen/products';
import { UiModule } from '@projectgreen/ui';
import { JwtInterceptor, UsersModule } from '@projectgreen/users';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ContactPageComponent } from './pages/contact/contact.component';
import { FAQPageComponent } from './pages/faq/faq.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { LogoutPageComponent } from './pages/logout-page/logout-page.component';
import { RegistrationPageComponent } from './pages/registration-page/registration-page.component';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';
import { MessagesComponent } from './shared/messages/messages.component';
import { NavComponent } from './shared/nav/nav.component';

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
    RegistrationPageComponent,
    FAQPageComponent,
    ContactPageComponent
  ],
  providers: [
    MessageService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class AppModule { }
