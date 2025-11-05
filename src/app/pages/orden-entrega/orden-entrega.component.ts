import { Component,TemplateRef,OnInit,Input,ViewChild,HostListener} from "@angular/core";
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CryptoService } from 'src/app/services/crypto.service';
import { AppComponent } from 'src/app/app.component';
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { ApiService } from "src/app/services/api.service";
import { ModalDocumentosComponent } from 'src/app/components/modal-documentos/modal-documentos.component';
import { DataTableDirective } from "angular-datatables";
import { Subject } from "rxjs";
import { analyzeAndValidateNgModules } from "@angular/compiler";
import swal from "sweetalert2";
import { error } from "util";
import { ModalConformidadComponent } from "src/app/components/modal-conformidad/modal-conformidad.component";
interface PermisoBtn {
  bot_id: number;
  bot_descri: string;
  pus_activo: number | string;
}
@Component({
  selector: 'app-orden-entrega',
  templateUrl: './orden-entrega.component.html',
  styleUrls: ['./orden-entrega.component.css']
})
export class OrdenEntregaComponent implements OnInit {
    private isXs(): boolean { return window.innerWidth < 768; }
    private permSet = new Set<number>();
    btnPerm = {
      nuevo: false,
      excel: false,
    };
    titulopant : string = "ENTREGAS";
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
    dataAreaDenominacion:any;
    dataTipoBien:any;
    dataEstadoOrden:any;
    dataEstadoSiaf:any;
    dataOrdenEntrega:any;
    dataOrden:any;
    dataEntrega:any;
    dataEstado:any;
    dataPrioridad:any;
    dataTemaAyuda:any;
    dataTipoBienControl:any;
    entregaEdit:any = {};
    modalMode: string = 'editar';
    est_id: string = '0';
    tea_id: string = '0';
    pri_id: string = '0';
    equ_id: string = '';
    age_id: string = '';
    ori_id: string = '';
    sed_id: string = '';
    ord_id:string='0';
    ord_numero:string='';
    ord_numruc:string='';
    tib_id:string='0';
    eso_id:string='0';
    ess_id:string='0';
    ard_id:string='0';
    ord_fecini:string='';
    ord_fecfin:string='';
    usu_id:string='';
    ord_permis:string='';
    @ViewChild(DataTableDirective, { static: false })
    dtElement: DataTableDirective;
    isDtInitialized: boolean = false;
    @ViewChild('EditEntregaModal', { static: false })
    EditEntregaModal: TemplateRef<any>;
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
      ordering: false,
      order: [[0, 'asc'], [1, 'asc']],
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
        { targets: 0, width: '5%', responsivePriority: 1, className: 'text-center', orderable: false },
        { targets: 1, width: '10%', responsivePriority: 1, className: 'text-center', orderable: false },
        { targets: 2, width: '10%', responsivePriority: 3, className: 'text-center', orderable: false },
        { targets: 3, width: '10%', responsivePriority: 4, className: 'text-center', orderable: false },
        { targets: 4, width: '10%', responsivePriority: 2 , className: 'text-center', orderable: false },
        { targets: 5, width: '10%', responsivePriority: 5, className: 'text-center', orderable: false },
        { targets: 6, width: '10%', responsivePriority: 6, className: 'text-center', orderable: false }
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
            1: "Entrega seleccionada",
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
      private modalService: BsModalService,
      private api: ApiService,
      private appComponent: AppComponent,
      private crypto: CryptoService,
      private location: Location
    ) {
    }
    ngOnInit(): void {
      this.SetMesIniFin();
      this.usu_id = localStorage.getItem('usuario');
      const idParam = this.route.snapshot.paramMap.get('id');
      this.getObjetoMenu();
      this.ObtenerObjId();
      if (idParam) {
        if (/^[0-9]+$/.test(idParam)) {
          this.ord_id = idParam;
          this.loadDataProceso();
        } else {
          (async () => {
            try {
              const decrypted = await this.crypto.decrypt(idParam);
              this.ord_id = decrypted;
            } catch (err) {
              console.warn('No se pudo descifrar id, se usará tal cual:', err);
              this.ord_id = idParam;
            }
            const ordIdNum = Number(this.ord_id);
            if (Number.isInteger(ordIdNum) && ordIdNum !== 0) {
              this.loadordensel();
              this.loadDataProceso();
            } else {
              await swal.fire('Error', 'No se obtuvo información con dicha orden', 'error');
              this.location.back();
            }
          })();
        }
      } else {
        this.loadDataProceso();
      }
      const onMobile = this.isXs();
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
    loadordensel() {
      const data_post = {
        p_ord_id: (this.ord_id == null || this.ord_id === '') ? 0 : parseInt(this.ord_id)
      };
      this.api.getordensel(data_post).subscribe((data: any) => {
        this.dataOrden = data[0];
      });
    }
    loadDataProceso() {
      this.loading = true;
      const data_post = {
        p_ent_id: 0,
        p_ord_id: (this.ord_id == null || this.ord_id === '') ? 0 : parseInt(this.ord_id),
        p_tbc_id: 0,
        p_eor_id: 0,
        p_usu_id: parseInt(localStorage.getItem('usuario')),
        p_ent_fecrei: '',
        p_ent_fecref: '',
        p_ent_permis: this.jsn_permis,
        p_ent_activo: 1
      };
      this.api.getentregalis(data_post).subscribe({
        next: (data: any[]) => {
          if (Array.isArray(data) && data.length > 0) {
            this.dataEntrega = data.map(item => ({
              ...item,
              bot_botons_parsed: this.safeParse(item.bot_botons)
            }));
            this.exportarHabilitado = true;
            this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
              dtInstance.destroy();
              this.dtTrigger.next();
            });
          } else {
            this.dataEntrega = [];
            this.exportarHabilitado = false;
            this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
              dtInstance.clear().draw();
            });
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.exportarHabilitado = false;
          swal.fire('Error', 'Ocurrió un error al cargar los datos', 'error');
        }
      });
    }
    ObtenerObjId() {
      this.ruta = this.router.url.replace(/^\/+/, '');
      const partes = this.router.url.split('/');
      const rutaBase = (partes.length > 0 ? partes[0].replace(/^\/+/, '').trim() : '') || (partes.length > 1 ? partes[1].trim() : '');
      const match = this.ObjetoMenu.find(item => item.obj_enlace === rutaBase);
      if (match) {
        this.objid = match.obj_id;
        this.jsn_permis = match.jsn_permis;
        let permisos: PermisoBtn[] = [];
        const raw = match.jsn_permis;
        try {
          const parsed = (typeof raw === 'string') ? JSON.parse(raw) : raw;
          permisos = Array.isArray(parsed) ? parsed : [];
        } catch {
          permisos = [];
        }
        const ids = permisos
          .filter(p => Number(p.pus_activo) === 1)
          .map(p => Number(p.bot_id));
        this.permSet = new Set<number>(ids);
        this.btnPerm.nuevo = this.permSet.has(1);
        this.btnPerm.excel = this.permSet.has(5);
      } else {
        console.warn('⚠️ No se encontró coincidencia para la ruta:', rutaBase);
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
      this.ord_fecfin = `${yyyy}-${mm}-${dd}`;
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
    getIdButton(bot_id: number, item: any) {
      this.selectedTicket = item;
      switch (bot_id) {
        case 4:
          this.openViewModal(item);
          break;
        case 21:
            this.modalRef = this.modalService.show(ModalDocumentosComponent, {
              class: 'modal-xl modal-dialog-centered',
              backdrop: 'static',
              ignoreBackdropClick: true,
              initialState: {
                entrega: { ...item },
                permisos: this.jsn_permis
              }
            });
            const modalInstancia = this.modalRef.content as ModalDocumentosComponent;
            modalInstancia.onClose.subscribe(() => {
              this.loadDataProceso();
            });
            setTimeout(() => (this.loading = false), 300);
          break;
        case 19:
          this.loading = true;
          const entrega = { ...item };
          setTimeout(() => {
            this.modalRef = this.modalService.show(ModalConformidadComponent, {
              class: 'modal-xl modal-dialog-centered',
              backdrop: 'static',
              ignoreBackdropClick: true,
              initialState: {
                entrega,
                permisos: this.jsn_permis
              }
            });
            const modalInstancia = this.modalRef.content as ModalConformidadComponent;
            modalInstancia.onClose.subscribe(() => {
              this.loadDataProceso();
            });
            setTimeout(() => (this.loading = false), 300);
          }, 200);
          break;
        default:
          console.warn('Botón no reconocido:', bot_id);
          break;
      }
    }
    openEditModal(item: any) {
      this.modalMode = 'editar';
      this.entregaEdit = { ...item };
      this.loadControles();
      this.modalRef = this.modalService.show(this.EditEntregaModal, { 
        class: 'modal-lg modal-dialog-centered' 
      });
    }
    openViewModal(item: any) {
      this.modalMode = 'ver';
      this.entregaEdit = { ...item };
      this.modalRef = this.modalService.show(this.EditEntregaModal, { 
        class: 'modal-lg modal-dialog-centered' 
      });
    }
    loadControles() {
      const data_post = {
        p_tbc_id: 0,
        p_tib_id: this.entregaEdit.tib_id ? parseInt(this.entregaEdit.tib_id) : 0
      };
      this.api.gettipobiencontrolsel(data_post).subscribe((data: any) => {
        this.dataTipoBienControl = data;
      });
    }
    getFechaFormateada(fecha: string): string {
      if (!fecha) return 'Sin fecha';
      const d = new Date(fecha);
      const dia = String(d.getDate()).padStart(2, '0');
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const anio = d.getFullYear();
      return `${dia}-${mes}-${anio}`;
    }
    grabarEntrega() {
      if (!this.entregaEdit.ent_fecent || !this.entregaEdit.ent_fecrec) {
        swal.fire({
          title: 'Campos requeridos',
          html: 'Complete los campos de fecha antes de continuar.',
          icon: 'warning',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Aceptar'
        });
        return;
      }
      const dataPost = {
        p_ent_id: this.entregaEdit.ent_id ? parseInt(this.entregaEdit.ent_id) : 0,
        p_ord_id: this.entregaEdit.ord_id ? parseInt(this.entregaEdit.ord_id) : 0,
        p_tbc_id: this.entregaEdit.tbc_id ? parseInt(this.entregaEdit.tbc_id) : 0,
        p_eor_id: this.entregaEdit.eor_id ? parseInt(this.entregaEdit.eor_id) : 0,
        p_ent_fecent: this.entregaEdit.ent_fecent || '',
        p_ent_fecrec: this.entregaEdit.ent_fecrec || '',
        p_ent_observ: this.entregaEdit.ent_observ || '',
        p_ent_usureg: parseInt(localStorage.getItem('usuario') || '0')
      };
      swal.fire({
        title: 'Mensaje',
        html: '¿Seguro de guardar los cambios?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ACEPTAR',
        cancelButtonText: 'CANCELAR'
      }).then((result) => {
        if (result.isConfirmed) {
          this.api.getentregagra(dataPost).subscribe({
            next: (data: any) => {
              if (Array.isArray(data) && data.length > 0 && data[0].error === 0) {
                swal.fire({
                  title: 'Éxito',
                  html: data[0].mensa,
                  icon: 'success',
                  confirmButtonColor: '#3085d6',
                  confirmButtonText: 'Aceptar'
                }).then((res) => {
                  if (res.value) {
                    setTimeout(() => {
                      if (this.modalRef) {
                        this.modalRef.hide();
                      }
                      this.loadDataProceso();
                    }, 300);
                  }
                });
              } else {
                swal.fire({
                  title: 'Error',
                  text: data && data[0] && data[0].mensa ? data[0].mensa.trim() : 'Ocurrió un error al guardar.',
                  icon: 'error',
                  confirmButtonColor: '#3085d6',
                  confirmButtonText: 'Aceptar'
                });
              }
            },
            error: () => {
              swal.fire({
                title: 'Error',
                text: 'No se pudo conectar con el servidor.',
                icon: 'error',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Aceptar'
              });
            }
          });
        }
      });
    }
}