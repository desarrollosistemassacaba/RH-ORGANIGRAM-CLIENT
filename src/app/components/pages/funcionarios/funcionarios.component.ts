import {
  Component,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from "@angular/core";

import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatDialog } from "@angular/material/dialog";

import { switchMap, map, catchError } from "rxjs/operators";
import { of, forkJoin } from "rxjs";

import { DialogFuncionarioComponent } from "./dialog-funcionario/dialog-funcionario.component";
import { ConfirmDialogComponent } from "../../../shared/components/confirm-dialog/confirm-dialog.component";
import { ViewFuncionarioComponent } from "./view-funcionario/view-funcionario.component";
import { FuncionariosService } from "../../../services/funcionarios.service";
import { RegistrosService } from "../../../services/registros.service";
import { DependenciasService } from "src/app/services/dependencias.service";
import { CargosService } from "../../../services/cargos.service";
import { ExcelService } from "../../../services/excel.service";

@Component({
  selector: "app-funcionarios",
  templateUrl: "./funcionarios.component.html",
  styleUrl: "./funcionarios.component.css",
})
export class FuncionariosComponent implements AfterViewInit {
  cargos: any[] = [];
  funcionarios: any[] = [];
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
    private excelService: ExcelService,
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
      funcionarios: this.funcionariosService
        .getFuncionarios()
        .pipe(map((data) => data || [])),
      registros: this.registrosService
        .getRegistros()
        .pipe(map((data) => data || [])),
      dependencias: this.dependenciasService
        .getDependencias()
        .pipe(map((data) => data || [])),
    })
      .pipe(
        map(({ funcionarios, registros, dependencias }) => {
          return this.combineData(funcionarios, registros, dependencias);
        })
      )
      .subscribe(
        (combinedData) => {
          this.funcionarios = combinedData;
          this.setupDataSource(combinedData);
        },
        (error) => {
          //console.error("Error al obtener los datos:", error);
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
      // Verificar que el funcionario no sea null o undefined y tenga _id
      if (!funcionario || !funcionario._id) {
        //console.error("Funcionario inválido:", funcionario);
        return funcionario; // O manejarlo de otra manera, como omitirlo del resultado
      }

      const registrosFuncionario = filteredRegistros.filter(
        (registro: any) =>
          registro &&
          registro.id_funcionario &&
          registro.id_funcionario._id === funcionario._id
      );

      // Obtener la dependencia solo si hay registros válidos
      const dependenciaId =
        registrosFuncionario.length > 0 && registrosFuncionario[0].id_cargo
          ? registrosFuncionario[0].id_cargo.id_dependencia
          : null;
      const dependencia = dependencias.find(
        (dep: any) => dep && dep._id === dependenciaId
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
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        this.cdr.detectChanges();
      },
      (error) => {
        //console.error("Error al obtener los cargos:", error);
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
          //console.error("Error al obtener los datos:", error);
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

  filtradoExcel(): void {
    const filteredData = this.dataSource.filteredData;
    this.excelService.exportFuncionarioToExcel(
      filteredData,
      "funcionarios.xlsx"
    );
  }

  edit(funcionario: any) {
    const dialogRef = this.dialog.open(DialogFuncionarioComponent, {
      width: "600px",
      data: funcionario, // Pasar los datos del cargo al componente de edición
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.load();
    });
  }

  view(funcionario: any) {
    const dialogRef = this.dialog.open(ViewFuncionarioComponent, {
      data: funcionario, // Pasar los datos del cargo al componente de edición
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.load();
    });
  }

  add() {
    const dialogRef = this.dialog.open(DialogFuncionarioComponent, {
      width: "600px",
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      this.load();
    });
  }

  delete(element: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "450px",
      data: {
        message: "¿Estás seguro de eliminar el usuario y sus registros?",
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.eliminarRegistro(element._id);
        this.funcionariosService.deleteFuncionario(element._id).subscribe(
          () => {
            this.load();
          },
          (error) => {
            //console.error("Error al eliminar la dependencia:", error);
          }
        );
      } else {
        //console.log("La eliminación ha sido cancelada.");
      }
    });
  }

  eliminarRegistro(element: any) {
    this.registrosService
      .getFiltroCampos("id_funcionario", element)
      .pipe(
        switchMap((registers) => {
          const deleteObservables = registers.map((register: any) =>
            this.registrosService.deleteRegistro(register._id).pipe(
              catchError((error: any) => {
                // console.error(
                //   `Error eliminando registro con ID ${register._id}:`,
                //   error
                // );
                return of(null); // Manejar errores individuales
              })
            )
          );
          return forkJoin(deleteObservables); // Ejecutar todas las eliminaciones en paralelo
        })
      )
      .subscribe(
        (results) => {
          //console.log("Registros eliminados:", results);
        },
        (error) => {
          //console.error("Error al eliminar registros:", error);
        }
      );
  }

  rotation(edit: string) {}
}
