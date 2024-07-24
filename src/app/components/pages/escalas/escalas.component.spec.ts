import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EscalasComponent } from './escalas.component';

describe('EscalasComponent', () => {
  let component: EscalasComponent;
  let fixture: ComponentFixture<EscalasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EscalasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EscalasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
