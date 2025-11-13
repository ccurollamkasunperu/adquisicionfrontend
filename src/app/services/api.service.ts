import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";
@Injectable({
  providedIn: "root",
})
export class ApiService {
  constructor(private httpClient: HttpClient, private router: Router) { }
  urlApi: string = "http://10.250.55.118/fedatariobackend/public/api/";
  urlApiAuth: string = "http://10.250.55.118/fedatariobackend/public/api/";

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
  getlibrocabsel(data: object) {
    return this.postQuery("fedatario/librocabsel", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getlibrocabvigsel(data: object) {
    return this.postQuery("fedatario/librocabvigsel", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getlibrocablis(data: object) {
    return this.postQuery("fedatario/librocablis", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getestadolibrossel(data: object) {
    return this.postQuery("fedatario/estadolibrossel", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getestadotramitessel(data: object) {
    return this.postQuery("fedatario/estadotramitessel", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getdocumentossel(data: object) {
    return this.postQuery("fedatario/documentossel", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  gettramitesel(data: object) {
    return this.postQuery("fedatario/tramitesel", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getfedatariogra(data: object) {
    return this.postQuery("fedatario/fedatariogra", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getfedatarioreg(data: object) {
    return this.postQuery("fedatario/fedatarioreg", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getlibrocabreg(data: object) {
    return this.postQuery("fedatario/librocabreg", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getnumeroregistroreg(data: object) {
    return this.postQuery("fedatario/numeroregistroreg", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getlibrodetlis(data: object) {
    return this.postQuery("fedatario/librodetlis", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getlibrodetsel(data: object) {
    return this.postQuery("fedatario/librodetsel", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getlibrodetgra(data: object) {
    return this.postQuery("fedatario/librodetgra", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getlibrodetanu(data: object) {
    return this.postQuery("fedatario/librodetanu", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getlibrodetcnf(data: object) {
    return this.postQuery("fedatario/librodetcnf", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getlibrodetcus(data: object) {
    return this.postQuery("fedatario/librodetcus", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getnumeroregistrosel(data: object) {
    return this.postQuery("fedatario/numeroregistrosel", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getnumeroregistroupd(data: object) {
    return this.postQuery("fedatario/numeroregistroupd", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  gettrazabilidadreg(data: object) {
    return this.postQuery("fedatario/trazabilidadreg", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getfedatariomovimientoreg(data: object) {
    return this.postQuery("fedatario/fedatariomovimientoreg", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getfedatariomovimientosel(data: object) {
    return this.postQuery("fedatario/fedatariomovimientosel", data).pipe(
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
  getlibrodetcnfanu(data: object) {
    return this.postQuery("fedatario/librodetcnfanu", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getlibrodetcusanu(data: object) {
    return this.postQuery("fedatario/librodetcusanu", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getmastertipodocidesel(data: object) {
    return this.postQuery("master/tipodocidesel", data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getfilebase64(data: object) {
    return this.postQuery('files/base64-from-path', data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getfileurl(data: object) {
    return this.postQuery('files/getfileurl', data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  //DESDE AQUI SE AGREGAN LAS RUTAS

}