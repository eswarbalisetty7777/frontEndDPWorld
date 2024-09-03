import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.css'] // Use the same CSS as the order and customer components
})
export class AddItemComponent implements OnInit {
  itemForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      item_num: ['', Validators.required],
      item_description: ['', Validators.required]
    });
  }

  saveItem() {
    if (this.itemForm.valid) {
      const itemData = this.itemForm.value;

      this.http.post('http://localhost:3000/items', itemData).subscribe(
        (response: any) => {
          this.snackBar.open('Item added successfully', 'Close', {
            duration: 3000,
            panelClass: ['custom-snackbar'],
            verticalPosition: 'top',
            horizontalPosition: 'center'
          })
        },
        (error: any) => {
          if (error.error.code === 'ITEM_EXISTS') {
            this.snackBar.open('Item with this combination already exists.', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar'],
              verticalPosition: 'top',
              horizontalPosition: 'center'
            });
          } else {
            console.error('Error saving item', error);
            this.snackBar.open('Failed to save item', 'Close', {
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
