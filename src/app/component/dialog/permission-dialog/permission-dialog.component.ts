import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PermissionService } from '../../../services/PermissionServices/permission.service';

@Component({
  selector: 'app-permission-dialog',
  imports: [
    MatDialogModule,       // Thêm module cho dialog
    MatFormFieldModule,    // Cho mat-form-field
    MatInputModule,        // Cho input
    MatSelectModule,       // Cho mat-select
    MatButtonModule,       // Cho button
    FormsModule,           // Cho ngModel (nếu cần)
    ReactiveFormsModule,
    MatIconModule,
    CommonModule
  ],
  templateUrl: './permission-dialog.component.html',
  styleUrl: './permission-dialog.component.scss'
})
export class PermissionDialogComponent {
  permissionForm: FormGroup;
  isEditMode: boolean;
  constructor(
    private fb: FormBuilder,
      private dialogRef: MatDialogRef<PermissionDialogComponent>,
      private permissionService: PermissionService,
      @Inject(MAT_DIALOG_DATA) 
      public data: any
  ){
    this.isEditMode = !!data?.permission; // Nếu có user truyền vào thì là edit mode
      
    this.permissionForm = this.fb.group({
      permissionName: ['', Validators.required],
      description:['', Validators.required]
    });

    if (this.isEditMode) {
      this.permissionForm.patchValue(data.permission); // Điền dữ liệu user hiện tại vào form
    }
  }

  onSubmit() {
    if (this.permissionForm.valid) {
      const permissionData = this.permissionForm.value;
      if (this.isEditMode) {
        console.log(this.data.permission.permissionId);
        console.log(permissionData);
        this.permissionService.updatePermission(this.data.permission.permissionId, permissionData).subscribe({
          next: () => this.dialogRef.close(true),
          error: (err) => console.error('Error updating permission:', err)
        });
        console.log("edit mode");
      } else {
        console.log(permissionData)
        this.permissionService.createPermission(permissionData).subscribe({
          next: () => this.dialogRef.close(true),
          error: (err) => console.error('Error creating permission:', err)
        });
      }
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
