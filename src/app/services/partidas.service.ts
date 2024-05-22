import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../environments/environment.development";

const base_url = environment.base_url + "/partida";

@Injectable({
  providedIn: "root",
})
export class PartidasService {
  constructor(private http: HttpClient) {}

  getPartidas(): Observable<any> {
    return this.http.get<any>(`${base_url}`);
  }

  getFiltroCampos(campo: string, valor: string) {
    return this.http.get<any>(`${base_url}/filtro/${campo}/${valor}`);
  }

  getFiltradoEstado(): Observable<any> {
    return this.http.get<any>(`${base_url}/filtro/estado/true`).pipe(
      map((response) => {
        return response;
      })
    );
  }

  addPartida(partida: any) {
    console.log(partida);
    return this.http.post<any>(`${base_url}`, partida);
  }

  updatePartida(id: string, partida: any) {
    return this.http.put<any>(`${base_url}/${id}`, partida);
  }

  deleteElemento(id: string) {
    return this.http.delete<any>(`${base_url}/${id}`);
  }
}
