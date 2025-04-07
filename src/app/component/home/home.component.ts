import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SongService } from '../../services/SongServices/song.service';
import { CommonModule, DatePipe } from '@angular/common';
import { Song } from '../../models/song.module';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { PlayerService } from '../../services/PlayerServices/player.service';
import { SearchService } from '../../services/SearchServices/search.service';
import { filter, Subscription } from 'rxjs';
import { QueueComponent } from '../queue/queue.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { SidebarService } from '../../services/SidebarServices/sidebar.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { PublicService } from '../../services/PublicServices/public.service';
import { combineLatest } from 'rxjs';
import { GenreService } from '../../services/GenreServices/genre.service';
import { Genre } from '../../models/genre.module';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { NgSelectModule } from '@ng-select/ng-select';

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
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    NgSelectModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  providers: [DatePipe]
})
export class HomeComponent implements OnInit,OnDestroy {
  songs: Song[] = [];

  totalElements = 0;
  pageSize = 10;
  currentPage = 0;
  isLoading = false;
  showQueue: boolean = false;
  searchKeyword: string | null = null;
  searchKeywordTitle: string | null = null;
  searchKeywordArtist: string | null = null;
  searchKeywordUserName: string | null = null;
  private searchSubscription!: Subscription;
  private queueSubscription!: Subscription;

  isSidebarVisible: boolean = true;
  private sidebarSubscription!: Subscription;

  isUploadDateAsc = false; // Trạng thái sắp xếp cho Upload Date
  isTitleAsc = false;      // Trạng thái sắp xếp cho Title
  isArtistAsc = false;    // Trạng thái sắp xếp cho Artist
  currentSortField = 'uploadDate';
  resultSort = 'desc'; // Giá trị mặc định cho sort

  genres: string[] = [];

  selectedGenres: string[] =[];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private playerService: PlayerService,
    private searchService: SearchService,
    private sidebarService: SidebarService,
    private publicService: PublicService,
    private genreService: GenreService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    combineLatest([this.searchService.currentKeyword$, this.searchService.currentTypeSearch$])
    .subscribe(([keyword, type]) => {

      this.searchKeywordTitle = null;
      this.searchKeywordArtist = null;
      this.searchKeywordUserName = null;
      this.searchKeyword = keyword;

      if(type=='title'){
        this.searchKeywordTitle = keyword;
      }
      else if(type=='artist'){
        this.searchKeywordArtist = keyword;
      }
      else if(type=='username'){
        this.searchKeywordUserName = keyword;
      }

      this.currentPage = 0; // Reset về trang đầu khi tìm kiếm
      this.songs = []; // Xóa danh sách cũ
      this.loadSongs(); // Tải lại danh sách với keyword và type mới
    });
    // this.loadSongs(this.currentPage, this.pageSize);
    this.queueSubscription = this.playerService.showQueue$.subscribe(show => {
      this.showQueue = show;
    });

    this.sidebarSubscription = this.sidebarService.sidebarVisible$.subscribe(
      visible => this.isSidebarVisible = visible
    );

    this.loadSongs();
    this.loadGenres();
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
  loadGenres() {
    this.genreService.getListAllGenres().subscribe((response) => {
      this.genres = response.map((genre: Genre) => genre.genreName);
    });
  }
  loadSongs(): void {
    if (this.isLoading) return;// Nếu đang tải, thoát ra ngay
    this.isLoading = true;// Đánh dấu là đang tải dữ liệu

    const hasKeyword = this.searchKeyword && this.searchKeyword.trim() !== '';
    const hasGenres = this.selectedGenres !== null && this.selectedGenres.length > 0;
    console.log("username:",this.searchKeywordUserName?? undefined);
    // if (this.searchKeyword && this.searchKeyword.trim() !== '' && this.selectedGenres !== null) {
    if (hasKeyword || hasGenres) {
      this.publicService.searchSongByKeyword(
        this.searchKeywordTitle ?? undefined  ,
        this.searchKeywordArtist ?? undefined, 
        this.selectedGenres ??[], 
        this.searchKeywordUserName?? undefined, 
        this.currentPage, this.pageSize, 
        this.currentSortField, 
        this.resultSort).subscribe({
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
    //  1. Kiểm tra xem người dùng có gần cuối trang không (cách cuối trang 100px)
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
    console.log(`Add to playlist: ${song.songId}`);
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
    // console.log(`Clicked genre: ${genreName}`);
    if (this.selectedGenres.includes(genreName)) {
      this.selectedGenres = this.selectedGenres.filter(g => g !== genreName);
    } else {
      this.selectedGenres = [...this.selectedGenres, genreName];
    }
    // console.log('Selected genres after click:', this.selectedGenres);
    this.onGenreSelectionChange();
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
    } 
    else if (field === 'title') {
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

  removeGenre(genre: string) {
    if (this.selectedGenres) {
      this.selectedGenres = this.selectedGenres.filter(g => g !== genre);
    }
    this.onGenreSelectionChange();
  }

  onGenreSelectionChange(event?: any): void {
    console.log('Selected genres:', this.selectedGenres);
    this.currentPage = 0;
    this.songs = [];
    this.loadSongs();
  }

  formatDate(dateString: Date): string {
    return this.datePipe.transform(dateString, 'dd/MM/yyyy HH:mm:ss UTC+7') || '';
  }
}
