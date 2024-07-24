import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { FuncionariosComponent } from "./funcionarios/funcionarios.component";
import { CargosComponent } from "./cargos/cargos.component";
import { DependenciasComponent } from "./dependencias/dependencias.component";
import { NivelesComponent } from "./niveles/niveles.component";
import { PartidasComponent } from "./partidas/partidas.component";
import { PlanillasabComponent } from "./planillas-altas-bajas/planillasab.component";
import { UnidadesComponent } from "./unidades/unidades.component";
import { OrganigramaComponent } from "./organigrama/organigrama.component";
import { EscalasComponent } from "./escalas/escalas.component";

const routes: Routes = [
  { path: "", component: FuncionariosComponent },
  { path: "funcionarios", component: FuncionariosComponent },
  { path: "cargos", component: CargosComponent },
  { path: "niveles", component: NivelesComponent },
  { path: "partidas", component: PartidasComponent },
  { path: "unidades", component: UnidadesComponent },
  { path: "dependencias", component: DependenciasComponent },
  { path: "planillasab", component: PlanillasabComponent },
  { path: "organigrama", component: OrganigramaComponent },
  { path: "escala", component: EscalasComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PageRoutingModule {}
