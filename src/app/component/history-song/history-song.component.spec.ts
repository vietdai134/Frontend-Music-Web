import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorySongComponent } from './history-song.component';

describe('HistorySongComponent', () => {
  let component: HistorySongComponent;
  let fixture: ComponentFixture<HistorySongComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorySongComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorySongComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
