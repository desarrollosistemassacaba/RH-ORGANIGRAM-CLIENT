import {
  Component,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from "@angular/core";

import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatDialog } from "@angular/material/dialog";

import { DialogPartidaComponent } from "./dialog-partida/dialog-partida.component";
import { ConfirmDialogComponent } from "../../../shared/components/confirm-dialog/confirm-dialog.component";
import { MessageDialogComponent } from "src/app/shared/components/message-dialog/message-dialog.component";

import { AuthService } from "src/app/services/auth.service";
import { PartidasService } from "../../../services/partidas.service";
import { CargosService } from "src/app/services/cargos.service";

@Component({
  selector: "app-partidas",
  templateUrl: "./partidas.component.html",
  styleUrl: "./partidas.component.css",
})
export class PartidasComponent implements AfterViewInit {
  text: string = "";
  fuente: any[] = [];
  organismo: any[] = [];
  searchEstado: boolean = false;
  searchFuente: boolean = false;
  searchOrganismo: boolean = false;
  filtrarEstado: string = "none";
  filtrarFuente: string = "none";
  filtrarOrganismo: string = "none";
  displayedColumns: string[];
  dataSource = new MatTableDataSource<any>([]);
  userType: string;

  visitor: any[] = ["nombre", "codigo", "fuente", "organismo", "estado"];

  user: any[] = [
    "nombre",
    "codigo",
    "fuente",
    "organismo",
    "estado",
    "options",
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor(
    private authService: AuthService,
    private partidaService: PartidasService,
    private cargoService: CargosService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    this.authService.getUserRole().subscribe((userRole) => {
      this.userType = userRole;
      this.displayedColumns = userRole === "visitor" ? this.visitor : this.user;
    });
  }

  ngAfterViewInit(): void {
    this.filterFuente();
    this.filterOrganismo();
    this.load();
  }

  load() {
    if (this.filtrarFuente !== "none") {
      this.fuenteByFilter(this.filtrarFuente);
    } else if (this.filtrarOrganismo !== "none") {
      this.organismoByFilter(this.filtrarOrganismo);
    } else if (this.filtrarEstado !== "none") {
      this.estadoByFilter(this.filtrarEstado);
    } else {
      this.partidaService.getPartidas().subscribe(
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
    this.partidaService.getFiltroCampos(campo, valor).subscribe(
      (data) => {
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
      },
      (error) => {
        //console.error("Error al obtener los cargos:", error);
      }
    );
  }

  fuenteByFilter(valor: string) {
    let campo = "fuente";
    this.partidaService.getFiltroCampos(campo, valor).subscribe(
      (data) => {
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
      },
      (error) => {
        //console.error("Error al obtener los cargos:", error);
      }
    );
  }
  organismoByFilter(valor: string) {
    let campo = "organismo";
    this.partidaService.getFiltroCampos(campo, valor).subscribe(
      (data) => {
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
      },
      (error) => {
        //console.error("Error al obtener los cargos:", error);
      }
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.dataSource.filter = filterValue;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }

    // Filtrar solo en columnas específicas
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const columnsToFilter = ["nombre", "codigo"]; // Especifica las columnas en las que deseas buscar
      for (let column of columnsToFilter) {
        if (
          data[column] &&
          data[column].toString().toLowerCase().includes(filter)
        ) {
          return true; // Devuelve true si encuentra el valor en alguna de las columnas especificadas
        }
      }
      return false; // Devuelve false si no encuentra el valor en ninguna de las columnas especificadas
    };
  }

  clearInput(input: HTMLInputElement): void {
    input.value = "";
    this.load();
  }

  filterFuente() {
    this.partidaService.getFiltradoEstado().subscribe(
      (fuentes) => {
        this.fuente = fuentes.map((val: any) => val.fuente);
        this.fuente = this.fuente.filter((value, index, self) => {
          return self.indexOf(value) === index;
        });
        this.fuente.sort((a, b) => a - b);
        this.cdr.detectChanges();
      },
      (error) => {
        //console.error("Error al obtener los cargos:", error);
      }
    );
  }

  filterOrganismo() {
    this.partidaService.getFiltradoEstado().subscribe(
      (organismos) => {
        this.organismo = organismos.map((val: any) => val.organismo);
        this.organismo = this.organismo.filter((value, index, self) => {
          return self.indexOf(value) === index;
        });
        this.organismo.sort((a, b) => a - b);
        this.cdr.detectChanges();
      },
      (error) => {
        //console.error("Error al obtener los cargos:", error);
      }
    );
  }

  fuenteSeleccion(event: any) {
    this.filtrarFuente = event.value;
    if (this.filtrarFuente === "none") {
      this.searchFuente = false;
      this.searchEstado = false;
    } else {
      this.searchFuente = true;
      this.searchEstado = true;
    }
    this.load();
  }

  organismoSeleccion(event: any) {
    this.filtrarOrganismo = event.value;
    if (this.filtrarOrganismo === "none") {
      this.searchOrganismo = false;
      this.searchEstado = false;
    } else {
      this.searchOrganismo = true;
      this.searchEstado = false;
    }
    this.load();
  }

  estadoSeleccion(event: any) {
    this.filtrarEstado = event.value;
    if (this.filtrarEstado === "none") {
      this.searchEstado = false;
    } else {
      this.searchEstado = true;
    }
    this.load();
  }

  add() {
    const dialogRef = this.dialog.open(DialogPartidaComponent, {
      width: "600px",
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.load();
      }
    });
  }

  edit(dependencia: any) {
    const dialogRef = this.dialog.open(DialogPartidaComponent, {
      width: "600px",
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
      .getFiltroCampos("id_partida", element._id)
      .toPromise();

    const filter = cargos.filter((cargo: any) => cargo.estado === true);

    if (filter.length > 0) {
      const dialogRef = this.dialog.open(MessageDialogComponent, {
        width: "450px",
        data: {
          message: `La partida se encuentra asignado a un cargo activo, primero debe asegurarse de que ningún cargo ocupe la partida presupuestaria ${element.nombre}`,
        },
      });
      dialogRef.afterClosed().subscribe((result) => {});
    } else {
      const nombre = element.nombre;
      const estado = element.estado ? "deshabilitar" : "habilitar";

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: "450px",
        data: {
          message: `¿Está seguro/a de ${estado} la partida presupuestaria ${nombre}?`,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          const value = {
            estado: !element.estado,
          };

          this.partidaService.updatePartida(element._id, value).subscribe(
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
        message: "¿Estás seguro de eliminar la partida presupuestaria?",
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.partidaService.deleteElemento(element._id).subscribe(
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
