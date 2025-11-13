
import { ActivatedRoute, Router } from '@angular/router';
import { Component,TemplateRef,OnInit,Input,ViewChild,HostListener} from "@angular/core";
import { CryptoService } from 'src/app/services/crypto.service';
import { AppComponent } from 'src/app/app.component';
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { ModalRegistroTramiteComponent } from 'src/app/components/modal-registro-tramite/modal-registro-tramite.component';
import { ApiService } from "src/app/services/api.service";
import { DataTableDirective } from "angular-datatables";
import { Subject } from "rxjs";
import { analyzeAndValidateNgModules } from "@angular/compiler";
import swal from "sweetalert2";
import * as XLSX from 'xlsx';
import { ModalConformidadComponent } from 'src/app/components/modal-conformidad/modal-conformidad.component';
import { ModalCustodiaComponent } from 'src/app/components/modal-custodia/modal-custodia.component';

interface PermisoBtn {
  bot_id: number;
  bot_descri: string;
  pus_activo: number | string;
}

@Component({
  selector: 'app-tramite',
  templateUrl: './tramite.component.html',
  styleUrls: ['./tramite.component.css']
})
export class TramiteComponent implements OnInit {
  private isXs(): boolean { return window.innerWidth < 768; }
  private permSet = new Set<number>();
  btnPerm = {
    nuevo: false,
    excel: false,
  };
  
  titulopant : string = "Trámite";
  icono : string = "pe-7s-next-2";
  loading: boolean = false;
  exportarHabilitado: boolean = false;
  modalRef?: BsModalRef;
  selectedTicket: any;
  btnnuevo:boolean=false;
  btnexcel:boolean=false;
  ObjetoMenu: any[] = [];
  jsn_permis: any[] = [];
  ruta: string = '';
  objid : number = 0 ;
  
  dataDetTramite:any;
  dataLibroCab:any;
  
  tra_id:string='0';
  lic_id:string='0';
  usu_id:string='0';
  lic_fecini:string='';
  lic_fecfin:string='';

  lic_numero:string='';
  lic_fecha:string='';
  fed_nomcom:string='';
  est_descri:string='';

