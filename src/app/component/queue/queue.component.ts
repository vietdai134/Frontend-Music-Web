import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Song } from '../../models/song.module';
import { PlayerService } from '../../services/PlayerServices/player.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

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

  constructor(
    private playerService: PlayerService
  ) {}

  ngOnInit(): void {
    this.playerService.currentSong$.subscribe(song => {
      this.currentSong = song;
      this.songQueue = this.playerService.getQueue();
    });
  }

  playSong(song: Song): void {
    this.playerService.playSongFromQueue(song); // Phát ngay bài này, giữ nguyên vị trí
  }

  createPlaylist(): void {
    console.log('Playlist created with:', this.songQueue);
    
    // Nếu muốn hiển thị thông báo
    // alert(`Playlist gồm ${this.songQueue.length} bài hát đã được tạo!`);
  }
}
