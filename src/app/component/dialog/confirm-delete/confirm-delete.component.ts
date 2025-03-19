import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-delete',
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './confirm-delete.component.html',
  styleUrl: './confirm-delete.component.scss'
})
export class ConfirmDeleteComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmDeleteComponent>, @Inject(MAT_DIALOG_DATA) public data: { userId: number }) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
