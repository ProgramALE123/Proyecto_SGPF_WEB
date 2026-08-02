import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Nadvar } from './nadvar';

describe('Nadvar', () => {
  let component: Nadvar;
  let fixture: ComponentFixture<Nadvar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Nadvar],
    }).compileComponents();
    fixture = TestBed.createComponent(Nadvar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
