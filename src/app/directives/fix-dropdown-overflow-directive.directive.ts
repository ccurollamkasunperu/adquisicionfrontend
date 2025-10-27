import {
  AfterViewInit, Directive, ElementRef, NgZone, OnDestroy
} from '@angular/core';

@Directive({
  selector: '[appFixDropdownOverflowDirective]'
})
export class FixDropdownOverflowDirectiveDirective {
private onShown?: (e: Event) => void;
  private onHide?: () => void;

  private menuEl?: HTMLElement;
  private placeholder?: Comment;

  constructor(private host: ElementRef<HTMLElement>, private zone: NgZone) {}

  ngAfterViewInit(): void {
    const el = this.host.nativeElement;

    this.zone.runOutsideAngular(() => {
      this.onShown = (e) => this.handleShown(e);
      this.onHide  = () => this.handleHide();

      // Escucha eventos de Bootstrap 5
      el.addEventListener('shown.bs.dropdown', this.onShown as any, true);
      el.addEventListener('hide.bs.dropdown',  this.onHide as any,  true);
    });
  }

  ngOnDestroy(): void {
    const el = this.host.nativeElement;
    if (this.onShown) el.removeEventListener('shown.bs.dropdown', this.onShown as any, true);
    if (this.onHide)  el.removeEventListener('hide.bs.dropdown',  this.onHide as any,  true);
  }

  private handleShown(_e: Event) {
    const container = this.host.nativeElement;
    const toggle = container.querySelector<HTMLElement>('[data-bs-toggle="dropdown"]');
    const menu   = container.querySelector<HTMLElement>('.dropdown-menu');
    if (!toggle || !menu) return;

    // Guarda posición original
    this.placeholder = document.createComment('dropdown-placeholder');
    if (menu.parentElement) {
      menu.parentElement.insertBefore(this.placeholder, menu);
    }

    // Mueve al <body> y posiciona fijo (evita cualquier overflow)
    document.body.appendChild(menu);
    menu.style.position = 'fixed';
    menu.style.zIndex   = '2000';

    const rect     = toggle.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const end      = menu.classList.contains('dropdown-menu-end');

    const top  = rect.bottom;
    const left = end ? (rect.right - menuRect.width) : rect.left;

    menu.style.top  = String(Math.round(top)) + 'px';
    menu.style.left = String(Math.round(left)) + 'px';

    // Evita que Popper reescriba estilos
    menu.setAttribute('data-popper', 'static');

    this.menuEl = menu;
  }

  private handleHide() {
    if (!this.menuEl || !this.placeholder) return;

    // Limpia estilos
    this.menuEl.style.position = '';
    this.menuEl.style.top = '';
    this.menuEl.style.left = '';
    this.menuEl.style.zIndex = '';
    this.menuEl.removeAttribute('data-popper');

    // Vuelve a su lugar original
    const parentNode = this.placeholder.parentNode;
    if (parentNode) {
      parentNode.insertBefore(this.menuEl, this.placeholder);
      parentNode.removeChild(this.placeholder);
    }

    this.menuEl = undefined;
    this.placeholder = undefined;
  }
}