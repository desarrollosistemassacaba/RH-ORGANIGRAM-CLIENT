import {
  Component,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from "@angular/core";

import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatDialog } from "@angular/material/dialog";

import { DialogNivelComponent } from "./dialog-nivel/dialog-nivel.component";
import { NivelesService } from "src/app/services/niveles.service";

@Component({
  selector: "app-niveles",
  templateUrl: "./niveles.component.html",
  styleUrl: "./niveles.component.css",
})
export class NivelesComponent implements AfterViewInit {
  text: string = "";
  searchEstado: boolean = false;
  filtrarEstado: string = "none";
  displayedColumns: string[];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor(
    private nivelService: NivelesService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    this.displayedColumns = [
      "nombre",
      "haber_basico",
      "cns",
      "solidario",
      "provivienda",
      "profesional",
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
      this.nivelService.getNiveles().subscribe(
        (data) => {
          this.dataSource = new MatTableDataSource(data);
          this.dataSource.paginator = this.paginator;
          this.cdr.detectChanges();
        },
        (error) => {
          console.error("Error al obtener los niveles:", error);
        }
      );
    }
  }

  estadoByFilter(valor: string) {
    let campo = "estado";
    this.nivelService.getFiltroCampos(campo, valor).subscribe(
      (data) => {
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
      },
      (error) => {
        console.error("Error al obtener los cargos:", error);
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
    const dialogRef = this.dialog.open(DialogNivelComponent, {
      width: "640px",
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.load();
      }
    });
  }

  edit(dependencia: any) {
    const dialogRef = this.dialog.open(DialogNivelComponent, {
      width: "640px",
      data: dependencia,
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.load();
    });
  }

  delete(element: any): void {
    const confirmar = confirm(
      "¿Estás seguro de que deseas eliminar esta dependencia?"
    );

    if (confirmar) {
      this.nivelService.deleteNivel(element._id).subscribe(
        () => {
          this.load();
        },
        (error) => {
          //console.error('Error al eliminar el nivel:', error);
        }
      );
    }
  }
}
