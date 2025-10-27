import { Component,TemplateRef,OnInit,Input,ViewChild,HostListener} from "@angular/core";
import { Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { ApiService } from "src/app/services/api.service";
import { DataTableDirective } from "angular-datatables";
import { Subject } from "rxjs";
import { analyzeAndValidateNgModules } from "@angular/compiler";
import swal from "sweetalert2";

interface PermisoBtn {
  bot_id: number;
  bot_descri: string;
  pus_activo: number | string;
}

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.css']
})

export class TicketComponent implements OnInit {
  
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
  dataOrden:any;
  dataEstado:any;
  dataPrioridad:any;
  dataTemaAyuda:any;

  tkt_id: string = '';
  tkt_numero: string = '';
  est_id: string = '0';
  tea_id: string = '0';
  pri_id: string = '0';
  equ_id: string = '';
  age_id: string = '';
  ori_id: string = '';
  sed_id: string = '';
  tkt_fecini:string='';
  tkt_fecfin:string='';
  tkt_activo: string = '';

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
      { targets: [0,1,3], responsivePriority: 1 },
      { targets: 2,  responsivePriority: 2, className: 'dt-col-asunto' },
      { targets: [4,5], responsivePriority: 1 },
      { targets: [6,7], responsivePriority: 4 },
      { targets: 8,  responsivePriority: 1 }
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
          1: "Ticket seleccionado",
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
    private appComponent: AppComponent
  ) {
  }

  ngOnInit(): void {
    this.SetMesIniFin();
    this.usu_id = localStorage.getItem('usuario');
    this.loadEstado();
    this.loadPrioridad();
    this.loadTemadeAyuda();
    this.getObjetoMenu();
    this.ObtenerObjId();
    this.loadDataProceso();
    console.log(this.ObjetoMenu[0]);
    
    const onMobile = this.isXs();

    this.dtOptions = {
      destroy: false,
      retrieve: true,
      pagingType: 'full_numbers',
      pageLength: 10,
      dom: 'Bfrtip',
      buttons: ['excel'],
      select: true,
      autoWidth: false,
      searching: true,
      responsive: onMobile ? false : {
        details: { type: 'inline', target: 'tr' },
        breakpoints: [
          { name: 'xl', width: Infinity },
          { name: 'lg', width: 1400 },
          { name: 'md', width: 1200 },
          { name: 'sm', width: 992 },
          { name: 'xs', width: 768 }
        ]
      },
      scrollX: false,
      columnDefs: [
        { targets: 8,  responsivePriority: 0 },     // ACCIONES (siempre visible)
        { targets: 0,  responsivePriority: 1 },     // Nº
        { targets: [4,5], responsivePriority: 2 },  // PRIORIDAD / ESTADO
        { targets: 2,  responsivePriority: 3, className: 'dt-col-asunto' }, // ASUNTO
        { targets: [1,3], responsivePriority: 4 },  // SOLICITADO / AGENTE
        { targets: [6,7], responsivePriority: 5 }   // FECHAS (se ocultan antes)
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
          1: "Ticket seleccionado",
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
      p_ord_numruc: (this.ord_numruc == null || this.ord_numruc === '') ? 0 : parseInt(this.ord_numruc),
      p_tib_id: (this.tib_id == null || this.tib_id === '') ? 0 : parseInt(this.tib_id),
      p_eso_id: (this.eso_id == null || this.eso_id === '') ? 0 : parseInt(this.eso_id),
      p_ess_id: (this.ess_id == null || this.ess_id === '') ? 0 : parseInt(this.ess_id),
      p_ard_id: (this.ard_id == null || this.ard_id === '') ? 0 : parseInt(this.ard_id),
      p_ord_fecini: (this.ord_fecini == null || this.ord_fecini === '') ? 0 : parseInt(this.ord_fecini),
      p_ord_fecfin: (this.ord_fecfin == null || this.ord_fecfin === '') ? 0 : parseInt(this.ord_fecfin),
      p_usu_id: (this.usu_id == null || this.usu_id === '') ? 0 : parseInt(this.usu_id),
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
          });
        } else {
          this.dataOrden = [];
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

    this.tkt_fecini = `${yyyy}-${mm}-01`;
    this.tkt_fecfin = `${yyyy}-${mm}-${dd}`;
  }

  TicketIns() {
    this.router.navigate(['/nuevo-ticket']);
  }
  
  TicketEdit(tkt_id: string) {
    this.router.navigate(['/editar-ticket',tkt_id]); 
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

  loadEstado() {
    const data_post = {
      p_est_id: 0,
      p_est_activo: 1
    };

    this.api.getestadossel(data_post).subscribe((data: any) => {
      this.dataEstado = data;
    });
  }
  
  loadPrioridad() {
    const data_post = {
      p_pri_id: 0,
      p_pri_activo: 1
    };

    this.api.getprioridadsel(data_post).subscribe((data: any) => {
      this.dataPrioridad = data;
    });
  }
  
  loadTemadeAyuda() {
    const data_post = {
      p_tea_id: 0,
      p_tea_idpadr: 0,
      p_tea_activo: 1
    };

    this.api.gettemaayudasel(data_post).subscribe((data: any) => {
      this.dataTemaAyuda = data;
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
    console.log('Botón presionado:', bot_id, 'para ticket:', item.tkt_numero);
    this.selectedTicket = item;

    switch (bot_id) {
      case 2:
        this.modalRef = this.modalService.show(this.OpenModalEditarTicket);
        break;
      case 3:
        this.modalRef = this.modalService.show(this.OpenModalAnularTicket);
        break;
      case 4:
        this.modalRef = this.modalService.show(this.OpenModalVerTicket,{ class: 'modal-xl modal-dialog-centered' });
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
      default:
        console.warn('Botón no reconocido:', bot_id);
        break;
    }
  }

}
