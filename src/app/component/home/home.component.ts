import { Component, OnInit, ViewChild } from '@angular/core';
import { SongService } from '../../services/SongServices/song.service';
import { CommonModule } from '@angular/common';
import { Song } from '../../models/song.module';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { PlayerService } from '../../services/PlayerServices/player.service';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule ,
    MatButtonModule,
    MatCardModule,
    MatPaginatorModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  songs: Song[] = [];

  totalElements = 0;
  pageSize = 10;
  currentPage = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private songService: SongService,
    private playerService: PlayerService
  ) {}

  ngOnInit() {
    this.loadSongs(this.currentPage, this.pageSize);
  }

  loadSongs(page: number, size: number):void {
    this.songService.getAllSongsWithStatus(page, size,'APPROVED').subscribe({
      next: (response) => {
        console.log(response.content)
        this.songs = response.content;
        this.totalElements = response.page.totalElements;
        this.pageSize = response.page.size;
        this.currentPage = response.page.number;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadSongs(this.currentPage, this.pageSize);
  }
  


  playSong(song: Song): void {
    console.log(song.fileSongId);
    this.playerService.setCurrentSong(song); 
  }
}
