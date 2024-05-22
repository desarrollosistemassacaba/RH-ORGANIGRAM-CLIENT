// cargos.component.ts

import {
  Component,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from "@angular/core";
// import { FormControl } from '@angular/forms';
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatDialog } from "@angular/material/dialog";
//import { Observable } from 'rxjs';
//import { map, startWith } from 'rxjs/operators';
import { map } from "rxjs/operators";
import { forkJoin } from "rxjs";

import { DialogCargoComponent } from "./dialog-cargo/dialog-cargo.component";
import { CargosService } from "../../../services/cargos.service";
import { RegistrosService } from "../../../services/registros.service";
import { FuncionariosService } from "../../../services/funcionarios.service";
import { NivelesService } from "../../../services/niveles.service";

@Component({
  selector: "app-cargos",
  templateUrl: "./cargos.component.html",
  styleUrls: ["./cargos.component.css"],
})
export class CargosComponent implements AfterViewInit {
  cargos: any[] = [];
  text: string = "";
  nivel: any[] = [];
  searchNivel: boolean = false;
  searchEstado: boolean = false;
  filtrarNivel: string = "none";
  filtrarEstado: string = "none";
  displayedColumns: string[];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor(
    private cargosService: CargosService,
    private registrosService: RegistrosService,
    private funcionariosService: FuncionariosService,
    private nivelesService: NivelesService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {
    this.displayedColumns = [
      "registro",
      "nombre",
      "personal",
      "dependencia",
      "contrato",
      "nivel",
      "estado",
      "superior",
      "options",
    ];
  }

  ngAfterViewInit(): void {
    this.load();
  }

  load() {
    this.nivelByName();
    if (this.filtrarNivel !== "none") {
      this.nivelByFilter(this.filtrarNivel);
    } else if (this.filtrarEstado !== "none") {
      this.estadoByFilter(this.filtrarEstado);
    } else {
      this.loadCargos(undefined, undefined);
    }
  }

  loadCargos(
    filtroNivel?: { elemento: string; campo: string; valor: string },
    filtroEstado?: { campo: string; valor: string }
  ) {
    // console.log(filtroNivel);
    // console.log(filtroEstado);
    let cargosRequest = filtroNivel
      ? this.cargosService.getFiltroElementos(
          filtroNivel.elemento,
          filtroNivel.campo,
          filtroNivel.valor
        )
      : filtroEstado
      ? this.cargosService.getFiltroCampos(
          filtroEstado.campo,
          filtroEstado.valor
        )
      : this.cargosService.getCargos();

    const registrosRequest = this.registrosService.getFiltroCampos(
      "estado",
      "true"
    );

    const funcionariosRequest = this.funcionariosService.getFiltroCampos(
      "estado",
      "true"
    );
    forkJoin({
      cargos: cargosRequest,
      registros: registrosRequest,
      funcionarios: funcionariosRequest,
    })
      .pipe(
        map(({ cargos, registros, funcionarios }) => {
          return this.combinarDatos(cargos, registros, funcionarios);
        })
      )
      .subscribe(
        (combinedData) => {
          this.dataSource = new MatTableDataSource(combinedData);
          this.dataSource.paginator = this.paginator;
          this.cdr.detectChanges();
        },
        (error) => {
          console.error("Error al obtener los datos:", error);
        }
      );
  }

  combinarDatos(cargos: any[], registros: any[], funcionarios: any[]): any[] {
    return cargos.map((cargo: any) => {
      // Encontrar el registro correspondiente al cargo
      const registro = registros.find((reg: any) => reg.id_cargo === cargo._id);
      //console.log(registro);
      // Si no hay registro, asignar "SIN ASIGNACION"
      if (!registro) {
        return {
          ...cargo,
          personal: "SIN ASIGNACION",
        };
      }

      // Encontrar el funcionario correspondiente al registro
      const funcionario = funcionarios.find(
        (func: any) => func._id === registro.id_funcionario
      );

      // Si no hay funcionario, asignar "SIN ASIGNACION"
      if (!funcionario) {
        return {
          ...cargo,
          personal: "SIN ASIGNACION",
        };
      }

      // Concatenar los campos del funcionario para el campo personal
      const personal = `${funcionario.nombre} ${funcionario.paterno} ${funcionario.materno}`;

      return {
        ...cargo,
        personal: personal,
      };
    });
  }

  nivelByName() {
    this.nivelesService.getFiltroCampos("estado", "true").subscribe(
      (levels) => {
        this.nivel = levels.map((level: any) => level.nombre);
        this.nivel.sort((a, b) => a - b);
        this.cdr.detectChanges();
      },
      (error) => {
        console.error("Error al obtener los cargos:", error);
      }
    );
  }

  nivelByFilter(valor: string) {
    const filtroNivel = {
      elemento: "id_nivel_salarial",
      campo: "nombre",
      valor: valor,
    };
    this.loadCargos(filtroNivel);
  }

  estadoByFilter(valor: string) {
    const filtroEstado = { campo: "estado", valor: valor };
    this.loadCargos(undefined, filtroEstado);
  }

  nivelSeleccion(event: any) {
    this.filtrarNivel = event.value;
    if (this.filtrarNivel === "none") {
      this.searchEstado = false;
    } else {
      this.searchEstado = true;
    }
    this.load();
  }

  estadoSeleccion(event: any) {
    this.filtrarEstado = event.value;
    if (this.filtrarEstado === "none") {
      this.searchNivel = false;
    } else {
      this.searchNivel = true;
    }
    this.load();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  clearInput(input: HTMLInputElement): void {
    input.value = "";
    this.load();
  }

  edit(cargo: any) {
    const dialogRef = this.dialog.open(DialogCargoComponent, {
      width: "600px",
      data: cargo._id, // Pasar los datos del cargo al componente de edición
    });

    dialogRef.afterClosed().subscribe((result) => {
      //   console.log("Resultado:", result);
      this.load();
    });
  }
  add() {
    const dialogRef = this.dialog.open(DialogCargoComponent, {
      width: "600px",
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      //   console.log("Resultado:", result);
      this.load();
    });
  }

  delete(element: any): void {
    const confirmar = confirm(
      "¿Estás seguro de que deseas eliminar esta dependencia?"
    );

    if (confirmar) {
      this.cargosService.deleteCargo(element._id).subscribe(
        () => {
          this.load();
        },
        (error) => {
          //console.error('Error al eliminar la dependencia:', error);
        }
      );
    }
  }

  rotation(edit: string) {}
}
