import { Routes } from '@angular/router';
import { LoginComponent } from './component/login/login.component';
import { HomeComponent } from './component/home/home.component';
import { AdminHomeComponent } from './component/admin/admin-home/admin-home.component';
import { SongComponent } from './component/admin/song/song.component';
import { GenreComponent } from './component/admin/genre/genre.component';
import { PermissionComponent } from './component/admin/permission/permission.component';
import { RoleComponent } from './component/admin/role/role.component';
import { UserComponent } from './component/admin/user/user.component';
import { UserPaymentComponent } from './component/admin/user-payment/user-payment.component';
import { DashboardComponent } from './component/admin/dashboard/dashboard.component';
import { SignupComponent } from './component/signup/signup.component';
import { SongUploadComponent } from './component/admin/song-upload/song-upload.component';
import { PlaylistComponent } from './component/playlist/playlist.component';
import { LikedSongComponent } from './component/liked-song/liked-song.component';
import { HistorySongComponent } from './component/history-song/history-song.component';
import { UserUploadComponent } from './component/user-upload/user-upload.component';


export const routes: Routes = [
    { path: '', component: HomeComponent},
    { path: 'login', component: LoginComponent },
    { path: 'signup', component:SignupComponent},
    { 
        path: 'admin', component: AdminHomeComponent,
        children: [
            { path: '', component: DashboardComponent },
            { path: 'song', component: SongComponent },
            { path: 'genre', component: GenreComponent },
            { path: 'permission', component: PermissionComponent },
            { path: 'role', component: RoleComponent },
            { path: 'song-upload', component: SongUploadComponent },
            { path: 'user', component: UserComponent },
            { path: 'user-payment', component: UserPaymentComponent }
        ]
    },
    { path: 'playlists', component:PlaylistComponent},
    { path: 'history', component:HistorySongComponent},
    { path: 'liked-songs', component:LikedSongComponent},
    { path: 'upload-song', component:UserUploadComponent},


];
