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

  createPlaylist(): void {
    console.log('Playlist created with:', this.songQueue);
    
    // Nếu muốn hiển thị thông báo
    // alert(`Playlist gồm ${this.songQueue.length} bài hát đã được tạo!`);
  }

  removeFromQueue(index: number): void {
    this.playerService.removeSongFromQueue(index);
  }
}
