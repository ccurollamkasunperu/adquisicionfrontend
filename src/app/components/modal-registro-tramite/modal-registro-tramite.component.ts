import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ApiService } from 'src/app/services/api.service';
import swal from 'sweetalert2';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-modal-registro-tramite',
  templateUrl: './modal-registro-tramite.component.html',
  styleUrls: ['./modal-registro-tramite.component.css']
})
export class ModalRegistroTramiteComponent implements OnInit {
  @Input() tramite: any;
  @Input() data: any;
  @Output() onGuardar = new EventEmitter<void>();

  // Estados y control
  isEditMode = false;
  viewMode = false;
  loading = false;
  bloquearCamposEdit = false;

  // Variables del formulario
  lic_id = '0';
  usu_id = '0';
  per_id = '0';
  tdi_id = '0';
  ard_id = '0';
  tra_id = 0;
  lid_id = '0';
  doc_id = '0';

  lid_fecemi = '';
  lid_numcop = '';
  lid_numexp = '';
  lid_numdoc = '';
  lid_apepat = '';
  lid_apemat = '';
  lid_nombre = '';
  lid_tramit = '';
  lid_docume = '';
  lid_observ = '';

  // Arrays para selects
  dataDocumentos: any[] = [];
  dataTramites: any[] = [];
  dataArea: any[] = [];
  dataTipoDoc: any[] = [];

  constructor(
    public modalRef: BsModalRef,
    private api: ApiService
  ) {
    this.lid_fecemi = this.getCurrentDate();
  }

  ngOnInit(): void {
    this.loadInitialData();
    if (this.data) {
      this.isEditMode = this.data.isEditMode || false;
      this.viewMode = this.data.viewMode || false;
      this.lic_id = this.data.lic_id || '0';
      this.usu_id = this.data.usu_id || '0';
    }
    if (this.tramite) {
      this.asignarDatos(this.tramite);
    }
    if (this.viewMode || this.isEditMode) {
      this.bloquearCamposEdit = true;
    }
  }

  asignarDatos(data: any): void {
    this.lid_id = data.lid_id || '0';
    this.lic_id = data.lic_id || '0';
    this.lid_fecemi = data.lid_fecemi || this.getCurrentDate();
    this.lid_numcop = data.lid_numcop || '1';
    this.lid_numexp = data.lid_numexp || '';
    this.lid_docume = data.lid_docume || '';
    this.lid_numdoc = data.per_numdoi || '';
    this.lid_apepat = data.pen_apepat || '';
    this.lid_apemat = data.pen_apemat || '';
    this.lid_nombre = data.pen_nombre || '';
    this.lid_tramit = data.lid_tramit || '';
    this.lid_observ = data.lid_observ || '';
    this.tdi_id = data.tdi_id || '0';
    this.doc_id = data.doc_id || '0';
    this.ard_id = data.ard_id || '0';
    this.tra_id = data.tra_id || 0;
  }

  bloquearCampos(): void {
    setTimeout(() => {
      const inputs = document.querySelectorAll('input, select, textarea, button, ng-select');
      inputs.forEach(el => {
        const element = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement;
        if (!element.classList.contains('btn-danger')) { // ❌ No bloquear el botón "Salir"
          element.disabled = true;
        }
      });
    }, 200);
  }

  onInputNumber(event: any, field: string) {
    const value = event.target.value.replace(/[^0-9]/g, '');
    (this as any)[field] = value;
  }

