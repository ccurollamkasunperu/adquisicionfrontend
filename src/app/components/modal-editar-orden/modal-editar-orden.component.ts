import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ApiService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-editar-orden',
  templateUrl: './modal-editar-orden.component.html',
  styleUrls: ['./modal-editar-orden.component.css']
})
export class ModalEditarOrdenComponent implements OnInit {
  @Input() orden: any;
  @Input() modo: 'ver' | 'editar' = 'ver';
  @Output() onClose = new EventEmitter<void>();

  dataAreas: any[] = [];
  dataEspecialistas: any[] = [];
  cargado = false;

  constructor(public modalRef: BsModalRef, private api: ApiService) {}

  ngOnInit(): void {
    console.log('Orden recibida:', this.orden);
    this.loadData();
  }

  loadData() {
    Promise.all([
      this.api.getareadenominacionsel({
        p_ard_id: 0, p_acl_id: 0, p_arj_id: 0, p_atd_id: 0, p_ard_activo: 1
      }).toPromise(),
      this.api.getespecialistasel({
        p_esp_id: 0, p_usu_id: 0,
        p_esp_apepat: '', p_esp_apemat: '', p_esp_nombre: '',
        p_esp_activo: 1
      }).toPromise()
    ])
    .then(([areas, especialistas]: any[]) => {
      this.dataAreas = areas || [];
      this.dataEspecialistas = especialistas || [];

      if (this.orden) {
        if (this.orden.ard_id) {
          const area = this.dataAreas.find(a => a.ard_id == this.orden.ard_id);
          if (area) this.orden.ard_id = area.ard_id;
        }

        if (this.orden.esp_id) {
          const esp = this.dataEspecialistas.find(e => e.esp_id == this.orden.esp_id);
          if (esp) this.orden.esp_id = esp.esp_id;
        }
      }

      this.cargado = true;
    })
    .catch(err => {
      console.error('Error al cargar datos:', err);
      this.cargado = true;
    });
  }

  soloNumeros(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  grabar() {
    if (!this.orden.ard_id || !this.orden.ord_nusiaf) {
      Swal.fire({
        title: 'Campos requeridos',
        html: 'Complete los campos obligatorios antes de continuar.',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    const dataPost = {
      p_ord_id: this.orden.ord_id ? parseInt(this.orden.ord_id) : 0,
      p_ard_id: parseInt(this.orden.ard_id) || 0,
      p_esp_id: parseInt(this.orden.esp_id) || 0,
      p_ord_canent: parseInt(this.orden.ord_canent) || 0,
      p_ord_nusiaf: parseInt(this.orden.ord_nusiaf) || 0,
      p_ord_docref: this.orden.ord_docref || '',
      p_ord_fecnot: this.orden.ord_fecnot || '',
      p_ord_fecrec: this.orden.ord_fecrec || '',
      p_usu_id: parseInt(localStorage.getItem('usuario') || '0')
    };

    Swal.fire({
      title: 'Mensaje',
      html: '¿Seguro de guardar los cambios?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ACEPTAR',
      cancelButtonText: 'CANCELAR'
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.getordenupd(dataPost).subscribe({
          next: (data: any) => {
            if (Array.isArray(data) && data.length > 0 && data[0].error === 0) {
              Swal.fire({
                title: 'Éxito',
                html: data[0].mensa ? data[0].mensa.trim() : 'La orden se actualizó correctamente.',
                icon: 'success',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Aceptar'
              }).then((res) => {
                if (res.value) {
                  setTimeout(() => {
                    this.modalRef.hide();
                    this.onClose.emit();
                  }, 300);
                }
              });
            } else {
              Swal.fire({
                title: 'Error',
                text: data && data[0] && data[0].mensa ? data[0].mensa.trim() : 'Ocurrió un error al guardar.',
                icon: 'error',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Aceptar'
              });
            }
          },
          error: () => {
            Swal.fire({
              title: 'Error',
              text: 'No se pudo conectar con el servidor.',
              icon: 'error',
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'Aceptar'
            });
          }
        });
      }
    });
  }

  salir() {
    this.modalRef.hide();
  }
}
