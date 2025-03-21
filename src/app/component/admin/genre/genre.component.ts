import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Genre } from '../../../models/genre.module';
import { GenreService } from '../../../services/GenreServices/genre.service';
import { ConfirmDeleteComponent } from '../../dialog/confirm-delete/confirm-delete.component';
import { GenreDialogComponent } from '../../dialog/genre-dialog/genre-dialog.component';

@Component({
  selector: 'app-genre',
  standalone: true,
  imports: [
    MatTableModule, 
    MatPaginatorModule, 
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    FormsModule,
    MatFormFieldModule
  ],
  templateUrl: './genre.component.html',
  styleUrl: './genre.component.scss'
})
export class GenreComponent implements OnInit{
  displayedColumns: string[] = ['genreId', 'genreName','actions'];
  genres: Genre[] = [];
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;
  searchKeyword: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  constructor(
    private genreService: GenreService,
    private dialog: MatDialog,
  ) {}


  ngOnInit(): void {
    this.loadGenres(this.currentPage, this.pageSize);
  }

  loadGenres(page: number, size: number): void {
    this.genreService.getAllGenres(page, size).subscribe({
      next: (response) => {
        // console.log('API Response:', response);
        this.genres = response.content;
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
    // this.loadGenres(this.currentPage, this.pageSize);
    // Kiểm tra xem có từ khóa tìm kiếm hay không
    if (this.searchKeyword.trim()) {
      this.searchGenres(this.currentPage, this.pageSize);
    } else {
      this.loadGenres(this.currentPage, this.pageSize);
    }
  }

  deleteGenre(genreId: number): void {
      const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
        width: '300px',
        data: { 
          // userId 
          entity:'genre',
          id:genreId
        } // Truyền userId vào dialog
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) { // Nếu người dùng xác nhận xóa
          // console.log(genreId)
          this.genreService.deleteGenre(genreId).subscribe({
            next: () => {
              console.log(`Delete user with ID: ${genreId}`);
              this.loadGenres(this.currentPage, this.pageSize); // Tải lại danh sách sau khi xóa
            },
            error: (err) => {
              console.error('Error deleting user:', err);
            }
          });
        }
      });
    }
  
    editGenre(genreId: number): void {
      console.log(`Edit genre with ID: ${genreId}`);
      this.genreService.getGenreById(genreId).subscribe({
        next: (genre) => {
          console.log(genre)
          const dialogRef = this.dialog.open(GenreDialogComponent, {
            width: '400px',
            disableClose: true,
            data: { genre } // Truyền dữ liệu user vào dialog
          });
  
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              this.loadGenres(this.currentPage, this.pageSize);
            }
          });
        },
        error: (err) => console.error('Error fetching user:', err)
      });
    }

  createGenre(): void {
      const dialogRef = this.dialog.open(GenreDialogComponent, {
        width: '400px',
        disableClose: true
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loadGenres(this.currentPage, this.pageSize);
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
      this.searchGenres(this.currentPage, this.pageSize);
      
    }
  
    searchGenres(page: number, size: number): void {
      if (!this.searchKeyword.trim()) {
        this.loadGenres(page, size); // Nếu không có từ khóa tìm kiếm, lấy toàn bộ danh sách
        return;
      }
      this.genreService.searchGenres(this.searchKeyword, page, size).subscribe({
        next: (response) => { // Xác định kiểu dữ liệu
          this.genres = response.content;
          this.totalElements = response.page.totalElements;
          this.pageSize = response.page.size;
          this.currentPage = response.page.number;
        },
        error: (err: any) => { // Xác định kiểu dữ liệu
          console.error('Error searching users:', err);
        }
      });
    }
}
