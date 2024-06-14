import { Injectable } from "@angular/core";
import { FormGroup } from "@angular/forms";

@Injectable({
  providedIn: "root",
})
export class UtilsService {
  constructor() {}

  // convierte la primera letra en mayuscula y el resto en minuscula, ejemplo: Este Es El Ejemplo
  ordenPalabras(str: string): string {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  getCurrentISODateTime(): string {
    return new Date().toISOString();
  }

  convertFromISO8601(isoDateString: string): Date {
    const date = new Date(isoDateString);

    if (isNaN(date.getTime())) {
      throw new Error("Formato invalido ISO 8601");
    }

    return date;
  }

  //converitr fecha al formato: 23 de marzo de 2024
  convertirFecha(dateString: string): string {
    const months = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      throw new Error("Invalid date format!");
    }

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} de ${month} de ${year}`;
  }

  //convierte valores numericos en letras, por ejemplo 33: treinta y tres.
  numerosALetras(num: number): string {
    const units = [
      "cero",
      "uno",
      "dos",
      "tres",
      "cuatro",
      "cinco",
      "seis",
      "siete",
      "ocho",
      "nueve",
    ];
    const tens = [
      "",
      "",
      "veinte",
      "treinta",
      "cuarenta",
      "cincuenta",
      "sesenta",
      "setenta",
      "ochenta",
      "noventa",
    ];
    const teens = [
      "diez",
      "once",
      "doce",
      "trece",
      "catorce",
      "quince",
      "dieciséis",
      "diecisiete",
      "dieciocho",
      "diecinueve",
    ];
    const hundreds = [
      "",
      "ciento",
      "doscientos",
      "trescientos",
      "cuatrocientos",
      "quinientos",
      "seiscientos",
      "setecientos",
      "ochocientos",
      "novecientos",
    ];

    if (num === 0) return units[0];

    let words = "";

    if (num >= 1000) {
      let thousands = Math.floor(num / 1000);
      words += (thousands === 1 ? "mil" : units[thousands] + " mil") + " ";
      num %= 1000;
    }

    if (num >= 100) {
      let hundred = Math.floor(num / 100);
      words += hundreds[hundred] + " ";
      num %= 100;
    }

    if (num >= 20) {
      let ten = Math.floor(num / 10);
      words += tens[ten] + (num % 10 === 0 ? "" : " y ") + " ";
      num %= 10;
    } else if (num >= 10) {
      words += teens[num - 10] + " ";
      num = 0;
    }

    if (num > 0 && num < 10) {
      words += units[num] + " ";
    }

    return words.trim();
  }

  convertToUpperCase(form: FormGroup, fieldName: string): void {
    if (
      form.value[fieldName] &&
      form.value[fieldName] !== null &&
      form.value[fieldName] !== undefined
    ) {
      form.value[fieldName] = form.value[fieldName].toUpperCase();
    }
  }

  convertToNumber(form: FormGroup, fieldName: string): void {
    if (
      form.value[fieldName] &&
      form.value[fieldName] !== null &&
      form.value[fieldName] !== undefined
    ) {
      form.value[fieldName] = parseInt(form.value[fieldName]);
    }
  }

  convertToDecimal(form: FormGroup, fieldName: string): void {
    if (
      form.value[fieldName] &&
      form.value[fieldName] !== null &&
      form.value[fieldName] !== undefined
    ) {
      form.value[fieldName] = parseFloat(form.value[fieldName]);
    }
  }

  getColor(contrato: string): string {
    switch (contrato) {
      case "EVENTUAL":
        return "#52BE80";
      case "REMANENTE":
        return "#F5B041";
      case "ITEM":
        return "#5DADE2";
      default:
        return "#000000"; // Color por defecto
    }
  }
}
