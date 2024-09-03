import { Component, OnInit } from '@angular/core';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../order.service';
import { filter, forkJoin } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {

  constructor(private http: HttpClient, private route: ActivatedRoute, private orderService: OrderService
    ,private snackBar: MatSnackBar
  ) { }
  private gridApi!: GridApi;
  rowData:any[]=[]
  order: any = {}
  items: {
    item_id: number;
    item_num: string;
    item_description: string;
  }[] = [];
  errors: any = {
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    address_line1: '',
    address_line2: '',
    country_code: ''
  };

  selectedItem: any = {}
  selectedItemId: number = 0;
  newItemQuantity: number = 1;
  isAdding: boolean = false;

  columnDefs: ColDef[] = [
    { headerName: 'Item Number', field: 'item_num', editable: false },
    { headerName: 'Item Description', field: 'item_description', editable: false },
    { headerName: 'Quantity', field: 'quantity', editable: true },
    {
      headerName: 'Actions',
      filter: false,            // Disable filtering for this column
      sortable: false,          // Disable sorting for this column
      floatingFilter: false,    // Disable floating filter for this column
      cellRenderer: (params: any) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-danger btn-sm';
        button.innerText = 'Delete';
        button.style.backgroundColor = '#d9534f'; // Set background color
button.style.color = 'white';             // Set text color
button.style.padding = '10px 20px';       // Add padding
button.style.borderRadius = '5px';        // Make corners rounded
button.style.border = 'none';             // Remove border
button.style.cursor = 'pointer';     
       
        button.addEventListener('click', () => {
          const confirmed = confirm('Are you sure you want to delete this item?');
          if (confirmed) {
            const orderLineId = params.node.data.id; // Assuming the ID field is 'id'
            console.log(params.data)
            const deleteRow=params.data
            console.log(this.rowData.length)
            this.rowData = this.rowData.filter(item => item !== deleteRow); 
            this.http.delete(`http://localhost:3000/orderlines/${deleteRow.orderLineID}`).subscribe(
              response => {
                this.snackBar.open('Deleted the item successfully', 'Close', {
                  duration: 3000,
                  panelClass: ['custom-snackbar'],
                  verticalPosition: 'top',
                  horizontalPosition: 'center', 
                });
                console.log('Deleted successfully', response);
                // remove the row from the grid
              },
              error => {
                console.error('Delete failed', error);
              }
            );
          }
        });
        return button;
      }
    }
  ];



  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 150,
    filter: true,
    sortable: true,
    floatingFilter: true,
  };

  frameworkComponents = {};

  ngOnInit(): void {
    this.fetchItems();
    this.order = this.orderService.getOrderData().orderFullData;
    this.setRowData()
  }

  fetchOrderData(orderId: number): void {
    this.http.get<any>(`http://localhost:3000/orders/${orderId}`)
      .subscribe(order => {
        console.log(this.order)
        console.log(order)
        this.order = order;
        this.setRowData()
      });
  }

  setRowData(): void {
    console.log(this.order.orderLines)
    this.rowData = this.order.orderLines.map((line: any) => ({
      item_num: line.item.item_num,
      item_description: line.item.item_description,
      quantity: line.quantity,
      orderLineID:line.order_line_id
    }));
  
  }

  validateAddress(): boolean {
    let isValid = true;

    // Validate Address Line 1
    if (!this.order.address.address_line1) {
      this.errors.address_line1 = 'Address Line 1 is required';
      isValid = false;
    } else {
      this.errors.address_line1 = '';
    }

    // Validate Address Line 2
    if (!this.order.address.address_line2) {
      this.errors.address_line2 = 'Address Line 2 is required';
      isValid = false;
    } else {
      this.errors.address_line2 = '';
    }

    // Validate Country Code
    if (!this.order.address.country_code) {
      this.errors.country_code = 'Country Code is required';
      isValid = false;
    } else {
      this.errors.country_code = '';
    }

    return isValid;
  }

  validateCustomerInfo(): boolean {
    let isValid = true;

    // Validate First Name
    if (!this.order.customer.first_name) {
      this.errors.first_name = 'First Name is required';
      isValid = false;
    } else {
      this.errors.first_name = '';
    }

    // Validate Last Name
    if (!this.order.customer.last_name) {
      this.errors.last_name = 'Last Name is required';
      isValid = false;
    } else {
      this.errors.last_name = '';
    }

    // Validate Phone (allows + followed by digits)
    const phonePattern = /^\+?\d{10,15}$/;
    if (!this.order.customer.phone || !phonePattern.test(this.order.customer.phone)) {
      this.errors.phone = 'A valid phone number is required';
      isValid = false;
    } else {
      this.errors.phone = '';
    }

    // Validate Email
    if (!this.order.customer.email || !/\S+@\S+\.\S+/.test(this.order.customer.email)) {
      this.errors.email = 'A valid email address is required';
      isValid = false;
    } else {
      this.errors.email = '';
    }

    return isValid;
}


saveOrderDetails() {
  if (this.validateCustomerInfo() && this.validateAddress()) {
    const customer = this.order.customer;
    const customerId = customer.customer_id;
    const address = this.order.address;
    const addressId = address.address_id;

    // Send both requests using forkJoin
    forkJoin([
      this.http.put(`http://localhost:3000/customers/${customerId}`, customer),
      this.http.put(`http://localhost:3000/addresses/${addressId}`, address)
    ]).subscribe(
      ([customerResponse, addressResponse]) => {
        console.log('Customer updated successfully:', customerResponse);
        console.log('Address updated successfully:', addressResponse);

        this.snackBar.open('Customer and Address details have been successfully updated.', 'Close', {
          duration: 3000,
          panelClass: ['custom-snackbar'],
          verticalPosition: 'top',
          horizontalPosition: 'center', 
        });

        // Display the saved information
        console.log('Saved Customer Info:', customerResponse);
        console.log('Saved Address Info:', addressResponse);
      },
      error => {
        console.error('Error updating customer or address', error);
        alert('There was an error updating the customer or address details.');
      }
    );
  }
}

  

  fetchItems(): void {
    this.http.get<any[]>('http://localhost:3000/items').subscribe(
      (data) => {
        this.items = data.map(item => ({
          item_id: item.item_id,
          item_num: item.item_num,
          item_description: item.item_description
        }));
      },
      (error) => {
        console.error('Failed to fetch items', error);
      }
    );
  }



  startAddingItem(): void {
    this.isAdding = true;
  }

  saveNewItem(): void {
    const payload = {
      order_id: this.order.order_id,
      item_id: this.selectedItem.item_id,
      quantity: this.newItemQuantity
    };

    this.http.post('http://localhost:3000/orderlines', payload)
      .subscribe(response => {
        console.log('Order line created successfully', response);
        this.fetchOrderData(this.order.order_id); // Fetch the updated order data
        this.isAdding=!this.isAdding
        this.snackBar.open('Added Item successfully', 'Close', {
          duration: 3000,
          panelClass: ['custom-snackbar'],
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });

      }, error => {
        console.error('Error creating order line', error);
      });
  }

  cancelNewItem(): void {
    this.isAdding = false;
  }

  removeOrderLine(index: number): void {
console.log('clicked the del')
    // this.order.orderLines.splice(index, 1);
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }


}
