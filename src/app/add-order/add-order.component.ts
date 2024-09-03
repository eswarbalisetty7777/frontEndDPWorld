import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-order',
  templateUrl: './add-order.component.html',
  styleUrls: ['./add-order.component.css']  // Reuse the same CSS as order-detail
})
export class AddOrderComponent implements OnInit {
  orderForm!: FormGroup;
  items: any[] = [];        // Items fetched from the server
  addresses: any[] = [];    // Existing addresses fetched from the server
  customerObjects:any[]=[]
  customerId=-1
  addressId=-1
  rowData: any[] = [];
  private gridApi!: GridApi;
  isAdding: boolean = false;
  isAddingNewAddress: boolean = false;
  customerAddresses:any[]=[]
  columnDefs: ColDef[] = [
    { headerName: 'Item Number', field: 'item_num', editable: false },
    { headerName: 'Item Description', field: 'item_description', editable: false },
    { headerName: 'Quantity', field: 'quantity', editable: true },
    {
      headerName: 'Actions',
      filter: false,
      sortable: false,
      floatingFilter: false,
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
            this.removeOrderLine(params.node.rowIndex);
            this.snackBar.open('Item deleted successfully', 'Close', {
              duration: 3000,
              panelClass: ['custom-snackbar'],
              verticalPosition: 'top',
              horizontalPosition: 'center', 
            });
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

  constructor(private fb: FormBuilder, private http: HttpClient, private router:Router,private snackBar: MatSnackBar ) { }

  fetchCustomers() {
    this.http.get<any[]>('http://localhost:3000/customers').subscribe(
      (data) => {
        this.customerObjects = data;
      },
      (error) => {
        console.error('Failed to fetch customers', error);
      }
    );
  }

  onAddressChange(event: Event){
    const selectedAddress = (event.target as HTMLSelectElement).value;
    this.addressId=Number(selectedAddress)
  }

  onCustomerCodeChange(event: Event) {
    const selectedCode = (event.target as HTMLSelectElement).value;
    
    // Find the customer object based on the selected customer_code
    const selectedCustomer = this.customerObjects.find(customer => customer.customer_code === selectedCode);
    this.customerId=selectedCustomer.customer_id;
    this.customerAddresses=[]
    if (selectedCustomer) {
      // Populate the form with the selected customer details
      this.orderForm.patchValue({
        customer: {
          first_name: selectedCustomer.first_name,
          last_name: selectedCustomer.last_name,
          phone: selectedCustomer.phone,
          email: selectedCustomer.email
        }
      });

      // Populate the addresses dropdown
    this.customerAddresses = selectedCustomer.addresses.map((address: { address_id: any; address_type: any; address_line1: any; address_line2: any; country_code: any; }) => {
      return {
        address_id: address.address_id,
        address_type: address.address_type,
        displayAddress: `${address.address_line1}, ${address.address_line2}, ${address.country_code}`
      };
    });
    }
  }
  
  
  

  ngOnInit(): void {
    this.initForm();
    this.fetchItems();
    this.fetchAddresses();
    this.fetchCustomers();
    this.customerId=-1
    this.addressId=-1
  }

  /**
   * Initialize the reactive form with necessary form groups and controls.
   */
  initForm() {
    this.orderForm = this.fb.group({
      customer: this.fb.group({
        customer_code: ['', Validators.required],  // Customer Code is required
        first_name: [{ value: '', disabled: true }, Validators.required],
        last_name: [{ value: '', disabled: true }, Validators.required],
        phone: [{ value: '', disabled: true }, [Validators.required]],
        email: [{ value: '', disabled: true }, [Validators.required, Validators.email]]
      }),
      address: this.fb.group({
        address_type: ['', Validators.required],  // New control to select address type
        existing_address_id: [''],                 // To hold selected existing address ID
        address_line1: [{ value: '', disabled: true }, Validators.required],
        address_line2: [{ value: '', disabled: true }, Validators.required],
        country_code: [{ value: '', disabled: true }, Validators.required]
      }),
      orderLines: this.fb.array([]),
      newItem: this.fb.group({
        item_id: [],
        quantity: []
      })
    });

    // Listen to changes in address_type to toggle address fields
   
  }

  /**
   * Fetch existing addresses from the server.
   */
  fetchAddresses(): void {
    this.http.get<any[]>('http://localhost:3000/addresses').subscribe(
      (data) => {
        this.addresses = data;
      },
      (error) => {
        console.error('Failed to fetch addresses', error);
      }
    );
  }

  /**
   * Handle changes in the address dropdown selection.
   * @param selectedValue The selected value from the address dropdown.
   */



 

  /**
   * Getter for orderLines FormArray
   */
  get orderLines(): FormArray {
    return this.orderForm.get('orderLines') as FormArray;
  }

  /**
   * Start the process of adding a new order line item.
   */
  startAddingItem() {
    this.isAdding = true;
  }

  /**
   * Find and log all invalid form controls for debugging.
   */
  findInvalidControls() {
    const invalidControls: any[] = [];
    const controls = this.orderForm.controls;

    for (const name in controls) {
      if (controls[name].invalid) {
        invalidControls.push({ name, errors: controls[name].errors });
      }

      // Check nested form groups (e.g., customer, address)
      if (controls[name] instanceof FormGroup) {
        const nestedControls = (controls[name] as FormGroup).controls;
        for (const nestedName in nestedControls) {
          if (nestedControls[nestedName].invalid) {
            invalidControls.push({ name: `${name}.${nestedName}`, errors: nestedControls[nestedName].errors });
          }
        }
      }
    }

    console.log('Invalid Controls:', invalidControls);
  }

  /**
   * Save a new order line item to the grid.
   */
  saveNewItem() {
    const newItemGroup = this.orderForm.get('newItem') as FormGroup;
    if (newItemGroup && newItemGroup.valid) {
      const newItem = newItemGroup.value;

      const selectedItem = this.items.find(item => item.item_id === Number(newItem.item_id));
      if (!selectedItem) {
        alert('Selected item is invalid.');
        return;
      }

      this.rowData.push({
        item_id: newItem.item_id,
        item_num: selectedItem.item_num,
        item_description: selectedItem.item_description,
        quantity: newItem.quantity
      });

      this.gridApi.setRowData(this.rowData);

      // Reset newItem form
      newItemGroup.reset();
      this.isAdding = false;
      this.snackBar.open('Item added successfully', 'Close', {
        duration: 3000,
        panelClass: ['custom-snackbar'],
        verticalPosition: 'top',
        horizontalPosition: 'center', 
      });
    } else {
      this.validateAllFormFields(newItemGroup);
    }
  }

  /**
   * Cancel adding a new order line item.
   */
  cancelNewItem(): void {
    this.isAdding = false;
    const newItemGroup = this.orderForm.get('newItem') as FormGroup;
    newItemGroup.reset();
  }

  /**
   * Add a new order line item.
   */
  addOrderLine() {
    this.startAddingItem();
  }

  /**
   * Remove an order line item from the grid.
   * @param index The index of the order line to remove.
   */
  removeOrderLine(index: number) {
    this.orderLines.removeAt(index);
    this.rowData.splice(index, 1);
    this.gridApi.setRowData(this.rowData);
  }

  /**
   * Get the item number based on item ID.
   * @param itemId The ID of the item.
   * @returns The item number as a string.
   */
  getItemNum(itemId: any): string {
    const item = this.items.find(i => i.item_id === Number(itemId));
    return item ? item.item_num : '';
  }

  /**
   * Get the item description based on item ID.
   * @param itemId The ID of the item.
   * @returns The item description as a string.
   */
  getItemDescription(itemId: any): string {
    const item = this.items.find(i => i.item_id === Number(itemId));
    return item ? item.item_description : '';
  }

  /**
   * Fetch items from the server to populate the items dropdown.
   */
  fetchItems(): void {
    this.http.get<any[]>('http://localhost:3000/items').subscribe(
      (data) => {
        this.items = data;
      },
      (error) => {
        console.error('Failed to fetch items', error);
      }
    );
  }

  /**
   * Clear specific validation errors.
   */
  clearValidationErrors() {
    this.orderForm.get('customer.customer_code')?.setErrors(null);
  }

  /**
   * Save the entire order by sending necessary data to the server.
   */
  saveOrder() {
    console.log(this.orderForm.value);
    console.log(this.rowData);
    this.findInvalidControls();

    if (this.orderForm.valid) {
        const customerId = this.customerId;
        const addressId = this.addressId;
        if(this.rowData.length==0){
          alert('Please select atleast one order Item')
        }
        const orderLines = this.rowData.map(row => ({
            item_id: row.item_id,
            quantity: row.quantity
        }));

        // Clear any previous validation errors
        this.clearValidationErrors();

        // Create the order
        const order = {
            customer_id: customerId,
            address_id: addressId
        };

        this.http.post('http://localhost:3000/orders', order).subscribe(
            (orderResponse: any) => {
                const orderId = orderResponse.order_id;

                // Create order lines
                const orderLineRequests = orderLines.map(line => {
                    return this.http.post('http://localhost:3000/orderlines', {
                        ...line,
                        order_id: orderId
                    });
                });

                // Execute all order line requests
                forkJoin(orderLineRequests).subscribe(
                    () => {
                      this.snackBar.open('Order is saved Successfully ', 'Close', {
                        duration: 1000,
                        panelClass: ['custom-snackbar'],
                        verticalPosition: 'top',
                        horizontalPosition: 'center', 
                      }).afterDismissed().subscribe(() => {
                        // This block will execute after the snackbar is dismissed
                        this.resetForm();
                        // Navigate to /orders after successful snackbar dismissal
                        this.router.navigate(['/orders']);
                      });
                      
                    },
                    (orderLineError) => {
                        console.error('Error creating order lines', orderLineError);
                        alert('There was an error creating the order lines.');
                    }
                );
            },
            (orderError) => {
                console.error('Error creating order', orderError);
                alert('There was an error creating the order.');
            }
        );
    } else {
        alert('Please fill out the form correctly.');
    }
}


  /**
   * Helper method to create an order after obtaining customer and address IDs.
   * @param customerId The ID of the created customer.
   * @param addressId The ID of the created or selected address.
   * @param orderLines The array of order lines.
   */
  private createOrder(customerId: number, addressId: number, orderLines: any[]) {
    const order = {
      customer_id: customerId,
      address_id: addressId
    };

    this.http.post('http://localhost:3000/orders', order).subscribe(
      (orderResponse: any) => {
        const orderId = orderResponse.order_id;

        // Create order lines
        const orderLineRequests = orderLines.map(line => {
          return this.http.post('http://localhost:3000/orderlines', {
            ...line,
            order_id: orderId
          });
        });

        // Execute all order line requests
        forkJoin(orderLineRequests).subscribe(
          () => {
            alert('Order has been successfully created.');
            this.resetForm();
          },
          (orderLineError) => {
            console.error('Error creating order lines', orderLineError);
            alert('There was an error creating the order lines.');
          }
        );
      },
      (orderError) => {
        console.error('Error creating order', orderError);
        alert('There was an error creating the order.');
      }
    );
  }

  /**
   * Reset the form after successful order creation.
   */
  private resetForm() {
    this.orderForm.reset();
    this.rowData = [];
    if (this.gridApi) {
      this.gridApi.setRowData(this.rowData);
    }
    this.isAddingNewAddress = false;
  }

  /**
   * Validate all form fields to display errors.
   * @param formGroup The form group to validate.
   */
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormArray) {
        control.controls.forEach((arrayControl: any) => {
          this.validateAllFormFields(arrayControl);
        });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      } else {
        control?.markAsTouched({ onlySelf: true });
      }
    });
  }

  /**
   * Handle the grid ready event to initialize the grid API.
   * @param params The grid ready event parameters.
   */
  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }
}
