import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ApiService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';

interface ExistingFile {
  edo_id: number;
  edo_numdoc: string;
  edo_nomfil: string;
  edo_tamfil: number;
  edo_observ: string | null;
  edo_activo: number;
  tipo?: string;
  edo_url?: string;
  chk_botanu?: number;
  chk_botver?: number;
}

@Component({
  selector: 'app-modal-documentos-ordenes',
  templateUrl: './modal-documentos-ordenes.component.html',
  styleUrls: ['./modal-documentos-ordenes.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ModalDocumentosOrdenesComponent {
  @Input() orden: any;
  @Output() onClose = new EventEmitter<void>();

  ObjetoMenu: any[] = [];
  permisosDoc: any[] = [];
  pendingDeletes: ExistingFile[] = [];

  ordenNumero = '';
  fechaOrden = '';
  proveedor = '';

  selectedFile: File | null = null;
  existingFiles: ExistingFile[] = [];
  uploading = false;
  uploadProgress = 0;
  cargando = false;

  readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    public modalRef: BsModalRef,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.getObjetoMenu();
    this.obtenerPermisosDocumentos();

    if (this.orden) {
      this.ordenNumero = this.orden.ord_numero || '';
      this.fechaOrden = this.orden.ord_fecoco || '';
      this.proveedor = this.orden.prv_nomrso || '';
    }
  }

  getObjetoMenu(): void {
    const ObjetoMenu = localStorage.getItem('objetosMenu');
    this.ObjetoMenu = ObjetoMenu ? JSON.parse(ObjetoMenu) : [];
  }

  obtenerPermisosDocumentos(): void {
    const match = this.ObjetoMenu.find((item) => Number(item.obj_id) === 24);
    if (match && match.jsn_permis) {
      try {
        const parsed = typeof match.jsn_permis === 'string'
          ? JSON.parse(match.jsn_permis)
          : match.jsn_permis;
        this.permisosDoc = Array.isArray(parsed) ? parsed : [];
      } catch {
        this.permisosDoc = [];
      }
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > this.MAX_FILE_SIZE) {
      Swal.fire('Advertencia', `El archivo ${file.name} excede el tamaño máximo de 10MB.`, 'warning');
      this.fileInput.nativeElement.value = '';
      return;
    }

    this.selectedFile = file;
  }

  onRemoveSelected() {
    this.selectedFile = null;
    this.fileInput.nativeElement.value = '';
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async eliminarPendientes() {
    for (const f of this.pendingDeletes) {
      const payload = {
        p_edo_id: f.edo_id,
        p_edo_usureg: Number(localStorage.getItem('usuario') || 0)
      };
      try {
        await this.api.getentregadocumentosanu(payload).toPromise();
      } catch {}
    }
    this.pendingDeletes = [];
  }

  verDocumento() {
    if (!this.orden || !this.orden.ord_nomfil) {
      Swal.fire('Error', 'No se encontró el documento para visualizar.', 'error');
      return;
    }
    let ruta = this.orden.ord_nomfil;
    ruta = ruta
      .replace('D:\\ADQUISICION', 'http://10.250.55.118/adquisicion')
      .replace(/\\/g, '/');

    window.open(ruta, '_blank');
  }

  anularDocumento() {
    Swal.fire({
      title: '¿Desea anular este documento?',
      text: 'Esta acción eliminará el archivo asociado a la orden.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          p_ord_id: this.orden.ord_id,
          p_usu_id: Number(localStorage.getItem('usuario') || 0)
        };

        this.api.getordendocumentoanu(payload).subscribe({
          next: (res: any) => {
            if (res && res[0].error == 0) {
              Swal.fire('Éxito', res[0].mensa || 'Documento anulado correctamente.', 'success');
              this.orden.ord_nomfil = null;
            } else {
              Swal.fire('Error', (res && res[0].mensa) ? res[0].mensa : 'No se pudo anular el documento.', 'error');
            }
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'Ocurrió un error al intentar anular el documento.', 'error');
          }
        });
      }
    });
  }

  guardar() {
    if (!this.orden || !this.orden.ord_id) {
      Swal.fire('Error', 'No se ha identificado la orden.', 'error');
      return;
    }

    if (!this.selectedFile) {
      Swal.fire('Info', 'Debe seleccionar un archivo PDF.', 'info');
      return;
    }

    const form = new FormData();
    form.append('files', this.selectedFile);
    form.append('p_ord_id', this.orden.ord_id.toString());
    form.append('p_usu_id', localStorage.getItem('usuario') || '0');

    this.uploading = true;

    this.api.getordendocumentoreg(form).subscribe({
      next: (res: any) => {
        console.log('Respuesta final:', res);
        this.uploading = false;

        if (res && res.success) {
          Swal.fire('Éxito', res.message || 'Documento registrado correctamente.', 'success');
          this.orden.ord_nomfil = res.ruta;
          this.orden.ord_iddoc = (res.dato && res.dato.numid) ? res.dato.numid : 0;
          this.selectedFile = null;
          this.fileInput.nativeElement.value = '';
        } else {
          Swal.fire('Error', (res && res.message) ? res.message : 'No se pudo registrar el documento.', 'error');
        }
      },
      error: (err) => {
        console.error(err);
        this.uploading = false;
        Swal.fire('Error', 'Ocurrió un error al subir el documento.', 'error');
      }
    });
  }

  cerrar() {
    this.modalRef.hide();
    this.onClose.emit();
  }
}
