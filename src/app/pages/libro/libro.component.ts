import { Component,TemplateRef,OnInit,Input,ViewChild,HostListener} from "@angular/core";
import { Router } from '@angular/router';
import { CryptoService } from 'src/app/services/crypto.service';
import { AppComponent } from 'src/app/app.component';
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { ApiService } from "src/app/services/api.service";
import { DataTableDirective } from "angular-datatables";
import { Subject } from "rxjs";
import { analyzeAndValidateNgModules } from "@angular/compiler";
import swal from "sweetalert2";
import * as XLSX from 'xlsx';
interface PermisoBtn {
  bot_id: number;
  bot_descri: string;
  pus_activo: number | string;
}
@Component({
  selector: 'app-libro',
  templateUrl: './libro.component.html',
  styleUrls: ['./libro.component.css']
})
export class LibroComponent implements OnInit {
  private isXs(): boolean { return window.innerWidth < 768; }
  private permSet = new Set<number>();
  btnPerm = {
    nuevo: false,
    excel: false,
  };
  
  titulopant : string = "Libro";
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
  dataEstadoLibro:any;
  dataLibro:any;
  
  ord_id:string='0';
  ord_numero:string='';

  lic_id:string='0';
  usu_id:string='0';
  esl_id:string='0';
  lic_fecini:string='';
  lic_fecfin:string='';
  lic_activo:string='1';

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
      { targets: 1, width: '10%', responsivePriority: 3, className: 'text-center' },
      { targets: 2, width: '50%', responsivePriority: 4, className: 'text-center' },
      { targets: 3, width: '10%', responsivePriority: 2 , className: 'text-center'},
      { targets: 4, width: '10%', responsivePriority: 1, className: 'text-center' }
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
    private crypto: CryptoService,
    private app: AppComponent,
    private modalService: BsModalService,
    private api: ApiService,
  ) {
  }
  ngOnInit(): void {
    this.SetMesIniFin();
    this.usu_id = localStorage.getItem('usuario');
    this.loadestadolibrossel();
    this.loadDataProceso();
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
      p_lic_id: (this.lic_id == null || this.lic_id === '') ? 0 : parseInt(this.lic_id),
      p_usu_id: (this.usu_id == null || this.usu_id === '') ? 0 : parseInt(this.usu_id),
      p_esl_id: (this.esl_id == null || this.esl_id === '') ? 0 : parseInt(this.esl_id),
      p_lic_fecini: (this.lic_fecini == null || this.lic_fecini === '') ? '' : this.lic_fecini,
      p_lic_fecfin: (this.lic_fecfin == null || this.lic_fecfin === '') ? '' : this.lic_fecfin,
      p_lic_permis: this.jsn_permis,
      p_lic_activo: (this.lic_activo == null || this.lic_activo === '') ? 0 : parseInt(this.lic_activo),
    };
    this.api.getlibrocablis(data_post).subscribe({
      next: (data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          this.dataLibro = data.map(item => ({
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
          this.dataLibro = [];
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
  loadestadolibrossel() {
    const data_post = {
      p_esl_id: 0,
      p_esl_activo: 1
    };
    this.api.getestadolibrossel(data_post).subscribe((data: any) => {
      this.dataEstadoLibro = data;
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
    console.log('Botón presionado:', bot_id, 'para item:', item);
    this.selectedTicket = item;
    
    // Si es el botón de TRAMITES (bot_id = 1), navegar a la página de trámites
    if (bot_id === 1 && item && item.lic_id) {
      try {
        const idEncriptado = await this.crypto.encrypt(item.lic_id.toString());
        this.router.navigate(['/tramite', idEncriptado]);
      } catch (error) {
        console.error('Error al encriptar el ID:', error);
        swal.fire('Error', 'No se pudo procesar la solicitud', 'error');
      }
    }
  }
}
