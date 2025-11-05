import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";
@Injectable({
  providedIn: "root",
})
export class ApiService {
  constructor(private httpClient: HttpClient, private router: Router) { }
  urlApi: string = "http://10.250.55.118/adquisicionbackend/public/api/";
  urlApiAuth: string = "http://10.250.55.118/adquisicionbackend/public/api/";
  getQuery(query: string) {
    const url = `${this.urlApi + query}`;
    return this.httpClient.get(url);
  }
  postQuery(query: string, params: any) {
    const url = `${this.urlApi + query}`;
    return this.httpClient.post(url, params);
  }
  postQueryBlob(endpoint: string, data: object) {
    return this.httpClient.post(`${this.urlApi + endpoint}`, data, {
      responseType: 'text',
      observe: 'response'
    });
  }
  AuthpostQuery(query: string, params: any) {
    const url = `${this.urlApi + query}`;
    return this.httpClient.post(url, params);
  }
  getIniciarSesion(data: object) {
    return this.AuthpostQuery("login", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getDatosUsuario(data: object) {
    return this.postQuery("me", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getFileUrl(filePath: string): string {
    return `${this.urlApi}getfile?file_path=${encodeURIComponent(filePath)}`;
  }
  getFile(data: object) {
    return this.postQueryBlob('getfile', data).pipe(map((res) => res));
  }
  isLogged() {
    let user_sess = localStorage.getItem("usu_id");
    return user_sess != null ? true : false;
  }
  validateSession(ruta: string) {
    if (this.isLogged()) {
      if (ruta == "login") {
        this.router.navigate(["login"]);
      } else {
        this.router.navigate([ruta]);
      }
    } else {
      this.router.navigate(["login"]);
    }
  }
  getSeguridadperfilusuarioobjetosel(data: object) {
    return this.postQuery("seguridad/perfilusuarioobjetosel", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getusuariocambiocontrasena(data: object) {
    return this.postQuery("seguridad/cambiarclave", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getareadenominacionsel(data: object) {
    return this.postQuery("area/areadenominacionsel", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getespecialistasel(data: object) {
    return this.postQuery("adquisicion/especialistasel", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  gettipobiensel(data: object) {
    return this.postQuery("adquisicion/tipobiensel", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getestadoordensel(data: object) {
    return this.postQuery("adquisicion/estadoordensel", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getordenupd(data: object) {
    return this.postQuery("adquisicion/ordenupd", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getestadosiafsel(data: object) {
    return this.postQuery("adquisicion/estadosiafsel", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getordenimp(data: object) {
    return this.postQuery("adquisicion/ordenimp", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getordenlis(data: object) {
    return this.postQuery('adquisicion/ordenlis', data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getespecialistaard(data: object) {
    return this.postQuery('adquisicion/especialistaard', data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getentregalis(data: object) {
    return this.postQuery('adquisicion/entregalis', data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getentregagra(data: object) {
    return this.postQuery('adquisicion/entregagra', data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getentregadocumentossel(data: object) {
    return this.postQuery('adquisicion/entregadocumentossel', data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getentregadocumentoslis(data: object) {
    return this.postQuery('adquisicion/entregadocumentoslis', data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  gettipobiencontrolsel(data: object) {
    return this.postQuery('adquisicion/tipobiencontrolsel', data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getconformidadgra(data: object) {
    return this.postQuery('adquisicion/conformidadgra', data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getconformidademi(data: object) {
    return this.postQuery('adquisicion/conformidademi', data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getconformidadlis(data: object) {
    return this.postQuery('adquisicion/conformidadlis', data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getordensel(data: object) {
    return this.postQuery('adquisicion/ordensel', data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getentregadocumentosanu(data: object) {
    return this.postQuery('adquisicion/entregadocumentosanu', data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getentregadocumentosgra(data: object) {
    return this.postQuery('adquisicion/entregadocumentosgra', data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getconformidaddocumentogra(data: object) {
    return this.postQuery('adquisicion/conformidaddocumentogra', data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getconformidaddocumentoanu(data: object) {
    return this.postQuery('adquisicion/conformidaddocumentoanu', data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getordendocumentoreg(data: object) {
    return this.postQuery('adquisicion/ordendocumentoreg', data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getordendocumentoanu(data: object) {
    return this.postQuery('adquisicion/ordendocumentoanu', data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  postFile(path: string, formData: FormData) {
    const url = `${this.urlApi + path}`;
    return this.httpClient.post(url, formData);
  }
  postEntregadocumentosGra(formData: FormData) {
    const url = `${this.urlApi}adquisicion/entregadocumentosgra`;
    return this.httpClient.post(url, formData);
  }
  postEntregadocumentosGraWithProgress(formData: FormData) {
    const url = `${this.urlApi}adquisicion/entregadocumentosgra`;
    return this.httpClient.post(url, formData, { reportProgress: true, observe: 'events' as 'events' });
  }
  getFileBlobByName(filename: string) {
    const base = this.urlApi.replace('/public/api/', '/public/');
    const url = `${base}uploads/${filename}`;
    return this.httpClient.get(url, { responseType: 'blob' as 'json' });
  }
  getestadossel(data: object) {
    return this.postQuery('ticket/getestadossel', data).pipe(map((data) => data));
  }
  getprioridadsel(data: object) {
    return this.postQuery('ticket/getprioridadsel', data).pipe(map((data) => data));
  }
  gettemaayudasel(data: object) {
    return this.postQuery('ticket/gettemaayudasel', data).pipe(map((data) => data));
  }
}