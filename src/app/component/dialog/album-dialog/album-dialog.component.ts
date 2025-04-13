import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { AlbumService } from '../../../services/AlbumServices/album.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Song } from '../../../models/song.module';
import { Album } from '../../../models/album.module';

@Component({
  selector: 'app-album-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './album-dialog.component.html',
  styleUrl: './album-dialog.component.scss'
})
export class AlbumDialogComponent implements OnInit{
  albums: Album[] = []; // You'll want to populate this with your playlists
  newAlbumName: string = '';
  isCreatingAlbum: boolean = false;
  isLoading: boolean = false;
  selectedImage?: File | null = null;
  isEditMode: boolean = false;
  editAlbumId: number | string | null = null;
  existingAlbumImage?: string;

  constructor(
    private albumService: AlbumService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AlbumDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      song: any;
      songQueue?: Song[] ;
      mode?: string;
      album?: Album;
    }
  ) {}

  ngOnInit(): void {
    // this.loadAlbums();
    this.isEditMode = this.data.mode === 'edit';
    
    if (this.isEditMode && this.data.album) {
      // Đang ở chế độ edit, hiển thị form chỉnh sửa với dữ liệu album
      // this.isCreatingAlbum = true; // Hiển thị form
      this.newAlbumName = this.data.album.albumName;
      this.editAlbumId = this.data.album.albumId;
      this.existingAlbumImage = this.data.album.albumImage;
      // Không cần load album trong chế độ edit
    } else {
      // Chế độ thêm bài hát vào album
      this.loadAlbums();
    }
  }

  loadAlbums(): void {
    this.isLoading = true;
    // Giả định có một phương thức getPlaylists trong service của bạn
    this.albumService.getAllAlbums().subscribe({
      next: (albums) => {
        this.albums = albums;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading albums:', error);
        this.isLoading = false;
        this.snackBar.open(
          'Failed to load albums',
          'Close',
          {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          }
        );
      }
    });
  }

  // onCancel(): void {
  //   this.dialogRef.close();
  // }
  onCancel(): void {
    this.newAlbumName = '';
    this.selectedImage = undefined;
    this.isCreatingAlbum = false;
    this.isEditMode = false;
    this.dialogRef.close();
  }

  addToAlbum(album: Album): void {
    if (this.data.songQueue) {
      // Trường hợp thêm nhiều bài từ QueueComponent
      this.dialogRef.close({ action: 'add', album: album });
    } else if (this.data.song) {
      // Trường hợp thêm một bài từ HistorySongComponent hoặc HomeComponent
      this.dialogRef.close({ action: 'add', album: album, song: this.data.song });
    }
    // this.dialogRef.close({ action: 'add', playlist: playlist, song: this.data.song });
  }

  // toggleCreateAlbum(): void {
  //   this.isCreatingAlbum = !this.isCreatingAlbum;
  // }

  toggleCreateAlbum(): void {
    this.isCreatingAlbum = !this.isCreatingAlbum;
    if (!this.isCreatingAlbum) {
      this.newAlbumName = '';
      this.selectedImage = undefined;
    }
  }


  // createAlbum(): void {
  //   if (this.newAlbumName.trim()) {
  //     this.isLoading = true;

  //     const albumData: { albumName: string; albumImage?: File } = {
  //       albumName: this.newAlbumName.trim()
  //     };
  //     if (this.selectedImage) {
  //       albumData.albumImage = this.selectedImage;
  //     }
  //       // Kiểm tra xem đang ở chế độ edit hay create
  //       if (this.isEditMode && this.editAlbumId) {
  //         // Chế độ edit - gọi API cập nhật
  //         this.albumService.updateAlbum(Number(this.editAlbumId), albumData).subscribe({
  //           next: () => {
  //             console.log('Album updated successfully:');
  //             this.snackBar.open(
  //               `Album "${albumData.albumName}" updated successfully`,
  //               'Close',
  //               { duration: 3000, horizontalPosition: 'end', verticalPosition: 'bottom', panelClass: ['success-snackbar'] }
  //             );
  //             this.dialogRef.close({ 
  //               action: 'edit', 
  //               album: {
  //                 albumName: albumData.albumName,
  //                 albumImage: albumData.albumImage ? URL.createObjectURL(albumData.albumImage) : undefined // URL tạm cho ảnh
  //               } 
  //             });
  //           },
  //           error: (err) => {
  //             console.error('Error updating album:', err);
  //             this.isLoading = false;
  //             this.snackBar.open(
  //               'Failed to update album',
  //               'Close',
  //               { duration: 3000, horizontalPosition: 'end', verticalPosition: 'bottom', panelClass: ['error-snackbar'] }
  //             );
  //           }
  //         });
  //       } else {
  //         this.albumService.createAlbum(albumData).subscribe({
  //         next: (response: Album) => {
  //           console.log('Album created successfully:', response);
  //           this.snackBar.open(
  //             `Album "${response.albumName}" created successfully`,
  //             'Close',
  //             {
  //               duration: 3000,
  //               horizontalPosition: 'end',
  //               verticalPosition: 'bottom',
  //               panelClass: ['success-snackbar']
  //             }
  //           );

  //           this.newAlbumName = '';
  //           this.selectedImage = null;
  //           this.isCreatingAlbum = false;
  //           this.isLoading = false;
  //           this.loadAlbums();
  //         },
  //         error: (err) => {
  //           console.error('Error creating album:', err);
  //           this.isLoading = false;

  //           this.snackBar.open(
  //             'Failed to create album',
  //             'Close',
  //             {
  //               duration: 3000,
  //               horizontalPosition: 'end',
  //               verticalPosition: 'bottom',
  //               panelClass: ['error-snackbar']
  //             }
  //           );
  //         }
  //       });
  //     }
  //   }
  // }

  createAlbum(): void {
    if (!this.newAlbumName.trim()) {
      this.snackBar.open('Album name is required', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;
    const albumData: { albumName: string; albumImage?: File } = {
      albumName: this.newAlbumName.trim(),
      albumImage: this.selectedImage ?? undefined
    };

    this.albumService.createAlbum(albumData).subscribe({
      next: (response: Album) => {
        this.isLoading = false;
        this.snackBar.open(`Album "${response.albumName}" created successfully`, 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
          panelClass: ['success-snackbar']
        });
        this.newAlbumName = '';
        this.selectedImage = undefined;
        this.isCreatingAlbum = false;
        this.albums.push(response); // Cập nhật danh sách album
        this.dialogRef.close({ action: 'create', album: response });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error creating album:', err);
        this.snackBar.open('Failed to create album', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar']
        });
      }
    });
  }
  


  // onFileSelected(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files.length > 0) {
  //     this.selectedImage = input.files[0];
  //   }
  // }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImage = input.files[0];
    } else {
      this.selectedImage = undefined;
    }
  }


  updateAlbum(): void {
    if (!this.newAlbumName.trim()) {
      this.snackBar.open('Album name is required', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (!this.editAlbumId) {
      this.snackBar.open('Invalid album ID', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;
    const albumData: { albumName: string; albumImage?: File } = {
      albumName: this.newAlbumName.trim(),
      albumImage: this.selectedImage ?? undefined
    };

    this.albumService.updateAlbum(Number(this.editAlbumId), albumData).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open(`Album "${albumData.albumName}" updated successfully`, 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
          panelClass: ['success-snackbar']
        });
        const updatedAlbum: Album = {
          albumId: Number(this.editAlbumId),
          albumName: albumData.albumName,
          albumImage: albumData.albumImage ? URL.createObjectURL(albumData.albumImage) : this.existingAlbumImage,
          createdDate: this.data.album?.createdDate || new Date() // Use existing date or set to current date
        };
        this.dialogRef.close({ action: 'edit', album: updatedAlbum });
        this.newAlbumName = '';
        this.selectedImage = undefined;
        this.isEditMode = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error updating album:', err);
        const errorMessage = err.error?.message || 'Failed to update album';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}
