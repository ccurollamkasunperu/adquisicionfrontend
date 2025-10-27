import { Routes } from "@angular/router";
import { LoginComponent } from "./pages/login/login.component";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { AuthGuard } from "./guards/auth.guard";
import { NoAuthGuard } from "./guards/no-auth.guard";
import { TicketComponent } from "./pages/ticket/ticket.component";
import { OrdenesComponent } from "./pages/ordenes/ordenes.component";
import { ReporteAdquisicionComponent } from "./pages/reporte-adquisicion/reporte-adquisicion.component";
import { OrdenEntregaComponent } from "./pages/orden-entrega/orden-entrega.component";

export const ROUTES: Routes = [
  { path: "dashboard", component: DashboardComponent , canActivate: [AuthGuard]},  
  //TICKET
  { path: "ticket", component: TicketComponent , canActivate: [AuthGuard]},
  
  { path: "ordenes", component: OrdenesComponent , canActivate: [AuthGuard]},
  { path: "entregas/:id", component: OrdenEntregaComponent , canActivate: [AuthGuard]},
  { path: "reporte-adquisicion", component: ReporteAdquisicionComponent , canActivate: [AuthGuard]},
  { path: "", pathMatch: "full", redirectTo: "login" },
  { path: "**", pathMatch: "full", redirectTo: "login" },
  { path: "login", component: LoginComponent ,canActivate: [NoAuthGuard]}
];