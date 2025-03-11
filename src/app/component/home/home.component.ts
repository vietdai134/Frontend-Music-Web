import { Component, OnInit } from '@angular/core';
import { SongService } from '../../services/song.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule 
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  songs: any[] = [];
  currentPage = 0;  
  pageSize = 5;    
  totalPages = 1;  

  constructor(private songService: SongService) {}

  ngOnInit() {
    this.loadSongs();
  }

  loadSongs() {
    this.songService.getAllSongs(this.currentPage, this.pageSize).subscribe({
      next: (data: any) => {
        this.songs = data.content;  
        this.totalPages = data.page.totalPages;  
      },
      error: (err) => console.error('Lỗi khi tải bài hát:', err)
    });
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadSongs();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadSongs();
    }
  }

}
