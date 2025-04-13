import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { NgSelectModule } from '@ng-select/ng-select';
import { QueueComponent } from '../queue/queue.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { Song } from '../../models/song.module';
import { combineLatest, Subscription } from 'rxjs';
import { PlayerService } from '../../services/PlayerServices/player.service';
import { SidebarService } from '../../services/SidebarServices/sidebar.service';
import { UserUploadService } from '../../services/UserUploadServices/user-upload.service';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { SongDialogComponent } from '../dialog/song-dialog/song-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { UserUploadDialogComponent } from '../dialog/user-upload-dialog/user-upload-dialog.component';
import { SongService } from '../../services/SongServices/song.service';
import { SearchService } from '../../services/SearchServices/search.service';
import { LikedSongService } from '../../services/LikedSongServices/liked-song.service';
import { PlaylistService } from '../../services/PlaylistServices/playlist.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PublicService } from '../../services/PublicServices/public.service';
import { PlaylistDialogComponent } from '../dialog/playlist-dialog/playlist-dialog.component';
import { WebSocketService } from '../../services/WebSocketServices/web-socket.service';
import { AlbumDialogComponent } from '../dialog/album-dialog/album-dialog.component';
import { AlbumService } from '../../services/AlbumServices/album.service';

@Component({
  selector: 'app-user-upload',
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
    NgSelectModule,
    MatTabsModule,

    MatDialogModule,
    MatInputModule,

  ],
  templateUrl: './user-upload.component.html',
  styleUrl: './user-upload.component.scss',
  providers: [DatePipe]
})
export class UserUploadComponent implements OnInit,OnDestroy{
  songs: Song[] = [];
  totalElements = 0;
  pageSize = 20;
  currentPage = 0;
  isLoading = false;
  showQueue: boolean = false;
  searchKeyword: string | null = null;
  searchKeywordTitle: string | null = null;
  searchKeywordArtist: string | null = null;
  searchKeywordUserName: string | null = null;
  searchKeywordAlbumName: string | null = null;
  private searchSubscription!: Subscription;
  private queueSubscription!: Subscription;

  isSidebarVisible: boolean = true;
  private sidebarSubscription!: Subscription;

  isUploadDateAsc = false; // Trạng thái sắp xếp cho Upload Date
  isTitleAsc = false;      // Trạng thái sắp xếp cho Title
  isArtistAsc = false;    // Trạng thái sắp xếp cho Artist
  currentSortField = 'uploadDate';
  resultSort = 'desc';

  selectedTabIndex = 1; // Default to APPROVED tab (index 1)
  currentStatus = 'APPROVED';

  likedSongIds: string[] = [];