  onInputText(event: any, field: string) {
    const value = event.target.value.toUpperCase().trimStart();
    (this as any)[field] = value;
  }
  onKeyPress(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
  
  private getCurrentDate(): string {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  loadInitialData(): void {
    this.loading = true;

    forkJoin([
      this.api.getdocumentossel({ p_doc_id: 0, p_doc_activo: 1 }),
      this.api.gettramitesel({ p_tra_id: 0, p_tra_activo: 1 }),
      this.api.getareadenominacionsel({
        p_ard_id: 0,
        p_acl_id: 0,
        p_arj_id: 0,
        p_atd_id: 0,
        p_ard_activo: 1
      }),
      this.api.getmastertipodocidesel({ p_tdi_id: 0, p_tpe_id: 1 })
    ]).subscribe({
      next: (results: any[]) => {
        this.dataDocumentos = Array.isArray(results[0]) ? results[0] : (results[0] && results[0].data ? results[0].data : []);
        this.dataTramites   = Array.isArray(results[1]) ? results[1] : (results[1] && results[1].data ? results[1].data : []);
        this.dataArea       = Array.isArray(results[2]) ? results[2] : (results[2] && results[2].data ? results[2].data : []);
        this.dataTipoDoc    = Array.isArray(results[3]) ? results[3] : (results[3] && results[3].data ? results[3].data : []);
        
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar datos iniciales:', err);
        this.loading = false;
        swal.fire('Error', 'No se pudieron cargar los datos iniciales', 'error');
      }
    });
  }

  loadItemData(): void {
    const initialState = (this.modalRef as any).initialState || {};

    this.lid_id = initialState.lid_id || '0';
    this.lic_id = initialState.lic_id || this.lic_id;
    this.usu_id = initialState.usu_id || this.usu_id;
    this.ard_id = initialState.ard_id || this.ard_id;
    this.tdi_id = initialState.tdi_id || this.tdi_id;
    this.tra_id = initialState.tra_id || this.tra_id;
    this.doc_id = initialState.doc_id || this.doc_id;
    this.lid_fecemi = initialState.lid_fecemi || this.getCurrentDate();
    this.lid_numcop = initialState.lid_numcop || '';
    this.lid_numexp = initialState.lid_numexp || '';
    this.lid_docume = initialState.lid_docume || '';
    this.lid_apepat = initialState.pen_apepat || '';
    this.lid_apemat = initialState.pen_apemat || '';
    this.lid_nombre = initialState.pen_nombre || '';
    this.lid_numdoc = initialState.lid_numdoc || '';
    this.lid_tramit = initialState.lid_tramit || '';
    this.lid_observ = initialState.lid_observ || '';

    if (this.viewMode) {
      setTimeout(() => {
        const inputs = document.querySelectorAll('input, select, textarea, button');
        inputs.forEach(el => (el as HTMLInputElement).disabled = true);
      }, 200);
    }
  }
  
  shouldShowDetalleTramit(): boolean {
    const tramite = this.dataTramites.find(t => t.tra_id === this.tra_id);
    return tramite ? tramite.tra_chkotr === 1 : false;
  }

  guardarTramite(): void {
    if (this.shouldShowDetalleTramit() && !this.lid_tramit) {
      swal.fire('Advertencia', 'Debe ingresar el detalle del trámite', 'warning');
      return;
    }

    const jsn_admini = [{
      tdi_id: parseInt(this.tdi_id),
      tdi_numero: this.lid_numdoc,
      per_apepat: this.lid_apepat,
      per_apemat: this.lid_apemat,
      per_nombre: this.lid_nombre
    }];

    const data_post = {
      p_lid_id: parseInt(this.lid_id),
      p_lic_id: parseInt(this.lic_id),
      p_doc_id: parseInt(this.doc_id),
      p_tra_id: this.tra_id,
      p_ard_id: parseInt(this.ard_id),
      p_lid_fecemi: this.lid_fecemi,
      p_lid_numcop: parseInt(this.lid_numcop),
      p_lid_tramit: this.lid_tramit,
      p_lid_docume: this.lid_docume,
      p_lid_numexp: this.lid_numexp,
      p_lid_observ: this.lid_observ,
      p_jsn_admini: jsn_admini,
      p_lid_usumov: parseInt(this.usu_id)
    };

    this.loading = true;
    this.api.getlibrodetgra(data_post).subscribe({
      next: (res: any) => {
        this.loading = false;
        const result = Array.isArray(res) ? res[0] : res;
        if (result && result.error === 0) {
          swal.fire('Éxito', result.mensa || 'Registro guardado correctamente', 'success')
            .then(() => {
              this.onGuardar.emit();
              this.modalRef.hide();
            });
        } else {
          swal.fire('Error', (result && result.mensa) ? result.mensa : 'Ocurrió un error al guardar', 'error');
        }
      },
      error: (err) => {
        this.loading = false;
        swal.fire('Error', 'Ocurrió un error al guardar el registro', 'error');
      }
    });
  }

  cerrarModal(): void {
    this.modalRef.hide();
  }
}
