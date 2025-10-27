import { Injectable } from '@angular/core';
import {CanActivate,ActivatedRouteSnapshot,RouterStateSnapshot,UrlTree,Router} from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');
    const objetosMenu = localStorage.getItem('objetosMenu');

    if (token && usuario) {
      return true;
    } else {
      console.warn('Bloqueado por AuthGuard: no hay token');
      return this.router.createUrlTree(['/login']);
    }
    
  }
}
