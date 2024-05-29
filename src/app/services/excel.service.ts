import { Injectable } from '@angular/core';
import { Workbook } from 'exceljs';
import {formatDate} from '@angular/common';
import * as fs from 'file-saver';

import { DatePipe } from '@angular/common';
import { style } from '@angular/animations';
@Injectable({
  providedIn: 'root'
})

export class ExcelService {    

    //Propiedades
    private TipoContrato: string;
    private MesLiteral: string;
    private GestionNumeral: string; 

    constructor(private datePipe: DatePipe) {

    }

    public setTipoContrato(tipo: string){
        this.TipoContrato = tipo;
    }

    async generarExcel(data: any[], tipoContrato: string){

        this.TipoContrato = tipoContrato;

        if(this.TipoContrato === "ITEM"){
            this.generarExcelItem(data);
        }
    }

    private async generarExcelItem(data: any[]){
        this.GestionNumeral = "2024";
        this.MesLiteral = "abril";

        // Excel titulo, Encabezado
        const titulo = `PLANILLA DE PERSONAL PERMANENTE ALTAS-BAJAS Y CAMBIOS`;
        const subtituloPeriodo = `CORRESPONDIENTE AL MES DE ${this.MesLiteral.toUpperCase()} de ${this.GestionNumeral}`;
        const subtituloExpresado = "(EXPRESADO EN BOLIVIANOS)";

        const encabezados = ['B/A', 'No Item', 'Cargo', 'Contrato', 'C.I.', 'NOMBRE COMPLETO', 
                            'FECHA DE NACIMIENTO', 'FECHA DE INGRESO', 'FECHA DE CONCLUSION',
                            'Nivel', 'Sueldo [Bs/Mes]', 'DIAS TRABAJADOS'];


        // Crear workbook and worksheet
        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet('Altas-Bajas');
        worksheet.pageSetup = {paperSize: 5, orientation: 'landscape'};
        worksheet.views = [{showGridLines: false}];

        // Agregar filas del Titulo y formato       
        var valoresFila = [];
        valoresFila[1] = '';
        valoresFila[2] = '';
        valoresFila[3] = titulo;

        //const formatoFuente = { name: 'Arial', family: 4, size: 14, underline: 'none', bold: true };

        const filaTitulo = worksheet.insertRow(1,valoresFila);        
        filaTitulo.font = { name: 'Arial', family: 4, size: 14, underline: 'none', bold: true };
        worksheet.getCell("C1").alignment = {horizontal: 'center'};

        valoresFila[3] = subtituloPeriodo;
        const filaSubPeriodo = worksheet.insertRow(2,valoresFila);        
        filaSubPeriodo.font = { name: 'Arial', family: 4, size: 14, underline: 'none', bold: true };
        worksheet.getCell("C2").alignment = {horizontal: 'center'};

        valoresFila[3] = subtituloExpresado;
        const filaSubExpresado = worksheet.insertRow(3,valoresFila);        
        filaSubExpresado.font = { name: 'Arial', family: 4, size: 14, underline: 'none', bold: true };
        worksheet.getCell("C3").alignment = {horizontal: 'center'};

        
        worksheet.mergeCells("C1:J1");
        worksheet.mergeCells("C2:J2");
        worksheet.mergeCells("C3:J3");
                
        // Agregar fila de Encabezados
        const filaEncabezados = worksheet.addRow(encabezados);

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



        //Cargar los datos y aplicar estilos en funcion a ciertos valores
        console.log("Data inside ExcelEngine: ");
        console.log(data);

        /*
        const encabezados = ['B/A', 'No Item', 'Cargo', 'Contrato', 'C.I.', 'NOMBRE COMPLETO', 
                            'FECHA DE NACIMIENTO', 'FECHA DE INGRESO', 'FECHA DE CONCLUSION',
                            'Nivel', 'Sueldo [Bs/Mes]', 'DIAS TRABAJADOS'];
        */ 

        data.forEach(d => {
            const funcionario_cargo = ['B',
                                    d.cargo.registro,
                                    d.cargo.nombre,
                                    d.cargo.contrato, 
                                    d.ci,
                                    d.paterno + ' ' + d.materno + ' ' + d.nombre,
                                    d.fecha_nacimiento? this.formatearFecha(d.fecha_nacimiento):'' ,
                                    d.registro.fecha_ingreso? this.formatearFecha(d.registro.fecha_ingreso):'' ,
                                    d.registro.fecha_conclusion? this.formatearFecha(d.registro.fecha_conclusion):'',
                                    d.cargo.nivel, 
                                     '3020.00',
                                    30];

            var row = worksheet.addRow(funcionario_cargo);

            row.font = { name: 'Arial', family: 4, size: 7, underline: 'none', bold: false };
            row.alignment = {vertical: 'middle'};            
            row.height = 20;

            //Por defecto los valores de las celdas estan alineados a la izquierda
            //Obtener las celdas que necesitan estar centradas            
            const centeredCells = [1,2,4,5,7,8,10,11,12];

            row.eachCell((cell, id) => {             
                cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                
                if(centeredCells.find((element) => element === id )){
                    cell.alignment = {horizontal: 'center', vertical: 'middle'};
                }

                //Cargo mostrar en doble linea si es necesario
                if(id === 3){
                    cell.alignment = {horizontal: 'left', vertical: 'middle', wrapText: true};
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

            //console.log(d);
            }
        );

        //Establecer ancho de columnas
        worksheet.getColumn(1).width = 5; //B A
        worksheet.getColumn(2).width = 5; //N Item
        worksheet.getColumn(3).width = 40; //CARGO
        worksheet.getColumn(4).width = 10; //ITEM
        worksheet.getColumn(5).width = 10; //CI
        worksheet.getColumn(6).width = 27; //Nombre
        worksheet.getColumn(7).width = 12; //Fecha Nac.
        worksheet.getColumn(8).width = 12; //Fecha Ing.
        worksheet.getColumn(9).width = 12; //Fecha Concl.
        worksheet.getColumn(10).width = 7; //Nivel
        worksheet.getColumn(11).width = 12; //Sueldo
        worksheet.getColumn(12).width = 6; //Dias Trabajados

        //agregar fila vacia
        worksheet.addRow([]);

        // Generar archivo Excel con el nombre
        workbook.xlsx.writeBuffer().then((data: any) => {
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        fs.saveAs(blob, 'PlanillaAltasBajas_Abril_2024.xlsx');
      });

        


    }

    //Utils
    private formatearFecha(fecha: string):string{
        return formatDate(fecha, "dd/MM/yyyy", 'en-US');
    }

}