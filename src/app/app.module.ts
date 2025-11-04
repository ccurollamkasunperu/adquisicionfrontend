import { BrowserModule } from "@angular/platform-browser";
import { LOCALE_ID, NgModule } from '@angular/core';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { RouterModule } from "@angular/router";
import { HttpClientModule } from "@angular/common/http";
import { ROUTES } from "./app.routes";
import { NgSelectModule } from '@ng-select/ng-select';
import { NgSelectConfig } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DataTablesModule } from "angular-datatables";
import { AppComponent } from "./app.component";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { MenuComponent } from "./components/menu/menu.component";
import { AgmCoreModule } from "@agm/core";
import { GooglePlaceModule } from "ngx-google-places-autocomplete";
import { ModalModule } from "ngx-bootstrap/modal";
import { LoginComponent } from "./pages/login/login.component";
import { TreeviewModule } from "ngx-treeview";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { NgxPrintModule } from "ngx-print";
import { NgxDropzoneModule } from 'ngx-dropzone';
import { DatePipe } from '@angular/common';
import { QuillModule } from 'ngx-quill';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from "./guards/auth";
import { TicketComponent } from './pages/ticket/ticket.component';
import { ApiService } from './services/api.service';
import { ModalVerComponent } from './components/modal-ver/modal-ver.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { FixDropdownOverflowDirectiveDirective } from './directives/fix-dropdown-overflow-directive.directive';
import { ActionMenuComponent } from './components/action-menu/action-menu.component';
import { OrdenesComponent } from './pages/ordenes/ordenes.component';
import { ReporteAdquisicionComponent } from './pages/reporte-adquisicion/reporte-adquisicion.component';
import { ModalEditarOrdenComponent } from './components/modal-editar-orden/modal-editar-orden.component';
import { ModalDocumentosComponent } from './components/modal-documentos/modal-documentos.component';
import { OrdenEntregaComponent } from './pages/orden-entrega/orden-entrega.component';
import { ModalConformidadComponent } from "./components/modal-conformidad/modal-conformidad.component";  
import { ModalDocumentosOrdenesComponent } from "./components/modal-documentos-ordenes/modal-documentos-ordenes.component";
import { ModalConformidadDocumentoComponent } from './components/modal-conformidad-documento/modal-conformidad-documento.component';

registerLocaleData(localeEs);

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    MenuComponent,
    LoginComponent,
    DashboardComponent,
    TicketComponent,
    ModalVerComponent,
    FixDropdownOverflowDirectiveDirective,
    ActionMenuComponent,
    OrdenesComponent,
    ReporteAdquisicionComponent,
    ModalEditarOrdenComponent,
    ModalDocumentosComponent,
    OrdenEntregaComponent,
    ModalConformidadComponent,
    ModalDocumentosOrdenesComponent,
    ModalConformidadDocumentoComponent
  ],
  imports: [
    BrowserModule,
    HighchartsChartModule,
    DataTablesModule,
    HttpClientModule,
    ReactiveFormsModule,
    QuillModule,
    GooglePlaceModule,
    NgxPrintModule,
    NgxDropzoneModule,
    TreeviewModule.forRoot(),
    ModalModule.forRoot(),
    AgmCoreModule.forRoot({
      apiKey: "",
      libraries: ["places"],
    }),
    RouterModule.forRoot(ROUTES, { useHash: false, scrollPositionRestoration: 'enabled' }),
    NgSelectModule,
    FormsModule
  ],
  providers: [
    ApiService,
    NgSelectConfig,
    DatePipe,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: LOCALE_ID,
      useValue: 'es-PE'
    }
  ],
  entryComponents: [ActionMenuComponent, ModalEditarOrdenComponent, ModalDocumentosComponent, ModalConformidadComponent, ModalDocumentosOrdenesComponent, ModalConformidadDocumentoComponent],
  exports: [ActionMenuComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}