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

import { AuthService } from "src/app/services/auth.service";

import { DialogFuncionarioComponent } from "./dialog-funcionario/dialog-funcionario.component";
import { ConfirmDialogComponent } from "../../../shared/components/confirm-dialog/confirm-dialog.component";
import { ViewFuncionarioComponent } from "./view-funcionario/view-funcionario.component";
import { FuncionariosService } from "../../../services/funcionarios.service";
import { RegistrosService } from "../../../services/registros.service";
import { DependenciasService } from "src/app/services/dependencias.service";
import { CargosService } from "../../../services/cargos.service";
import { NivelesService } from "src/app/services/niveles.service";
import { ExcelService } from "../../../services/excel.service";
import { MessageDialogComponent } from "src/app/shared/components/message-dialog/message-dialog.component";

import { limpiarObject, ordenPalabras } from "../../../utils/utils";

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
  userType: string;
  visitor: any[] = [
    "nombre",
    "ci",
    "cargo",
    "dependencia",
    "contrato",
    "estado",
  ];

  user: any[] = [
    "nombre",
    "ci",
    "cargo",
    "dependencia",
    "contrato",
    "estado",
    "options",
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor(
    private authService: AuthService,
    private cargosService: CargosService,
    private funcionariosService: FuncionariosService,
    private registrosService: RegistrosService,
    private dependenciasService: DependenciasService,
    private nivelesService: NivelesService,
    private excelService: ExcelService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {
    this.authService.getUserRole().subscribe((userRole) => {
      this.userType = userRole;
      this.displayedColumns = userRole === "visitor" ? this.visitor : this.user;
    });
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
      niveles: this.nivelesService.getNiveles().pipe(map((data) => data || [])),
    })
      .pipe(
        map(({ funcionarios, registros, dependencias, niveles }) => {
          return this.combineData(
            funcionarios,
            registros,
            dependencias,
            niveles
          );
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
    dependencias: any[],
    niveles: any[]
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

      // Obtener la dependencia solo si hay registros válidos
      const nivelId =
        registrosFuncionario.length > 0 && registrosFuncionario[0].id_cargo
          ? registrosFuncionario[0].id_cargo.id_nivel_salarial
          : null;
      const nivel = niveles.find((niv: any) => niv && niv._id === nivelId);

      return {
        ...funcionario,
        registros: registrosFuncionario,
        sigla: dependencia ? dependencia.sigla : "Sin dependencia.",
        nombre_nivel: nivel ? nivel.nombre : "Sin nivel.",
        haber_basico_nivel: nivel ? nivel.haber_basico : "Sin nivel.",
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
      const nombre =
        (data.nombre ? data.nombre : "").toLowerCase() +
        " " +
        (data.paterno ? data.paterno : "").toLowerCase() +
        " " +
        (data.materno ? data.materno : "").toLowerCase();
      const casada = (data.casada ? data.casada : "").toLowerCase();
      const ci = (data.ci ? data.ci : "") + (data.ext ? data.ext : "");
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
        nombre.includes(filter) ||
        casada.includes(filter) ||
        ci.includes(filter) ||
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
            niveles: this.nivelesService.getNiveles(),
          }).pipe(
            map(({ registros, dependencias, niveles }) => {
              return this.combineData(
                funcionarios,
                registros,
                dependencias,
                niveles
              );
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
      if (result) {
        this.load();
      }
    });
  }

  view(funcionario: any) {
    const dialogRef = this.dialog.open(ViewFuncionarioComponent, {
      data: funcionario, // Pasar los datos del cargo al componente de edición
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.load();
      }
    });
  }

  add() {
    const dialogRef = this.dialog.open(DialogFuncionarioComponent, {
      width: "600px",
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.load();
      }
    });
  }

  estado(element: any) {
    //console.log(element);
    if (element.registros && element.registros.length > 0) {
      const dialogRef = this.dialog.open(MessageDialogComponent, {
        width: "450px",
        data: {
          message:
            "El servidor público se encuentra con un cargo activo, primero debe dar de baja para deshabilitar.",
        },
      });
      dialogRef.afterClosed().subscribe((result) => {});
    } else {
      const nombre = ordenPalabras(
        (element.nombre ? element.nombre : "") +
          " " +
          (element.paterno ? element.paterno : "") +
          " " +
          (element.materno ? element.materno : "") +
          " " +
          (element.casada ? element.casada : "")
      );
      const estado = element.estado ? "deshabilitar" : "habilitar";
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: "450px",
        data: {
          message: `¿Está seguro/a de ${estado} al servidor público ${nombre}?`,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          const value = {
            paterno: element.paterno,
            materno: element.materno,
            casada: element.casada,
            ext: element.ext,
            telefono: element.telefono,
            estado: !element.estado,
          };
          const valueClear = limpiarObject(value);
          this.funcionariosService
            .updateFuncionario(element._id, valueClear)
            .subscribe(
              (response) => {
                if (response) {
                  this.load();
                }
              },
              (error) => {
                //console.error("Error al llamar al servicio:", error);
              }
            );
        }
      });
    }
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
