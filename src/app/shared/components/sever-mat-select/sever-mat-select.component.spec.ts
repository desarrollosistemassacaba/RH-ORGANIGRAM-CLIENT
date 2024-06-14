import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeverMatSelectComponent } from './sever-mat-select.component';

describe('SeverMatSelectComponent', () => {
  let component: SeverMatSelectComponent;
  let fixture: ComponentFixture<SeverMatSelectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SeverMatSelectComponent]
    });
    fixture = TestBed.createComponent(SeverMatSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
