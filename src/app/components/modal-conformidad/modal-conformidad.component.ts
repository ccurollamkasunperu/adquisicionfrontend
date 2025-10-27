import { Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ApiService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-conformidad',
  templateUrl: './modal-conformidad.component.html',
  styleUrls: ['./modal-conformidad.component.css']
})

export class ModalConformidadComponent implements OnInit {
  @Input() entrega: any;
  @Output() onClose = new EventEmitter<void>();
  @ViewChild('inputEmision', { static: false }) inputEmision!: ElementRef;

  loading: boolean = false;
  cargado: boolean = false;
  bloquearCampos: boolean = true;

  showForm: boolean = true;
  modoEdicion: boolean = true;
  registroEditando: any = null;

  nuevoRegistro: any = {
    p_cnf_fecemi: '',
    p_cnf_monpre: 0,
    p_cnf_cumpre: 0,
    p_cnf_cumplz: 0,
    p_cnf_conent: 0,
    p_cnf_cuprau: 0,
    p_cnf_observ: ''
  };

  dataConformidad: any[] = [];
  permisos: any = null;

  constructor(
    public modalRef: BsModalRef,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.cargado = false;
    this.loadPermisos();
    this.loadConformidades();
  }

  loadPermisos() {
    try {
      const raw = localStorage.getItem('objetosMenu');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const permisoCnf = parsed.find(
            (p) =>
              p.obj_id === 23 ||
              (p.obj_descri && p.obj_descri.toUpperCase() === 'CONFORMIDAD')
          );
          if (permisoCnf) {
            permisoCnf.jsn_permis = permisoCnf.jsn_permis
              ? JSON.parse(permisoCnf.jsn_permis)
              : [];
            this.permisos = permisoCnf;
            console.log('✅ Permiso encontrado para CONFORMIDAD:', this.permisos);
          }
        }
      }
    } catch (e) {
      console.error('❌ Error al leer permisos:', e);
      this.permisos = null;
    }
  }

  loadConformidades() {
    this.loading = false;
    const payload = {
      p_cnf_id: 0,
      p_ent_id: this.entrega && this.entrega.ent_id ? this.entrega.ent_id : 0,
      p_usu_id: Number(localStorage.getItem('usuario') || 0),
      p_cnf_permis: this.permisos ? this.permisos.jsn_permis : []
    };

    this.api.getconformidadlis(payload).subscribe({
      next: (data: any[]) => {
        this.dataConformidad = Array.isArray(data) ? data : [];
        this.loading = false;
        this.cargado = true;
      },
      error: (err) => {
        console.error('Error en getconformidadlis:', err);
        this.loading = false;
        this.cargado = true;  
        Swal.fire('Error', 'No se pudieron cargar los registros de conformidad.', 'error');
      }
    });
  }

  tienePermiso(botId: number): boolean {
    if (!this.permisos || !this.permisos.jsn_permis) return false;
    return this.permisos.jsn_permis.some(
      (p: any) => p.bot_id === botId && Number(p.pus_activo) === 1
    );
  }

  abrirNuevo() {
    this.modoEdicion = false;
    this.showForm = true;
    this.bloquearCampos = false; // 🔓 oculta botón Nuevo
    this.nuevoRegistro = {
      p_cnf_fecemi: '',
      p_cnf_monpre: 0,
      p_cnf_cumpre: 0,
      p_cnf_cumplz: 0,
      p_cnf_conent: 0,
      p_cnf_cuprau: 0,
      p_cnf_observ: ''
    };
    setTimeout(() => {
      if (this.inputEmision) {
        this.inputEmision.nativeElement.focus();
      }
    }, 200);
  }

  cancelarNuevo() {
    this.bloquearCampos = true;
    this.nuevoRegistro = {
      p_cnf_fecemi: '',
      p_cnf_monpre: 0,
      p_cnf_cumpre: 0,
      p_cnf_cumplz: 0,
      p_cnf_conent: 0,
      p_cnf_cuprau: 0,
      p_cnf_observ: ''
    };
    this.modoEdicion = false;
    this.registroEditando = null;
    this.showForm = true;
  }


  verDocumento(c: any) {
    if (!c.url_documento) {
      Swal.fire('Aviso', 'El documento no tiene una URL asociada.', 'warning');
      return;
    }
    window.open(c.url_documento, '_blank');
  }

  onMontoInput(event: any) {
    const input = event.target;
    let valor = input.value.replace(/[^0-9.]/g, '');
    if (valor.startsWith('.')) valor = '0' + valor;

    const partes = valor.split('.');
    if (partes.length > 2)
      valor = partes[0] + '.' + partes.slice(1).join('');

    const entero = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    let decimal = partes[1] ? partes[1].substring(0, 2) : '';

    input.value = decimal !== '' ? `${entero}.${decimal}` : entero;
    this.nuevoRegistro.p_cnf_monpre = input.value;
  }

  onMontoBlur() {
    const num = parseFloat(
      (this.nuevoRegistro.p_cnf_monpre || '').replace(/,/g, '')
    );
    this.nuevoRegistro.p_cnf_monpre = isNaN(num)
      ? '0.00'
      : num.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
  }

  toggleCheckbox(event: any, field: string) {
    this.nuevoRegistro[field] = event.target.checked ? 1 : 0;
  }

  getMontoNumerico(): number {
    const limpio = (this.nuevoRegistro.p_cnf_monpre || '')
      .toString()
      .replace(/,/g, '');
    const num = parseFloat(limpio);
    return isNaN(num) ? 0 : num;
  }

  editarConformidad(c: any) {
    this.modoEdicion = true;
    this.showForm = true;
    this.bloquearCampos = false;
    this.registroEditando = c;
    this.nuevoRegistro = {
      p_cnf_fecemi: c.cnf_fecemi || '',
      p_cnf_monpre: c.cnf_monpre || 0,
      p_cnf_cumpre: c.chk_cumpre || 0,
      p_cnf_cumplz: c.chk_cumplz || 0,
      p_cnf_conent: c.chk_conent || 0,
      p_cnf_cuprau: c.chk_cuprau || 0,
      p_cnf_observ: c.cnf_observ || ''
    };
    setTimeout(() => {
      if (this.inputEmision) {
        this.inputEmision.nativeElement.focus();
      }
    }, 200);
  }

  guardarConformidad() {
    const monto = this.getMontoNumerico();
    const payload = {
      p_cnf_id: this.modoEdicion ? this.registroEditando.cnf_id : 0,
      p_ent_id: this.entrega.ent_id,
      p_cnf_fecemi: this.nuevoRegistro.p_cnf_fecemi || '',
      p_cnf_monpre: monto,
      p_cnf_cumpre: this.nuevoRegistro.p_cnf_cumpre ? 1 : 0,
      p_cnf_cumplz: this.nuevoRegistro.p_cnf_cumplz ? 1 : 0,
      p_cnf_conent: this.nuevoRegistro.p_cnf_conent ? 1 : 0,
      p_cnf_cuprau: this.nuevoRegistro.p_cnf_cuprau ? 1 : 0,
      p_cnf_observ: this.nuevoRegistro.p_cnf_observ || '',
      p_cnf_usureg: Number(localStorage.getItem('usuario') || 0)
    };

    Swal.fire({
      title: 'Mensaje',
      html: this.modoEdicion
        ? '¿Seguro de actualizar los cambios?'
        : '¿Seguro de guardar la nueva conformidad?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ACEPTAR',
      cancelButtonText: 'CANCELAR'
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.getconformidadgra(payload).subscribe({
          next: (resp: any) => {
            const data = (resp && resp.data) ? resp.data : [];
            if (Array.isArray(data) && data.length > 0 && data[0].error === 0) {
              Swal.fire('Éxito', data[0].mensa || 'Registro exitoso.', 'success');
              this.bloquearCampos = true;
              this.showForm = true;
              this.modoEdicion = true;
              this.nuevoRegistro = {
                p_cnf_fecemi: '',
                p_cnf_monpre: 0,
                p_cnf_cumpre: 0,
                p_cnf_cumplz: 0,
                p_cnf_conent: 0,
                p_cnf_cuprau: 0,
                p_cnf_observ: ''
              };
              this.loadConformidades();
            } else {
              Swal.fire('Error', data[0].mensa, 'error');
            }
          },
          error: () => {
            Swal.fire('Error', 'No se pudo conectar con el servidor.', 'error');
          }
        });
      }
    });
  }
  
  eliminarConformidad(c: any) {
    Swal.fire({
      title: '¿Eliminar?',
      text: `¿Desea eliminar el registro de conformidad?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((r) => {
      if (r.isConfirmed) {
        Swal.fire('Eliminado', 'Registro eliminado correctamente.', 'success');
      }
    });
  }

  cerrar() {
    this.modalRef.hide();
    this.onClose.emit();
  }
}