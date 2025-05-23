import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { SongService } from '../../../services/SongServices/song.service';
import { SongDialogComponent } from '../../dialog/song-dialog/song-dialog.component';
import { Song } from '../../../models/song.module';
import { SongApprovalService } from '../../../services/SongApprovalServices/song-approval.service';
import { Genre } from '../../../models/genre.module';
import { ConfirmDeleteComponent } from '../../dialog/confirm-delete/confirm-delete.component';

@Component({
  selector: 'app-song',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule, 
    MatPaginatorModule, 
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    FormsModule,
    MatFormFieldModule
  ],
  templateUrl: './song.component.html',
  styleUrl: './song.component.scss',
  providers: [DatePipe]
})
export class SongComponent implements OnInit{
  displayedColumns: string[] = ['songId', 'title', 'artist', 
    'fileSongId', 'songImage','genres', 
    'approvedDate','userName', 'actions'];
  songs:Song[]=[];
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;
  searchKeyword: string = ''; // Khai báo biến searchKeyword

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private songService: SongService,
    private songApprovalService: SongApprovalService,
    private dialog: MatDialog,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadSongs(this.currentPage, this.pageSize);
  }

  loadSongs(page: number, size: number): void {
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
    // this.loadUsers(this.currentPage, this.pageSize);
    if (this.searchKeyword.trim()) {
      // this.searchUsers(this.currentPage, this.pageSize);
    } else {
      this.loadSongs(this.currentPage, this.pageSize);
    }
  }

  getGenresDisplay(song: Song): string {
    return song.genres.length > 0 
      ? song.genres.map((genre: Genre) => genre.genreName).join(', ') 
      : 'Không có thể loại';
  }

  revokeSong(songId: number): void {
    const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      width: '300px',
      data: { 
        entity:'song',
        id:songId
      } 
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) { // Nếu người dùng xác nhận xóa
        this.songApprovalService.UpdateSongApproval(songId,'REVOKED').subscribe({
          next: () => {
            console.log(`Delete song with ID: ${songId}`);
            this.loadSongs(this.currentPage, this.pageSize);
          },
          error: (err) => {
            console.error('Error deleting song:', err);
          }
        });
      }
    });
  }

  onSearchChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchKeyword = inputElement.value;
    console.log(this,this.searchKeyword);
    // Reset currentPage về 0 khi tìm kiếm
    this.currentPage = 0;
    
    // Cập nhật paginator để hiển thị trang đầu tiên
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.searchSongs(this.currentPage, this.pageSize);
    
  }

  searchSongs(page: number, size: number): void {
    if (!this.searchKeyword.trim()) {
      console.log("khong co keyword")
      this.loadSongs(page, size); // Nếu không có từ khóa tìm kiếm, lấy toàn bộ danh sách
      return;
    }
    this.songService.searchSongsWithStatus(page, size,this.searchKeyword,'APPROVED').subscribe({
      next: (response) => { // Xác định kiểu dữ liệu
        console.log(response.content)
        this.songs = response.content;
        this.totalElements = response.page.totalElements;
        this.pageSize = response.page.size;
        this.currentPage = response.page.number;
      },
      error: (err: any) => { // Xác định kiểu dữ liệu
        console.error('Error searching songs:', err);
      }
    });
  }


  createSong(): void {
    const dialogRef = this.dialog.open(SongDialogComponent, {
      width: '400px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(!result.userId)
        this.loadSongs(this.currentPage, this.pageSize);
      }
    });
  }

  // Cập nhật method editUser
  editSong(songId: number): void {
    console.log(`Edit song with ID: ${songId}`);
    this.songService.getSongById(songId).subscribe({
      next: (song) => {
        const dialogRef = this.dialog.open(SongDialogComponent, {
          width: '400px',
          disableClose: true,
          data: { song } // Truyền dữ liệu user vào dialog
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            // console.log(result.userId)
            this.loadSongs(this.currentPage, this.pageSize);
          }
        });
      },
      error: (err) => console.error('Error fetching user:', err)
    });
  }

  formatDate(dateString: string): string {
    return this.datePipe.transform(dateString, 'dd/MM/yyyy HH:mm:ss') || '';
  }

  
}
