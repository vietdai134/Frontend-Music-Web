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
    const currentSong = this.currentSongSubject.value;
    const songIndex = this.songQueue.findIndex(s => s.songId === song.songId);

    if (songIndex !== -1) {
      const currentSongIndex = this.songQueue.findIndex(s => s === currentSong);
      if (songIndex < currentSongIndex) {
        // Nếu bài hát đã có trong queue và ở trước bài hiện tại, xóa và thêm vào cuối
        this.songQueue.splice(songIndex, 1);
        this.songQueue.push(song);
      }
      // Nếu bài hát đã có và không ở trước bài hiện tại, không làm gì thêm
    } else {
      // Nếu bài hát chưa có trong queue, thêm vào cuối
      this.songQueue.push(song);
    }

    this.songQueueSubject.next([...this.songQueue]);
    
    // Chỉ phát bài mới nếu không có bài đang phát
    if (!currentSong) {
      this.currentSongSubject.next(song);
      this.isPlayingSubject.next(true);
    }
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
    this.songQueueSubject.next([]);
  }

  // Lấy danh sách hàng đợi (nếu cần hiển thị UI)
  getQueue(): Song[] {
    return this.songQueue;
  }

  toggleShowQueue(): void {
    this.showQueueSubject.next(!this.showQueueSubject.value);
  }
  
  setQueue(songs: Song[]): void {
    this.songQueue = [...songs];
    this.songQueueSubject.next(this.songQueue);

    const current = this.currentSongSubject.value;
    const stillInQueue = songs.some(s => s.songId === current?.songId);
    if (!stillInQueue) {
      this.currentSongSubject.next(null);
      this.isPlayingSubject.next(false);
    }
  }

  removeSongFromQueue(index: number): void {
    const currentSong = this.currentSongSubject.value;
    const songToRemove = this.songQueue[index];

    // Xóa bài hát tại index
    this.songQueue.splice(index, 1);
    this.songQueueSubject.next([...this.songQueue]);

    // Nếu queue rỗng, dừng phát
    if (this.songQueue.length === 0) {
      this.currentSongSubject.next(null);
      this.isPlayingSubject.next(false);
    }
    // Nếu xóa bài đang phát và còn bài khác trong queue, phát bài tiếp theo
    else if (songToRemove === currentSong) {
      const nextIndex = index < this.songQueue.length ? index : this.songQueue.length - 1;
      this.currentSongSubject.next(this.songQueue[nextIndex]);
      this.isPlayingSubject.next(true);
    }
    // Nếu xóa bài không đang phát, không cần làm gì thêm
  }

}

