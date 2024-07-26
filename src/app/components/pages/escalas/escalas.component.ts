import { Component, ViewChild, AfterViewInit } from "@angular/core";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";

import { CargosService } from "src/app/services/cargos.service";
import { NivelesService } from "src/app/services/niveles.service";
import { EscalaService } from "src/app/services/escala.service";
import { ExcelService } from "src/app/services/excel.service";
import { UnidadesService } from "src/app/services/unidades.service";

@Component({
  selector: "app-escalas",
  templateUrl: "./escalas.component.html",
  styleUrl: "./escalas.component.css",
})
export class EscalasComponent {
  cargos: any;
  niveles: any;
  unidades: any;
  items: any;
  eventuales: any;

  cantidadItems: any;
  totalMensualItem: number = 0;
  totalAnualItem: number = 0;

  unidadItems: any;

  displayedColumnsEscala: string[] = [
    "categoria",
    "nivel",
    "denominacion",
    "items",
    "sueldo",
    "costo_mensual",
    "costo_anual",
  ];
  displayedColumnsPlanilla: string[] = [
    "nombre",
    "registro",
    "nivelSalarialNombre",
    "haberBasico",
    "costo_aguinaldo",
    "costo_anual",
  ];

  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor(
    private cargoService: CargosService,
    private nivelService: NivelesService,
    private escalaService: EscalaService,
    private unidadService: UnidadesService,
    private excelService: ExcelService
  ) {}

  ngAfterViewInit(): void {
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
        this.planillaItems();
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

  private async loadItems() {
    this.cargos = await this.cargoService.getCargos().toPromise();
    //agregamos excepcion del cargo sub-alcaldias debido que lo usamos para visualizar las sub alcaldias.
    this.items = this.cargos.filter(
      (cargo: any) =>
        cargo.estado === true &&
        cargo.contrato === "ITEM" &&
        cargo._id !== "6606c32a0f34d63dc490e2ea"
    );
    this.eventuales = this.cargos.filter(
      (cargo: any) => cargo.estado === true && cargo.contrato === "EVENTUAL"
    );
  }

  private async generalItems() {
    await this.loadItems();
    this.niveles = await this.nivelService
      .getFiltroCampos("estado", "true")
      .toPromise();
    //console.log(this.niveles);

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

  private getTotalItems(items: any): void {
    this.cantidadItems = Object.values(items).reduce(
      (acc: any, count) => acc + (count as number),
      0
    );
  }

  public exportadoEscalaItems(): void {
    this.excelService.escalaGeneralItems(
      this.dataSource.data,
      "escala_salarial.xlsx"
    );
  }
  /*************************PLANILLA ITEMS********************** */

  private async planillaItems() {
    this.unidades = await this.unidadService
      .getFiltroCampos("estado", "true")
      .toPromise();
    this.unidadItems = this.items;
    this.unidadItems.sort((a: any, b: any) => a.registro - b.registro);

    //console.log(this.unidadItems);
    this.dataSource = new MatTableDataSource(this.unidadItems);
    this.dataSource.paginator = this.paginator;
  }

  public async exportPlanillaItems() {
    // Crear un objeto para agrupar los elementos
    const unidadesAgrupadas: { [key: string]: { unidad: any; items: any[] } } =
      {};

    // Inicializar cada unidad en el objeto agrupado
    this.unidades.forEach((unidad: any) => {
      unidadesAgrupadas[unidad._id] = {
        unidad: unidad,
        items: [],
      };
    });

    // Agrupar los elementos de this.items por id_unidad
    this.items.forEach((item: any) => {
      const unidadId = item.id_unidad;
      if (unidadesAgrupadas[unidadId]) {
        unidadesAgrupadas[unidadId].items.push(item);
      }
    });

    // Convertir el objeto a un array si es necesario
    let resultadoAgrupado = Object.values(unidadesAgrupadas);

    // Ordenar cada grupo de items por el campo 'registro' de menor a mayor
    resultadoAgrupado.forEach((grupo: any) => {
      grupo.items.sort((a: any, b: any) => a.registro - b.registro);
    });

    this.unidadItems = resultadoAgrupado.flatMap((grupo: any) => {
      const subgrupos: any[] = [];
      let currentSubgroup: any[] = [];

      grupo.items.forEach((item: any, index: number) => {
        if (currentSubgroup.length === 0) {
          currentSubgroup.push(item);
        } else {
          const previousItem = currentSubgroup[currentSubgroup.length - 1];
          if (item.registro === previousItem.registro + 1) {
            currentSubgroup.push(item);
          } else {
            subgrupos.push({ ...grupo, items: currentSubgroup });
            currentSubgroup = [item];
          }
        }
      });

      if (currentSubgroup.length > 0) {
        subgrupos.push({ ...grupo, items: currentSubgroup });
      }

      return subgrupos;
    });

    // Ordenar las unidades por el registro más bajo de cada subgrupo
    this.unidadItems.sort((a: any, b: any) => {
      const aMinRegistro = a.items[0]?.registro ?? Infinity;
      const bMinRegistro = b.items[0]?.registro ?? Infinity;
      return aMinRegistro - bMinRegistro;
    });

    this.excelService.planillaGeneralItem(
      this.unidadItems,
      "planillaGeneralItem.xlsx"
    );
  }

  public async exportPlanillaEventuales() {
    this.eventuales.sort((a: any, b: any) => a.registro - b.registro);

    this.excelService.planillaGeneralEventual(
      this.eventuales,
      "planillaGeneralEventual.xlsx"
    );
  }
}
