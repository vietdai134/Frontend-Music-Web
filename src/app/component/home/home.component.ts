import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SongService } from '../../services/SongServices/song.service';
import { CommonModule } from '@angular/common';
import { Song } from '../../models/song.module';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { PlayerService } from '../../services/PlayerServices/player.service';
import { SearchService } from '../../services/SearchServices/search.service';
import { Subscription } from 'rxjs';
import { QueueComponent } from '../queue/queue.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule ,
    MatButtonModule,
    MatCardModule,
    MatPaginatorModule,
    QueueComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit,OnDestroy {
  songs: Song[] = [];

  totalElements = 0;
  pageSize = 10;
  currentPage = 0;
  showQueue: boolean = false;
  searchKeyword: string | null = null;
  private searchSubscription!: Subscription;
  private queueSubscription!: Subscription;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private songService: SongService,
    private playerService: PlayerService,
    private searchService: SearchService
  ) {}

  ngOnInit() {
    this.searchSubscription = this.searchService.currentKeyword$.subscribe(keyword => {
      this.searchKeyword = keyword;
      this.currentPage = 0; // Reset về trang đầu khi tìm kiếm
      this.loadSongs(this.currentPage, this.pageSize);
    });
    // this.loadSongs(this.currentPage, this.pageSize);
    this.queueSubscription = this.playerService.showQueue$.subscribe(show => {
      this.showQueue = show;
    });
  }

  ngOnDestroy() {
    // Hủy subscription để tránh memory leak
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }

    if (this.queueSubscription) {
      this.queueSubscription.unsubscribe();
    }
  }

  loadSongs(page: number, size: number): void {
    const approvalStatus = 'APPROVED';
    if (this.searchKeyword && this.searchKeyword.trim() !== '') {
      // Gọi API tìm kiếm nếu có từ khóa
      this.songService.searchSongsWithStatus(page, size, this.searchKeyword, approvalStatus).subscribe({
        next: (response) => {
          this.songs = response.content;
          this.totalElements = response.page.totalElements;
          this.pageSize = response.page.size;
          this.currentPage = response.page.number;
        },
        error: (err) => {
          console.error('Error fetching search results:', err);
        }
      });
    } else {
      // Gọi API mặc định nếu không có từ khóa
      this.songService.getAllSongsWithStatus(page, size, approvalStatus).subscribe({
        next: (response) => {
          this.songs = response.content;
          this.totalElements = response.page.totalElements;
          this.pageSize = response.page.size;
          this.currentPage = response.page.number;
        },
        error: (err) => {
          console.error('Error fetching songs:', err);
        }
      });
    }
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
