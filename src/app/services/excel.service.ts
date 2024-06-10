import { Injectable } from '@angular/core';
import { Anchor, Row, Workbook, Worksheet } from 'exceljs';
import {formatDate} from '@angular/common';
import * as fs from 'file-saver';

import { DatePipe } from '@angular/common';
import { style } from '@angular/animations';
import { EntidadAltaBaja } from './Utils/EntidadAltaBaja';
import { totalmem } from 'node:os';

import { Logos } from '../shared/resources/Logos';
import { range } from 'rxjs';
import { ConstantPool } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})

export class ExcelService {    

    //Propiedades
    private TipoContrato: string;
    private MesLiteral: string;
    private GestionNumeral: string;
    private MesNumeral: number;    
    
    constructor(private datePipe: DatePipe) {        

    }

    public setTipoContrato(tipo: string){
        this.TipoContrato = tipo;
    }

    async generarExcel(data: any[], tipoContrato: string, mes: any, year: any){

        this.TipoContrato = tipoContrato;
        this.MesNumeral = mes;
        this.MesLiteral = this.mesNumeralToLiteral(mes);
        this.GestionNumeral = year;

        console.log("YEAR: " + this.GestionNumeral + " , MONTH: " + this.MesNumeral + ", MONTH NAME: " + this.MesLiteral);
        if(this.TipoContrato === "ITEM"){
            this.generarExcelItem(data);
        }else  if(this.TipoContrato === "EVENTUAL"){
            this.generarExcelEventual(data);
        }
    }

