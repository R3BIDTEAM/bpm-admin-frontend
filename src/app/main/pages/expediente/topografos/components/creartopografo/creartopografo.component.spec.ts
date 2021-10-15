import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreartopografoComponent } from './creartopografo.component';

describe('CreartopografoComponent', () => {
  let component: CreartopografoComponent;
  let fixture: ComponentFixture<CreartopografoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreartopografoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreartopografoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
