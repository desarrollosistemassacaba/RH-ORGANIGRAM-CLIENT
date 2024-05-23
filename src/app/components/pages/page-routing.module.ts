import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { FuncionariosComponent } from "./funcionarios/funcionarios.component";
import { CargosComponent } from "./cargos/cargos.component";
import { DependenciasComponent } from "./dependencias/dependencias.component";
import { NivelesComponent } from "./niveles/niveles.component";
import { PartidasComponent } from "./partidas/partidas.component";
import { PlanillasabComponent } from "./planillas-altas-bajas/planillasab.component";
//import { DescuentosComponent } from './descuentos/descuentos.component';
import { OrganigramaComponent } from "./organigrama/organigrama.component";

const routes: Routes = [
  { path: "", component: FuncionariosComponent },
  { path: "funcionarios", component: FuncionariosComponent },
  { path: "cargos", component: CargosComponent },
  { path: "dependencias", component: DependenciasComponent },
  { path: "niveles", component: NivelesComponent },
  { path: "partidas", component: PartidasComponent },
  { path: "planillasab", component: PlanillasabComponent },
  //{ path: 'descuentos', component: DescuentosComponent },
  { path: "organigrama", component: OrganigramaComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PageRoutingModule {}
