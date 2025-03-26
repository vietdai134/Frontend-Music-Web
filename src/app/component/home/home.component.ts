import { Component, OnInit } from '@angular/core';
import { SongService } from '../../services/SongServices/song.service';
import { CommonModule } from '@angular/common';
import { Song } from '../../models/song.module';

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
  songs: Song[] = [];
  currentPage = 0;  
  pageSize = 5;    
  totalPages = 1;  

  constructor(private songService: SongService) {}

  ngOnInit() {
    this.loadSongs();
  }

  loadSongs() {
    this.songService.getAllSongsWithStatus(this.currentPage, this.pageSize,'APPROVED').subscribe({
      next: (data) => {
        this.songs = data.content || [];           // Access content directly
        this.totalPages = data.page.totalPages || 1; // Access totalPages from page object
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
