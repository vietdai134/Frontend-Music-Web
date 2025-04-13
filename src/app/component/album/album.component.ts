import { CommonModule, DatePipe } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { NgSelectModule } from '@ng-select/ng-select';
import { QueueComponent } from '../queue/queue.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { combineLatest, Subscription } from 'rxjs';
import { Song } from '../../models/song.module';
import { Playlist } from '../../models/playlist.module';
import { PlayerService } from '../../services/PlayerServices/player.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Genre } from '../../models/genre.module';
import { GenreService } from '../../services/GenreServices/genre.service';
import { LikedSongService } from '../../services/LikedSongServices/liked-song.service';
import { PlaylistService } from '../../services/PlaylistServices/playlist.service';
import { PublicService } from '../../services/PublicServices/public.service';
import { SearchService } from '../../services/SearchServices/search.service';
import { SidebarService } from '../../services/SidebarServices/sidebar.service';
import { SongService } from '../../services/SongServices/song.service';
import { ConfirmDeleteComponent } from '../dialog/confirm-delete/confirm-delete.component';
import { AlbumService } from '../../services/AlbumServices/album.service';
import { Album } from '../../models/album.module';
import { PlaylistDialogComponent } from '../dialog/playlist-dialog/playlist-dialog.component';
import { AlbumDialogComponent } from '../dialog/album-dialog/album-dialog.component';

@Component({
  selector: 'app-album',
  imports: [
    SidebarComponent,
    CommonModule ,
    MatButtonModule,
    MatCardModule,
    MatPaginatorModule,
    QueueComponent,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    NgSelectModule
  ],
  templateUrl: './album.component.html',
  styleUrl: './album.component.scss',
  providers: [DatePipe]
})
export class AlbumComponent implements OnInit, OnDestroy{
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
    searchKeywordAlbumName: string | null = null;
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

    albums: Album[] = [];
    albumsDisplayed: Album[] = [];
    selectedAlbum: Album | null = null;
    albumCurrentPage: number = 0;
    itemsPerPage: number = 3;

    likedSongIds: string[] = [];

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    @ViewChild('playlistButtons', { static: false }) playlistButtons!: ElementRef;

    @ViewChild('genreSelect') genreSelect!: MatSelect;
    
