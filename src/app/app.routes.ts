import { Routes } from "@angular/router";
import { LoginComponent } from "./pages/login/login.component";
import { AuthGuard } from "./guards/auth.guard";
import { NoAuthGuard } from "./guards/no-auth.guard";
import { LibroComponent } from "./pages/libro/libro.component";
import { TramiteComponent } from "./pages/tramite/tramite.component";

export const ROUTES: Routes = [
  { path: "libro", component: LibroComponent , canActivate: [AuthGuard]},
  { path: "tramite/:id", component: TramiteComponent , canActivate: [AuthGuard]},
  { path: "", pathMatch: "full", redirectTo: "login" },
  { path: "**", pathMatch: "full", redirectTo: "login" },
  { path: "login", component: LoginComponent ,canActivate: [NoAuthGuard]}
];