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

import { DialogCargoComponent } from "./dialog-cargo/dialog-cargo.component";
import { CargosService } from "../../../services/cargos.service";
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
    private nivelesService: NivelesService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {
    this.displayedColumns = [
      "registro",
      "nombre",
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
      this.cargosService.getCargos().subscribe(
        (data) => {
          this.cargos = data;
          this.dataSource = new MatTableDataSource(data);
          this.dataSource.paginator = this.paginator;
          this.cdr.detectChanges();
        },
        (error) => {
          console.error("Error al obtener los cargos:", error);
        }
      );
    }
  }

  loadCargos() {
    this.cargosService.getCargos().subscribe(
      (data) => {
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error("Error al obtener los cargos:", error);
      }
    );
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
    let elemento = "id_nivel_salarial";
    let campo = "nombre";
    this.cargosService.getFiltroElementos(elemento, campo, valor).subscribe(
      (data) => {
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
      },
      (error) => {
        console.error("Error al obtener los cargos:", error);
      }
    );
  }

  estadoByFilter(valor: string) {
    let campo = "estado";
    this.cargosService.getFiltroCampos(campo, valor).subscribe(
      (data) => {
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
      },
      (error) => {
        console.error("Error al obtener los cargos:", error);
      }
    );
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
      // Aquí puedes manejar la respuesta del diálogo de edición
      //   console.log("El diálogo de edición se cerró");
      //   console.log("Resultado:", result);
      this.load();
    });
  }
  add() {
    const dialogRef = this.dialog.open(DialogCargoComponent, {
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
