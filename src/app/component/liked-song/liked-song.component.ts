import { CommonModule, DatePipe } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { NgSelectModule } from '@ng-select/ng-select';
import { QueueComponent } from '../queue/queue.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription, combineLatest } from 'rxjs';
import { Genre } from '../../models/genre.module';
import { Song } from '../../models/song.module';
import { GenreService } from '../../services/GenreServices/genre.service';
import { PlayerService } from '../../services/PlayerServices/player.service';
import { PlaylistService } from '../../services/PlaylistServices/playlist.service';
import { PublicService } from '../../services/PublicServices/public.service';
import { SearchService } from '../../services/SearchServices/search.service';
import { SidebarService } from '../../services/SidebarServices/sidebar.service';
import { PlaylistDialogComponent } from '../dialog/playlist-dialog/playlist-dialog.component';
import { ListenHistoryService } from '../../services/ListenHistoryServices/listen-history.service';
import { LikedSongService } from '../../services/LikedSongServices/liked-song.service';
import { SongService } from '../../services/SongServices/song.service';

@Component({
  selector: 'app-liked-song',
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
  templateUrl: './liked-song.component.html',
  styleUrl: './liked-song.component.scss',
  providers: [DatePipe]
})
export class LikedSongComponent implements OnInit,OnDestroy{
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

  selectedSongIds: string[] = [];

  hasNoSongs: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private playerService: PlayerService,
    private searchService: SearchService,
    private sidebarService: SidebarService,
    private publicService: PublicService,
    private genreService: GenreService,
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private playlistService: PlaylistService,
    private snackBar: MatSnackBar,
    private likedSongService: LikedSongService,
    private songService:SongService
  ) {}

  ngOnInit() {
    this.loadLikedSongs();
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

    // this.loadSongs();
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
    if (this.isLoading) return;// Nếu đang tải, thoát ra ngayz
    this.isLoading = true;// Đánh dấu là đang tải dữ liệu

    const hasKeyword = this.searchKeyword && this.searchKeyword.trim() !== '';
    const hasGenres = this.selectedGenres !== null && this.selectedGenres.length > 0;
    const hasSongIds =this.selectedSongIds !== null && this.selectedSongIds.length > 0;
    console.log("username:",this.searchKeywordUserName?? undefined);
    // if (hasKeyword || hasGenres || hasSongIds) {
    if (hasSongIds) {
      this.publicService.searchSongByKeyword(
        this.selectedSongIds ?? [], 
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
    } 
    else{
      this.songs = []; // Xóa danh sách bài hát
      this.totalElements = 0;
      this.isLoading = false;
      this.hasNoSongs = true;
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

  addToPlaylist(song: any): void {
    const dialogRef = this.dialog.open(PlaylistDialogComponent, {
      width: '400px',
      data: { song: song }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.action === 'add') {
          console.log('Adding song:', result.song.songId, 'to playlist:', result.playlist.playlistId);
          this.playlistService.addSongToPlaylist(result.song.songId, result.playlist.playlistId).subscribe({
            next: (response) => {
              console.log('Song added to playlist successfully:', response);
              this.snackBar.open(
                `Added to playlist`, 
                'Close', 
                {
                  duration: 3000,           // The snackbar will disappear after 3 seconds
                  horizontalPosition: 'end', // Position at the right side
                  verticalPosition: 'bottom', // Position at the bottom
                  panelClass: ['success-snackbar'] // Optional custom CSS class for styling
                }
              );
            }
            , error: (err) => {
              console.error('Error adding song to playlist:', err);
            }
          });
        }
      }
    });
  }

  unlikeSong(song: Song) {
    console.log(`Like song: ${song.songId}`);
    this.likedSongService.deleteSongFromLikedSongs(song.songId).subscribe({
      next: (response) => {
        console.log('Song removed from liked songs successfully:', response);
        this.snackBar.open(
          `Removed from liked songs`, 
          'Close', 
          {
            duration: 3000,           // The snackbar will disappear after 3 seconds
            horizontalPosition: 'end', // Position at the right side
            verticalPosition: 'bottom', // Position at the bottom
            panelClass: ['success-snackbar'] // Optional custom CSS class for styling
          }
        );
        this.loadLikedSongs();
      }
      , error: (err) => {
        console.error('Error removing song from liked songs:', err);
      }
    });
  }

  downloadSong(song: Song) {
    console.log(`More options for: ${song.fileSongId}`);
    // Logic hiển thị thêm tùy chọn
    this.songService.downloadSong(song.fileSongId).subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = song.title + '.mp3'; // Tên file tải về
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url); // Giải phóng URL đã tạo
        a.remove(); // Xóa phần tử <a> đã tạo
      }
      , error: (err) => {
        console.error('Error downloading song:', err);
      }
    });
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

  loadLikedSongs(): void {
    this.likedSongService.getAllLikedSongs().subscribe({
      next: (response) => {
        this.selectedSongIds = Array.isArray(response) ? response.map(item => item.songId.toString()) : []; // Giả sử response chứa danh sách bài hát
        console.log('Songs in selected playlist:', this.selectedSongIds);

        this.currentPage = 0;
        this.songs = [];
        // this.loadSongs();
        this.hasNoSongs = this.selectedSongIds.length === 0; // Kiểm tra nếu không có bài hát
        if (!this.hasNoSongs) {
          this.loadSongs(); // Chỉ load nếu có bài hát
        }
      }
      , error: (err) => {
        console.error('Error fetching liked songs:', err);
      }
    });
  }
}
