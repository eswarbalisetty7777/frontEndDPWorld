import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ColDef } from 'ag-grid-community';
import { OrderService } from '../order.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-order-grid',
  templateUrl: './ordergrid.component.html',
  styleUrls: ['./ordergrid.component.css']
})
export class OrderGridComponent implements OnInit {
   defaultColDef: ColDef = {
    flex: 1,
    minWidth: 150,
    filter: true,
    sortable: true,
    floatingFilter: true,
  };

  public columnDefs: ColDef[];
  public rowData: any[];
  public orders:any[]=[];

  constructor(private http: HttpClient,private router: Router,private orderService: OrderService,
    private snackBar: MatSnackBar

  ) {
    // Define the columns for the order grid
    this.columnDefs = [
      {
        field: 'serialNo',
        headerName: 'Serial Number',
        resizable:true
      },
      {
        field: 'referenceNumber',
        headerName: 'Reference Number',
        resizable:true
      },
      {
        field: 'customerName',
        headerName: 'Customer Name',
        resizable:true
      },
      {
        field: 'customerEmail',
        headerName: 'Email',
        resizable:true
      },
      {
        field: 'customerPhone',
        headerName: 'Phone',
        resizable:true
      },
      {
        field: 'countryCode',
        headerName: 'Country Code',
        resizable:true
      },
      {
        field: 'numberOfItems',
        headerName: 'Number of Items',
        resizable:true
      }
    ];

    // Define the row data for the order grid
    this.rowData = []
  }

  ngOnInit() {
    this.fetchOrder()
  }
   mapOrdersData(orders: any[]): any[] {
    return orders.map((order, index) => {
      return {
        serialNo: index + 1,
        referenceNumber: order.reference_num,
        customerName: `${order.customer.first_name} ${order.customer.last_name}`,
        countryCode: order.address.country_code,
        numberOfItems: order.orderLines.length,
        customerEmail:order.customer.email,
        orderID:order.order_id,
        customerPhone:order.customer.phone,
        orderFullData: order
      };
    });
  }

  addOrder(){
    this.router.navigate(['addOrder'])
  }

  uploadXML(event: any) {
    const file = event.target.files[0];

    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      const headers = new HttpHeaders().set('Accept', 'application/json');

      this.http.post('http://localhost:3000/uploadXML', formData, { headers }).subscribe(
        (response: any) => {
          this.ngOnInit();
          this.snackBar.open('File Uploaded suuccessfully', 'Close', {
            duration: 3000,
            panelClass: ['custom-snackbar'],
            verticalPosition: 'top',
            horizontalPosition: 'center'
          })         
        },
        (error: any) => {
          console.error('Error uploading file:', error);
          alert('There was an error uploading the file.');
        }
      );
    }
  }

  fetchOrder(): void {
    this.http.get<any>(`http://localhost:3000/orders/`).subscribe(
      data => {
        console.log(data)
        this.orders=this.mapOrdersData(data)
        console.log(this.orders)
        this.rowData=this.orders
      },
      error => {
        console.error('Error fetching order:', error);
      }
    );
  }

  onRowClicked(event: any): void {
    this.orderService.setOrderData(event.data);

    console.log(event.data.orderID)
    const orderID = event.data.orderID;
    console.log(orderID)
    this.router.navigate(['/orderDetail', orderID]);

  }
}
