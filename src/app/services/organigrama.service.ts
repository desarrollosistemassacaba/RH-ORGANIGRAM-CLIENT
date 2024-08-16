import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { server } from "../../environments/environment.staging";
import { Observable } from "rxjs";

const base_url = server.base_url + "/organization";

@Injectable({
  providedIn: "root",
})
export class OrganigramaService {
  constructor(private http: HttpClient) {}

  getFiltroElementos(elemento: string, campo: string, valor: string) {
    return this.http.get<any>(
      `${base_url}/campo/${elemento}/${campo}/${valor}`
    );
  }
  updateOrganigram(id: string, data: any) {
    return this.http.put<any>(`${base_url}/${id}`, data);
  }

  getElementoById(id: string): Observable<any> {
    return this.http.get<any>(`${base_url}/${id}`);
  }
}
