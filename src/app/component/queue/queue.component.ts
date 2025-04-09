import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Song } from '../../models/song.module';
import { PlayerService } from '../../services/PlayerServices/player.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoginService } from '../../services/LoginServices/login.service';
import { Observable } from 'rxjs';
import { User } from '../../models/user.module';
import { PlaylistService } from '../../services/PlaylistServices/playlist.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlaylistDialogComponent } from '../dialog/playlist-dialog/playlist-dialog.component';

@Component({
  selector: 'app-queue',
  imports: [
    CommonModule, 
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './queue.component.html',
  styleUrl: './queue.component.scss'
})
export class QueueComponent implements OnInit{
  currentSong: Song | null = null;
  songQueue: Song[] = [];
  user$: Observable<User | null>;
  canCreatePlaylist: boolean = false;

  constructor(
    private playerService: PlayerService,
    private loginService: LoginService,
    private playlistService: PlaylistService, // Thêm PlaylistService
    private dialog: MatDialog, // Thêm MatDialog
    private snackBar: MatSnackBar
  ) {
    this.user$ = this.loginService.user$;
  }

  ngOnInit(): void {
    this.playerService.currentSong$.subscribe(song => {
      this.currentSong = song;
      this.songQueue = this.playerService.getQueue();
    });
    this.playerService.songQueue$.subscribe(queue => {
      this.songQueue = queue;
    });
    this.user$.subscribe(user => {
      this.canCreatePlaylist = this.isPlaylist(user);
    });
  }

  isPlaylist(user: User | null): boolean {
    return user?.permissions?.includes('CREATE_PLAYLIST') || false;
  }

  playSong(song: Song): void {
    this.playerService.playSongFromQueue(song); // Phát ngay bài này, giữ nguyên vị trí
  }

  // createPlaylist(): void {
  //   console.log('Playlist created with:', this.songQueue);
    
  //   // Nếu muốn hiển thị thông báo
  //   // alert(`Playlist gồm ${this.songQueue.length} bài hát đã được tạo!`);
  // }
  createPlaylist(): void {
    if (this.songQueue.length === 0) {
      this.snackBar.open('Queue is empty!', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Mở dialog PlaylistDialogComponent
    const dialogRef = this.dialog.open(PlaylistDialogComponent, {
      width: '400px',
      data: { songQueue: this.songQueue } // Truyền toàn bộ songQueue vào dialog
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'add') {
        const playlistId = result.playlist.playlistId;
        const songIds = this.songQueue.map(song => song.songId); // Lấy danh sách songId từ songQueue

        // Gọi addMultipleSongsToPlaylist
        this.playlistService.addMultipleSongsToPlaylist(playlistId, songIds).subscribe({
          next: () => {
            this.snackBar.open(
              `Added ${songIds.length} songs to playlist "${result.playlist.playlistName}"`,
              'Close',
              {
                duration: 3000,
                horizontalPosition: 'end',
                verticalPosition: 'bottom',
                panelClass: ['success-snackbar']
              }
            );
          },
          error: (err) => {
            console.error('Error adding songs to playlist:', err);
            this.snackBar.open(
              'Failed to add songs to playlist',
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
    });
  }

  removeFromQueue(index: number): void {
    this.playerService.removeSongFromQueue(index);
  }
}
