import { Component,TemplateRef,OnInit,Input,ViewChild,HostListener} from "@angular/core";
import { Router } from '@angular/router';
import { CryptoService } from 'src/app/services/crypto.service';
import { AppComponent } from 'src/app/app.component';
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { ApiService } from "src/app/services/api.service";
import { DataTableDirective } from "angular-datatables";
import { Subject } from "rxjs";
import { analyzeAndValidateNgModules } from "@angular/compiler";
import { ModalEditarOrdenComponent } from 'src/app/components/modal-editar-orden/modal-editar-orden.component';
import { ModalDocumentosComponent } from 'src/app/components/modal-documentos/modal-documentos.component';
import swal from "sweetalert2";
import * as XLSX from 'xlsx';

interface PermisoBtn {
  bot_id: number;
  bot_descri: string;
  pus_activo: number | string;
}

@Component({
  selector: 'app-ordenes',
  templateUrl: './ordenes.component.html',
  styleUrls: ['./ordenes.component.css']
})
export class OrdenesComponent implements OnInit {
  
  private isXs(): boolean { return window.innerWidth < 768; }

  private permSet = new Set<number>();

  btnPerm = {
    nuevo: false,
    excel: false,
  };

  titulopant : string = "Adquisiciones";
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

  //INICIO PARAMETROS
  dataAreaDenominacion:any;
  dataTipoBien:any;
  dataEstadoOrden:any;
  dataEstadoSiaf:any;
  dataOrden:any;

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
  //FIN DE PARAMETROS

  @ViewChild('OpenModalEditarTicket', { static: false }) OpenModalEditarTicket!: TemplateRef<any>;
  @ViewChild('OpenModalAnularTicket', { static: false }) OpenModalAnularTicket!: TemplateRef<any>;
  @ViewChild('OpenModalVerTicket', { static: false }) OpenModalVerTicket!: TemplateRef<any>;
  @ViewChild('OpenModalValidarTicket', { static: false }) OpenModalValidarTicket!: TemplateRef<any>;
  @ViewChild('OpenModalAsignarTicket', { static: false }) OpenModalAsignarTicket!: TemplateRef<any>;
  @ViewChild('OpenModalAtencionTicket', { static: false }) OpenModalAtencionTicket!: TemplateRef<any>;
  @ViewChild('OpenModalResponderTicket', { static: false }) OpenModalResponderTicket!: TemplateRef<any>;
  @ViewChild('OpenModalCerrarTicket', { static: false }) OpenModalCerrarTicket!: TemplateRef<any>;
  @ViewChild('OpenModalTrazabilidadTicket', { static: false }) OpenModalTrazabilidadTicket!: TemplateRef<any>;
  @ViewChild('OpenModalDerivarTicket', { static: false }) OpenModalDerivarTicket!: TemplateRef<any>;
  @ViewChild('ImportFileModal', { static: false }) ImportFileModal!: TemplateRef<any>;

