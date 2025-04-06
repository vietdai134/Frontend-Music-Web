import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { SidebarComponent } from '../sidebar/sidebar.component';
import { SidebarService } from '../../services/SidebarServices/sidebar.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { PublicService } from '../../services/PublicServices/public.service';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule ,
    MatButtonModule,
    MatCardModule,
    MatPaginatorModule,
    QueueComponent,
    SidebarComponent,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit,OnDestroy {
  songs: Song[] = [];

  totalElements = 0;
  pageSize = 10;
  currentPage = 0;
  isLoading = false;
  showQueue: boolean = false;
  searchKeyword: string | null = null;
  private searchSubscription!: Subscription;
  private queueSubscription!: Subscription;

  isSidebarVisible: boolean = true;
  private sidebarSubscription!: Subscription;

  isUploadDateAsc = false; // Trạng thái sắp xếp cho Upload Date
  isTitleAsc = false;      // Trạng thái sắp xếp cho Title
  isArtistAsc = false;    // Trạng thái sắp xếp cho Artist
  currentSortField = 'uploadDate';
  resultSort = 'desc'; // Giá trị mặc định cho sort

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private songService: SongService,
    private playerService: PlayerService,
    private searchService: SearchService,
    private sidebarService: SidebarService,
    private publicService: PublicService
  ) {}

  ngOnInit() {
    this.searchSubscription = this.searchService.currentKeyword$.subscribe(keyword => {
      this.searchKeyword = keyword;
      this.currentPage = 0; // Reset về trang đầu khi tìm kiếm
      // this.loadSongs(this.currentPage, this.pageSize);
      this.songs = [];
      this.loadSongs();
    });
    // this.loadSongs(this.currentPage, this.pageSize);
    this.queueSubscription = this.playerService.showQueue$.subscribe(show => {
      this.showQueue = show;
    });

    this.sidebarSubscription = this.sidebarService.sidebarVisible$.subscribe(
      visible => this.isSidebarVisible = visible
    );

    this.loadSongs();
  }

  ngOnDestroy() {
    // Hủy subscription để tránh memory leak
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }

    if (this.queueSubscription) {
      this.queueSubscription.unsubscribe();
    }

    if (this.sidebarSubscription) {
      this.sidebarSubscription.unsubscribe();
    }
  }
  
  loadSongs(): void {
    if (this.isLoading) return;// Nếu đang tải, thoát ra ngay
    this.isLoading = true;// Đánh dấu là đang tải dữ liệu
    const approvalStatus = 'APPROVED';

    if (this.searchKeyword && this.searchKeyword.trim() !== '') {
      this.publicService.searchSongByKeyword(this.searchKeyword,undefined,[],undefined,this.currentPage, this.pageSize,this.currentSortField,this.resultSort).subscribe({
        next: (response) => {
          this.songs = [...this.songs, ...response.content]; // Thêm dữ liệu mới vào danh sách hiện tại
          this.totalElements = response.page.totalElements;
          this.isLoading = false;// Hoàn thành tải
        },
        error: (err) => {
          console.error('Error fetching search results:', err);
          this.isLoading = false;//Đặt lại để có thể thử tải lại
        }
      });
    } else {
      this.publicService.getAllSongsWithApproved(this.currentPage, this.pageSize,this.currentSortField,this.resultSort).subscribe({
        next: (response) => {
          console.log(response.content)
          this.songs = [...this.songs, ...response.content];
          console.log(this.songs)
          this.totalElements = response.page.totalElements;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching songs:', err);
          this.isLoading = false;
        }
      });
    }
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
     // 1. Kiểm tra xem người dùng có gần cuối trang không (cách cuối trang 100px)
    const isNearBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100;

    // 2. Nếu đang tải dữ liệu hoặc đã tải hết toàn bộ, không tải nữa
    if (isNearBottom && !this.isLoading && this.songs.length < this.totalElements) {
      console.log("Loading more songs...");
      this.currentPage++; // Tăng trang hiện tại
      this.loadSongs();   // Tải thêm dữ liệu
    }
  }

  playSong(song: Song): void {
    console.log(song.fileSongId);
    this.playerService.setCurrentSong(song); 
  }

  addToPlaylist(song: Song) {
    console.log(`Add to playlist: ${song.title}`);
    // Logic thêm vào playlist
  }

  likeSong(song: Song) {
    console.log(`Like song: ${song.title}`);
    // Logic thích bài hát
  }

  showMoreOptions(song: Song) {
    console.log(`More options for: ${song.title}`);
    // Logic hiển thị thêm tùy chọn
  }

  // Xử lý khi nhấp vào nút thể loại
  onGenreClick(genreName: string): void {
    console.log(`Clicked genre: ${genreName}`);
    // TODO: lọc bài hát theo thể loại nếu cần
  }

  // Hàm xử lý khi bấm nút sắp xếp
  toggleSort(field: 'uploadDate' | 'title' | 'artist'): void {
    // Nếu chuyển sang trường khác, reset trạng thái của trường cũ về mặc định (desc)
    if (this.currentSortField !== field) {
      if (field === 'uploadDate') {
        this.isTitleAsc = false; // Reset Title về desc
        this.isArtistAsc = false; // Reset Artist về desc
      } else if (field === 'title') {
        this.isUploadDateAsc = false; // Reset Upload Date về desc
        this.isArtistAsc = false; // Reset Artist về desc
      }
      else if (field === 'artist') {
        this.isUploadDateAsc = false; 
        this.isTitleAsc = false; // Reset Title về desc
      }
      this.currentSortField = field; // Cập nhật trường hiện tại
    }

    // Toggle trạng thái của trường được chọn
    if (field === 'uploadDate') {
      this.isUploadDateAsc = !this.isUploadDateAsc;
      this.resultSort = this.isUploadDateAsc ? 'asc' : 'desc';
    } else if (field === 'title') {
      this.isTitleAsc = !this.isTitleAsc;
      this.resultSort = this.isTitleAsc ? 'asc' : 'desc';
    }
    else if (field === 'artist') {
      this.isArtistAsc = !this.isArtistAsc;
      this.resultSort = this.isArtistAsc ? 'asc' : 'desc';
    }
    
    this.songs = [];
    this.currentPage = 0;
    this.loadSongs(); // Tải lại danh sách bài hát với sắp xếp mới

  }
}