  private webSocketSubscription: Subscription | null = null;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private playerService: PlayerService,
    private sidebarService: SidebarService,
    private datePipe: DatePipe,
    private userUploadService: UserUploadService,
    private dialog: MatDialog,
    private songService: SongService,
    private searchService: SearchService,
    private likedSongService: LikedSongService,
    private playlistService: PlaylistService,
    private snackBar: MatSnackBar,
    private publicService: PublicService,
    private webSocketService: WebSocketService,
    private albumService: AlbumService
  ){}
  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }

    if (this.queueSubscription) {
      this.queueSubscription.unsubscribe();
    }

    if (this.sidebarSubscription) {
      this.sidebarSubscription.unsubscribe();
    }

    if (this.webSocketSubscription) {
      this.webSocketSubscription.unsubscribe();
    }
  }
  ngOnInit(): void {
    // this.loadSongs();
    this.loadLikedSongs();
    combineLatest([this.searchService.currentKeyword$, this.searchService.currentTypeSearch$])
    .subscribe(([keyword, type]) => {

      this.searchKeywordTitle = null;
      this.searchKeywordArtist = null;
      this.searchKeywordUserName = null;
      this.searchKeywordAlbumName = null;
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
      else if(type=='albumNames'){
        this.searchKeywordAlbumName = keyword;
      }

      this.currentPage = 0; // Reset về trang đầu khi tìm kiếm
      this.songs = []; // Xóa danh sách cũ
      this.loadSongs(); // Tải lại danh sách với keyword và type mới
    });
    this.queueSubscription = this.playerService.showQueue$.subscribe(show => {
      this.showQueue = show;
    });

    this.sidebarSubscription = this.sidebarService.sidebarVisible$.subscribe(
      visible => this.isSidebarVisible = visible
    );
    this.subscribeToStatusUpdates();
  }

  loadSongs(): void {
    if (this.isLoading) return;// Nếu đang tải, thoát ra ngay
    this.isLoading = true;// Đánh dấu là đang tải dữ liệu

    const hasKeyword = this.searchKeyword && this.searchKeyword.trim() !== '';
    const status= this.currentStatus.toUpperCase();
    if (hasKeyword && status === 'APPROVED' ) {
      this.publicService.searchSongByKeyword(
        // this.selectedSongIds ?? [], 
        [],
        this.searchKeywordTitle ?? undefined  ,
        this.searchKeywordArtist ?? undefined, 
        // this.selectedGenres ??[], 
        [],
        // this.searchKeywordUserName?? undefined,
        undefined,
        this.searchKeywordAlbumName?? undefined,
        this.currentPage, this.pageSize, 
        this.currentSortField, 
        this.resultSort
      ).subscribe({
        next: (response) => {
          // this.songs = [...this.songs, ...response.content]; // Thêm dữ liệu mới vào danh sách hiện tại
          console.log('Search response:', response);
          this.songs = response.content;
          this.totalElements = response.page.totalElements;
          this.isLoading = false;// Hoàn thành tải
        },
        error: (err) => {
          console.error('Error fetching search results:', err);
          this.isLoading = false;//Đặt lại để có thể thử tải lại
          this.totalElements = 0;
        }
      });
    } 
    else {
      this.userUploadService.getAllUploadedSongs(
        this.currentPage, 
        this.pageSize,
        this.currentSortField,
        this.resultSort,
        status
      ).subscribe({
        next: (response) => {
          console.log(response)
          // this.songs = [...this.songs, ...response.content]; // Thêm dữ liệu mới vào danh sách hiện tại
          console.log('Uploaded songs response:', response);
          this.songs = response.content;
          console.log("các bài đã upload",this.songs)
          this.totalElements = response.page.totalElements;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching songs:', err);
          this.isLoading = false;
          this.totalElements = 0;
        }
      });
    }
  }

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

  formatDate(dateString: Date): string {
    return this.datePipe.transform(dateString, 'dd/MM/yyyy HH:mm:ss UTC+7') || '';
  }

  onTabChange(event: MatTabChangeEvent): void {
    this.selectedTabIndex = event.index;
    switch (event.index) {
      case 0:
        this.currentStatus = 'PENDING';
        break;
      case 1:
        this.currentStatus = 'APPROVED';
        break;
      case 2:
        this.currentStatus = 'REJECTED';
        break;
      case 3:
        this.currentStatus = 'UNDER_REVIEW';
        break;
      case 4:
        this.currentStatus = 'REVOKED';
        break;
    }
    this.songs = [];
    this.currentPage = 0;
    if (this.paginator) this.paginator.pageIndex = 0; // Reset paginator
    this.loadSongs(); // Load songs for the selected tab
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.songs = [];
    this.loadSongs();
  }

  onUploadSong(){
    console.log("Upload song clicked")
    const dialogRef = this.dialog.open(UserUploadDialogComponent, {
          width: '400px',
          disableClose: true
        });
    
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            console.log(!result.userId)
            this.songs = [];
            this.loadSongs();
          }
        });
  }

  editUploadSong(songId: number): void {
    console.log(`Edit song with ID: ${songId}`);
    this.songService.getSongById(songId).subscribe({
      next: (song) => {
        const dialogRef = this.dialog.open(UserUploadDialogComponent, {
          width: '400px',
          disableClose: true,
          data: { song } // Truyền dữ liệu user vào dialog
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            // console.log(result.userId)
            this.songs = [];
            this.loadSongs();
          }
        });
      },
      error: (err) => console.error('Error fetching user:', err)
    });
  }

  loadLikedSongs(): void {
    this.likedSongService.getAllLikedSongs().subscribe({
      next: (response) => {
        this.likedSongIds =Array.isArray(response) ? response.map(item => item.songId.toString()) : [];
        console.log(this.likedSongIds);
      },
      error: (err) => {
        console.error('Error fetching liked songs:', err);
      }
    });
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

  likeSong(song: Song) {
    console.log(`Like song: ${song.title}`);
    this.likedSongService.addSongToLikedSongs(song.songId).subscribe({
      next: (response) => {
        this.likedSongIds.push(song.songId.toString());
        console.log('Song liked successfully:', response);
        this.snackBar.open(
          `Liked ${song.title}`, 
          'Close', 
          {
            duration: 3000,           // The snackbar will disappear after 3 seconds
            horizontalPosition: 'end', // Position at the right side
            verticalPosition: 'bottom', // Position at the bottom
            panelClass: ['success-snackbar'] // Optional custom CSS class for styling
          }
        );
      },
      error: (err) => {
        console.error('Error liking song:', err);
      }
    });
  }

  unlikeSong(song: Song) {
    console.log(`Unlike song: ${song.title}`);
    this.likedSongService.deleteSongFromLikedSongs(song.songId).subscribe({
      next: (response) => {
        this.likedSongIds = this.likedSongIds.filter(id => id !== song.songId.toString());
        console.log('Song unliked successfully:', response);
        this.snackBar.open(
          `Unliked ${song.title}`, 
          'Close', 
          {
            duration: 3000,           // The snackbar will disappear after 3 seconds
            horizontalPosition: 'end', // Position at the right side
            verticalPosition: 'bottom', // Position at the bottom
            panelClass: ['success-snackbar'] // Optional custom CSS class for styling
          }
        );
      },
      error: (err) => {
        console.error('Error unliking song:', err);
      }
    });
  }

  playSong(song: Song): void {
    console.log(song.fileSongId);
    this.playerService.setCurrentSong(song); 
  }

  subscribeToStatusUpdates(): void {
    // this.webSocketService.connect();
    this.webSocketSubscription = this.webSocketService.getStatusUpdates().subscribe({
      next: (statusUpdate) => {
        console.log('Received status update:', statusUpdate); // Debug
        console.log('Current status:', this.currentStatus);
          console.log('Reloading songs for tab:', this.currentStatus);
          this.songs = []; // Reset danh sách trước khi tải
          this.currentPage = 0; // Reset về trang đầu
          if (this.paginator) this.paginator.pageIndex = 0;
          this.loadSongs(); // Tải lại danh sách nếu đang ở tab APPROVED hoặc REVOKED
        // }
      },
      error: (err) => {
        console.error('WebSocket error:', err);
      },
    });
  }

  addToAlbum(song: Song): void {
    console.log('song', song.songId);
    const dialogRef = this.dialog.open(AlbumDialogComponent, {
      width: '400px',
      data: { song: song }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.action === 'add') {
          console.log('Adding song:', result.song.songId, 'to playlist:', result.album.albumId);
          this.albumService.addSongToAlbum(result.song.songId, result.album.albumId).subscribe({
            next: (response) => {
              console.log('Song added to album successfully:', response);
              this.snackBar.open(
                `Added to album`, 
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
              console.error('Error adding song to album:', err);
            }
          });
        }
      }
    });
  }
}
