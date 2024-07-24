import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class EscalaService {
  constructor() {}

  getDateItems(levels: any, sueldoMensual: any): any {
    const anios = 12;
    const element = [
      {
        categoria: "SUPERIOR",
        niveles: [{ nivel: "NIVEL 1" }, { nivel: "NIVEL 2" }],
        denominaciones: [
          { denominacion: "Alcalde Municipal" },
          { denominacion: "Secretario (a) Municipal" },
        ],
        items: [{ item: levels[1] }, { item: levels[2] }],
        sueldos: [{ sueldo: sueldoMensual[1] }, { sueldo: sueldoMensual[2] }],
        mensuales: [
          { mensual: levels[1] * sueldoMensual[1] },
          { mensual: levels[2] * sueldoMensual[2] },
        ],
        anuales: [
          { anual: levels[1] * sueldoMensual[1] * anios },
          { anual: levels[2] * sueldoMensual[2] * anios },
        ],
      },
      {
        categoria: "EJECUTIVO",
        niveles: [{ nivel: "NIVEL 3" }, { nivel: "NIVEL 4" }],
        denominaciones: [
          { denominacion: "Directores (Asesores)" },
          { denominacion: "Jefes de Unidad, Sub-Alcaldes Urbanos" },
        ],
        items: [{ item: levels[3] }, { item: levels[4] }],
        sueldos: [{ sueldo: sueldoMensual[3] }, { sueldo: sueldoMensual[4] }],
        mensuales: [
          { mensual: levels[3] * sueldoMensual[3] },
          { mensual: levels[4] * sueldoMensual[4] },
        ],
        anuales: [
          { anual: levels[3] * sueldoMensual[3] * anios },
          { anual: levels[4] * sueldoMensual[4] * anios },
        ],
      },
      {
        categoria: "OPERATIVO",
        niveles: [
          { nivel: "NIVEL 5" },
          { nivel: "NIVEL 6" },
          { nivel: "NIVEL 7" },
          { nivel: "NIVEL 8" },
          { nivel: "NIVEL 9" },
          { nivel: "NIVEL 10" },
          { nivel: "NIVEL 11" },
          { nivel: "NIVEL 12" },
          { nivel: "NIVEL 13" },
          { nivel: "NIVEL 14" },
        ],
        denominaciones: [
          { denominacion: "Profesionales I, Sub-Alcaldes Rurales" },
          { denominacion: "Profesionales II " },
          { denominacion: "Profesionales III" },
          {
            denominacion:
              "Profesional IV,  Equipo Pesado, Secretaria del alcalde",
          },
          { denominacion: "Tecnico I" },
          {
            denominacion:
              "Tecnico II Equipo Semi Pesado, Secretarias SM, Choferes SM",
          },
          { denominacion: "Tecnico III Secretarias Direcciones" },
          { denominacion: "Tecnico IV Choferes Equipo Liviano,Topografos" },
          {
            denominacion:
              "Auxiliar I ,Matadero, Almacenes, Medio Amb, Ventanilla Unica",
          },
          {
            denominacion:
              "Auxiliar II ,Sereno, Informaciones, Arch. Urbanismo, Limpieza, Jardineria",
          },
        ],
        items: [
          { item: levels[5] },
          { item: levels[6] },
          { item: levels[7] },
          { item: levels[8] },
          { item: levels[9] },
          { item: levels[10] },
          { item: levels[11] },
          { item: levels[12] },
          { item: levels[13] },
          { item: levels[14] },
        ],
        sueldos: [
          { sueldo: sueldoMensual[5] },
          { sueldo: sueldoMensual[6] },
          { sueldo: sueldoMensual[7] },
          { sueldo: sueldoMensual[8] },
          { sueldo: sueldoMensual[9] },
          { sueldo: sueldoMensual[10] },
          { sueldo: sueldoMensual[11] },
          { sueldo: sueldoMensual[12] },
          { sueldo: sueldoMensual[13] },
          { sueldo: sueldoMensual[14] },
        ],
        mensuales: [
          { mensual: levels[5] * sueldoMensual[5] },
          { mensual: levels[6] * sueldoMensual[6] },
          { mensual: levels[7] * sueldoMensual[7] },
          { mensual: levels[8] * sueldoMensual[8] },
          { mensual: levels[9] * sueldoMensual[9] },
          { mensual: levels[10] * sueldoMensual[10] },
          { mensual: levels[11] * sueldoMensual[11] },
          { mensual: levels[12] * sueldoMensual[12] },
          { mensual: levels[13] * sueldoMensual[13] },
          { mensual: levels[14] * sueldoMensual[14] },
        ],
        anuales: [
          { anual: levels[5] * sueldoMensual[5] * anios },
          { anual: levels[6] * sueldoMensual[6] * anios },
          { anual: levels[7] * sueldoMensual[7] * anios },
          { anual: levels[8] * sueldoMensual[8] * anios },
          { anual: levels[9] * sueldoMensual[9] * anios },
          { anual: levels[10] * sueldoMensual[10] * anios },
          { anual: levels[11] * sueldoMensual[11] * anios },
          { anual: levels[12] * sueldoMensual[12] * anios },
          { anual: levels[13] * sueldoMensual[13] * anios },
          { anual: levels[14] * sueldoMensual[14] * anios },
        ],
      },
    ];

    return element;
  }
}
