import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../../services/LoginServices/login.service';
import { Observable } from 'rxjs';
import { User } from '../../models/user.module';

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule, 
    RouterModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit{
  @Input() isSidebarVisible: boolean = true;
  
  user$: Observable<User | null>;
  menuItems = [
    { label: 'Home', icon: 'fas fa-home', link: '' },
    // { label: 'Profile', icon: 'fas fa-user', link: '/profile' },
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
            icon: 'fas fa-cog',
            link: '/playlists'
          });
        }
      }
      if (this.isHistory(user)) {
        if (!this.menuItems.some(item => item.label === 'History')) {
          this.menuItems.push({
            label: 'History',
            icon: 'fas fa-cog',
            link: '/history'
          });
        }
      }
      if (this.isLikedSongs(user)) {
        if (!this.menuItems.some(item => item.label === 'Liked Songs')) {
          this.menuItems.push({
            label: 'Liked Songs',
            icon: 'fas fa-cog',
            link: '/liked-songs'
          });
        }
      }
      if (this.isUploadSong(user)) {
        if (!this.menuItems.some(item => item.label === 'Upload Song')) {
          this.menuItems.push({
            label: 'Upload Song',
            icon: 'fas fa-cog',
            link: '/upload-song'
          });
        }
      }
      if (this.isCreateAlbum(user)) {
        if (!this.menuItems.some(item => item.label === 'Albums')) {
          this.menuItems.push({
            label: 'Albums',
            icon: 'fas fa-cog',
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
