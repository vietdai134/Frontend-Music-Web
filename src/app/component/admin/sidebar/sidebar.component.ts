import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  menuItems = [
    { label: 'Dashboard', icon: 'fas fa-home', link: '/admin' },
    { label: 'Song', icon: 'fas fa-users', link: '/admin/song' },
    { label: 'Genre', icon: 'fas fa-shopping-cart', link: '/admin/genre' },
    { label: 'Permission', icon: 'fas fa-box', link: '/admin/permission' },
    { label: 'Role', icon: 'fas fa-cog', link: '/admin/role' },
    { label: 'Users', icon: 'fas fa-users', link: '/admin/user' },
    { label: 'User-Role', icon: 'fas fa-shopping-cart', link: '/admin/user-role' },
    { label: 'Role-Permission', icon: 'fas fa-box', link: '/admin/role-permission' },
    { label: 'User-Payment', icon: 'fas fa-cog', link: '/admin/user-payment' },
    { label: 'Song-Approval', icon: 'fas fa-users', link: '/admin/song-approval' }
  ];
}
