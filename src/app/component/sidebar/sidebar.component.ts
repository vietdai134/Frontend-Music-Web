import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../../services/LoginServices/login.service';
import { Observable } from 'rxjs';
import { User } from '../../models/user.module';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule, 
    RouterModule,
    MatIconModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit{
  @Input() isSidebarVisible: boolean = true;
  
  user$: Observable<User | null>;
  menuItems = [
    { label: 'Home', icon: 'home', link: '' },
  ];

  constructor(
    private loginService: LoginService,
    private router: Router
  ) {
    this.user$ = this.loginService.user$;
  }

  ngOnInit(): void {
    this.user$.subscribe(user => {
      if (this.isPlaylist(user)) {
        if (!this.menuItems.some(item => item.label === 'Playlists')) {
          this.menuItems.push({
            label: 'Playlists',
            icon: 'library_music',
            link: '/playlists'
          });
        }
      }
      if (this.isHistory(user)) {
        if (!this.menuItems.some(item => item.label === 'History')) {
          this.menuItems.push({
            label: 'History',
            icon: 'history',
            link: '/history'
          });
        }
      }
      if (this.isLikedSongs(user)) {
        if (!this.menuItems.some(item => item.label === 'Liked Songs')) {
          this.menuItems.push({
            label: 'Liked Songs',
            icon: 'favorite',
            link: '/liked-songs'
          });
        }
      }
      if (this.isUploadSong(user)) {
        if (!this.menuItems.some(item => item.label === 'Upload Song')) {
          this.menuItems.push({
            label: 'Upload Song',
            icon: 'cloud_upload',
            link: '/upload-song'
          });
        }
      }
      if (this.isCreateAlbum(user)) {
        if (!this.menuItems.some(item => item.label === 'Albums')) {
          this.menuItems.push({
            label: 'Albums',
            icon: 'album',
            link: '/albums'
          });
        }
      }
    });
  }

  isPlaylist(user: User | null): boolean {
    return user?.permissions?.includes('CREATE_PLAYLIST') || false;
  }

  isHistory(user: User | null): boolean {
    return user?.permissions?.includes('HISTORY') || false;
  }

  isLikedSongs(user: User | null): boolean {
    return user?.permissions?.includes('LIKE_SONG') || false;
  }

  isUploadSong(user: User | null): boolean {
    return user?.permissions?.includes('UPLOAD_SONG') || false;
  }

  isCreateAlbum(user: User | null): boolean {
    return user?.permissions?.includes('CREATE_ALBUM') || false;
  }

  isActive(link: string): boolean {
    return this.router.url === link;
  }
}
