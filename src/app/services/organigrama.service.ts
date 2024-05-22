import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment.development";

const base_url = environment.base_url + "/organigrama";

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
}
