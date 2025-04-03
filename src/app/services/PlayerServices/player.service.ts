import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Song } from '../../models/song.module';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private currentSongSubject = new BehaviorSubject<Song | null>(null);
  currentSong$ = this.currentSongSubject.asObservable();
  private songQueue: Song[] = [];

  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  isPlaying$ = this.isPlayingSubject.asObservable();
  
  private showQueueSubject = new BehaviorSubject<boolean>(false);
  showQueue$ = this.showQueueSubject.asObservable();

  private songQueueSubject = new BehaviorSubject<Song[]>([]);
  songQueue$ = this.songQueueSubject.asObservable();

  private baseUrl = environment.baseUrl; 
  constructor(private http: HttpClient) { }

  setCurrentSong(song: Song): void {
    const currentSongIndex = this.songQueue.findIndex(s => s === this.currentSongSubject.value);
    const songIndex = this.songQueue.findIndex(s => s.songId === song.songId); // Giả sử Song có songId

    if (songIndex !== -1 && songIndex < currentSongIndex) {
      // Nếu bài hát đã có trong queue và ở trước bài hiện tại, xóa và thêm vào cuối
      this.songQueue.splice(songIndex, 1);
      this.songQueue.push(song);
      console.log('Moved existing song to end of queue:', this.songQueue);
    } else if (songIndex === -1) {
      // Nếu bài hát chưa có trong queue, thêm vào cuối
      this.songQueue.push(song);
      console.log('Added new song to queue:', this.songQueue);
    }

    this.songQueueSubject.next([...this.songQueue]);
    
    if (!this.currentSongSubject.value ) {
      // Nếu không có bài đang phát, phát bài đầu tiên
      // this.currentSongSubject.next(this.songQueue[0]);
      this.currentSongSubject.next(song);
      this.isPlayingSubject.next(true);
    }
    // this.currentSongSubject.next(song);
    // this.isPlayingSubject.next(true);
  }

  playSongFromQueue(song: Song): void {
    this.currentSongSubject.next(song); // Phát ngay bài này
    this.isPlayingSubject.next(true);
  }

  streamingSong(fileSongId: string) {
    return this.http.get(`${this.baseUrl}/songs/stream/${fileSongId}`, { 
      responseType: 'blob'
      // withCredentials: true 
    });
  }
  
  // Chuyển sang bài tiếp theo (không xóa bài hiện tại)
  playNext(): void {
    const currentSongIndex = this.songQueue.findIndex(s => s === this.currentSongSubject.value);
    if (currentSongIndex !== -1 && currentSongIndex < this.songQueue.length - 1) {
      const nextSong = this.songQueue[currentSongIndex + 1];
      this.currentSongSubject.next(nextSong);
      this.isPlayingSubject.next(true);
    } else {
      // Đã đến cuối hàng đợi, dừng phát
      this.currentSongSubject.next(null);
      this.isPlayingSubject.next(false);
    }
  }

  // Chuyển về bài trước
  playPrevious(): void {
    const currentSongIndex = this.songQueue.findIndex(s => s === this.currentSongSubject.value);
    if (currentSongIndex > 0) {
      const previousSong = this.songQueue[currentSongIndex - 1];
      this.currentSongSubject.next(previousSong);
      this.isPlayingSubject.next(true);
    }
    else{
      console.log('No previous song');
    }
  }

  // Tạm dừng hoặc tiếp tục phát
  togglePlayPause(): void {
    if (this.currentSongSubject.value) {
      this.isPlayingSubject.next(!this.isPlayingSubject.value);
    }
  }

  // Xóa toàn bộ hàng đợi
  clearQueue(): void {
    this.songQueue = [];
    this.currentSongSubject.next(null);
    this.isPlayingSubject.next(false);
  }

  // Lấy danh sách hàng đợi (nếu cần hiển thị UI)
  getQueue(): Song[] {
    return this.songQueue;
  }

  toggleShowQueue(): void {
    this.showQueueSubject.next(!this.showQueueSubject.value);
  }
}