  fileToUpload: File | null = null;
  selectedFileName: string = '';
  uploading: boolean = false;
  uploadResult: string = '';
  uploadSuccess: boolean = false;
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  isDtInitialized: boolean = false;
  rowSelected : any;
  dataanteriorseleccionada : any;
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: any = {
    destroy: false,
    retrieve: true,
    pagingType: 'full_numbers',
    pageLength: 10,
    dom: 'Bfrtip',
    buttons: ['excel'],
    select: true,
    autoWidth: false,
    searching: true,
    order: [[0, 'desc']],
    responsive: {
      details: {
        type: 'inline',
        target: 'tr'
      },
      breakpoints: [
        { name: 'xl', width: Infinity },
        { name: 'lg', width: 1400 },
        { name: 'md', width: 1200 },
        { name: 'sm', width: 992 },
        { name: 'xs', width: 768 }
      ]
    },
    columnDefs: [
      { targets: 0, width: '10%', responsivePriority: 1, className: 'text-center' },
      { targets: 1, width: '10%', responsivePriority: 2, className: 'text-center' },
      { targets: 2, width: '10%', responsivePriority: 3, className: 'text-center' },
      { targets: 3, width: '10%', responsivePriority: 4, className: 'text-center'},
      { targets: 4, width: '10%', responsivePriority: 5, className: 'text-center' },
      { targets: 5, width: '10%', responsivePriority: 6, className: 'text-center' },
      { targets: 6, width: '10%', responsivePriority: 7, className: 'text-center' },
      { targets: 7, width: '10%', responsivePriority: 8, className: 'text-center' },
      { targets: 8, width: '10%', responsivePriority: 9, className: 'text-center' },
    ],
    rowCallback: (row: Node, data: any[] | Object, index: number) => {
      const self = this;
      $("td", row).off("click");
      $("td", row).on("click", () => {
        this.rowSelected = data;
        if (this.rowSelected !== this.dataanteriorseleccionada) {
          this.dataanteriorseleccionada = this.rowSelected;
        } else {
          this.dataanteriorseleccionada = [];
        }
        const anular = document.getElementById('anular') as HTMLButtonElement | null;
        if (anular) {
          anular.disabled = false;
        }
      });
      return row;
    },
    language: {
      processing: "Procesando...",
      search: "Buscar:",
      lengthMenu: "Mostrar _MENU_ elementos",
      info: "Mostrando desde _START_ al _END_ de _TOTAL_ elementos",
      infoEmpty: "Mostrando ningún elemento.",
      infoFiltered: "(filtrado _MAX_ elementos total)",
      loadingRecords: "Cargando registros...",
      zeroRecords: "No se encontraron registros",
      emptyTable: "No hay datos disponibles en la tabla",
      select: {
        rows: {
          _: "%d filas seleccionadas",
          0: "Haga clic en una fila para seleccionarla",
          1: "Adquisición seleccionada",
        },
      },
      paginate: {
        first: "Primero",
        previous: "Anterior",
        next: "Siguiente",
        last: "Último",
      },
      aria: {
        sortAscending: ": Activar para ordenar la tabla en orden ascendente",
        sortDescending: ": Activar para ordenar la tabla en orden descendente",
      },
    },
  };
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private crypto: CryptoService,
    private app: AppComponent,
    private modalService: BsModalService,
    private api: ApiService,
  ) {
  }

  async ngOnInit() {
    try {
      this.usu_id = localStorage.getItem('usuario');
      const idEncriptado = this.route.snapshot.paramMap.get('id');
      if (!idEncriptado) {
        throw new Error('No se proporcionó un ID válido');
      }
      this.lic_id = await this.crypto.decrypt(idEncriptado);

      this.SetMesIniFin();
      this.loadLibroCabeceraSel();
      this.loadDataProceso();
      this.getObjetoMenu();
      this.ObtenerObjId();
      console.log(this.ObjetoMenu[0]);
      const onMobile = this.isXs();

    } catch (error) {
      swal.fire({
        title: 'Error',
        text: 'No se pudo procesar el ID del libro',
        icon: 'error',
        confirmButtonText: 'Volver'
      }).then(() => {
        this.router.navigate(['/libro']);
      });
    } finally {
      this.loading = false;
    }
  }

  loadTramiteData() {
    console.log('Cargando datos del trámite con lic_id:', this.lic_id);
  }

  ngOnDestroy(): void {
       this.dtTrigger.unsubscribe();
    }
  descargaExcel() {
    let btnExcel = document.querySelector('#tablaDataProceso .dt-buttons .dt-button.buttons-excel.buttons-html5') as HTMLButtonElement;
    btnExcel.click();
  }
  @HostListener('window:resize') onResize() { this.adjustDt(); }
  ngAfterViewInit() {
    this.dtTrigger.next();
    setTimeout(() => this.adjustDt(), 0);
  }
  private adjustDt() {
    if (!this.dtElement) return;
    this.dtElement.dtInstance.then((dt: any) => {
      dt.columns.adjust();
      if (dt.responsive.recalc) dt.responsive.recalc();
    });
  }
  CerrarModalProceso() {
    this.loadDataProceso();
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }
  getFechaFormateada(fecha: string): string {
    if (!fecha) return 'Sin fecha';
    const d = new Date(fecha);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    return `${dia}-${mes}-${anio}`;
  }

  loadDataProceso() {
    this.loading = true;
    const data_post = {
      p_lid_id: 0,
      p_lic_id: (this.lic_id == null || this.lic_id === '') ? 0 : parseInt(this.lic_id),
      p_usu_id: parseInt(this.usu_id),
      p_lid_permis: this.jsn_permis,
      p_lid_activo: 1,
    };
    this.api.getlibrodetlis(data_post).subscribe({
      next: (data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          this.dataDetTramite = data.map(item => ({
            ...item,
            bot_botons_parsed: this.safeParse(item.bot_botons)
          }));
          this.exportarHabilitado = true;
          this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.destroy();
            this.dtTrigger.next();
            setTimeout(() => {
              this.loading = false;
            }, 350);
          });
        } else {
          this.dataDetTramite = [];
          this.exportarHabilitado = false;
          this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.clear().draw();
            setTimeout(() => {
              this.loading = false;
            }, 200);
          });
        }
      },
      error: () => {
        this.loading = false;
        this.exportarHabilitado = false;
        swal.fire('Error', 'Ocurrió un error al cargar los datos', 'error');
        setTimeout(() => {
          this.loading = false;
        }, 300);
      }
    });
  }

  loadLibroCabeceraSel() {
    const data_post = {
      p_lic_id: (this.lic_id == null || this.lic_id === '') ? 0 : parseInt(this.lic_id),
    };
    this.api.getlibrocabsel(data_post).subscribe((data: any) => {
      this.dataLibroCab = data[0];
      this.lic_numero = this.dataLibroCab.lic_numero;
      this.lic_fecha = this.dataLibroCab.lic_fecemi;
      this.fed_nomcom = this.dataLibroCab.fed_nomcom;
      this.est_descri = this.dataLibroCab.esl_descri;
    });
  }
  ObtenerObjId() {
    this.ruta = this.router.url.replace(/^\/+/, '');
    console.log('Ruta actual:', this.ruta);
    
    const normaliza = (txt: string) => txt.toLowerCase().replace(/s$/, '');
    const rutaBase = normaliza(this.ruta.split('/')[0]);
    const match = this.ObjetoMenu.find(item =>
      item.obj_enlace && normaliza(item.obj_enlace) === rutaBase
    );

    console.log('Objeto de menú coincidente:', match);

    if (match) {
      this.objid = match.obj_id;

      // 🔹 Parsear jsn_permis y guardarlo como array en la clase
      try {
        this.jsn_permis = JSON.parse(match.jsn_permis || '[]');
      } catch {
        this.jsn_permis = [];
      }

      let permisos: PermisoBtn[] = Array.isArray(this.jsn_permis) ? this.jsn_permis : [];
      const ids = permisos
        .filter(p => Number(p.pus_activo) === 1)
        .map(p => Number(p.bot_id));

      this.permSet = new Set<number>(ids);
      this.btnPerm.nuevo = this.permSet.has(1);
      this.btnPerm.excel = this.permSet.has(5);

      console.log('Permisos activos:', [...this.permSet]);
      console.log('this.jsn_permis listo para enviar:', this.jsn_permis);
    } else {
      console.log('Ruta no encontrada en objetosMenu');
    }
  }

  private resetPermFlags() {
    Object.keys(this.btnPerm).forEach(k => (this.btnPerm as any)[k] = false);
  }
  hasPerm(botId: number): boolean {
    return this.permSet.has(botId);
  }
  getObjetoMenu() {
    const ObjetoMenu = localStorage.getItem('objetosMenu');
    this.ObjetoMenu = ObjetoMenu ? JSON.parse(ObjetoMenu) : [];
  }
  SetMesIniFin(){
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = (today.getMonth() + 1).toString().padStart(2, '0');
    const dd = today.getDate().toString().padStart(2, '0');
    this.lic_fecini = `${yyyy}-${mm}-01`;
    this.lic_fecfin = `${yyyy}-${mm}-${dd}`;
  }
  restrictNumeric(e) {
    let input;
    if (e.metaKey || e.ctrlKey) {
      return true;
    }
    if (e.which === 32) {
      return false;
    }
    if (e.which === 0) {
      return true;
    }
    if (e.which < 33) {
      return true;
    }
    input = String.fromCharCode(e.which);
    return !!/[\d\s]/.test(input);
  }
  safeParse(jsonStr: string): any[] {
    try {
      return JSON.parse(jsonStr || '[]');
    } catch (e) {
      console.error('Error al parsear bot_botons:', e);
      return [];
    }
  }
  
  async getIdButton(bot_id: number, item: any): Promise<void> {
    this.selectedTicket = item;
    switch(bot_id) {
      case 1:
        this.openModalNuevo();
        break;
      case 2:
        this.openModalEditar(item);
        break;
      case 3:
        this.openModalVer(item);
        break;
      case 4:
        this.Anular(item);
        break;
    }
  }

  openModalNuevo() {
    const modalRef = this.modalService.show(ModalRegistroTramiteComponent, {
      class: 'modal-lg modal-dialog-centered',
      backdrop: 'static',
      initialState: {
        data: {
          isEditMode: false,
          viewMode: false,
          lic_id: this.lic_id,
          usu_id: this.usu_id
        }
      }
    });

    const modal = modalRef.content as ModalRegistroTramiteComponent;
    modal.onGuardar.subscribe(() => this.loadDataProceso());
  }

  openModalEditar(item: any) {
    const modalRef = this.modalService.show(ModalRegistroTramiteComponent, {
      class: 'modal-lg modal-dialog-centered',
      backdrop: 'static',
      ignoreBackdropClick: true,
      keyboard: false,
      initialState: {
        tramite: item,
        isEditMode: true,
        viewMode: false,
        lic_id: this.lic_id,
        usu_id: this.usu_id
      }
    });

    modalRef.content.onGuardar.subscribe(() => this.loadDataProceso());
  }


  openModalVer(item: any) {
    const modalRef = this.modalService.show(ModalRegistroTramiteComponent, {
      class: 'modal-lg modal-dialog-centered',
      backdrop: 'static',
      ignoreBackdropClick: true,
      keyboard: false,
      initialState: {
        tramite: item,
        data: {
          isEditMode: false,
          viewMode: true,
          lic_id: this.lic_id,
          usu_id: this.usu_id
        }
      }
    });

    const modal = modalRef.content as ModalRegistroTramiteComponent;
  }

  Anular(item: any) {
    this.mostrarObservacionPrompt('', item);
  }

  private mostrarObservacionPrompt(valorInicial: string, item: any) {
    swal.fire({
      title: '<b>OBSERVACIÓN</b>',
      text: 'Ingrese el motivo o comentario de la anulación',
      input: 'textarea',
      inputValue: valorInicial,
      inputPlaceholder: 'Ej.: Anulación por error de registro',
      inputAttributes: { autocapitalize: 'off' },
      showCancelButton: true,
      confirmButtonText: 'CONTINUAR',
      cancelButtonText: 'CANCELAR',
      allowOutsideClick: false,
      allowEscapeKey: false,
      inputValidator: (value: string) => {
        if (!value || !String(value).trim()) {
          return 'La observación es obligatoria';
        }
        return undefined as any;
      }
    }).then((inputResult: any) => {
      if (!inputResult.isConfirmed) return;

      const observacion = String(inputResult.value || '').trim();

      swal.fire({
        title: 'Mensaje',
        html: '¿Seguro de <b>ANULAR REGISTRO</b>?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ACEPTAR',
        cancelButtonText: 'CANCELAR',
        allowOutsideClick: false,
        allowEscapeKey: false
      }).then((confirmRes: any) => {
        if (!confirmRes.isConfirmed) {
          // Reabrir el input con lo ya escrito
          this.mostrarObservacionPrompt(observacion, item);
          return;
        }

        // 🔹 Datos para backend
        const dataPost = {
          p_lid_id: parseInt(item.lid_id),
          p_lid_activo: 0, // 0 = anulado
          p_lid_observ: observacion,
          p_lid_usumov: parseInt(this.usu_id)
        };

        this.loading = true;
        this.api.getlibrodetanu(dataPost).subscribe({
          next: (data: any) => {
            this.loading = false;
            const row = Array.isArray(data) ? data[0] : data;
            const ok = row && row.error === 0;
            const mensa = row && row.mensa ? String(row.mensa).trim() : '';

            if (ok) {
              swal.fire({
                title: 'Éxito',
                html: mensa || 'Registro anulado correctamente.',
                icon: 'success',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Aceptar'
              }).then(() => {
                this.loadDataProceso(); // 🔄 Refrescar tabla
              });
            } else {
              swal.fire({
                title: 'Error',
                text: mensa || 'Ocurrió un error en la operación.',
                icon: 'error',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Aceptar'
              });
            }
          },
          error: (err) => {
            this.loading = false;
            console.error('❌ Error al anular:', err);
            swal.fire('Error', 'Ocurrió un problema al procesar la solicitud.', 'error');
          }
        });
      });
    });
  }
  openModalConformidad(item: any) {
    const modalRef = this.modalService.show(ModalConformidadComponent, {
      class: 'modal-lg modal-dialog-centered',
      backdrop: 'static',
      initialState: { tramite: item }
    });
    modalRef.content.cancelClicked.subscribe(() => this.loadDataProceso());
  }

  openModalCustodia(item: any) {
    const modalRef = this.modalService.show(ModalCustodiaComponent, {
      class: 'modal-lg modal-dialog-centered',
      backdrop: 'static',
      initialState: { tramite: item }
    });
    modalRef.content.cancelClicked.subscribe(() => this.loadDataProceso());
  }
}
