import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ApiService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-conformidad-documento',
  templateUrl: './modal-conformidad-documento.component.html',
  styleUrls: ['./modal-conformidad-documento.component.css']
})
export class ModalConformidadDocumentoComponent {
  @Input() conformidad: any;
  @Output() onClose = new EventEmitter<void>();
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  selectedFile: File | null = null;
  uploading = false;
  uploadProgress = 0;

  constructor(
    public modalRef: BsModalRef,
    private api: ApiService
  ) {}

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      Swal.fire('Advertencia', 'El archivo excede los 10MB.', 'warning');
      this.fileInput.nativeElement.value = '';
      return;
    }
    this.selectedFile = file;
  }

  onRemoveSelected() {
    this.selectedFile = null;
    this.fileInput.nativeElement.value = '';
  }

  verDocumento() {
    if (!this.conformidad || !this.conformidad.cnf_anxfil) {
      Swal.fire('Aviso', 'No hay documento asociado.', 'info');
      return;
    }

    let ruta = this.conformidad.cnf_anxfil;
    ruta = ruta.replace('D:\\ADQUISICION', 'http://10.250.55.118/adquisicion').replace(/\\/g, '/');
    window.open(ruta, '_blank');
  }

  guardar() {
    if (!this.selectedFile) {
      Swal.fire('Info', 'Seleccione un archivo PDF.', 'info');
      return;
    }

    const form = new FormData();
    form.append('files', this.selectedFile);
    form.append('p_cnf_id', this.conformidad.cnf_id);

    this.uploading = true;
    this.api.getconformidaddocumentogra(form).subscribe({
      next: (res: any) => {
        this.uploading = false;
        if (res && res.success) {
          Swal.fire('Éxito', res.message || 'Documento anexado correctamente.', 'success');
          this.selectedFile = null;
          this.fileInput.nativeElement.value = '';
          this.modalRef.hide();
          this.onClose.emit();
        } else {
          Swal.fire('Error', res.message || 'No se pudo guardar el documento.', 'error');
        }
      },
      error: (err) => {
        this.uploading = false;
        console.error(err);
        Swal.fire('Error', 'Error al conectar con el servidor.', 'error');
      }
    });
  }

  anularDocumento() {
    Swal.fire({
      title: '¿Desea eliminar el documento?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((r) => {
      if (r.isConfirmed) {
        const payload = { p_cnf_id: this.conformidad.cnf_id };
        this.api.getconformidaddocumentoanu(payload).subscribe({
          next: (res: any) => {
            if (res && res[0].error === 0) {
              Swal.fire('Éxito', res[0].mensa || 'Documento eliminado.', 'success');
              this.conformidad.cnf_anxfil = null;
            } else {
              Swal.fire('Error', res[0].mensa || 'No se pudo eliminar el documento.', 'error');
            }
          },
          error: () => Swal.fire('Error', 'Error al conectar con el servidor.', 'error')
        });
      }
    });
  }

  cerrar() {
    this.modalRef.hide();
    this.onClose.emit();
  }
}
