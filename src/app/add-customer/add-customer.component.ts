import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-customer',
  templateUrl: './add-customer.component.html',
  styleUrls: ['./add-customer.component.css']
})
export class AddCustomerComponent implements OnInit {
  customerForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.customerForm = this.fb.group({
      customer_code: ['', Validators.required],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\+?\d{10,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
      address_line1: ['', Validators.required],
      address_line2: ['', Validators.required],
      country_code: ['', Validators.required]
    });
  }

  saveCustomer() {
    if (this.customerForm.valid) {
      const customerData = {
        customer_code: this.customerForm.value.customer_code,
        first_name: this.customerForm.value.first_name,
        last_name: this.customerForm.value.last_name,
        phone: this.customerForm.value.phone,
        email: this.customerForm.value.email
      };
  
      // First, send the request to save the customer
      this.http.post('http://localhost:3000/customers', customerData).subscribe(
        (customerResponse: any) => {
          const addressData = {
            customer_id: customerResponse.customer_id, // Use the customer ID from the response
            address_type: 'primary', // or any default type
            address_line1: this.customerForm.value.address_line1,
            address_line2: this.customerForm.value.address_line2,
            country_code: this.customerForm.value.country_code
          };
  
          // Then, send the request to save the address
          this.http.post('http://localhost:3000/addresses', addressData).subscribe(
            (addressResponse: any) => {
              this.snackBar.open('Customer and Address details saved successfully', 'Close', {
                duration: 3000,
                panelClass: ['custom-snackbar'],
                verticalPosition: 'top',
                horizontalPosition: 'center'
              }).afterDismissed().subscribe(() => {
                this.router.navigate(['/customers']);
              });
            },
            error => {
              console.error('Error saving address', error);
              this.snackBar.open('Failed to save address', 'Close', {
                duration: 3000,
                panelClass: ['error-snackbar'],
                verticalPosition: 'top',
                horizontalPosition: 'center'
              });
            }
          );
        },
        error => {
          // Handle the specific error where customer code already exists
          if (error.error && error.error.code === 'CUSTOMER_CODE_EXISTS') {
            this.snackBar.open('Customer code already exists.', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar'],
              verticalPosition: 'top',
              horizontalPosition: 'center'
            });
          } else {
            console.error('Error saving customer', error);
            this.snackBar.open('Failed to save customer', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar'],
              verticalPosition: 'top',
              horizontalPosition: 'center'
            });
          }
        }
      );
    } else {
      this.snackBar.open('Please fill out the form correctly.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
        verticalPosition: 'top',
        horizontalPosition: 'center'
      });
    }
  }
  
  
}
