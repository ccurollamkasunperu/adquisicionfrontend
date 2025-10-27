import { Component, EventEmitter, Output, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-action-menu',
  template: `
  <ul class="dropdown-menu show" style="display:block; position:relative; margin:0;">
    <li *ngIf="showEditar"><a class="dropdown-item" (click)="emit('EDITAR')">EDITAR</a></li>
    <li *ngIf="showAnular"><a class="dropdown-item" (click)="emit('ANULAR')">ANULAR</a></li>
    <li *ngIf="showVer"><a class="dropdown-item" (click)="emit('VER')">VER</a></li>
    <li *ngIf="showAsignar"><a class="dropdown-item" (click)="emit('ASIGNAR')">ASIGNAR</a></li>
    <li *ngIf="showAtender"><a class="dropdown-item" (click)="emit('ATENDER')">ATENDER</a></li>
    <li *ngIf="showResponder"><a class="dropdown-item" (click)="emit('RESPONDER')">RESPONDER</a></li>
    <li *ngIf="showValidar"><a class="dropdown-item" (click)="emit('VALIDAR')">VALIDAR</a></li>
    <li *ngIf="showCerrar"><a class="dropdown-item" (click)="emit('CERRAR')">CERRAR</a></li>
    <li *ngIf="showTrazabilidad"><a class="dropdown-item" (click)="emit('TRAZABILIDAD')">TRAZABILIDAD</a></li>
  </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionMenuComponent {
  @Input() showEditar = false;
  @Input() showAnular = false;
  @Input() showVer = false;
  @Input() showAsignar = false;
  @Input() showAtender = false;
  @Input() showResponder = false;
  @Input() showValidar = false;
  @Input() showCerrar = false;
  @Input() showTrazabilidad = false;

  @Output() select = new EventEmitter<string>();
  emit(action: string) { this.select.emit(action); }
}
