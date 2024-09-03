import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { OrderGridComponent } from './ordergrid/ordergrid.component';
import { AgGridModule } from 'ag-grid-angular';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { HttpClientModule } from '@angular/common/http';
import { AddOrderComponent } from './add-order/add-order.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AddCustomerComponent } from './add-customer/add-customer.component';
import { AddItemComponent } from './add-item/add-item.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    OrderGridComponent,
    OrderDetailComponent,
    AddOrderComponent,
    AddCustomerComponent,
    AddItemComponent
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AgGridModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatSnackBarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
