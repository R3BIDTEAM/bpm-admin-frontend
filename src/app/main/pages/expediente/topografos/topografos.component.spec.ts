import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopografosComponent } from './topografos.component';

describe('TopografosComponent', () => {
  let component: TopografosComponent;
  let fixture: ComponentFixture<TopografosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TopografosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TopografosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
