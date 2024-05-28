import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import {
  BrowserModule,
  provideClientHydration,
} from "@angular/platform-browser";
import { DatePipe } from '@angular/common';

import { MaterialModule } from "./shared/material/material.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "./shared/shared.module";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";

import { AppRoutingModule } from "./app-routing.module";

import { AppComponent } from "./app.component";
import { HomeComponent } from "./components/home/home.component";
//import { LoginComponent } from "./components/login/login.component";
import { CargosComponent } from "./components/pages/cargos/cargos.component";
import { FuncionariosComponent } from "./components/pages/funcionarios/funcionarios.component";
import { NivelesComponent } from "./components/pages/niveles/niveles.component";
import { DependenciasComponent } from "./components/pages/dependencias/dependencias.component";
import { PartidasComponent } from "./components/pages/partidas/partidas.component";
import { PlanillasabComponent } from "./components/pages/planillas-altas-bajas/planillasab.component";
//import { DescuentosComponent } from "./components/pages/descuentos/descuentos.component";
import { OrganigramaComponent } from "./components/pages/organigrama/organigrama.component";

import { AsyncPipe } from "@angular/common";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";

import { AuthService } from "./auth.service";

import { DialogCargoComponent } from "./components/pages/cargos/dialog-cargo/dialog-cargo.component";
import { DialogDependenciaComponent } from "./components/pages/dependencias/dialog-dependencia/dialog-dependencia.component";
import { DialogPartidaComponent } from "./components/pages/partidas/dialog-partida/dialog-partida.component";
import { DialogNivelComponent } from "./components/pages/niveles/dialog-nivel/dialog-nivel.component";
import { DialogOrganigramaComponent } from "./components/pages/organigrama/dialog-organigrama/dialog-organigrama.component";

@NgModule({
  declarations: [
    AppComponent,
    OrganigramaComponent,
    HomeComponent,
    CargosComponent,
    FuncionariosComponent,
    NivelesComponent,
    DependenciasComponent,
    PartidasComponent,
    PlanillasabComponent,
    DialogCargoComponent,
    DialogDependenciaComponent,
    DialogPartidaComponent,
    DialogNivelComponent,
    DialogOrganigramaComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    AsyncPipe,
    SharedModule,
  ],
  providers: [AuthService, provideClientHydration(), provideAnimationsAsync(), DatePipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
