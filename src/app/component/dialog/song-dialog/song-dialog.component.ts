import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Genre } from '../../../models/genre.module';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { SongService } from '../../../services/SongServices/song.service';
import { GenreService } from '../../../services/GenreServices/genre.service';
import { minSelectionValidator } from '../../../shared/Validators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SongApprovalService } from '../../../services/SongApprovalServices/song-approval.service';

@Component({
  selector: 'app-song-dialog',
  imports: [
    MatDialogModule,       // Thêm module cho dialog
    MatFormFieldModule,    // Cho mat-form-field
    MatInputModule,        // Cho input
    MatSelectModule,       // Cho mat-select
    MatButtonModule,       // Cho button
    FormsModule,           // Cho ngModel (nếu cần)
    ReactiveFormsModule,
    MatIconModule,
    CommonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './song-dialog.component.html',
  styleUrl: './song-dialog.component.scss'
})
export class SongDialogComponent implements OnInit{
  songForm: FormGroup;
  isEditMode: boolean;
  availableGenres:Genre[]= [];
  selectedImgFile: File | null = null;
  selectedImgFileName: string | null = null;

  selectedSongFile: File | null = null;
  selectedSongFileName: string | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SongDialogComponent>,
    private songService: SongService,
    private genreService: GenreService,
    private songApprovalService: SongApprovalService,
    @Inject(MAT_DIALOG_DATA) 
    public data: any
  ){
    this.isEditMode = !!data?.song; // Nếu có user truyền vào thì là edit mode

    this.songForm = this.fb.group({
      title: ['', Validators.required],
      artist: ['', Validators.required],
      songImage: [''],
      // songFileData: [''],
      songFileData: [
        this.isEditMode ? this.data.song.fileSongId : '',
         this.isEditMode ? [] : [Validators.required]], // Chỉ required khi tạo mới
      genreNames:[[],minSelectionValidator(1)],
      downloadable: [null, Validators.required],
      
    });

    if (this.isEditMode) {
      // this.userForm.patchValue(data.user); // Điền dữ liệu user hiện tại vào form
      console.log(data.song)
      this.songForm.patchValue({
        ...data.song,
        genreNames: data.song.genres.map((genre: Genre) => genre.genreName), // Chuyển roles thành mảng roleName
        songImage: data.song.songImage,
        songFileData: data.song.fileSongId
      });
    }
  }
  
  ngOnInit(): void {
    this.getAllGenres();
  }

  removeGenre(genre: string): void {
    const currentGenres = this.songForm.get('genreNames')?.value as string[];
    this.songForm.get('genreNames')?.setValue(currentGenres.filter(g => g !== genre));
  }

  onSubmit() {
    if (this.songForm.valid) {
      const songData = this.songForm.value;
      const requestData: any = {
        title: songData.title,
        artist: songData.artist,
        songImage: this.selectedImgFile || undefined,
        genreNames: songData.genreNames,
        downloadable: songData.downloadable
      };
  
      if (this.isEditMode) {
        requestData.songFileId = songData.songFileData; // Nếu là chế độ sửa, giữ nguyên file
      } else {
        requestData.songFileData = this.selectedSongFile;
      }
  
      if (this.isEditMode) {
        this.songService.updateSong(this.data.song.songId, requestData).subscribe({
          next: () => this.dialogRef.close(true),
          error: (err) => console.error('Error updating song:', err)
        });
      } else {
        this.songService.createSong(requestData).subscribe({
          next: () => this.dialogRef.close(true),
          error: (err) => console.error('Error creating song:', err)
        });
      }
    }
  }
  

  onCancel() {
    this.dialogRef.close(false);
  }

  getAllGenres(){
    // Gọi API để lấy danh sách roles
    this.genreService.getListAllGenres().subscribe({
      next: (genres) => {
        this.availableGenres = genres; // Cập nhật availableRoles từ API
      },
      error: (err) => {
        console.error('Error fetching roles:', err);
      }
    });
  }

  onImgFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImgFile = input.files[0];
      this.selectedImgFileName = this.selectedImgFile.name;
      console.log('Selected file:', this.selectedImgFile);
    }
  }

  clearImgFile() {
    this.selectedImgFile = null;
    this.selectedImgFileName = null;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  onSongFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedSongFile = input.files[0];
      this.selectedSongFileName = this.selectedSongFile.name;
      console.log('Selected file:', this.selectedSongFile);
      if (!this.isEditMode) {
        this.songForm.get('songFileData')?.setValue(this.selectedSongFile.name); // Gán tên file để thỏa mãn Validators.required
      }
    }
  }

  clearSongFile() {
    this.selectedSongFile = null;
    this.selectedSongFileName = null;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    if (!this.isEditMode) {
      this.songForm.get('songFileData')?.setValue(''); // Reset về rỗng khi tạo mới
    }
  }
}