    private async generarExcelItem(data: any[]){
       
        // Excel titulos, Encabezado
        const titulo = `PLANILLA DE PERSONAL PERMANENTE ALTAS-BAJAS Y CAMBIOS`;
        const subtituloPeriodo = `CORRESPONDIENTE AL MES DE ${this.MesLiteral.toUpperCase()} de ${this.GestionNumeral}`;
        const subtituloExpresado = "(EXPRESADO EN BOLIVIANOS)";

        //Encabezados de columna y anchos
        const encabezadosAncho = [['B/A', 5], 
                                  ['No Item', 5],
                                  ['Cargo', 40],
                                  ['Contrato', 10],
                                  ['C.I.', 10],
                                  ['NOMBRE COMPLETO', 27],
                                  ['FECHA DE NACIMIENTO', 12],
                                  ['FECHA DE INGRESO', 12],
                                  ['FECHA DE CONCLUSION', 12] ,
                                  ['Nivel', 7],
                                  [`Sueldo [Bs/Mes]`, 12],
                                  ['DIAS TRABAJADOS', 6]];
        
        const encabezados : any = [];
        const anchos : any = [];

        encabezadosAncho.forEach((item) => encabezados.push(item[0]) | anchos.push(item[1]));
        

        // Crear workbook and worksheet, configurar tamano de pagina y orientacion
        //papersize 5 : Legal
        //landscape : horizontal
        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet('Altas-Bajas');
        worksheet.pageSetup = {paperSize: 5, orientation: 'landscape'};
        worksheet.views = [{showGridLines: false}];

        // Agregar filas del Titulo y formato       
        var valoresFila = [];
        valoresFila[1] = '';//vacio en col A
        valoresFila[2] = '';//vacio en col B

        valoresFila[3] = titulo; //empieza en col C
        this.agregarFilaTitulos(1, valoresFila, worksheet);
       
        valoresFila[3] = subtituloPeriodo;
        this.agregarFilaTitulos(2, valoresFila, worksheet);

        valoresFila[3] = subtituloExpresado;
        this.agregarFilaTitulos(3, valoresFila, worksheet);
       
        //Agregar las imagenes del encabezado
        const objLogos = new Logos();

        let logoInstitucionalElement = workbook.addImage({
            base64: objLogos.GetLogoInstitucional(),
            extension: 'png'
        });
        this.agregarLogos(logoInstitucionalElement, worksheet);

                
        // Agregar fila de Encabezados        
        this.agregarFilaEncabezadosItem(encabezados, worksheet);
        
        //Cargar los datos y aplicar estilos en funcion a ciertos valores
        console.log("Data inside ExcelEngine: ");
        console.log(data);       
        
        let nroRegistros = 1;
        var nombreUnidadActual = "Inicial";
        var montoTotal = 0; 
        var controlPrimera = {isFirst:true};        
        const nroFilasPrimeraHoja = 21;
        const nroFilasRestoHojas = 23;

        data.sort((a, b) => a.cargo.registro - b.cargo.registro).forEach(d => {            

            //Determinar si se efectuo una Alta o Baja en el presente periodo
            //para establecer las etiquetas [A, B, A/B]
            //y para resaltar la fila si es que hubo uno de esos eventos
            //tambien se define el nro de dias trabajados si hubo cambios            
            let objAltaBaja = new EntidadAltaBaja();
            objAltaBaja.procesarEvento(d, this.MesNumeral, this.GestionNumeral);

            var montoSalario = this.formatearMonto(d.cargo.id_nivel_salarial.haber_basico);
            montoTotal = montoTotal + parseFloat(d.cargo.id_nivel_salarial.haber_basico);
             /*
                ['B/A', 'No Item', 'Cargo', 'Contrato', 'C.I.', 'NOMBRE COMPLETO', 
                'FECHA DE NACIMIENTO', 'FECHA DE INGRESO', 'FECHA DE CONCLUSION',
                'Nivel', 'Sueldo [Bs/Mes]', 'DIAS TRABAJADOS']
            */ 

            const funcionario_cargo = [objAltaBaja.etiquetaAltaBaja,
                                    d.cargo.registro,
                                    d.cargo.nombre,
                                    d.cargo.contrato, 
                                    d.ci,
                                    d.paterno + ' ' + d.materno + ' ' + d.nombre,
                                    d.fecha_nacimiento? this.formatearFecha(d.fecha_nacimiento):'' ,
                                    d.registro.fecha_ingreso? this.formatearFecha(d.registro.fecha_ingreso):'' ,
                                    d.registro.fecha_conclusion? this.formatearFecha(d.registro.fecha_conclusion):'',
                                    d.cargo.nivel,
                                    montoSalario,
                                    objAltaBaja.diasTrabajados];
            
            //Comprobar si hay una nueva unidad para imprimir el Nombre de la seccion
            if(d.cargo.id_dependencia?.nombre !== nombreUnidadActual){

                const titulo_seccion_unidad = ['**', '', d.cargo.id_dependencia?.nombre, '', '', '', '', '', '', '', '', ''];

                var filaTituloDependencia = worksheet.addRow(titulo_seccion_unidad);
                this.formatearFilaDatosItem(filaTituloDependencia, objAltaBaja.modificacion, true);
               
                nombreUnidadActual = d.cargo.id_dependencia?.nombre;

                nroRegistros = this.verificarImprimirEncabezados(encabezados, nroRegistros, controlPrimera,
                     nroFilasPrimeraHoja, nroFilasRestoHojas, worksheet);
            }

            var row = worksheet.addRow(funcionario_cargo);
            this.formatearFilaDatosItem(row, objAltaBaja.modificacion, false);
            
            nroRegistros = this.verificarImprimirEncabezados(encabezados, nroRegistros, controlPrimera,
                nroFilasPrimeraHoja, nroFilasRestoHojas, worksheet);
              
        });

        //Establecer ancho de columnas
        this.establecerAnchoColumnas(anchos, worksheet);        

        //agregar fila de salario total acumulado
        var filaTotal = worksheet.addRow(['TOTAL','','','','','','','','','', this.formatearMonto(montoTotal) ,'']);
        this.formatearFilaDatosItem(filaTotal, false, false);

        // Generar archivo Excel con el nombre
        workbook.xlsx.writeBuffer().then((data: any) => {
            const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, `PlanillaAltasBajas_Item_${this.MesLiteral}_${this.GestionNumeral}.xlsx`);
        });

    }

    private async generarExcelEventual(data: any[]){
        // Excel titulos, Encabezado
        const titulo = `PLANILLA DE PERSONAL EVENTUAL ALTAS-BAJAS Y CAMBIOS`;
        const subtituloPeriodo = `CORRESPONDIENTE AL MES DE ${this.MesLiteral.toUpperCase()} de ${this.GestionNumeral}`;
        const subtituloExpresado = "(Expresado en Bolivianos)";

        //Encabezados de columna y anchos
        const encabezadosAncho = [['No', 4],
                                  ['A/B', 3],                                 
                                  ['No. CONTRATO', 25],
                                  ['CARNET', 10],
                                  ['APELLIDOS Y NOMBRES', 27],
                                  ['FECHA DE NACIMIENTO', 10],
                                  ['CARGO', 27],
                                  ['FECHA DE INGRESO', 10],
                                  ['FECHA DE CONCLUSION', 10],
                                  ['DIAS TRABAJADOS', 5],                                  
                                  ['MONTO CONTRATO', 9],
                                  ['TOTAL GANADO', 9],
                                  ['OBSERVACION', 10]                                  
                                  ];
        
        const encabezados : any = [];
        const anchos : any = [];

        encabezadosAncho.forEach((item) => encabezados.push(item[0]) | anchos.push(item[1]));

        //Crear workbook and worksheet, configurar tamano de pagina y orientacion
        //papersize 5 : Legal
        //landscape : horizontal
        const workbook = new Workbook();

        const worksheet = workbook.addWorksheet('Altas-Bajas-Eventual');
        worksheet.pageSetup = {paperSize: 5, orientation: 'landscape'};
        worksheet.views = [{showGridLines: false}];

        // Agregar filas del Titulo y formato       
        var valoresFila = [];
        valoresFila[1] = '';//vacio en col A
        valoresFila[2] = '';//vacio en col B

        valoresFila[3] = titulo; //empieza en col C
        this.agregarFilaTitulos(1, valoresFila, worksheet);
       
        valoresFila[3] = subtituloPeriodo;
        this.agregarFilaTitulos(2, valoresFila, worksheet);

        valoresFila[3] = subtituloExpresado;
        this.agregarFilaTitulos(3, valoresFila, worksheet);
       
        //Agregar las imagenes del encabezado
        const objLogos = new Logos();

        let logoInstitucionalElement = workbook.addImage({
            base64: objLogos.GetLogoInstitucional(),
            extension: 'png'
        });
        this.agregarLogos(logoInstitucionalElement, worksheet);
                
        // Agregar fila de Encabezados        
        this.agregarFilaEncabezadosItem(encabezados, worksheet);


        /********************* 
         * Seccion para agregar los datos iterando data[]
        **********************/
        //Cargar los datos y aplicar estilos en funcion a ciertos valores
        console.log("Data inside ExcelEngine: ");
        console.log(data);       
        
        let nroRegistros = 1;
        var nombreUnidadActual = "Inicial";
        var montoTotal = 0;
        var controlPrimera = {isFirst:true};
        let contadorUnidades = 0;
        let totalParcialMonto = 0;
        let totalParcialGanado = 0;
        const nroFilasPrimeraHoja = 16;
        const nroFilasRestoHojas = 19;

        data.sort((a, b) => a.cargo.registro - b.cargo.registro).forEach(d => {
           
            //Determinar si se efectuo una Alta o Baja en el presente periodo
            //para establecer las etiquetas [A, B, A/B]
            //y para resaltar la fila si es que hubo uno de esos eventos
            //tambien se define el nro de dias trabajados si hubo cambios            
            let objAltaBaja = new EntidadAltaBaja();
            objAltaBaja.procesarEvento(d, this.MesNumeral, this.GestionNumeral);

            var montoSalario = this.formatearMonto(d.cargo.id_nivel_salarial.haber_basico);
            montoTotal = montoTotal + parseFloat(d.cargo.id_nivel_salarial.haber_basico);
            totalParcialMonto = totalParcialMonto + parseFloat(d.cargo.id_nivel_salarial.haber_basico);
             /*
                [['No', 4],
                ['A/B', 3],                                 
                ['No. CONTRATO', 25],
                ['CARNET', 10],
                ['APELLIDOS Y NOMBRES', 27],
                ['FECHA DE NACIMIENTO', 10],
                ['CARGO', 27],
                ['FECHA DE INGRESO', 10],
                ['FECHA DE CONCLUSION', 10],
                ['DIAS TRABAJADOS', 5],                                  
                ['MONTO CONTRATO', 9],
                ['TOTAL GANADO', 9],
                ['OBSERVACION', 10]                                  
                ]
            */ 

            const funcionario_cargo = [d.cargo.registro,
                                       objAltaBaja.etiquetaAltaBaja,
                                       d.cargo.contrato,
                                       d.ci,
                                       d.paterno + ' ' + d.materno + ' ' + d.nombre,
                                       d.fecha_nacimiento? this.formatearFecha(d.fecha_nacimiento):'',
                                       d.cargo.nombre,
                                       d.registro.fecha_ingreso? this.formatearFecha(d.registro.fecha_ingreso):'',
                                       d.registro.fecha_conclusion? this.formatearFecha(d.registro.fecha_conclusion):'',
                                       objAltaBaja.diasTrabajados,
                                       montoSalario,
                                       montoSalario,
                                       '',
                                       ];
            
            //Comprobar si hay una nueva unidad para imprimir el Nombre de la seccion
            //Y los subtotales
            if(d.cargo.id_dependencia?.nombre !== nombreUnidadActual){

                //Imprimir SubTotales antes de imprimir el nombre de la nueva seccion
                //Si es la primera unidad, no se imprime subtotales
                if(contadorUnidades > 0){
                    console.log("Agregando subTotalUnidades : ",nroRegistros, contadorUnidades, ", ", totalParcialMonto, ", ", d.cargo.id_dependencia?.nombre);
                    let montoFormateado = this.formatearMonto(totalParcialMonto);
                    const contenidoFilaSubtotales = ['','*Sub-Total','','','','','','','','', montoFormateado, totalParcialMonto,''];

                    let filaSubtotales = worksheet.addRow(contenidoFilaSubtotales);
                    this.formatearFilaDatosEventual(filaSubtotales, objAltaBaja.modificacion, true, true);
                    
                    //centrar y merge la fila
                    let fila = filaSubtotales.getCell(1).$col$row;                                  
                    let nroFilai = fila.split('$');                    
                    worksheet.mergeCells(`B${nroFilai[2]}:J${nroFilai[2]}`);
                    
                    nroRegistros = this.verificarImprimirEncabezados(encabezados, nroRegistros, controlPrimera,
                        nroFilasPrimeraHoja, nroFilasRestoHojas, worksheet);
                }

                const titulo_seccion_unidad = [d.cargo.id_dependencia?.nombre,'','','','','','','','','','','',''];
                
                var filaTituloDependencia = worksheet.addRow(titulo_seccion_unidad);
                this.formatearFilaDatosEventual(filaTituloDependencia, objAltaBaja.modificacion, true, false);
                var filaCompleta = filaTituloDependencia.getCell(1).$col$row;         

                //centrar y merge la fila
                let nroFila = filaCompleta.split('$');                
                worksheet.mergeCells(`A${nroFila[2]}:L${nroFila[2]}`);
                nroFila = [];
               
                nombreUnidadActual = d.cargo.id_dependencia?.nombre;

                totalParcialMonto = 0;
                
                nroRegistros = this.verificarImprimirEncabezados(encabezados, nroRegistros, controlPrimera, 
                    nroFilasPrimeraHoja, nroFilasRestoHojas, worksheet);
                contadorUnidades += 1;
            }

            var row = worksheet.addRow(funcionario_cargo);
            this.formatearFilaDatosEventual(row, objAltaBaja.modificacion, false, false);
            nroRegistros = this.verificarImprimirEncabezados(encabezados, nroRegistros, controlPrimera,
                    nroFilasPrimeraHoja, nroFilasRestoHojas, worksheet);
        });

        /*** 
         * Guardar archivo generado
        */
       //Establecer ancho de columnas
       this.establecerAnchoColumnas(anchos, worksheet);        

       //agregar fila de salario total acumulado
       var filaTotal = worksheet.addRow(['TOTAL','','','','','','','','','','','0.00' ,'']);
       this.formatearFilaDatosItem(filaTotal, false, false);

       // Generar archivo Excel con el nombre
       workbook.xlsx.writeBuffer().then((data: any) => {
           const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
           fs.saveAs(blob, `PlanillaAltasBajas_Eventual_${this.MesLiteral}_${this.GestionNumeral}.xlsx`);
       });

    }

    private async generarExcelEventualSalud(data: any[]){

    }

    //Utils
    private formatearFecha(fecha: string):string{
        return formatDate(fecha, "dd/MM/yyyy", 'en-US');
    }

    private formatearMonto(monto: any) : any {

        const formateador = new Intl.NumberFormat('es-ES', {
            style: 'decimal',
            // currency: 'BOB',
            useGrouping: true ,            
            minimumFractionDigits: 2,                              
        }
        );

        return formateador.format(monto);
    }

    private verificarImprimirEncabezados(encabezados: any, nroRegistros: number, controlPrimera: any,
        nroFilasPrimera: number,
        nroFilasOtras: number, 
        worksheet: Worksheet): number {
                
        //Agregar nueva fila de encabezados (nueva pagina para impresion)       
        if(nroRegistros === nroFilasPrimera && controlPrimera.isFirst){           
            controlPrimera.isFirst = false;           
            return 1;

        }else if(nroRegistros%nroFilasOtras === 0){            
            this.agregarFilaEncabezados(encabezados, worksheet,false);            
            //Resetear contador de filas
            return 1;
        }
        
        //No se agrego nada, solo incrementar
        return nroRegistros+=1;
    }

    private mesNumeralToLiteral(mes: any): string{

        var monthNames = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
                            "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
                            ];
        return monthNames[parseInt(mes)-1];
    }

    private formatearFilaDatosItem(row: Row, modificacion: boolean, esTituloDependencia: boolean) : any {
        
        row.font = { name: 'Arial', family: 4, size: 7, underline: 'none', bold: false };
        row.alignment = {vertical: 'middle'};            
        row.height = 20;

        //Por defecto los valores de las celdas estan alineados a la izquierda
        //Obtener las celdas que necesitan estar centradas            
        const centeredCells = [1,2,4,5,7,8,10,11,12];

        row.eachCell((cell, id) => {             
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            
            if(modificacion){
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'ff949494' },
                    bgColor: { argb: 'ff949494' }
                    };
            }
            
            
            if(centeredCells.find((element) => element === id )){
                cell.alignment = {horizontal: 'center', vertical: 'middle'};
            }

            //Cargo: mostrar en doble linea si es necesario
            if(id === 3){
                cell.alignment = {horizontal: 'left', vertical: 'middle', wrapText: true};
                
                if(esTituloDependencia){
                    cell.font = { name: 'Arial', family: 4, size: 7, underline: 'none', bold: true };
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'ff949494' },
                        bgColor: { argb: 'ff949494' }
                        };
                }
            }

            //Fecha Conclusion
            if(id === 9){
                cell.alignment = {horizontal: 'right', vertical: 'middle'};
            }

            //Columna `Dias Trabajados` en negrita
            if(id === 12){
                cell.font = { name: 'Arial', family: 4, size: 7, underline: 'none', bold: true };
            }                
        });
    }

    private formatearFilaDatosEventual(row: Row, modificacion: boolean, esTituloDependencia: boolean, esSubtotal: boolean) : any {
        
        row.font = { name: 'Arial', family: 4, size: 7, underline: 'none', bold: false };
        row.alignment = {vertical: 'middle'};            
        row.height = 25;

        //Por defecto los valores de las celdas estan alineados a la izquierda
        //Obtener las celdas que necesitan estar centradas            
        const centeredCells = [1,2,4,6,8,9,10,11,12,13];

        row.eachCell((cell, id) => {             
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            
            if(modificacion){
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'ff949494' },
                    bgColor: { argb: 'ff949494' }
                    };
            }

            if(centeredCells.find((element) => element === id )){
                cell.alignment = {horizontal: 'center', vertical: 'middle'};
            }

            /*
                [['No', 4],
                ['A/B', 3],                                 
                ['No. CONTRATO', 25],
                ['CARNET', 10],
                ['APELLIDOS Y NOMBRES', 27],
                ['FECHA DE NACIMIENTO', 10],
                ['CARGO', 27],
                ['FECHA DE INGRESO', 10],
                ['FECHA DE CONCLUSION', 10],
                ['DIAS TRABAJADOS', 5],                                  
                ['MONTO CONTRATO', 9],
                ['TOTAL GANADO', 9],
                ['OBSERVACION', 10]                                  
                ]
            */ 


            //Cargo: mostrar en doble linea si es necesario
            if(id === 7 || id === 5){
                cell.alignment = {horizontal: 'left', vertical: 'middle', wrapText: true}; 
                
                if(cell.value && cell.value.toString().length > 65){
                    cell.font = { name: 'Arial', family: 4, size: 6, underline: 'none'};
                }            
            }

            //Columna `Dias Trabajados` en negrita
            if(id === 10){
                cell.font = { name: 'Arial', family: 4, size: 7, underline: 'none', bold: true };
            }
            
            if(esTituloDependencia){
                cell.font = { name: 'Arial', family: 4, size: 7, underline: 'none', bold: true };                
            }

            if(esSubtotal){
                cell.font = { name: 'Arial', family: 4, size: 7, underline: 'none', bold: true };
                if(id === 2 || id === 11 || id === 12){
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'ff949494' },
                        bgColor: { argb: 'ff949494' }
                        };
                }
            }
                
        });       

    }

    private agregarFilaEncabezadosItem(encabezados: [], worksheet: Worksheet): any {

        // Agregar fila de Encabezados
        const filaEncabezados = worksheet.addRow(encabezados);

        //filaEncabezados.addPageBreak();

        // Estilo de las celdas : Fill and Border
        filaEncabezados.eachCell((cell, number) => {
            cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'ff949494' },
            bgColor: { argb: 'ff949494' }
            };
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            cell.font = { name: 'Arial', family: 4, size: 7, underline: 'none', bold: true };
            cell.alignment = {horizontal: 'center',vertical:'middle', wrapText: true};            
        });

        return;
    }

    private agregarFilaEncabezados(encabezados: [], worksheet: Worksheet, esEventual: boolean): any {

        // Agregar fila de Encabezados
        const filaEncabezados = worksheet.addRow(encabezados);

        if(esEventual){
            filaEncabezados.height = 25;
        }

        //filaEncabezados.addPageBreak();

        // Estilo de las celdas : Fill and Border
        filaEncabezados.eachCell((cell, number) => {
            cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'ff949494' },
            bgColor: { argb: 'ff949494' }
            };
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            cell.font = { name: 'Arial', family: 4, size: 7, underline: 'none', bold: true };
            cell.alignment = {horizontal: 'center',vertical:'middle', wrapText: true};            
        });

        return;
    }

    private establecerAnchoColumnas(data: [], worksheet: Worksheet):any{
       
        data.forEach(function(value, i){            
            worksheet.getColumn(i+1).width = value;
         });
    }

    private agregarFilaTitulos(nroFila: number, filaDatos: string[], worksheet: Worksheet): any{        

        let filaSubPeriodo = worksheet.insertRow(nroFila, filaDatos);        
        filaSubPeriodo.font = { name: 'Arial', family: 4, size: 14, underline: 'none', bold: true };
        
        //centrar y merge la fila de titulos
        worksheet.getCell(`C${nroFila}`).alignment = {horizontal: 'center'};
        //merge desde la columna C hasta la J
        worksheet.mergeCells(`C${nroFila}:J${nroFila}`);

        return;
    }

    private agregarLogos(id: number, worksheet: Worksheet): any{
        //Agregar las imagenes del encabezado        
        worksheet.addImage(id, {
            tl: { col: 0, row: 0 },
            ext: { width: 180, height: 60 },
            });
        
        return;
    }

}