    constructor(
      private playerService: PlayerService,
      private searchService: SearchService,
      private sidebarService: SidebarService,
      private publicService: PublicService,
      private genreService: GenreService,
      private playlistService: PlaylistService,
      private datePipe: DatePipe,
      private dialog: MatDialog,
      private likedSongService: LikedSongService,
      private snackBar: MatSnackBar,
      private songService: SongService,
      private albumService:AlbumService
    ) {}

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
    }
    ngOnInit(): void {
      this.loadAlbums();
      this.loadLikedSongs();
      this.loadGenres();
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
    }

    loadGenres() {
      this.genreService.getListAllGenres().subscribe((response) => {
        this.genres = response.map((genre: Genre) => genre.genreName);
      });
    }

    loadAlbums(){
      this.albumService.getAllAlbums().subscribe((response) => {
        this.albums = response;
        console.log(this.albums);
        this.updateDisplayedAlbums();
        if (this.albums.length > 0) {
          this.selectAlbum(this.albums[0]); // Chọn playlist đầu tiên
        }
      });

      
    }

    loadSongs(): void {
      if (this.isLoading) return;// Nếu đang tải, thoát ra ngay
      this.isLoading = true;// Đánh dấu là đang tải dữ liệu
  
      const hasKeyword = this.searchKeyword && this.searchKeyword.trim() !== '';
      const hasGenres = this.selectedGenres !== null && this.selectedGenres.length > 0;
      const hasSongIds =this.selectedSongIds !== null && this.selectedSongIds.length > 0;
      console.log("username:",this.searchKeywordUserName?? undefined);
      // if (this.searchKeyword && this.searchKeyword.trim() !== '' && this.selectedGenres !== null) {
      // if (hasKeyword || hasGenres || hasSongIds) {
      if (hasSongIds) {
        this.publicService.searchSongByKeyword(
          this.selectedSongIds ?? [], 
          this.searchKeywordTitle ?? undefined  ,
          this.searchKeywordArtist ?? undefined, 
          this.selectedGenres ??[], 
          this.searchKeywordUserName?? undefined, 
          this.searchKeywordAlbumName?? undefined,
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

    deleteFromAlbum(song: Song) {
      console.log(`Add to playlist: ${song.songId}`);
      console.log(`Add to playlist: ${this.selectedAlbum?.albumId}`);
      const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
        width: '300px',
        data: { 
          entity:'song',
          id:song.title
        } 
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) { // Nếu người dùng xác nhận xóa
          if(this.selectedAlbum?.albumId == null){
            console.log("Chưa chọn album nào")
            return;
          }
          this.albumService.deleteSongFromAlbum(this.selectedAlbum?.albumId, song.songId).subscribe(
            (response) => {
              console.log('Song removed from playlist:', response);
              this.selectedSongIds = this.selectedSongIds.filter(id => id !== song.songId.toString());
              // this.songs = this.songs.filter(s => s.songId !== song.songId); // Xóa bài hát khỏi danh sách hiện tại
              this.songs = [];
              this.currentPage = 0;
              this.totalElements = 0;
              this.loadSongs(); // Tải lại danh sách bài hát
            },
            (error) => {
              console.error('Error removing song from playlist:', error);
            }
          );
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
    // Logic thích bài hát
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
  
    formatDate(dateString: Date | string): string {
      return this.datePipe.transform(dateString, 'HH:mm:ss dd/MM/yyyy  UTC+7') || '';
    }

    updateDisplayedAlbums() {
      const start = this.currentPage * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      this.albumsDisplayed = this.albums.slice(start, end);
    }
    scrollLeft() {
      if (this.currentPage > 0) {
        this.currentPage--;
        this.updateDisplayedAlbums();
      }
    }
  
    scrollRight() {
      if (!this.isLastPage()) {
        this.currentPage++;
        this.updateDisplayedAlbums();
      }
    }
  
    isLastPage(): boolean {
      return (this.currentPage + 1) * this.itemsPerPage >= this.albums.length;
    }
  
    selectAlbum(album: Album) {
      this.selectedAlbum = album;//gán playlist đã chọn để đổi màu
      // Thêm logic để lọc bài hát theo playlist nếu cần
      console.log('Selected playlist:', album.albumId);
      this.albumService.getSongsByAlbumId(album.albumId).subscribe(
        (response) => {
          console.log('Songs in selected playlist:', response);
          this.selectedSongIds = Array.isArray(response) ? response.map(item => item.songId.toString()) : []; // Giả sử response chứa danh sách bài hát
          console.log('Songs in selected playlist:', this.selectedSongIds);

          this.currentPage = 0;
          this.songs = [];
          this.loadSongs();
          
      },
      (error) => {
        console.error('Error fetching songs for playlist:', error);
      });    
      
    }

    editAlbum(album: Album): void {
      console.log('Edit album:', album);

      const dialogRef = this.dialog.open(AlbumDialogComponent, {
        width: '400px',
        data: { 
          mode: 'edit',
          album: album 
        }
      });
    
      dialogRef.afterClosed().subscribe(result => {
        if (result && result.action === 'edit') {
          // Xử lý sau khi chỉnh sửa album
          console.log('Album edited:', result.album);
          // Có thể cần reload dữ liệu hoặc cập nhật UI
          this.loadAlbums(); // Giả sử bạn có phương thức này để tải lại albums
        }
      });
    }
    

    deleteAlbum(album: Album): void {
      console.log('Delete album:', album);
      const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
        width: '300px',
        data: { 
          entity:'album',
          id: album.albumName
        } 
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) { // Nếu người dùng xác nhận xóa
          this.albumService.deleteAlbum(album.albumId).subscribe(
            (response) => {
              console.log('Song removed from playlist:', response);
              this.loadAlbums();
            },
            (error) => {
              console.error('Error removing song from playlist:', error);
            }
          );
        }
      });
    }

    addAlbumToQueue(): void {
      console.log(this.songs);
      for (const song of this.songs){
        console.log(song);
        this.playerService.setCurrentSong(song); 
      }
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
}
