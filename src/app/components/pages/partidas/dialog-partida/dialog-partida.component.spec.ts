import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogPartidaComponent } from './dialog-partida.component';

describe('DialogPartidaComponent', () => {
  let component: DialogPartidaComponent;
  let fixture: ComponentFixture<DialogPartidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogPartidaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogPartidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
