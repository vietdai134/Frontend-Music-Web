import { Component, OnInit, ViewChild } from '@angular/core';
import { SongUpload } from '../../../models/songUpload.module';
import { SongUploadService } from '../../../services/SongUploadServices/song-upload.service';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { SongApprovalService } from '../../../services/SongApprovalServices/song-approval.service';

@Component({
  selector: 'app-song-upload',
  imports: [
    CommonModule,
    MatTableModule, 
    MatPaginatorModule, 
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './song-upload.component.html',
  styleUrl: './song-upload.component.scss',
  providers: [DatePipe]
})
export class SongUploadComponent implements OnInit{
  displayedColumns: string[] = ['uploadId', 'title', 'artist', 
    'fileSongId', 'songImage','uploadDate','userName', 'actions'];
  songUploads: SongUpload[]=[];
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;
  status='PENDING';
  searchKeyword: string = '';

  statusOptions: string[] = ['PENDING','REJECTED','UNDER_REVIEW','REVOKED'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private songUploadService: SongUploadService,
    private songApprovalService: SongApprovalService,
    private dialog: MatDialog,
    private datePipe: DatePipe
  ) {}
  ngOnInit(): void {
    this.loadUploadSongs(this.currentPage, this.pageSize,this.status);
  }



  loadUploadSongs(page: number, size: number, status:string): void {
    this.songUploadService.getAllSongsUpload(page, size,status).subscribe({
      next: (response) => {
        this.songUploads = response.content;
        this.totalElements = response.page.totalElements;
        this.pageSize = response.page.size;
        this.currentPage = response.page.number;
      },
      error: (err) => {
        console.error('Error fetching songs:', err);
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    if (this.searchKeyword.trim()) {
      this.searchSongs(this.currentPage, this.pageSize,this.status);
    } else {
      this.loadUploadSongs(this.currentPage, this.pageSize, this.status);
    }
  }
  
  formatDate(dateString: string): string {
    return this.datePipe.transform(dateString, 'dd/MM/yyyy HH:mm:ss') || '';
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
    this.searchSongs(this.currentPage, this.pageSize,this.status);
    
  }

  searchSongs(page: number, size: number,status:string): void {
    console.log(status)
    if (!this.searchKeyword.trim()) {
      console.log("khong co keyword")
      this.loadUploadSongs(page, size,status); // Nếu không có từ khóa tìm kiếm, lấy toàn bộ danh sách
      return;
    }
    this.songUploadService.searchSongsUploadWithStatus(page, size,this.searchKeyword,status).subscribe({
      next: (response) => { // Xác định kiểu dữ liệu
        console.log(response.content)
        this.songUploads = response.content;
        this.totalElements = response.page.totalElements;
        this.pageSize = response.page.size;
        this.currentPage = response.page.number;
      },
      error: (err: any) => { // Xác định kiểu dữ liệu
        console.error('Error searching songs:', err);
      }
    });
  }

  // Xử lý sự kiện thay đổi status
  onStatusChange(status: string): void {
    this.status = status;
    this.currentPage = 0; // Reset về trang đầu tiên khi thay đổi status
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    if (this.searchKeyword.trim()) {
      this.searchSongs(this.currentPage, this.pageSize, this.status);
    } else {
      this.loadUploadSongs(this.currentPage, this.pageSize, this.status);
    }
    
  }

  getSongStatus(): string {
    // Giả sử trạng thái nằm trong songDto.status, điều chỉnh theo dữ liệu thực tế
    return this.status; // Cần kiểm tra dữ liệu API
  }

  // Cập nhật trạng thái bài hát
  updateSongStatus(uploadId: number, newStatus: string): void {
    this.songApprovalService.UpdateSongUploadApproval(uploadId, newStatus).subscribe({
      next: () => {
        console.log(`Updated song ${uploadId} to status ${newStatus}`);
        if (this.searchKeyword.trim()) {
          this.searchSongs(this.currentPage, this.pageSize, this.status);
        } else {
          this.loadUploadSongs(this.currentPage, this.pageSize, this.status);
        }
      },
      error: (err) => {
        console.error('Error updating song status:', err);
      }
    });
  }
}
