import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, UrlTree } from '@angular/router';
import { filter } from 'rxjs/operators';

interface RawItem {
  obj_id: number;
  obj_descri: string;
  obj_abrevi?: string | null;
  obj_idpadr?: number | null;
  jsn_permis?: string | null;
  obj_enlace?: string | null;
  obj_pintar?: number | boolean | string | null;
  obj_ismenu?: number | boolean | string | null;
}

interface MenuNode {
  id: number;
  label: string;
  parentId: number | null;
  enlace: string;
  children: MenuNode[];
  expanded?: boolean;     // << estado UI
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  menuTree: MenuNode[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    const raw = this.readFromStorage();
    this.menuTree = this.buildMenuTree(raw);

    // abrir ramas cuya ruta esté activa al cargar y en cada navegación
    this.markActiveBranches();
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.markActiveBranches());
  }

  // ---------- helpers de datos ----------
  private readFromStorage(): RawItem[] {
    const s = localStorage.getItem('objetosMenu');
    if (!s) return [];
    try {
      const arr = JSON.parse(s) as RawItem[];
      // Si además quieres exigir que sean de menú, puedes encadenar && this.isPaint(x.obj_ismenu)
      return arr.filter(x => this.isPaint(x.obj_pintar));
    } catch {
      return [];
    }
  }

  private buildMenuTree(items: RawItem[]): MenuNode[] {
    const map: { [id: number]: MenuNode } = {};
    const roots: MenuNode[] = [];

    for (let i = 0; i < items.length; i++) {
      const r = items[i];
      const parentId = (typeof r.obj_idpadr === 'number') ? r.obj_idpadr : null;
      const enlace = (r.obj_enlace || '').replace(/^\/+/, '');

      map[r.obj_id] = {
        id: r.obj_id,
        label: r.obj_descri,
        parentId: (typeof r.obj_idpadr === 'number') ? r.obj_idpadr : null,
        enlace,
        children: [],
        expanded: false
      };
    }

    for (const idStr in map) {
      if (!map.hasOwnProperty(idStr)) continue;
      const node = map[+idStr];
      if (node.parentId != null && map[node.parentId]) {
        map[node.parentId].children.push(node);
      } else {
        roots.push(node);
      }
    }

    const sortRec = (arr: MenuNode[]) => {
      arr.sort((a, b) => a.id - b.id);
      for (let i = 0; i < arr.length; i++) sortRec(arr[i].children);
    };
    sortRec(roots);

    return roots;
  }

  private guessLink(r: RawItem): string { return this.slugify(r.obj_descri); }

  slugify(s: string): string {
    if (!s) return '';
    return s.toString()
      .replace(/[ÁÀÂÄáàâä]/g, 'a')
      .replace(/[ÉÈÊËéèêë]/g, 'e')
      .replace(/[ÍÌÎÏíìîï]/g, 'i')
      .replace(/[ÓÒÔÖóòôö]/g, 'o')
      .replace(/[ÚÙÛÜúùûü]/g, 'u')
      .replace(/Ñ/g, 'n').replace(/ñ/g, 'n')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private isPaint(val: unknown): boolean {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'number') return val === 1;
    if (typeof val === 'string') return val.trim() === '1' || val.trim().toLowerCase() === 'true';
    return false;
  }

  trackById(_i: number, n: MenuNode) { return n.id; }

  // ---------- helpers de UI/Router ----------
  private buildFullPath(parentPath: string, node: MenuNode): string {
    return parentPath ? `${parentPath}/${node.enlace}` : node.enlace;
  }


  isActiveRoute(path: string): boolean {
    // compara usando Router para que coincida con rutas hijas
    const tree: UrlTree = this.router.parseUrl('/' + path);
    return this.router.isActive(tree, false);
  }

  toggle(node: MenuNode, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    node.expanded = !node.expanded;
  }

  private collapseAll(nodes: MenuNode[]) {
    for (const n of nodes) {
      n.expanded = false;
      this.collapseAll(n.children);
    }
  }

  private expandPathByPredicate(nodes: MenuNode[], parentPath: string, pred: (full: string) => boolean): boolean {
    // devuelve true si en esta rama hay algo activo (para abrir ancestros)
    let anyActive = false;
    for (const n of nodes) {
      const full = this.buildFullPath(parentPath, n);
      const childHasActive = this.expandPathByPredicate(n.children, full, pred);
      const selfActive = pred(full);
      n.expanded = childHasActive || (selfActive && n.children.length > 0);
      anyActive = anyActive || childHasActive || selfActive;
    }
    return anyActive;
  }

  private markActiveBranches() {
    this.collapseAll(this.menuTree);
    this.expandPathByPredicate(this.menuTree, '', (full) => this.isActiveRoute(full));
  }

  goTo(parentPath: string, node: MenuNode, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    const full = this.buildFullPath(parentPath, node);
    const segs = this.pathSegments(full);
    this.router.navigate(['/', ...segs]);
  }


  /* isBranchActive(node: MenuNode, parentPath: string): boolean {
    const base = this.buildFullPath(parentPath, node); // p.ej. 'reporte'
    const current = this.router.url.replace(/^\//, ''); // sin slash inicial
    if (!node.children || node.children.length === 0) {
      return current.startsWith(base);
    }
    const selfActive = current.startsWith(base + '/');
    return selfActive || node.children.some(child => this.isBranchActive(child, base));
  } */

  pathSegments(full: string): string[] {
    return (full || '')
      .replace(/^\/+/, '')          // quita slashes de inicio
      .replace(/\/+$/, '')          // quita slashes de fin
      .split('/')
      .filter(Boolean);
  }
  
  normalizeLink(s: string): string {
    return (s || '').trim().replace(/^\/+|\/+$/g, '');
  }

  isLeafActive(node: MenuNode): boolean {
    const curr = this.router.url.replace(/^\/+|\/+$/g, '');
    const link = this.normalizeLink(node.enlace);
    return curr === link;
  }

  isBranchActive(node: MenuNode): boolean {
    if (!node.children || node.children.length === 0) {
      return this.isLeafActive(node);
    }
    return node.children.some(ch => this.isBranchActive(ch));
  }

}
