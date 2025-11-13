import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ApiService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-custodia',
  templateUrl: './modal-custodia.component.html',
  styleUrls: ['./modal-custodia.component.css']
})
export class ModalCustodiaComponent implements OnInit {
  @Input() tramite: any;
  @Input() data: any;
  @Output() cancelClicked = new EventEmitter<void>();

  titulopant = 'ARCHIVO DE CUSTODIA';
  lic_id = '0';
  lid_id = '0';
  usu_id = '0';

  isEditMode = false;
  viewMode = false;
  loading = false;
  uploading = false;

  showGuardararchivo = false;
  showArc = false;

  selectedFile: File | null = null;
  safeUrl: SafeResourceUrl | null = null;
  archivoUrl = '';

  constructor(
    private api: ApiService,
    private sanitizer: DomSanitizer,
    public modalRef: BsModalRef
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.isEditMode = this.data.isEditMode || false;
      this.viewMode = this.data.viewMode || false;
    }

    if (this.tramite) {
      this.lid_id = String(this.tramite.lid_id);
      this.lic_id = String(this.tramite.lic_id);
      this.usu_id = String(localStorage.getItem('usuario') || '0');
      const url = this.tramite.lid_doccus ? String(this.tramite.lid_doccus).trim() : '';

      if (!url) {
        this.showGuardararchivo = true;
      } else {
        this.showArc = true;
        this.verArchivo();
      }
    }

    if (this.viewMode) this.bloquearCampos();
  }

  bloquearCampos(): void {
    setTimeout(() => {
      const inputs = document.querySelectorAll('input, select, textarea, button');
      inputs.forEach(function (el) {
        var element = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement;
        if (!element.classList.contains('btn-danger')) element.disabled = true;
      });
    }, 200);
  }

  cerrarModal(): void {
    this.cancelClicked.emit();
    this.modalRef.hide();
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    this.selectedFile = files && files.length ? files[0] : null;
  }

  guardarArchivo() {
    if (!this.selectedFile) {
      Swal.fire('Archivo requerido', 'Selecciona un archivo PDF', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('p_lid_id', this.lid_id);
    formData.append('p_lic_id', this.lic_id);
    formData.append('p_lid_usumov', this.usu_id);
    formData.append('file', this.selectedFile!);

    Swal.fire({
      title: 'Confirmar',
      text: '¿Desea subir el archivo de custodia?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar'
    }).then(result => {
      if (!result.isConfirmed) return;

      this.uploading = true;
      this.api.getlibrodetcus(formData).subscribe({
        next: (res: any) => {
          this.uploading = false;
          const ok = res && res[0] && res[0].error === 0;
          Swal.fire(ok ? 'Éxito' : 'Error', res && res[0] ? res[0].mensa : '', ok ? 'success' : 'error')
            .then(() => { if (ok) this.cerrarModal(); });
        },
        error: () => {
          this.uploading = false;
          Swal.fire('Error', 'No se pudo subir el archivo', 'error');
        }
      });
    });
  }

  verArchivo() {
    const archivo = (this.tramite.lid_doccnf ? this.tramite.lid_doccnf : this.tramite.lid_doccus);
    if (!archivo) {
      console.warn('No hay archivo asociado al trámite.');
      return;
    }

    const data = {
      path: 'fedatario/' + this.lic_id + '/' + this.lid_id + '/' + archivo
    };

    this.loading = true;

    this.api.getfileurl(data).subscribe({
      next: (res: any) => {
        this.loading = false;

        if (res && res.error === false && res.url) {
          // ✅ Mostrar directamente el PDF en el iframe
          this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(res.url);
        } else {
          var mensaje = res && res.message ? res.message : 'No se pudo generar la URL del archivo';
          Swal.fire('Error', mensaje, 'error');
        }
      },
      error: (err) => {
        this.loading = false;
        Swal.fire('Error', 'Error al obtener el archivo: ' + err.message, 'error');
      }
    });
  }


  refrescarVista() {
    if (!this.tramite || !this.tramite.lid_doccus) return;
    this.safeUrl = null;
    this.verArchivo();
    Swal.fire('Refrescado', 'Vista actualizada correctamente', 'success');
  }

  anular() {
    Swal.fire({
      title: 'Motivo de anulación',
      input: 'textarea',
      inputPlaceholder: 'Escriba el motivo...',
      showCancelButton: true,
      confirmButtonText: 'Continuar'
    }).then(result => {
      if (!result.isConfirmed || !result.value || !String(result.value).trim()) return;
      const obs = String(result.value).trim();

      const data = {
        p_lid_id: this.lid_id,
        p_lid_activo: 0,
        p_lid_usumov: this.usu_id,
        p_lid_observ: obs
      };

      this.api.getlibrodetcusanu(data).subscribe({
        next: (r: any) => {
          const ok = r && r[0] && r[0].error === 0;
          Swal.fire(ok ? 'Éxito' : 'Error', r && r[0] ? r[0].mensa : '', ok ? 'success' : 'error')
            .then(() => { if (ok) this.cerrarModal(); });
        },
        error: () => Swal.fire('Error', 'No se pudo anular el archivo', 'error')
      });
    });
  }
}
