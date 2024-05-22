// funcionarios.component.ts

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

import { switchMap, map } from "rxjs/operators";
import { forkJoin } from "rxjs";

import { DialogFuncionarioComponent } from "./dialog-funcionario/dialog-funcionario.component";
import { FuncionariosService } from "../../../services/funcionarios.service";
import { RegistrosService } from "../../../services/registros.service";
import { DependenciasService } from "src/app/services/dependencias.service";
import { CargosService } from "../../../services/cargos.service";

@Component({
  selector: "app-funcionarios",
  templateUrl: "./funcionarios.component.html",
  styleUrl: "./funcionarios.component.css",
})
export class FuncionariosComponent implements AfterViewInit {
  cargos: any[] = [];
  text: string = "";

  searchEstado: boolean = false;
  filtrarEstado: string = "none";
  displayedColumns: string[];
  dataSource = new MatTableDataSource<any>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor(
    private cargosService: CargosService,
    private funcionariosService: FuncionariosService,
    private registrosService: RegistrosService,
    private dependenciasService: DependenciasService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {
    this.displayedColumns = [
      "nombre",
      "ci",
      "cargo",
      "dependencia",
      "contrato",
      "estado",
      "options",
    ];
  }

  ngAfterViewInit(): void {
    this.load();
  }

  load() {
    if (this.filtrarEstado !== "none") {
      this.estadoByFilter(this.filtrarEstado);
    } else {
      this.loadFuncionariosAndRegistros();
    }
  }

  loadFuncionariosAndRegistros() {
    forkJoin({
      funcionarios: this.funcionariosService.getFuncionarios(),
      registros: this.registrosService.getRegistros(),
      dependencias: this.dependenciasService.getDependencias(),
    })
      .pipe(
        map(({ funcionarios, registros, dependencias }) => {
          return this.combineData(funcionarios, registros, dependencias);
        })
      )
      .subscribe(
        (combinedData) => {
          this.setupDataSource(combinedData);
        },
        (error) => {
          console.error("Error al obtener los datos:", error);
        }
      );
  }

  private combineData(
    funcionarios: any[],
    registros: any[],
    dependencias: any[]
  ): any[] {
    const filteredRegistros = this.filterRegistros(registros);

    return funcionarios.map((funcionario: any) => {
      const registrosFuncionario = filteredRegistros.filter(
        (registro: any) => registro.id_funcionario._id === funcionario._id
      );
      const dependencia = dependencias.find(
        (dep: any) =>
          dep._id === (registrosFuncionario[0]?.id_cargo?.id_dependencia || "")
      );

      return {
        ...funcionario,
        registros: registrosFuncionario,
        sigla: dependencia ? dependencia.sigla : "Sin cargo.",
      };
    });
  }

  private filterRegistros(registros: any[]): any[] {
    return registros.filter((r: any) => r.estado === true);
  }

  private setupDataSource(data: any[]): void {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;

    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const textToSearch = (
        data.nombre +
        " " +
        data.paterno +
        " " +
        data.materno +
        " " +
        data.ci
      ).toLowerCase();
      const cargoToSearch =
        data.registros &&
        data.registros.length > 0 &&
        data.registros[0].id_cargo
          ? data.registros[0].id_cargo.nombre.toLowerCase()
          : "";
      const contratoToSearch =
        data.registros &&
        data.registros.length > 0 &&
        data.registros[0].id_cargo
          ? data.registros[0].id_cargo.contrato.toLowerCase()
          : "";
      const dependenciaToSearch = data.sigla ? data.sigla.toLowerCase() : "";

      return (
        textToSearch.includes(filter) ||
        cargoToSearch.includes(filter) ||
        contratoToSearch.includes(filter) ||
        dependenciaToSearch.includes(filter)
      );
    };
  }

  loadCargos() {
    this.cargosService.getCargos().subscribe(
      (data) => {
        //this.cargos = data;
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error("Error al obtener los cargos:", error);
      }
    );
  }

  estadoByFilter(valor: string) {
    const campo = "estado";
    this.funcionariosService
      .getFiltroCampos(campo, valor)
      .pipe(
        switchMap((funcionarios) => {
          return forkJoin({
            registros: this.registrosService.getRegistros(),
            dependencias: this.dependenciasService.getDependencias(),
          }).pipe(
            map(({ registros, dependencias }) => {
              return this.combineData(funcionarios, registros, dependencias);
            })
          );
        })
      )
      .subscribe(
        (combinedData) => {
          this.setupDataSource(combinedData);
        },
        (error) => {
          console.error("Error al obtener los datos:", error);
        }
      );
  }

  estadoSeleccion(event: any) {
    this.filtrarEstado = event.value;
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
    const dialogRef = this.dialog.open(DialogFuncionarioComponent, {
      width: "600px",
      data: cargo._id, // Pasar los datos del cargo al componente de edición
    });

    dialogRef.afterClosed().subscribe((result) => {
      // Aquí puedes manejar la respuesta del diálogo de edición
      //   console.log("El diálogo de edición se cerró");
      //   console.log("Resultado:", result);
      this.load();
    });
  }
  add() {
    const dialogRef = this.dialog.open(DialogFuncionarioComponent, {
      width: "600px",
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      this.load();
      //   if (result) {
      //     this.dataSource = new MatTableDataSource([
      //       result,
      //       ...this.dataSource.data,
      //     ]);
      //     this.dataSource.paginator = this.paginator;
      //   }
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
