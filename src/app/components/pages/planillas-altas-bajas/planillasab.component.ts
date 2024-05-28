// planillasab.component.ts
import {
  Component,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from "@angular/core";
  
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatDialog } from "@angular/material/dialog";
import { MatButtonModule } from '@angular/material/button';

import { switchMap, map } from "rxjs/operators";
import { forkJoin } from "rxjs";

//import { DialogPlanillasabComponent } from "./dialog-planillas-altas-bajas/dialog-planillasab.component";

//Servicios
import { FuncionariosService } from "../../../services/funcionarios.service";
import { RegistrosService } from "../../../services/registros.service";
import { CargosService } from "../../../services/cargos.service";
import { ExcelService } from "../../../services/excel.service";

@Component({
selector: "app-planillasab",
templateUrl: "./planillasab.component.html",
styleUrl: "./planillasab.component.css",
})
export class PlanillasabComponent implements AfterViewInit {
cargos: any[] = [];
text: string = "";

searchEstado: boolean = false;
searchTipoContrato: boolean = false;
filtrarEstado: string = "none";
filtrarTipoContrato: string = "none";
displayedColumns: string[];
habilitarBotonExportar: boolean = true;

dataSource = new MatTableDataSource<any>([]);

@ViewChild(MatPaginator) paginator!: MatPaginator;
constructor(
private cargosService: CargosService,
private funcionariosService: FuncionariosService,
private registrosService: RegistrosService,
private cdr: ChangeDetectorRef,
private dialog: MatDialog,
private excelService: ExcelService
) {
this.displayedColumns = [
    "nombre",
    "ci",
    "contrato",
    "cargo",    
    "fecha_ingreso",
    "fecha_conclusion",
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
    } else if(this.filtrarTipoContrato !== "none"){        
        this.contratoByFilter(this.filtrarTipoContrato);        
    } 
    else {
        this.loadFuncionariosAndRegistros();
    }
}

loadFuncionariosAndRegistros() {
forkJoin({    
    //funcionarios: this.funcionariosService.getFiltroCampos("estado", "true"),   
    funcionarios: this.funcionariosService.getFuncionarios(),
    registros: this.registrosService.getRegistros(),
    cargos: this.cargosService.getFiltroCampos("estado", "true")
    })
    .pipe(
    map(({ funcionarios, registros, cargos}) => {
        return this.combineFuncionariosData(funcionarios, registros, cargos);
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

private combineFuncionariosData(    
    funcionarios: any[],    
    registros: any[],
    cargos: any[],
): any[] {

return funcionarios.map((funcionario: any) => {

    const registroFuncionario = registros.find(
        (registro: any) => (registro.id_funcionario?._id === funcionario._id)
    );


    if (!registroFuncionario) {        
        return {
          ...funcionario,           
          registro: [],
          cargo: []       
        };
    }
    
    const cargoRegistro = cargos.find(
        (cargo: any) => cargo._id === registroFuncionario.id_cargo?._id
    );

     
    if (!cargoRegistro) {
        return {
          ...funcionario,          
          registro: registroFuncionario,
          cargo: []                 
        };
    }

    return {
        ...funcionario,
        registro: registroFuncionario,
        cargo:  cargoRegistro        
    };
});
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
        data.cargo &&       
        data.cargo._id
            ? data.cargo.nombre.toLowerCase()
            : "";

        return (
            textToSearch.includes(filter) ||
            cargoToSearch.includes(filter) 
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
     console.error("Error al obtener los cargos:", error);
    }
);
}

//Filtro de estados: Baja, Alta
//El estado se basa en el estado del funcionario donde estado=false
//equivale a baja, es posible que no se encuentre un cargo relacionado
estadoByFilter(valor: string) {

const campo = "estado";

this.funcionariosService
    .getFiltroCampos(campo, valor)
    .pipe(
    switchMap((funcionarios) => {
        return forkJoin({
            registros: this.registrosService.getRegistros(),
            cargos: this.cargosService.getCargos()
        }).pipe(
        map(({ registros, cargos }) => {
            return this.combineFuncionariosData(funcionarios, registros, cargos);
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


contratoByFilter(valor: string) {

    const campo = "contrato";
 
    this.funcionariosService
        .getFiltroCampos("estado", "true")
        .pipe(
            switchMap((funcionarios) => {
                return forkJoin({
                    registros: this.registrosService.getRegistros(),
                    cargos: this.cargosService.getFiltroCampos(campo, valor)               
                }).pipe(
                    map(({registros, cargos }) => {
                        return this.combineFuncionariosData(funcionarios, registros, cargos);
                })
                );
            })
        )
        .subscribe(
            (combinedData) => {
                //Remover filas que no tienen cargo
                //debido a que el filtro aplica al tipo de Contrato especificamente
                var filteredData = combinedData.filter((row: any) => row.cargo.length !== 0 );                
                this.setupDataSource(filteredData);
            },
            (error) => {
                console.error("Error al obtener los datos:", error);
            }
        );
    }

/*
tipoContratoByFilter(valor: string) {
    let campo = "contrato";
    console.log("filtering by contrato...");

    this.cargosService.getFiltroCampos(campo, valor).subscribe(
      (data) => {
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
      },
      (error) => {
        console.error("Error al obtener los cargos:", error);
      }
    );


  }*/

estadoSeleccion(event: any) {
    this.filtrarEstado = event.value;

    if(this.filtrarEstado === "none"){
        this.searchTipoContrato = false;
    } else{
        this.searchTipoContrato = true;
    }

    this.load();
}

tipoContratoSeleccion(event: any){
    
    this.filtrarTipoContrato = event.value;

    if(this.filtrarTipoContrato === "none"){
        this.searchEstado = false;
        this.habilitarBotonExportar = true;
    } else {
        this.searchEstado = true;
        this.habilitarBotonExportar = false;
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
    /*
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
    */
}


rotation(edit: string) {

}

generateExcel() {
    this.excelService.generateExcel();
  }

}

