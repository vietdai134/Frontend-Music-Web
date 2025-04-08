import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PlaylistService } from '../../../services/PlaylistServices/playlist.service';
import { Playlist } from '../../../models/playlist.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-playlist-dialog',
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
  templateUrl: './playlist-dialog.component.html',
  styleUrl: './playlist-dialog.component.scss'
})
export class PlaylistDialogComponent implements OnInit {
  playlists: any[] = []; // You'll want to populate this with your playlists
  newPlaylistName: string = '';
  isCreatingPlaylist: boolean = false;
  isLoading: boolean = false;

  constructor(
    private playlistService: PlaylistService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<PlaylistDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { song: any }
  ) {}

  ngOnInit(): void {
    this.loadPlaylists();
  }

  loadPlaylists(): void {
    this.isLoading = true;
    // Giả định có một phương thức getPlaylists trong service của bạn
    this.playlistService.getAllPlaylists().subscribe({
      next: (playlists) => {
        this.playlists = playlists;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading playlists:', error);
        this.isLoading = false;
        this.snackBar.open(
          'Failed to load playlists',
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

  onCancel(): void {
    this.dialogRef.close();
  }

  addToPlaylist(playlist: Playlist): void {
    this.dialogRef.close({ action: 'add', playlist: playlist, song: this.data.song });
  }

  toggleCreatePlaylist(): void {
    this.isCreatingPlaylist = !this.isCreatingPlaylist;
  }

  createPlaylist(): void {
    if (this.newPlaylistName.trim()) {
      this.isLoading = true;
      
      this.playlistService.createPlaylist(this.newPlaylistName.trim()).subscribe({
        next: (response) => {
          console.log('Playlist created successfully:', response);
          this.snackBar.open(
            `Playlist "${response.playlistName}" created successfully`,
            'Close',
            {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'bottom',
              panelClass: ['success-snackbar']
            }
          );
          
          this.newPlaylistName = '';
          this.isCreatingPlaylist = false;
          this.isLoading = false;
          this.loadPlaylists(); // Reload playlists to ensure the new one is displayed
        },
        error: (err) => {
          console.error('Error creating playlist:', err);
          this.isLoading = false;
          
          this.snackBar.open(
            'Failed to create playlist',
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
  }
}
