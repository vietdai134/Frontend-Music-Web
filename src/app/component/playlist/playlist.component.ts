import { ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { combineLatest, Subscription } from 'rxjs';
import { PlayerService } from '../../services/PlayerServices/player.service';
import { SidebarService } from '../../services/SidebarServices/sidebar.service';
import { CommonModule, DatePipe } from '@angular/common';
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
import { Song } from '../../models/song.module';
import { SearchService } from '../../services/SearchServices/search.service';
import { PublicService } from '../../services/PublicServices/public.service';
import { GenreService } from '../../services/GenreServices/genre.service';
import { Genre } from '../../models/genre.module';
import { Playlist } from '../../models/playlist.module';
import { PlaylistService } from '../../services/PlaylistServices/playlist.service';
import { ConfirmDeleteComponent } from '../dialog/confirm-delete/confirm-delete.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-playlist',
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
  templateUrl: './playlist.component.html',
  styleUrl: './playlist.component.scss',
  providers: [DatePipe]
})
export class PlaylistComponent implements OnInit,OnDestroy{
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

    editingPlaylist: any = null;
    tempPlaylistName: string = '';

    isUploadDateAsc = false; // Trạng thái sắp xếp cho Upload Date
    isTitleAsc = false;      // Trạng thái sắp xếp cho Title
    isArtistAsc = false;    // Trạng thái sắp xếp cho Artist
    currentSortField = 'uploadDate';
    resultSort = 'desc'; // Giá trị mặc định cho sort

    genres: string[] = [];

    selectedGenres: string[] =[];
    selectedSongIds: string[] = [];
    
    playlists: Playlist[] = [];
    playlistsDisplayed: Playlist[] = [];
    selectedPlaylist: Playlist | null = null;
    playlistCurrentPage: number = 0;
    itemsPerPage: number = 4;
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
      private dialog: MatDialog
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
      this.loadPlaylists();
      this.loadGenres();
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

    loadPlaylists(){
      this.playlistService.getAllPlaylists().subscribe((response) => {
        this.playlists = response;
        console.log(this.playlists);
        this.updateDisplayedPlaylists();
        if (this.playlists.length > 0) {
          this.selectPlaylist(this.playlists[0]); // Chọn playlist đầu tiên
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
      if (hasKeyword || hasGenres || hasSongIds) {
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
      } else {
        this.publicService.getAllSongsWithApproved(this.currentPage, this.pageSize,this.currentSortField,this.resultSort).subscribe({
          next: (response) => {
            // console.log(response.content)
            this.songs = [...this.songs, ...response.content];
            // console.log(this.songs)
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

    deleteFromPlaylist(song: Song) {
      console.log(`Add to playlist: ${song.songId}`);
      console.log(`Add to playlist: ${this.selectedPlaylist?.playlistId}`);
      const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
        width: '300px',
        data: { 
          entity:'song',
          id:song.title
        } 
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) { // Nếu người dùng xác nhận xóa
          if(this.selectedPlaylist?.playlistId == null){
            console.log("Chưa chọn playlist nào")
            return;
          }
          this.playlistService.deleteSongFromPlaylist(this.selectedPlaylist?.playlistId, song.songId).subscribe(
            (response) => {
              console.log('Song removed from playlist:', response);
              this.selectedSongIds = this.selectedSongIds.filter(id => id !== song.songId.toString());
              this.songs = this.songs.filter(s => s.songId !== song.songId); // Xóa bài hát khỏi danh sách hiện tại
              this.currentPage = 0;
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
  
    formatDate(dateString: Date | string): string {
      return this.datePipe.transform(dateString, 'HH:mm:ss dd/MM/yyyy  UTC+7') || '';
    }

    updateDisplayedPlaylists() {
      const start = this.currentPage * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      this.playlistsDisplayed = this.playlists.slice(start, end);
    }
    scrollLeft() {
      if (this.currentPage > 0) {
        this.currentPage--;
        this.updateDisplayedPlaylists();
      }
    }
  
    scrollRight() {
      if (!this.isLastPage()) {
        this.currentPage++;
        this.updateDisplayedPlaylists();
      }
    }
  
    isLastPage(): boolean {
      return (this.currentPage + 1) * this.itemsPerPage >= this.playlists.length;
    }
  
    selectPlaylist(playlist: Playlist) {
      this.selectedPlaylist = playlist;//gán playlist đã chọn để đổi màu
      // Thêm logic để lọc bài hát theo playlist nếu cần
      console.log('Selected playlist:', playlist.playlistId);
      this.playlistService.getSongsByPlaylistId(playlist.playlistId).subscribe(
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

    editPlaylist(playlist: any): void {
      this.editingPlaylist = playlist;
      this.tempPlaylistName = playlist.playlistName;
      
      // Đảm bảo focus vào input sau khi DOM được cập nhật
      setTimeout(() => {
        const editInput = document.querySelector('.edit-playlist-name') as HTMLInputElement;
        if (editInput) {
          editInput.focus();
          editInput.select(); // Chọn toàn bộ text
        }
      }, 0);
    }
    
    savePlaylistName(playlist: any): void {
      // Kiểm tra để không lưu tên trống
      if (this.tempPlaylistName.trim()) {
        playlist.playlistName = this.tempPlaylistName.trim();
        // Ở đây bạn sẽ gọi service để lưu thay đổi vào database
        this.updatePlaylistInDatabase(playlist);
      }
      this.editingPlaylist = null;
    }
    
    cancelEdit(): void {
      this.editingPlaylist = null;
    }
    @HostListener('document:click', ['$event'])
    handleClickOutside(event: MouseEvent) {
      // Kiểm tra xem có đang trong chế độ chỉnh sửa không
      if (this.editingPlaylist) {
        // Kiểm tra xem click có phải là bên ngoài input không
        const editInput = document.querySelector('.edit-playlist-name');
        if (editInput && !editInput.contains(event.target as Node)) {
          this.cancelEdit();
        }
      }
    }
    
    updatePlaylistInDatabase(playlist: Playlist): void {
      // Gọi service để cập nhật playlist trong database
      console.log('Updating playlist in database:', playlist);
      this.playlistService.updatePlaylist(playlist.playlistId,playlist.playlistName).subscribe(
        (response) => {
          console.log('Playlist updated successfully:', response);
          this.loadPlaylists(); // Tải lại danh sách playlist sau khi cập nhật
        },
        (error) => {
          console.error('Error updating playlist:', error);
        }
      );
    }

    deletePlaylist(playlist: Playlist): void {
      console.log('Delete playlist:', playlist);
      const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
        width: '300px',
        data: { 
          entity:'playlist',
          id: playlist.playlistName
        } 
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) { // Nếu người dùng xác nhận xóa
          this.playlistService.deletePlaylist(playlist.playlistId).subscribe(
            (response) => {
              console.log('Song removed from playlist:', response);
              this.loadPlaylists();
            },
            (error) => {
              console.error('Error removing song from playlist:', error);
            }
          );
        }
      });
    }

    addPlaylistToQueue(): void {
      console.log(this.songs);
      for (const song of this.songs){
        console.log(song);
        this.playerService.setCurrentSong(song); 
      }
    }
}
