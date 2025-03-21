import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { GenreService } from '../../../services/GenreServices/genre.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-genre-dialog',
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
  templateUrl: './genre-dialog.component.html',
  styleUrl: './genre-dialog.component.scss'
})
export class GenreDialogComponent {
    genreForm: FormGroup;
    isEditMode: boolean;

    constructor(
      private fb: FormBuilder,
      private dialogRef: MatDialogRef<GenreDialogComponent>,
      private genreService: GenreService,
      @Inject(MAT_DIALOG_DATA) 
      public data: any
    ){
      this.isEditMode = !!data?.genre; // Nếu có user truyền vào thì là edit mode
  
      this.genreForm = this.fb.group({
        genreName: ['', Validators.required],
      });
  
      if (this.isEditMode) {
        this.genreForm.patchValue(data.genre); // Điền dữ liệu user hiện tại vào form
      }
    }

    onSubmit() {
      if (this.genreForm.valid) {
        const genreData = this.genreForm.value;
        if (this.isEditMode) {
          console.log(this.data.genre.genreId);
          console.log(genreData);
          this.genreService.updateGenre(this.data.genre.genreId, genreData).subscribe({
            next: () => this.dialogRef.close(true),
            error: (err) => console.error('Error updating user:', err)
          });
          console.log("edit mode");
        } else {
          console.log(genreData)
          this.genreService.createGenre(genreData).subscribe({
            next: () => this.dialogRef.close(true),
            error: (err) => console.error('Error creating user:', err)
          });
        }
      }
    }
  
    onCancel() {
      this.dialogRef.close(false);
    }
}
