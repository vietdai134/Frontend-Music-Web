import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './component/header/header.component';
import { FooterComponent } from './component/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    HeaderComponent, 
    FooterComponent
  ],
  template: `
    <app-header></app-header>
    <div class="content">
      <router-outlet></router-outlet>
    </div>
    <app-footer></app-footer>
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'music-web';
}
