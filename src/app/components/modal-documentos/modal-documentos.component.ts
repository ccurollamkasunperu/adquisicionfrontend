import { Component, Input, OnInit, Output, EventEmitter, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ApiService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';
import { BsModalService } from 'ngx-bootstrap/modal';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgxDropzoneComponent } from 'ngx-dropzone';
import { HttpEventType } from '@angular/common/http';

interface ExistingFile {
  edo_id: number;
  ent_id: number;
  etd_id: number;
  edo_nomfil: string;
  edo_fecdoc: string | null;
  edo_numdoc: string | null;
  edo_observ: string | null;
  edo_activo: number;
  tipo?: string;
  edo_url?: string;
  chk_botanu?: number;
  chk_botver?: number;
}
@Component({
  selector: 'app-modal-documentos',
  templateUrl: './modal-documentos.component.html',
  styleUrls: ['./modal-documentos.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class ModalDocumentosComponent implements OnInit {
  @Input() entrega: any;
  @Input() permisos: any[] = [];
  @Output() onClose = new EventEmitter<void>();
  ObjetoMenu: any[] = [];
  objActual: any = null;
  objId: number = 0;
  permisosDoc: any[] = [];
  pendingDeletes: ExistingFile[] = [];
  entregable: string = '';
  fechaEntrega: string = '';
  descripcionControl: string = '';
  existingFiles: ExistingFile[] = [];
  files: File[] = [];
  MAX_FILES = 10;
  uploading: boolean = false;
  uploadProgress: number = 0;
  previewName = '';
  previewSrc: SafeResourceUrl | string = '';
  isPdf = false;
  isDirectUrl = false;
  modalRefPreview: BsModalRef | null = null;
  private readonly baseUrl = 'http://10.250.55.211/ticketsbackend/public/api';
  @ViewChild('previewTpl', { static: false }) previewTpl: TemplateRef<any> | undefined;
  @ViewChild(NgxDropzoneComponent, { static: false }) dz!: NgxDropzoneComponent;
  constructor(
    public modalRef: BsModalRef,
    private api: ApiService,
    private modalService: BsModalService,
    private sanitizer: DomSanitizer
  ) {}
  ngOnInit(): void {
    this.getObjetoMenu();
    this.obtenerPermisosDocumentos();
    if (this.entrega) {
      this.entregable = this.entrega.eor_descri || '';
      this.fechaEntrega = this.entrega.ent_fecent || '';
      this.descripcionControl = (this.entrega && this.entrega.tbc_descri && this.entrega.tbc_descri.trim() !== '')
        ? this.entrega.tbc_descri
        : 'SIN RESPUESTA';
    }
    this.loadExistingFiles();
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
      } catch (e) {
        this.permisosDoc = [];
      }
    } else {
    }
  }
  obtenerObjId(): void {
    const match = this.ObjetoMenu.find(item => item.obj_enlace === 'reporte-adquisicion');
    if (match) {
      this.objActual = match;
      this.objId = match.obj_id;
    } else {
    }
  }
  loadExistingFiles() {
    const payload = {
      p_edo_id: 0,
      p_ent_id: this.entrega ? this.entrega.ent_id : 0,
      p_etd_id: 0,
      p_usu_id: Number(localStorage.getItem('usuario') || 0),
      p_ent_permis: this.permisosDoc || [],
      p_edo_activo: 1
    };
    this.api.getentregadocumentoslis(payload).subscribe({
      next: (data: any[]) => {
        this.existingFiles = data.map((d: any) => ({
          ...d,
          chk_botanu: Number(d.chk_botanu),
          chk_botver: Number(d.chk_botver),
          tipo: (d.edo_nomfil || '').toLowerCase().endsWith('.pdf')
            ? 'application/pdf'
            : 'image/*',
          edo_url: d.edo_nomfil
            ? d.edo_nomfil
                .replace('D:\\ADQUISICION', 'http://10.250.55.118/adquisicionbackend/public/files')
                .replace('D:/ADQUISICION', 'http://10.250.55.118/adquisicionbackend/public/files')
                .replace(/\\/g, '/')
            : ''
        }));
      },
      error: (err) => {
        Swal.fire('Error', 'No se pudieron cargar los documentos existentes.', 'error');
      }
    });
  }
  get totalFiles(): number {
    const existingCount = (this.existingFiles && this.existingFiles.length) ? this.existingFiles.length : 0;
    const newCount = (this.files && this.files.length) ? this.files.length : 0;
    return existingCount + newCount;
  }
  onSelect(event: any) {
    const added: File[] = event.addedFiles || [];
    for (const f of added) {
      if (this.totalFiles >= this.MAX_FILES) {
        Swal.fire('Límite', `No puede agregar más de ${this.MAX_FILES} archivos.`, 'warning');
        break;
      }
      if (f.size > 10 * 1024 * 1024) {
        Swal.fire('Error', f.name + ' supera el tamaño máximo de 10 MB.', 'error');
        continue;
      }
      const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (f.type && allowed.indexOf(f.type) === -1) {
        Swal.fire('Error', f.name + ' no es un tipo permitido.', 'error');
        continue;
      }
      const nombreLower = f.name.trim().toLowerCase();
      const existe =
        (this.existingFiles && this.existingFiles.some(x => 
          x.edo_numdoc && x.edo_numdoc.trim().toLowerCase() === nombreLower
        )) ||
        (this.files && this.files.some(x => 
          x.name && x.name.trim().toLowerCase() === nombreLower
        ));
      if (existe) {
        Swal.fire({
          title: 'Archivo duplicado',
          text: 'Ya existe un archivo con el nombre "' + f.name + '". ¿Desea registrarlo de todas formas?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, registrar',
          cancelButtonText: 'No, cancelar'
        }).then(res => {
          if (res.isConfirmed) {
            try {
              (f as any).objectURL = URL.createObjectURL(f);
            } catch (e) {}
            this.files.push(f);
          } else {
          }
        });
        continue;
      }
      try {
        (f as any).objectURL = URL.createObjectURL(f);
      } catch (e) {}
      this.files.push(f);
    }
  }
  onRemove(f: File) {
    this.files = this.files.filter(x => x !== f);
    try { URL.revokeObjectURL((f as any).objectURL); } catch {}
  }
  onRemoveExisting(f: any) {
    if (!f.chk_botanu || Number(f.chk_botanu) !== 1) {
      Swal.fire('Permiso denegado', 'No tiene permiso para eliminar este archivo.', 'warning');
      return;
    }
    Swal.fire({
      title: '¿Quitar archivo?',
      text: `${f.edo_numdoc || f.edo_nomfil} (se eliminará al guardar los cambios)`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, quitar',
      cancelButtonText: 'Cancelar'
    }).then(res => {
      if (res.isConfirmed) {
        this.existingFiles = this.existingFiles.filter(x => x.edo_id !== f.edo_id);
        this.pendingDeletes.push(f);
        Swal.fire('Marcado para eliminar', `${f.edo_numdoc || f.edo_nomfil} será eliminado al guardar.`, 'info');
      }
    });
  }
  verArchivoExisting(f: ExistingFile) {
    if (!f.edo_nomfil) {
      Swal.fire('Error', 'No se encontró la ruta del archivo.', 'error');
      return;
    }
    const isLarge = f.hasOwnProperty('edo_tamfil') && Number(f['edo_tamfil']) > 5 * 1024 * 1024;
    if (f.hasOwnProperty('edo_url') && f['edo_url'] && isLarge) {
      window.open(f['edo_url'], '_blank');
      return;
    }
    Swal.fire({
      title: 'Cargando archivo',
      text: 'Por favor espere...',
      allowOutsideClick: false,
      showConfirmButton: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
    this.api.getFile({ file_path: f.edo_nomfil }).subscribe({
      next: (response: any) => {
        Swal.close();
        const res = response.body;
        try {
          const parsed = JSON.parse(res);
          if (parsed.success) {
            if (parsed.isLargeFile && parsed.url) {
              window.open(parsed.url, '_blank');
              return;
            }
            if (parsed.data && parsed.data.content) {
              const mime = parsed.data.mime_type || 'application/pdf';
              const byteArray = Uint8Array.from(atob(parsed.data.content), c => c.charCodeAt(0));
              const blob = new Blob([byteArray], { type: mime });
              const blobUrl = URL.createObjectURL(blob);
              if (blob.size > 5 * 1024 * 1024) {
                window.open(blobUrl, '_blank');
              } else {
                this.openPreview(parsed.data.file_name, mime, blobUrl, true);
              }
              return;
            }
          }
        } catch (e) {
          const blob = new Blob([res], { type: 'application/pdf' });
          const blobUrl = URL.createObjectURL(blob);
          if (isLarge || blob.size > 5 * 1024 * 1024) {
            window.open(blobUrl, '_blank');
          } else {
            this.openPreview(f.edo_nomfil, 'application/pdf', blobUrl, true);
          }
          return;
        }
      },
      error: (err) => {
        Swal.close();
        Swal.fire('Error', 'No se pudo cargar el archivo para previsualizar.', 'error');
      }
    });
  }
  tryOpenPdf(fileName: string, mime: string, blobUrl: string) {
    try {
      this.openPreview(fileName, mime, blobUrl, true);
      setTimeout(() => {
        const iframeEl = document.querySelector('iframe');
        if (iframeEl && iframeEl instanceof HTMLIFrameElement) {
          iframeEl.onerror = () => {
            window.open(blobUrl, '_blank');
          };
        }
      }, 1000);
    } catch (err) {
      window.open(blobUrl, '_blank');
    }
  }
  openPreview(name: string, mime: string, source: string, isDirectUrl: boolean = false) {
    this.previewName = name || 'archivo';
    this.isPdf = mime.includes('pdf') || name.toLowerCase().endsWith('.pdf');
    this.isDirectUrl = isDirectUrl;
    try {
      this.previewSrc = this.sanitizer.bypassSecurityTrustResourceUrl(source);
    } catch {
      this.previewSrc = source;
    }
    if (this.previewTpl && this.modalService) {
      this.modalRefPreview = this.modalService.show(this.previewTpl, {
        class: 'modal-xl modal-dialog-centered',
        backdrop: 'static',
        ignoreBackdropClick: true
      });
    } else {
      const w = window.open(source, '_blank');
      if (!w) Swal.fire('Aviso', 'El navegador bloqueó la vista previa emergente.', 'info');
    }
  }

  cerrarPreview() {
    this.modalRef.hide();
    this.onClose.emit();
    if (this.modalRefPreview) this.modalRefPreview.hide();
    if (this.previewSrc && typeof this.previewSrc === 'string' && this.previewSrc.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(this.previewSrc);
      } catch (e) {
      }
    }
  }
  verArchivoNew(f: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = String(reader.result || '');
      const mime = f.type || (dataUri.indexOf(';base64,') > -1
        ? dataUri.split(';base64,')[0].replace('data:', '')
        : '');
      this.openPreview(f.name, mime, dataUri);
    };
    reader.readAsDataURL(f);
  }
  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src =
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM3Nzc3NzciIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIyIiByeT0iMiIvPjxjaXJjbGUgY3g9IjguNSIgY3k9IjguNSIgcj0iMi41Ii8+PHBvbHlsaW5lIHBvaW50cz0iMjEgMTUgMTYgMTAgNSAyMSIvPjwvc3ZnPg==';
    img.alt = 'No se pudo cargar la imagen';
    img.style.padding = '2rem';
    img.style.opacity = '0.5';
  }
  getFileSize(f: any) {
    if (!f) return '';
    const size = f.size || (typeof f === 'number' ? f : 0);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }
  onAddClick(event: any, dz: any) {
    event.preventDefault();
    event.stopPropagation();
    if (dz && dz.showFileSelector) dz.showFileSelector();
  }
  onLabelClick(ev: Event) {
    ev.preventDefault();
    ev.stopPropagation();
    if (this.dz && this.dz.showFileSelector) this.dz.showFileSelector();
  }
  get canSave(): boolean {
    return !this.uploading && (this.files.length > 0 || this.pendingDeletes.length > 0);
  }
  private async eliminarPendientes() {
    if (!this.pendingDeletes.length) return;
    for (const f of this.pendingDeletes) {
      const payload = {
        p_edo_id: f.edo_id,
        p_edo_usureg: Number(localStorage.getItem('usuario') || 0)
      };
      try {
        const res: any = await this.api.getentregadocumentosanu(payload).toPromise();
        const result = Array.isArray(res) ? res[0] : res;
        if (result && result.error === 0) {
        } else {
        }
      } catch (err) {
      }
    }
    this.pendingDeletes = [];
  }

  guardar() {
    if (!this.entrega || !this.entrega.ent_id) {
      Swal.fire('Error', 'No se ha identificado la entrega.', 'error');
      return;
    }

    if (this.files.length === 0 && this.pendingDeletes.length > 0) {
      Swal.fire({
        title: 'Confirmar cambios',
        text: 'Se eliminarán ' + this.pendingDeletes.length + ' archivo(s) existente(s). ¿Desea continuar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((res) => {
        if (res.isConfirmed) {
          this.uploading = true;
          this.eliminarPendientes()
            .then(() => {
              this.uploading = false;
              Swal.fire('Éxito', 'Cambios aplicados correctamente.', 'success');
              this.loadExistingFiles();
            })
            .catch((err) => {
              this.uploading = false;
              Swal.fire('Error', 'Ocurrió un error al eliminar los archivos.', 'error');
            });
        }
      });
      return;
    }

    if (this.files.length === 0 && this.pendingDeletes.length === 0) {
      Swal.fire('Info', 'No hay cambios para guardar.', 'info');
      return;
    }

    const form = new FormData();
    form.append('p_ent_id', String(this.entrega.ent_id));
    form.append('p_usu_id', String(Number(localStorage.getItem('usuario') || 0)));
    this.files.forEach(f => form.append('files[]', f));

    this.uploading = true;
    this.uploadProgress = 0;

    // 👇 Llamada simple: sin reportProgress ni observe:'events'
    this.api.postQuery('adquisicion/entregadocumentosgra', form).subscribe({
      next: (res: any) => {
        this.uploading = false;

        if (res && res.success) {
          const archivos = Array.isArray(res.archivos) ? res.archivos : [];
          const totalOk = archivos.filter(a => a.status === 'ok').length;
          const totalErr = archivos.filter(a => a.status !== 'ok').length;

          let mensaje = res.message || 'Archivos procesados correctamente.';
          if (totalOk > 0 && totalErr > 0) {
            mensaje += ' (' + totalOk + ' subidos, ' + totalErr + ' con error)';
          } else if (totalOk > 0) {
            mensaje += ' (' + totalOk + ' archivo(s) subido(s))';
          }

          Swal.fire('Éxito', mensaje, 'success');
          this.eliminarPendientes().then(() => this.loadExistingFiles());
          this.files = [];
        } else {
          const msgError = (res && res.message) ? res.message : 'Error al subir los archivos.';
          Swal.fire('Error', msgError, 'error');
        }
      },
      error: (err) => {
        this.uploading = false;
        Swal.fire('Error', 'No se pudo subir los archivos.', 'error');
      }
    });
  }

  cerrar() {
    this.modalRef.hide();
    this.onClose.emit();
  }
}