import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment.development";

const base_url = environment.base_url + "/funcionario";

@Injectable({
  providedIn: "root",
})
export class FuncionariosService {
  constructor(private http: HttpClient) {}

  getFuncionarios(): Observable<any> {
    return this.http.get<any>(`${base_url}`);
  }

  getFuncionarioById(id: string): Observable<any> {
    return this.http.get<any>(`${base_url}/${id}`);
  }

  getFiltroCampos(campo: string, valor: string) {
    return this.http.get<any>(`${base_url}/filtro/${campo}/${valor}`);
  }

  getFiltroElementos(elemento: string, campo: string, valor: string) {
    return this.http.get<any>(
      `${base_url}/campo/${elemento}/${campo}/${valor}`
    );
  }

  searchFuncionarios(params: any): Observable<any> {
    return this.http.post<any>(`${base_url}/search`, params);
  }

  addFuncionario(funcionario: any) {
    console.log(funcionario);
    return this.http.post<any>(`${base_url}`, funcionario);
  }

  updateFuncionario(id: string, funcionario: any) {
    return this.http.put<any>(`${base_url}/${id}`, funcionario);
  }

  deleteFuncionario(id: string) {
    return this.http.delete<any>(`${base_url}/${id}`);
  }
}
