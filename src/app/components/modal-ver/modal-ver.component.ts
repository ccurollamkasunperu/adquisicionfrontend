import { Component, Input, Output, EventEmitter,OnInit, ViewChild, TemplateRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { AppComponent } from 'src/app/app.component';
import { ApiService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-ver',
  templateUrl: './modal-ver.component.html',
  styleUrls: ['./modal-ver.component.css']
})
export class ModalVerComponent implements OnInit {
  blobUrl: string | null = null;
  
  titulopant : string = "VISUALIZAR TICKET";
  tkt_id : string = '0';
  
  dataArchivos: any[] = [];

  @ViewChild('previewTpl', { static: false }) previewTpl!: TemplateRef<any>;
  modalRefPreview?: BsModalRef;

  previewName = '';
  previewMime = '';
  previewSrc: SafeResourceUrl | null = null;
  isPdf = false;
  
  modalRef?: BsModalRef;
  
  @Input() ticket: any;
  
  @Output() cancelClicked = new EventEmitter<void>(); 
  
  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    private modalService: BsModalService,
    private api: ApiService,
    private appComponent: AppComponent
  ) {
    this.appComponent.login = false;
  }

  ngOnInit() {
    console.log(this.ticket.tkt_id);
    this.tkt_id = this.ticket.tkt_id;
    this.loadArchivos();
  }
  
  loadArchivos() {
    const data_post = {
      p_arc_id: 0,
      p_tkt_id: this.tkt_id ? parseInt(this.tkt_id) : 0,
      p_rut_id: 1,
      p_arc_activo: 1
    };

    this.api.getestadoordensel(data_post).subscribe((data: any[]) => {
      this.dataArchivos = data || [];
    });
  }

  verArchivo(item: any) {
    const rutaRelativa = item.rut_archiv.replace(/\\\\/g, '\\').replace(/\\/g, '/'); 
    const data_post = {
      ruta: rutaRelativa,
    };
    this.api.getDatosUsuario(data_post).subscribe({
      next: (res: any) => {
        if (!res || !res.dataUri) { console.error('Respuesta inesperada', res); return; }

        const mimeFromDataUri = res.dataUri.indexOf(';base64,') > -1
          ? res.dataUri.split(';base64,')[0].replace('data:', '')
          : '';

        this.previewName = res.name || item.arc_nombre || 'archivo';
        this.previewMime = res.mime || mimeFromDataUri || '';
        this.isPdf = (this.previewMime || '').toLowerCase().indexOf('pdf') !== -1
                  || (/\.pdf$/i).test(this.previewName);

        if (this.isPdf) {
          // usar Blob URL para PDFs
          const url = this.dataUriToBlobUrl(res.dataUri, this.previewMime || 'application/pdf');
          this.blobUrl = url;
          this.previewSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        } else {
          // para imágenes el dataUri va bien
          this.previewSrc = this.sanitizer.bypassSecurityTrustResourceUrl(res.dataUri);
        }

        this.modalRefPreview = this.modalService.show(this.previewTpl, {
          class: 'modal-xl modal-dialog-centered'
        });
      },
      error: (err) => {
        console.error('Error base64-from-path:', err);
      }
    });
  }

  cancelar() {
    this.cancelClicked.emit();
  }

  private dataUriToBlobUrl(dataUri: string, fallbackMime: string): string {
    const parts = dataUri.split(',');
    const header = parts[0] || '';
    const base64 = parts[1] || '';
    let mime = 'application/octet-stream';
    const m = header.match(/^data:([^;]+);base64$/i);
    if (m && m[1]) mime = m[1];
    if (!m || !m[1]) mime = fallbackMime || mime;

    const byteChars = atob(base64);
    const len = byteChars.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = byteChars.charCodeAt(i);

    const blob = new Blob([bytes], { type: mime });
    return URL.createObjectURL(blob);
  }

  cerrarPreview(): void {
    this.previewSrc = null;
    if (this.modalRefPreview) this.modalRefPreview.hide();
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = null;
    }
  }

}
