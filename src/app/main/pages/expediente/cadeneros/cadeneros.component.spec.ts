import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadenerosComponent } from './cadeneros.component';

describe('CadenerosComponent', () => {
  let component: CadenerosComponent;
  let fixture: ComponentFixture<CadenerosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CadenerosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CadenerosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
