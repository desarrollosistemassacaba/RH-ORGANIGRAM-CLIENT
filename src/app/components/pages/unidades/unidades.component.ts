import {
  Component,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from "@angular/core";

import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatDialog } from "@angular/material/dialog";

import { DialogUnidadComponent } from "./dialog-unidad/dialog-unidad.component";
import { ConfirmDialogComponent } from "../../../shared/components/confirm-dialog/confirm-dialog.component";

import { AuthService } from "src/app/services/auth.service";
import { UnidadesService } from "src/app/services/unidades.service";
import { CargosService } from "src/app/services/cargos.service";
import { ExcelService } from "src/app/services/excel.service";
import { MessageDialogComponent } from "src/app/shared/components/message-dialog/message-dialog.component";

@Component({
  selector: "app-unidades",
  templateUrl: "./unidades.component.html",
  styleUrl: "./unidades.component.css",
})
export class UnidadesComponent implements AfterViewInit {
  text: string = "";
  searchEstado: boolean = false;
  filtrarEstado: string = "none";
  displayedColumns: string[];
  dataSource = new MatTableDataSource<any>([]);
  userType: string;

  visitor: any[] = ["nombre", "clasificacion", "dependencia", "estado"];

  user: any[] = ["nombre", "clasificacion", "dependencia", "estado", "options"];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor(
    private authService: AuthService,
    private unidadService: UnidadesService,
    private cargoService: CargosService,
    private excelService: ExcelService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    this.authService.getUserRole().subscribe((userRole) => {
      this.userType = userRole;
      this.displayedColumns = userRole === "visitor" ? this.visitor : this.user;
    });
  }

  ngAfterViewInit(): void {
    this.load();
  }

  async load() {
    if (this.filtrarEstado !== "none") {
      this.estadoByFilter(this.filtrarEstado);
    } else {
      this.unidadService.getUnidades().subscribe(
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
  }

  estadoByFilter(valor: string) {
    let campo = "estado";
    this.unidadService.getFiltroCampos(campo, valor).subscribe(
      (data) => {
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
      },
      (error) => {
        // console.error("Error al obtener los cargos:", error);
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

  // Función para generar el Excel
  filtradoExcel(): void {
    const filteredData = this.dataSource.filteredData;
    this.excelService.exportUnidadToExcel(filteredData, "unidades.xlsx");
  }

  add() {
    const dialogRef = this.dialog.open(DialogUnidadComponent, {
      width: "550px",
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.load();
      }
    });
  }

  edit(dependencia: any) {
    const dialogRef = this.dialog.open(DialogUnidadComponent, {
      width: "550px",
      data: dependencia,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.load();
      }
    });
  }

  async estado(element: any) {
    //console.log(element);
    const cargos = await this.cargoService
      .getFiltroCampos("id_unidad", element._id)
      .toPromise();

    const filter = cargos.filter((cargo: any) => cargo.estado === true);

    if (filter.length > 0) {
      const dialogRef = this.dialog.open(MessageDialogComponent, {
        width: "450px",
        data: {
          message: `La unidad se encuentra asignado a un cargo activo, primero debe asegurarse de que ningún cargo ocupe la unidad ${element.nombre}`,
        },
      });
      dialogRef.afterClosed().subscribe((result) => {});
    } else {
      const nombre = element.nombre;
      const estado = element.estado ? "deshabilitar" : "habilitar";

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: "450px",
        data: {
          message: `¿Está seguro/a de ${estado} la unidad ${nombre}?`,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          const value = {
            estado: !element.estado,
          };

          this.unidadService.updateUnidad(element._id, value).subscribe(
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
        message: "¿Estás seguro de eliminar la unidad?",
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.unidadService.deleteElemento(element._id).subscribe(
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
}
