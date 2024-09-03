import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor() { }
  private selectedOrder: any;

  setOrderData(data: any) {
    this.selectedOrder = data;
  }

  getOrderData() {
    return this.selectedOrder;
  }

  clearOrderData() {
    this.selectedOrder = null;
  }
}
