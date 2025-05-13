import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Song } from '../../models/song.module';

@Component({
  selector: 'app-lyrics-overlay',
  imports: [
    CommonModule, MatIconModule, MatButtonModule
  ],
  standalone: true,
  templateUrl: './lyrics-overlay.component.html',
  styleUrl: './lyrics-overlay.component.scss'
})
export class LyricsOverlayComponent {
  @Input() currentSong: Song | null = null;
  @Output() close = new EventEmitter<void>();

  ngOnInit(): void {
    console.log('LyricsOverlayComponent initialized, currentSong:', this.currentSong);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentSong']) {
      console.log('currentSong changed:', this.currentSong);
    }
  }
  onClose() {
    this.close.emit();
  }
}
