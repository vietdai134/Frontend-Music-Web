import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Song } from '../../models/song.module';
import { GeniusService } from '../../services/GeniusServices/genius.service';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-lyrics-overlay',
  imports: [
    CommonModule, 
    FormsModule,
    MatIconModule, 
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  standalone: true,
  templateUrl: './lyrics-overlay.component.html',
  styleUrl: './lyrics-overlay.component.scss'
})
export class LyricsOverlayComponent {
  @Input() currentSong: Song | null = null;
  @Output() close = new EventEmitter<void>();
  lyrics: string | null = null;
  song = '';
  artist = '';

  selectedLanguage: string | null = null; // Ngôn ngữ được chọn từ combobox
  availableLanguages = [
    { value: 'Vietnamese', label: 'Tiếng Việt' },
    { value: 'English', label: 'Tiếng Anh' },
    { value: 'French', label: 'Tiếng Pháp' },
    { value: 'Spanish', label: 'Tiếng Tây Ban Nha' },
    { value: 'Japanese', label: 'Tiếng Nhật' },
    { value: 'Chinese', label: 'Tiếng Trung' },
    { value: 'Korean', label: 'Tiếng Hàn' },
    { value: 'German', label: 'Tiếng Đức' },
    { value: 'Italian', label: 'Tiếng Ý' },
    { value: 'Portuguese', label: 'Tiếng Bồ Đào Nha' },
    { value: 'Russian', label: 'Tiếng Nga' },
    { value: 'Thai', label: 'Tiếng Thái' },
    { value: 'Arabic', label: 'Tiếng Ả Rập' },
    { value: 'Hindi', label: 'Tiếng Hindi' },
    { value: 'Indonesian', label: 'Tiếng Indonesia' },
    { value: 'Malay', label: 'Tiếng Mã Lai' },
    { value: 'Turkish', label: 'Tiếng Thổ Nhĩ Kỳ' },
    { value: 'Polish', label: 'Tiếng Ba Lan' },
    { value: 'Dutch', label: 'Tiếng Hà Lan' },
    { value: 'Greek', label: 'Tiếng Hy Lạp' },
    { value: 'Czech', label: 'Tiếng Séc' },
    { value: 'Hungarian', label: 'Tiếng Hungary' },
    { value: 'Swedish', label: 'Tiếng Thụy Điển' },
    { value: 'Finnish', label: 'Tiếng Phần Lan' },
    { value: 'Danish', label: 'Tiếng Đan Mạch' },
    { value: 'Norwegian', label: 'Tiếng Na Uy' },
    { value: 'Hebrew', label: 'Tiếng Do Thái' },
    { value: 'Ukrainian', label: 'Tiếng Ukraina' },
    { value: 'Romanian', label: 'Tiếng Romania' },
    { value: 'Slovak', label: 'Tiếng Slovakia' }
  ];
  translatedLyrics: string | null = null;

  isTranslating = false;

  constructor(
    private geniusService: GeniusService,
    private cdr: ChangeDetectorRef

  ) {}

  ngOnInit(): void {
    console.log('LyricsOverlayComponent initialized, currentSong:', this.currentSong);
    this.findLyrics();
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentSong']) {
      console.log('currentSong changed:', this.currentSong);
      this.findLyrics();
      this.resetTranslation();
    }
  }
  onClose() {
    this.close.emit();
  }

  findLyrics() {
    this.song = this.currentSong?.title || '';
    this.artist = this.currentSong?.artist || '';
    this.geniusService.getLyrics(this.song, this.artist).subscribe({
      next: (res) => {
        this.lyrics = res.lyrics;
        console.log('Lyrics:', this.lyrics);
      },
      error: (err) => {
        console.error(err);
        this.lyrics = 'Không tìm thấy lời bài hát hoặc có lỗi xảy ra.';
      },
    });
  }

  onLanguageSelected(language: string) {
    this.selectedLanguage = language;
    if (this.lyrics && language) {
      this.translateLyrics(this.lyrics, language);
    } else {
      this.translatedLyrics = null; // Reset nếu không có lời bài hát
    }
  }

  // translateLyrics(lyrics: string, targetLanguage: string) {
  //   this.isTranslating = true;
  //   this.translatedLyrics = null;
  //   this.geniusService.translateText(lyrics, targetLanguage).subscribe({
  //     next: (res) => {
  //       this.translatedLyrics = res.translated_text;
  //       console.log('Translated Lyrics:', this.translatedLyrics);
  //       this.isTranslating = false;
  //     },
  //     error: (err) => {
  //       console.error(err);
  //       this.translatedLyrics = 'Lỗi khi dịch lời bài hát.';
  //       this.isTranslating = false;
  //     }
  //   });
  // }
  translateLyrics(lyrics: string, targetLanguage: string) {
    this.isTranslating = true;
    this.translatedLyrics = null;

    this.geniusService.translateText(lyrics, targetLanguage).subscribe({
      next: (res) => {
        this.translatedLyrics = res.translated_text;
        console.log('Translated Lyrics:', this.translatedLyrics);

        this.isTranslating = false;
        this.cdr.detectChanges(); // ép cập nhật UI
      },
      error: (err) => {
        console.error(err);
        this.translatedLyrics = 'Lỗi khi dịch lời bài hát.';
        this.isTranslating = false;
        this.cdr.detectChanges(); // ép cập nhật UI nếu có lỗi
      }
    });
  }

  resetTranslation() {
    this.selectedLanguage = null;
    this.translatedLyrics = null;
  }
}
