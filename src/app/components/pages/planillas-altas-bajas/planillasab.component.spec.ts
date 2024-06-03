import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanillasabComponent } from './planillasab.component';

describe('FuncionariosComponent', () => {
  let component: PlanillasabComponent;
  let fixture: ComponentFixture<PlanillasabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanillasabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlanillasabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
