import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { server } from "../../environments/environment.staging";

const base_url = server.base_url + "/unidad";
@Injectable({
  providedIn: "root",
})
export class UnidadesService {
  constructor(private http: HttpClient) {}

  getUnidades(): Observable<any> {
    return this.http.get<any>(`${base_url}`);
  }

  getFiltroCampos(campo: string, valor: string) {
    return this.http.get<any>(`${base_url}/filtro/${campo}/${valor}`);
  }

  addUnidad(unidad: any) {
    return this.http.post<any>(`${base_url}`, unidad);
  }

  updateUnidad(id: string, unidad: any) {
    return this.http.put<any>(`${base_url}/${id}`, unidad);
  }

  deleteElemento(id: string) {
    return this.http.delete<any>(`${base_url}/${id}`);
  }
}
