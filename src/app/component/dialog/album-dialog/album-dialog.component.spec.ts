import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlbumDialogComponent } from './album-dialog.component';

describe('AlbumDialogComponent', () => {
  let component: AlbumDialogComponent;
  let fixture: ComponentFixture<AlbumDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlbumDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlbumDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
