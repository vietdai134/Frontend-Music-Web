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
  currentStatus = 'approved';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private playerService: PlayerService,
    private sidebarService: SidebarService,
    private datePipe: DatePipe,
    private userUploadService: UserUploadService,
    private dialog: MatDialog,
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

  }
  ngOnInit(): void {
    this.loadSongs();
      // combineLatest([this.searchService.currentKeyword$, this.searchService.currentTypeSearch$])
      // .subscribe(([keyword, type]) => {
  
      //   this.searchKeywordTitle = null;
      //   this.searchKeywordArtist = null;
      //   this.searchKeywordUserName = null;
      //   this.searchKeyword = keyword;
  
      //   if(type=='title'){
      //     this.searchKeywordTitle = keyword;
      //   }
      //   else if(type=='artist'){
      //     this.searchKeywordArtist = keyword;
      //   }
      //   else if(type=='username'){
      //     this.searchKeywordUserName = keyword;
      //   }
  
      //   this.currentPage = 0; // Reset về trang đầu khi tìm kiếm
      //   this.songs = []; // Xóa danh sách cũ
      //   this.loadSongs(); // Tải lại danh sách với keyword và type mới
      // });
      this.queueSubscription = this.playerService.showQueue$.subscribe(show => {
        this.showQueue = show;
      });
  
      this.sidebarSubscription = this.sidebarService.sidebarVisible$.subscribe(
        visible => this.isSidebarVisible = visible
      );
  }

  loadSongs(): void {
    if (this.isLoading) return;// Nếu đang tải, thoát ra ngay
    this.isLoading = true;// Đánh dấu là đang tải dữ liệu

    // const hasKeyword = this.searchKeyword && this.searchKeyword.trim() !== '';
    // const hasGenres = this.selectedGenres !== null && this.selectedGenres.length > 0;
    // const hasSongIds =this.selectedSongIds !== null && this.selectedSongIds.length > 0;
    
    // if (hasKeyword || hasGenres || hasSongIds) {
    //   this.publicService.searchSongByKeyword(
    //     this.selectedSongIds ?? [], 
    //     this.searchKeywordTitle ?? undefined  ,
    //     this.searchKeywordArtist ?? undefined, 
    //     this.selectedGenres ??[], 
    //     this.searchKeywordUserName?? undefined, 
    //     this.currentPage, this.pageSize, 
    //     this.currentSortField, 
    //     this.resultSort
    //   ).subscribe({
    //     next: (response) => {
    //       this.songs = [...this.songs, ...response.content]; // Thêm dữ liệu mới vào danh sách hiện tại
    //       this.totalElements = response.page.totalElements;
    //       this.isLoading = false;// Hoàn thành tải
    //     },
    //     error: (err) => {
    //       console.error('Error fetching search results:', err);
    //       this.isLoading = false;//Đặt lại để có thể thử tải lại
    //       this.totalElements = 0;
    //     }
    //   });
    // } 
    // else {
      this.userUploadService.getAllUploadedSongs(
        this.currentPage, 
        this.pageSize,
        this.currentSortField,
        this.resultSort,
        this.currentStatus
      ).subscribe({
        next: (response) => {
          console.log(response)
          this.songs = [...this.songs, ...response.content]; // Thêm dữ liệu mới vào danh sách hiện tại
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
    // }
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
        this.currentStatus = 'pending';
        break;
      case 1:
        this.currentStatus = 'approved';
        break;
      case 2:
        this.currentStatus = 'rejected';
        break;
      case 3:
        this.currentStatus = 'under_review';
        break;
      case 4:
        this.currentStatus = 'revoked';
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
            this.loadSongs();
          }
        });
  }
}
