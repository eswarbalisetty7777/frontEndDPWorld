import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component'; // Import your HomeComponent
import { OrderGridComponent } from './ordergrid/ordergrid.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { AddOrderComponent } from './add-order/add-order.component';
import { AddCustomerComponent } from './add-customer/add-customer.component';
import { AddItemComponent } from './add-item/add-item.component';

const routes: Routes = [
  { path: '', component: HomeComponent },     // Root path
  { path: 'home', component: HomeComponent } ,
  { path: 'orders', component: OrderGridComponent } , // /home path
  { path: 'orderDetail/:id', component: OrderDetailComponent },
  { path: 'addOrder', component: AddOrderComponent },
  { path: 'add-customer', component: AddCustomerComponent },
  { path: 'add-item', component: AddItemComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
