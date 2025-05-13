import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LyricsOverlayComponent } from './lyrics-overlay.component';

describe('LyricsOverlayComponent', () => {
  let component: LyricsOverlayComponent;
  let fixture: ComponentFixture<LyricsOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LyricsOverlayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LyricsOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
