import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcuseReciboComponent } from './acuse-recibo.component';

describe('AcuseReciboComponent', () => {
  let component: AcuseReciboComponent;
  let fixture: ComponentFixture<AcuseReciboComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AcuseReciboComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AcuseReciboComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
