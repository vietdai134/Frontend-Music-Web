import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Song } from '../../models/song.module';
import { PlayerService } from '../../services/PlayerServices/player.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Thêm MatSnackBar
import { MatIconModule } from '@angular/material/icon';

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

  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
  
  volume: number = 1;

  constructor(
    private playerService: PlayerService,
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

    // Lắng nghe trạng thái phát
    // this.playerService.isPlaying$.subscribe(isPlaying => {
    //   this.isPlaying = isPlaying;
    //   if (this.audioPlayer && this.audioPlayer.nativeElement) {
    //     if (isPlaying && this.currentSong) {
    //       this.audioPlayer.nativeElement.play().catch(err => console.error('Play error:', err));
    //     } else {
    //       this.audioPlayer.nativeElement.pause();
    //     }
    //   }
    // });
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

    // // Lắng nghe sự kiện timeupdate và loadedmetadata để cập nhật thời gian và duration
    // if (this.audioPlayer) {
    //   this.audioPlayer.nativeElement.addEventListener('timeupdate', () => {
    //     this.currentTime = this.audioPlayer.nativeElement.currentTime;
    //     this.duration = this.audioPlayer.nativeElement.duration;
    //   });
    //   this.audioPlayer.nativeElement.addEventListener('loadedmetadata', () => {
    //     this.duration = this.audioPlayer.nativeElement.duration;
    //     this.volume = this.audioPlayer.nativeElement.volume;
    //   });
    // }
  }

  ngAfterViewInit(): void {
    if (this.audioPlayer && this.audioPlayer.nativeElement) {
      this.audioPlayer.nativeElement.addEventListener('loadedmetadata', () => {
        this.volume = this.audioPlayer.nativeElement.volume;
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
    // if (this.audioPlayer && this.audioPlayer.nativeElement) {
    //   this.audioPlayer.nativeElement.pause(); // Dừng ngay lập tức khi bài kết thúc
    // }
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

  // nextSong(): void {
  //   this.playerService.playNext();
  //   this.updateNavigationState();
  // }
  nextSong(): void {
    if (this.audioPlayer && this.audioPlayer.nativeElement) {
      this.audioPlayer.nativeElement.pause();
      this.audioPlayer.nativeElement.src = '';
      this.songUrl = null;
    }
    this.playerService.playNext();
  }

  // previousSong(): void {
  //   this.playerService.playPrevious();
  //   this.updateNavigationState();
  // }
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
  onVolumeChange(event: Event): void {
    const volumeValue = (event.target as HTMLInputElement).value;
    if (this.audioPlayer && this.audioPlayer.nativeElement) {
      this.audioPlayer.nativeElement.volume = parseFloat(volumeValue);
      this.volume = parseFloat(volumeValue); // Cập nhật biến volume
    }
  }


  
}
