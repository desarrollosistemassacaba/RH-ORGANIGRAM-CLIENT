import { Component } from "@angular/core";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { MatTableDataSource } from "@angular/material/table";

import { CargosService } from "src/app/services/cargos.service";
import { NivelesService } from "src/app/services/niveles.service";
import { EscalaService } from "src/app/services/escala.service";
import { ExcelService } from "src/app/services/excel.service";

@Component({
  selector: "app-escalas",
  templateUrl: "./escalas.component.html",
  styleUrl: "./escalas.component.css",
})
export class EscalasComponent {
  cargos: any;
  niveles: any;
  items: any;

  cantidadItems: any;
  totalMensualItem: number = 0;
  totalAnualItem: number = 0;

  displayedColumns: string[] = [
    "categoria",
    "nivel",
    "denominacion",
    "items",
    "sueldo",
    "costo_mensual",
    "costo_anual",
  ];

  dataSource = new MatTableDataSource<any>([]);
  constructor(
    private cargoService: CargosService,
    private nivelService: NivelesService,
    private escalaService: EscalaService,
    private excelService: ExcelService
  ) {}

  ngAfterViewInit(): void {
    //this.load();
    this.generalItems();
  }

  //menu seleccion
  tabSelected(event: MatTabChangeEvent): void {
    // Obtener el índice de la pestaña seleccionada
    const selectedIndex = event.index;

    // Dependiendo del índice, puedes llamar a la función correspondiente
    switch (selectedIndex) {
      case 0:
        this.generalItems();
        break;
      case 1:
        break;
      case 2:
        break;
      case 3:
        break;
      case 4:
        break;
      case 5:
        break;
      case 6:
        break;
      case 7:
        break;

      default:
        break;
    }
  }

  private async generalItems() {
    this.cargos = await this.cargoService.getCargos().toPromise();
    this.niveles = await this.nivelService
      .getFiltroCampos("estado", "true")
      .toPromise();
    //console.log(this.niveles);
    //agragamos excepcion del cargo sub-alcaldias debido que lo usamos para visualizar las sub alcaldias.
    this.items = this.cargos.filter(
      (cargo: any) =>
        cargo.estado === true &&
        cargo.contrato === "ITEM" &&
        cargo._id !== "6606c32a0f34d63dc490e2ea"
    );

    const itemNivel: { [key: number]: number } = {};
    const sueldoNivel: { [key: number]: number } = {};
    // Inicializar conteo a 0 para niveles del 1 al 14
    for (let nivel = 1; nivel <= 14; nivel++) {
      itemNivel[nivel] = 0;
      sueldoNivel[nivel] = 0;
    }

    this.items.forEach((cargo: any) => {
      let nivel = cargo.id_nivel_salarial?.nombre;
      let cantidad = cargo.id_nivel_salarial.haber_basico;
      if (nivel >= 1 && nivel <= 14) {
        itemNivel[nivel]++;
        sueldoNivel[nivel] = +cantidad;
      }
    });

    for (let nivel = 1; nivel <= 14; nivel++) {
      this.totalMensualItem += itemNivel[nivel] * sueldoNivel[nivel];
    }

    this.totalAnualItem = this.totalMensualItem * 12;

    // console.log(this.totalMensualItem);
    // console.log(this.totalAnualItem);

    this.getTotalItems(itemNivel);
    this.dataSource.data = this.escalaService.getDateItems(
      itemNivel,
      sueldoNivel
    );
  }

  private getTotalItems(items: any) {
    this.cantidadItems = Object.values(items).reduce(
      (acc: any, count) => acc + (count as number),
      0
    );
  }

  public exportadoItems() {
    this.excelService.escalaGeneralItems(
      this.dataSource.data,
      "escala_salarial.xlsx"
    );
  }
}