  // Import file modal props
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
      { targets: 0, width: '4%', responsivePriority: 1, className: 'text-center' },
      { targets: 1, width: '5%', responsivePriority: 3, className: 'text-center' },
      { targets: 2, width: '6%', responsivePriority: 4, className: 'text-center' },
      { targets: 3, width: '17%', responsivePriority: 2 , className: 'text-left'},
      { targets: 4, width: '33%', responsivePriority: 5, className: 'text-justify' },
      { targets: 5, width: '5%', responsivePriority: 6, className: 'text-center' },
      { targets: 6, width: '15%', responsivePriority: 2, className: 'text-center' },
      { targets: 7, width: '6%', responsivePriority: 1, className: 'text-center' }
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
    private modalService: BsModalService,
    private api: ApiService,
    private appComponent: AppComponent,
    private crypto: CryptoService
  ) {
  }

  ngOnInit(): void {
    this.SetMesIniFin();
    this.usu_id = localStorage.getItem('usuario');
    this.loadDataProceso();
    this.loadAreaDenominacion();
    this.loadTipoBien();
    this.loadEstadoOrden();
    this.loadEstadoSiaf();
    this.getObjetoMenu();
    this.ObtenerObjId();
    console.log(this.ObjetoMenu[0]);
    
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

  loadDataProceso() {
    this.loading = true;

    const data_post = {
      p_ord_id: (this.ord_id == null || this.ord_id === '') ? 0 : parseInt(this.ord_id),
      p_ord_numero: (this.ord_numero == null || this.ord_numero === '') ? 0 : parseInt(this.ord_numero),
      p_ord_numruc: (this.ord_numruc == null || this.ord_numruc === '') ? '' : this.ord_numruc,
      p_tib_id: (this.tib_id == null || this.tib_id === '') ? 0 : parseInt(this.tib_id),
      p_eso_id: (this.eso_id == null || this.eso_id === '') ? 0 : parseInt(this.eso_id),
      p_ess_id: (this.ess_id == null || this.ess_id === '') ? 0 : parseInt(this.ess_id),
      p_ard_id: (this.ard_id == null || this.ard_id === '') ? 0 : parseInt(this.ard_id),
      p_ord_fecini: this.ord_fecini,
      p_ord_fecfin: this.ord_fecfin,
      p_usu_id: parseInt(this.usu_id) || 0,
      p_ord_permis: this.jsn_permis
    };

    this.api.getordenlis(data_post).subscribe({
      next: (data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          this.dataOrden = data.map(item => ({
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
          this.dataOrden = [];
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
        this.exportarHabilitado = false;
        swal.fire('Error', 'Ocurrió un error al cargar los datos', 'error');
        setTimeout(() => {
          this.loading = false;
        }, 300);
      }
    });
  }

  ObtenerObjId(){
    this.ruta = this.router.url.replace(/^\/+/, '');
    console.log('Ruta actual:', this.ruta);

    const match = this.ObjetoMenu.find(item => item.obj_enlace === this.ruta);
    console.log('Objeto de menú coincidente:', match);
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

      const ids = permisos.filter(p => Number(p.pus_activo) === 1).map(p => Number(p.bot_id));
      
      this.permSet = new Set<number>(ids);

      this.btnPerm.nuevo = this.permSet.has(1);
      this.btnPerm.excel = this.permSet.has(5);
      
      console.log('Permisos activos:', [...this.permSet]);
    } else {
      console.log('Ruta no encontrada en objetosMenu');
    }
  }

  private resetPermFlags() {
    Object.keys(this.btnPerm).forEach(k => (this.btnPerm as any)[k] = false);
  }

  // Helper opcional (por si quieres consultar en línea)
  hasPerm(botId: number): boolean {
    return this.permSet.has(botId);
  }

  getObjetoMenu() {
    const ObjetoMenu = localStorage.getItem('objetosMenu');
    this.ObjetoMenu = ObjetoMenu ? JSON.parse(ObjetoMenu) : [];
  }

  //FUNCIONES
  SetMesIniFin(){
    const today = new Date();

    const yyyy = today.getFullYear();
    const mm = (today.getMonth() + 1).toString().padStart(2, '0');
    const dd = today.getDate().toString().padStart(2, '0');

    this.ord_fecini = `${yyyy}-${mm}-01`;
    this.ord_fecfin = `${yyyy}-${mm}-${dd}`;
  }

  TicketIns() {
    //this.router.navigate(['/nuevo-ticket']);
  }
  
  TicketEdit(tkt_id: string) {
    //this.router.navigate(['/editar-ticket',tkt_id]); 
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

  loadTipoBien() {
    const data_post = {
      p_tib_id: 0,
      p_tib_activo: 1
    };

    this.api.gettipobiensel(data_post).subscribe((data: any) => {
      this.dataTipoBien = data;
    });
  }
  
  loadAreaDenominacion() {
    const data_post = {
      p_ard_id: 0,
      p_acl_id: 0,
      p_arj_id: 0,
      p_atd_id: 0,
      p_ard_activo: 1
    };

    this.api.getareadenominacionsel(data_post).subscribe((data: any) => {
      this.dataAreaDenominacion = data;
    });
  }
  
  loadEstadoOrden() {
    const data_post = {
      p_eso_id: 0,
      p_eso_activo: 1
    };

    this.api.getestadoordensel(data_post).subscribe((data: any) => {
      this.dataEstadoOrden = data;
    });
  }
  
  loadEstadoSiaf() {
    const data_post = {
      p_ess_id: 0,
      p_ess_activo: 1
    };

    this.api.getestadosiafsel(data_post).subscribe((data: any) => {
      this.dataEstadoSiaf = data;
    });
  }

  //PARSE BUTTONS ARRAY 
  safeParse(jsonStr: string): any[] {
    try {
      return JSON.parse(jsonStr || '[]');
    } catch (e) {
      console.error('Error al parsear bot_botons:', e);
      return [];
    }
  }

  getIdButton(bot_id: number, item: any) {
    console.log('Botón presionado:', bot_id, 'para ticket:', item.ord_id);
    this.selectedTicket = item;

    switch (bot_id) {
      case 1:
        this.modalRef = this.modalService.show(ModalEditarOrdenComponent, {
          class: 'modal-lg modal-dialog-centered',
          initialState: {
            orden: { ...item },
            modo: 'editar'
          }
        });
        this.modalRef.content.onClose.subscribe(() => this.loadDataProceso());
        break;
      case 2:
        this.modalRef = this.modalService.show(this.OpenModalEditarTicket);
        break;
      case 3:
        this.modalRef = this.modalService.show(this.OpenModalAnularTicket);
        break;
      case 4:
        this.modalRef = this.modalService.show(ModalEditarOrdenComponent, {
          class: 'modal-lg modal-dialog-centered',
          initialState: {
            orden: { ...item },
            modo: 'ver'
          }
        });
        break;
      case 6:
        this.modalRef = this.modalService.show(this.OpenModalAsignarTicket);
        break;
      case 7:
        this.modalRef = this.modalService.show(this.OpenModalAtencionTicket);
        break;
      case 8:
        this.modalRef = this.modalService.show(this.OpenModalResponderTicket);
        break;
      case 9:
        this.modalRef = this.modalService.show(this.OpenModalValidarTicket);
        break;
      case 10:
        this.modalRef = this.modalService.show(this.OpenModalCerrarTicket);
        break;
      case 11:
        this.modalRef = this.modalService.show(this.OpenModalTrazabilidadTicket);
        break;
      case 12:
        this.modalRef = this.modalService.show(this.OpenModalDerivarTicket);
        break;
      case 21:
        this.modalRef = this.modalService.show(ModalDocumentosComponent, {
          class: 'modal-xl modal-dialog-centered',
          initialState: {
            entrega: { ...item }
          }
        });
        this.modalRef.content.onClose.subscribe(() => this.loadDataProceso());
        break;
        case 18:
          if (item && item.ord_id != null) {
            (async () => {
              try {
                const token = await this.crypto.encrypt(String(item.ord_id));
                this.router.navigate(['/entregas', token]);
              } catch (err) {
                console.error('Error en cifrado:', err);
                swal.fire('Error', 'No se pudo cifrar el identificador. Intenta nuevamente.', 'error');
              }
            })();
          }
          break;
      default:
        console.warn('Botón no reconocido:', bot_id);
        break;
    }
  }

  openImportModal() {
    this.selectedFileName = '';
    this.fileToUpload = null;
    this.uploadResult = '';
    this.uploadSuccess = false;
    if (this.ImportFileModal) {
      this.modalRef = this.modalService.show(this.ImportFileModal, { class: 'modal-md modal-dialog-centered' });
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files && event.target.files.length > 0 ? event.target.files[0] : null;
    if (file) {
      this.fileToUpload = file;
      this.selectedFileName = file.name;
      this.uploadResult = '';
    } else {
      this.fileToUpload = null;
      this.selectedFileName = '';
    }
  }

  uploadFile() {
    if (!this.fileToUpload) {
      swal.fire('Advertencia', 'Seleccione un archivo Excel antes de subir.', 'warning');
      return;
    }

    const file = this.fileToUpload;
    const fileName = file.name.toLowerCase();

    if (!fileName.endsWith('.xls') && !fileName.endsWith('.xlsx')) {
      swal.fire('Error', 'Solo se permiten archivos Excel (.xls o .xlsx).', 'error');
      return;
    }

    this.uploading = true;
    this.uploadResult = '';

    const reader = new FileReader();

    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawData: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

        const requiredHeaders = [
          'fk_id_orden_tipo',
          'in_orden_anno',
          'in_orden_mes',
          'vc_orden_ruc',
          'vc_orden_periodo',
          'vc_orden_numero',
          'vc_orden_numero_siaf',
          'dt_orden_fecha',
          'dc_orden_monto',
          'vc_orden_proveedor',
          'vc_orden_descripcion',
          'moneda',
          'estado_orden',
          'estado_siaf'
        ];

        const firstRow = rawData[0] ? Object.keys(rawData[0]) : [];
        const missing = requiredHeaders.filter(h => !firstRow.includes(h));
        if (missing.length > 0) {
          this.uploading = false;
          swal.fire('Error en formato', `Faltan las siguientes cabeceras:\n${missing.join(', ')}`, 'error');
          return;
        }

        // ===== RECONSTRUCCIÓN UTF-8 FORZADA =====
        const cleanJson: any[] = [];
        for (const row of rawData) {
          const cleanRow: any = {};
          for (const key in row) {
            let value = row[key];
            if (typeof value === 'string') {
              try {
                // 1️⃣ eliminar caracteres invisibles
                value = value.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ');
                // 2️⃣ normalizar acentos
                value = value.normalize('NFC');
                // 3️⃣ reparar secuencias típicas
                value = value
                  .replace(/Ã¡/g, 'á').replace(/ÃÀ/g, 'Á')
                  .replace(/Ã©/g, 'é').replace(/Ã‰/g, 'É')
                  .replace(/Ãí/g, 'í').replace(/ÃÍ/g, 'Í')
                  .replace(/Ã³/g, 'ó').replace(/ÃÓ/g, 'Ó')
                  .replace(/Ãº/g, 'ú').replace(/ÃÚ/g, 'Ú')
                  .replace(/Ã±/g, 'ñ').replace(/Ã‘/g, 'Ñ')
                  .replace(/Ã /g, 'à').replace(/Ã€/g, 'À')
                  .replace(/Ã¨/g, 'è').replace(/ÃÊ/g, 'Ê')
                  .replace(/Â/g, '').replace(/�/g, '');
                // 4️⃣ fallback universal
                value = decodeURIComponent(escape(unescape(encodeURIComponent(value))));
              } catch {
                value = value;
              }
              value = value.trim();
            }
            cleanRow[key] = value;
          }
          cleanJson.push(cleanRow);
        }

        const payload = {
          p_imp_nomfil: file.name,
          p_imp_jsdata: JSON.stringify(cleanJson),
          p_imp_usureg: Number(localStorage.getItem('usuario') || 0)
        };

        this.api.getordenimp(payload).subscribe({
          next: (res: any) => {
            this.uploading = false;
            this.uploadSuccess = false;

            if (Array.isArray(res) && res.length > 0) {
              this.CerrarModalProceso();
              const item = res[0];
              const errorCode = (item && item.error != null) ? item.error : 0;
              const mensaje = (item && item.mensa)
                ? item.mensa.trim()
                : 'Archivo procesado correctamente.';

              if (errorCode === 0) {
                this.uploadSuccess = true;
                this.uploadResult = mensaje;
                swal.fire('Éxito', mensaje, 'success');
                this.loadDataProceso();
              } else {
                swal.fire('Error', mensaje, 'error');
              }
            } else {
              this.uploadResult = 'Respuesta inesperada del servidor.';
              swal.fire('Advertencia', this.uploadResult, 'warning');
            }
          },
          error: (err: any) => {
            console.error('Error subida:', err);
            this.uploading = false;
            this.uploadSuccess = false;

            let msg = 'Error al subir el archivo.';
            if (err && err.error && err.error.mensa) {
              msg = err.error.mensa;
            } else if (err && err.message) {
              msg = err.message;
            }

            swal.fire('Error', msg, 'error');
          }
        });

      } catch (ex) {
        this.uploading = false;
        swal.fire('Error', 'No se pudo leer el archivo Excel.', 'error');
      }
    };

    reader.readAsArrayBuffer(file);
  }

}