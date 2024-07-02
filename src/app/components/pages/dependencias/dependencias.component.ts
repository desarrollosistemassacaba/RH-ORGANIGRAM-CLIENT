import {
  Component,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from "@angular/core";

import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatDialog } from "@angular/material/dialog";

import { DialogDependenciaComponent } from "./dialog-dependencia/dialog-dependencia.component";
import { ConfirmDialogComponent } from "../../../shared/components/confirm-dialog/confirm-dialog.component";
import { MessageDialogComponent } from "src/app/shared/components/message-dialog/message-dialog.component";

import { AuthService } from "src/app/services/auth.service";
import { DependenciasService } from "../../../services/dependencias.service";
import { CargosService } from "src/app/services/cargos.service";

@Component({
  selector: "app-dependencias",
  templateUrl: "./dependencias.component.html",
  styleUrl: "./dependencias.component.css",
})
export class DependenciasComponent implements AfterViewInit {
  text: string = "";
  searchEstado: boolean = false;
  filtrarEstado: string = "none";
  displayedColumns: string[];
  dataSource = new MatTableDataSource<any>([]);
  userType: string;
  visitor: any[] = ["nombre", "sigla", "tipo", "dependiente", "estado"];
  user: any[] = ["nombre", "sigla", "tipo", "dependiente", "estado", "options"];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor(
    private authService: AuthService,
    private cargoService: CargosService,
    private dependenciaService: DependenciasService,
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

  load() {
    if (this.filtrarEstado !== "none") {
      this.estadoByFilter(this.filtrarEstado);
    } else {
      this.dependenciaService.getDependencias().subscribe(
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
    this.dependenciaService.getFiltroCampos(campo, valor).subscribe(
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

  add() {
    const dialogRef = this.dialog.open(DialogDependenciaComponent, {
      width: "550px",
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.load();
      }
    });
  }

  edit(dependencia: any) {
    const dialogRef = this.dialog.open(DialogDependenciaComponent, {
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
      .getFiltroCampos("estado", "true")
      .toPromise();

    const filter = cargos.filter(
      (cargo: any) =>
        cargo.id_dependencia && cargo.id_dependencia._id === element._id
    );

    if (filter.length > 0) {
      const dialogRef = this.dialog.open(MessageDialogComponent, {
        width: "450px",
        data: {
          message: `La dependencia se encuentra asignado a un cargo activo, primero debe asegurarse de que ningún cargo ocupe la dependencia ${element.nombre}`,
        },
      });
      dialogRef.afterClosed().subscribe((result) => {});
    } else {
      const nombre = element.nombre;
      const estado = element.estado ? "deshabilitar" : "habilitar";

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: "450px",
        data: {
          message: `¿Está seguro/a de ${estado} el cargo ${nombre}?`,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          let value;
          if (element.id_dependencia && element.id_dependencia._id) {
            value = {
              estado: !element.estado,
              id_dependencia:
                element.id_dependencia && element.id_dependencia._id
                  ? element.id_dependencia._id
                  : "",
            };
          } else {
            value = {
              estado: !element.estado,
            };
          }

          this.dependenciaService
            .updateDependencia(element._id, value)
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
        message: "¿Estás seguro de eliminar la dependencia?",
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dependenciaService.deleteElemento(element._id).subscribe(
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
