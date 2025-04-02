import { Component } from '@angular/core';
import { Song } from '../../models/song.module';
import { PlayerService } from '../../services/PlayerServices/player.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [
    CommonModule 
  ],
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  currentSong: Song | null = null;
  songUrl: string | null = null;
  constructor(private playerService: PlayerService) {}

  ngOnInit(): void {
    this.playerService.currentSong$.subscribe(song => {
      if (song) {
        this.currentSong = song;
        console.log("Current Song:", JSON.stringify(this.currentSong, null, 2));

        this.playAudio(song.fileSongId);
      }
    });
  }

  playAudio(fileSongId: string): void {
    this.playerService.streamingSong(fileSongId).subscribe({
      next: (blob) => {
        this.songUrl = URL.createObjectURL(blob);
      },
      error: (err) => {
        console.error('Error streaming song:', err);
      }
    });
  }
}
