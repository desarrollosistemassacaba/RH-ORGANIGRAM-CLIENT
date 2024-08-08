import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import {
  BrowserModule,
  provideClientHydration,
} from "@angular/platform-browser";
import { DatePipe } from "@angular/common";

import { MaterialModule } from "./shared/material/material.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "./shared/shared.module";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";

//Personalización de paginator en todos los módulos a español
import { CustomPaginatorIntl } from "src/app/shared/material/paginator";
import { MatPaginatorIntl } from "@angular/material/paginator";

import { MAT_DATE_LOCALE } from "@angular/material/core";
import { MAT_DATE_FORMATS } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";

import { AppRoutingModule } from "./app-routing.module";

import { AppComponent } from "./app.component";
import { HomeComponent } from "./components/home/home.component";
import { LoginComponent } from "./components/login/login.component";
import { CargosComponent } from "./components/pages/cargos/cargos.component";
import { FuncionariosComponent } from "./components/pages/funcionarios/funcionarios.component";
import { NivelesComponent } from "./components/pages/niveles/niveles.component";
import { DependenciasComponent } from "./components/pages/dependencias/dependencias.component";
import { PartidasComponent } from "./components/pages/partidas/partidas.component";
import { UnidadesComponent } from "./components/pages/unidades/unidades.component";
import { PlanillasabComponent } from "./components/pages/planillas-altas-bajas/planillasab.component";
//import { DescuentosComponent } from "./components/pages/descuentos/descuentos.component";
import { OrganigramaComponent } from "./components/pages/organigrama/organigrama.component";
import { EscalasComponent } from "./components/pages/escalas/escalas.component";

import { AsyncPipe } from "@angular/common";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";

import { AuthService } from "./services/auth.service";
import { AuthGuard } from "./guards/auth.guard";

import { DialogFuncionarioComponent } from "./components/pages/funcionarios/dialog-funcionario/dialog-funcionario.component";
import { DialogCargoComponent } from "./components/pages/cargos/dialog-cargo/dialog-cargo.component";
import { DialogDependenciaComponent } from "./components/pages/dependencias/dialog-dependencia/dialog-dependencia.component";
import { DialogPartidaComponent } from "./components/pages/partidas/dialog-partida/dialog-partida.component";
import { DialogUnidadComponent } from "./components/pages/unidades/dialog-unidad/dialog-unidad.component";
import { DialogNivelComponent } from "./components/pages/niveles/dialog-nivel/dialog-nivel.component";
import { DialogOrganigramaComponent } from "./components/pages/organigrama/dialog-organigrama/dialog-organigrama.component";
import { ViewFuncionarioComponent } from "./components/pages/funcionarios/view-funcionario/view-funcionario.component";
import { ConfirmDialogComponent } from "./shared/components/confirm-dialog/confirm-dialog.component";
import { MessageDialogComponent } from "./shared/components/message-dialog/message-dialog.component";

// Define los formatos de fecha
export const MY_DATE_FORMATS = {
  parse: {
    dateInput: "DD/MM/YY",
  },
  display: {
    dateInput: "DD/MM/YY",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY",
  },
};

@NgModule({
  declarations: [
    AppComponent,
    OrganigramaComponent,
    HomeComponent,
    LoginComponent,
    CargosComponent,
    FuncionariosComponent,
    NivelesComponent,
    DependenciasComponent,
    UnidadesComponent,
    PartidasComponent,
    DialogFuncionarioComponent,
    PlanillasabComponent,
    DialogCargoComponent,
    DialogDependenciaComponent,
    DialogPartidaComponent,
    DialogNivelComponent,
    DialogOrganigramaComponent,
    DialogUnidadComponent,
    ViewFuncionarioComponent,
    EscalasComponent,
    ConfirmDialogComponent,
    MessageDialogComponent,
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
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [
    AuthService,
    AuthGuard,
    provideClientHydration(),
    provideAnimationsAsync(),
    DatePipe,
    { provide: MAT_DATE_LOCALE, useValue: "es-ES" },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MatPaginatorIntl, useClass: CustomPaginatorIntl },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
