import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Song } from '../../models/song.module';
import { PlayerService } from '../../services/PlayerServices/player.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Thêm MatSnackBar
import { MatIconModule } from '@angular/material/icon';
import { ListenHistoryService } from '../../services/ListenHistoryServices/listen-history.service';

@Component({
  selector: 'app-footer',
  imports: [
    CommonModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule
  ],
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit{
  currentSong: Song | null = null;
  songUrl: string | null = null;

  isPlaying: boolean = false;
  songQueue: Song[] = [];
  canGoPrevious: boolean = false; // Kiểm tra có bài trước hay không
  canGoNext: boolean = false;     // Kiểm tra có bài sau hay không
  currentTime: number = 0;
  duration: number = 0;

  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
  
  volume: number = 1;

  constructor(
    private playerService: PlayerService,
    private historyService: ListenHistoryService,
  ) {}

  ngOnInit(): void {
    // Lắng nghe bài hát hiện tại
    this.playerService.currentSong$.subscribe(song => {
      this.currentSong = song;
      console.log(this.currentSong)
      this.songQueue = this.playerService.getQueue();
      this.updateNavigationState();
      if (song) {
        // this.playAudio(song.fileSongId);
        if (this.audioPlayer && this.audioPlayer.nativeElement) {
          this.audioPlayer.nativeElement.pause();
          this.audioPlayer.nativeElement.src = ''; // Xóa nguồn cũ ngay lập tức
          this.songUrl = null; // Đảm bảo songUrl cũng được reset
        }
        this.playAudio(song.fileSongId);
      } else {
        this.songUrl = null;
        if (this.audioPlayer) {
          this.audioPlayer.nativeElement.pause();
          this.audioPlayer.nativeElement.src = '';
        }
      }
    });

    this.playerService.songQueue$.subscribe(queue => {
      this.songQueue = queue;
      this.updateNavigationState();
    });

    this.playerService.isPlaying$.subscribe(isPlaying => {
      this.isPlaying = isPlaying;
      if (this.audioPlayer && this.audioPlayer.nativeElement) {
        if (isPlaying && this.currentSong && this.songUrl) {
          this.audioPlayer.nativeElement.play().catch(err => console.error('Play error:', err));
        } else {
          this.audioPlayer.nativeElement.pause();
        }
      }
    });

  }

  ngAfterViewInit(): void {
    if (this.audioPlayer && this.audioPlayer.nativeElement) {
      this.audioPlayer.nativeElement.addEventListener('loadedmetadata', () => {
        this.volume = this.audioPlayer.nativeElement.volume;
      });
    }

    if (this.audioPlayer?.nativeElement) {
      this.audioPlayer.nativeElement.addEventListener('loadedmetadata', () => {
        this.duration = this.audioPlayer.nativeElement.duration || 0;
      });
  
      // Lắng nghe sự kiện cập nhật thời gian
      this.audioPlayer.nativeElement.addEventListener('timeupdate', () => {
        this.onTimeUpdate();
      });
    }
  }

  playAudio(fileSongId: string): void {
    this.playerService.streamingSong(fileSongId).subscribe({
      next: (blob) => {
        this.songUrl = URL.createObjectURL(blob);
        // Phát nhạc sau khi có URL
        // setTimeout(() => {
          if (this.audioPlayer && this.audioPlayer.nativeElement ) {
            this.audioPlayer.nativeElement.src = this.songUrl ?? '';
            this.audioPlayer.nativeElement.load();
            // this.audioPlayer.nativeElement.play();
            if (this.isPlaying) {
              // this.audioPlayer.nativeElement.play();
              this.audioPlayer.nativeElement.play().catch(err => console.error('Play error:', err));
              this.addSongToHisotry(this.currentSong?.songId ?? 0); // Thêm bài hát vào lịch sử nghe
            }
          }
        // }, 0);
      },
      error: (err) => {
        console.error('Error streaming song:', err);
      }
    });
  }

  // Xử lý khi bài hát kết thúc
  onSongEnded(): void {
    console.log('Song ended, playing next...');
    if (this.audioPlayer && this.audioPlayer.nativeElement) {
      this.audioPlayer.nativeElement.pause(); // Dừng ngay lập tức
      this.audioPlayer.nativeElement.src = ''; // Xóa nguồn cũ
      this.songUrl = null; // Reset songUrl
    }
    this.playerService.playNext();
  }

  togglePlayPause(): void {
    this.playerService.togglePlayPause();
  }

  nextSong(): void {
    if (this.audioPlayer && this.audioPlayer.nativeElement) {
      this.audioPlayer.nativeElement.pause();
      this.audioPlayer.nativeElement.src = '';
      this.songUrl = null;
    }
    this.playerService.playNext();
  }

  previousSong(): void {
    if (this.audioPlayer && this.audioPlayer.nativeElement) {
      this.audioPlayer.nativeElement.pause();
      this.audioPlayer.nativeElement.src = '';
      this.songUrl = null;
    }
    this.playerService.playPrevious();
  }

  clearQueue(): void {
    this.playerService.clearQueue();
  }

  toggleQueue(): void {
    this.playerService.toggleShowQueue();
  }

  private updateNavigationState(): void {
    const currentSongIndex = this.songQueue.findIndex(s => s === this.currentSong);
    this.canGoPrevious = currentSongIndex > 0;
    this.canGoNext = currentSongIndex !== -1 && currentSongIndex < this.songQueue.length - 1;
  }

  // Xử lý khi thay đổi volume
  // onVolumeChange(event: Event): void {
  //   const volumeValue = (event.target as HTMLInputElement).value;
  //   if (this.audioPlayer && this.audioPlayer.nativeElement) {
  //     this.audioPlayer.nativeElement.volume = parseFloat(volumeValue);
  //     this.volume = parseFloat(volumeValue); // Cập nhật biến volume
  //   }
  // }

  onVolumeChange(event: Event): void {
    const volumeValue = (event.target as HTMLInputElement).value;
    const volume = parseFloat(volumeValue);
    this.volume = volume;
  
    if (this.audioPlayer?.nativeElement) {
      this.audioPlayer.nativeElement.volume = volume;
    }
  
    const volumeBar = document.querySelector('.volume-bar') as HTMLElement;
    if (volumeBar) {
      volumeBar.style.setProperty('--volume', volume.toString());
    }
  }

  // Cập nhật thanh thời lượng khi nhạc chạy
  onTimeUpdate(): void {
    if (this.audioPlayer?.nativeElement) {
      this.currentTime = this.audioPlayer.nativeElement.currentTime;
      this.duration = this.audioPlayer.nativeElement.duration || 0;
  
      const progressPercent = this.duration
        ? (this.currentTime / this.duration) * 100
        : 0;
  
      const progressBar = document.querySelector('.progress-bar') as HTMLElement;
      if (progressBar) {
        progressBar.style.setProperty('--progress', progressPercent.toString());
      }
    }
  }
  
  

  // Khi người dùng kéo thanh thời lượng
  onSeek(event: Event): void {
    const seekTime = parseFloat((event.target as HTMLInputElement).value);
    if (this.audioPlayer?.nativeElement) {
      this.audioPlayer.nativeElement.currentTime = seekTime;
      this.currentTime = seekTime; // Cập nhật UI ngay lập tức
    }
  }
  
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }
  
  addSongToHisotry(songId: number): void {
    this.historyService.addSongToHistory(songId).subscribe({
      next: (response) => {
        console.log('Song added to history successfully:', response);
      }
      , error: (err) => {
        console.error('Error adding song to history:', err);
      }
    });
  }
}
