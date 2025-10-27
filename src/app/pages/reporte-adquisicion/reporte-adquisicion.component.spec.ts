import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteAdquisicionComponent } from './reporte-adquisicion.component';

describe('ReporteAdquisicionComponent', () => {
  let component: ReporteAdquisicionComponent;
  let fixture: ComponentFixture<ReporteAdquisicionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteAdquisicionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteAdquisicionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
