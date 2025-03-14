import { TestBed } from '@angular/core/testing';

import { PlaylistSongService } from './playlist-song.service';

describe('PlaylistSongService', () => {
  let service: PlaylistSongService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlaylistSongService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
