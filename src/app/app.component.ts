import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './component/header/header.component';
import { FooterComponent } from './component/footer/footer.component';
import { CommonModule } from '@angular/common';

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
      <router-outlet></router-outlet>
    </div>
    <app-footer *ngIf="!isAdminRoute()"></app-footer>
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'music-web';
  constructor(private router: Router) {}

  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }
}
