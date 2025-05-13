import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './component/header/header.component';
import { FooterComponent } from './component/footer/footer.component';
import { CommonModule } from '@angular/common';
import { LoginService } from './services/LoginServices/login.service';
import { HomeComponent } from './component/home/home.component';
import { Song } from './models/song.module';
// import { LoginService } from './services/LoginServices/login.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    HeaderComponent, 
    FooterComponent,
    CommonModule
  ],
  template: `
    <app-header *ngIf="!isAdminRoute()"></app-header>
    <div class="content">
      <router-outlet (activate)="onActivate($event)"></router-outlet>
    </div>
    <app-footer (lyricsRequest)="onLyricsRequest($event)" *ngIf="!isAdminRoute()"></app-footer>
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'music-web';
  private currentPage: any;
  constructor(
    private router: Router,
    private loginService : LoginService
  ) {}

  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }

  ngOnInit() {
    this.loginService.initialize(); // Khởi động khôi phục phiên
  }

    onActivate(componentRef: any) {
    this.currentPage = componentRef;
  }

  onLyricsRequest(event: { currentSong: Song }) {
    if (this.currentPage instanceof HomeComponent) {
      this.currentPage.showLyricsOverlay(event.currentSong);
    }
  }
}
