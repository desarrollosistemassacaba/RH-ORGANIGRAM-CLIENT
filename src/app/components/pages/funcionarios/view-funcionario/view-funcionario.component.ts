import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Component, Inject, OnInit, ChangeDetectorRef } from "@angular/core";

import { DependenciasService } from "src/app/services/dependencias.service";
import { NivelesService } from "src/app/services/niveles.service";
import { RegistrosService } from "src/app/services/registros.service";
import { UnidadesService } from "src/app/services/unidades.service";
import { FuncionariosService } from "src/app/services/funcionarios.service";

import {
  contratoAuxiliar,
  contratoTecnico,
  contratoProfesional,
  documentoDesignacion,
  documentoReasignacion,
  documentoAscenso,
} from "../../../../utils/contratos";
import {
  convertirFecha,
  ordenPalabras,
  numerosALetras,
  getIniciales,
} from "src/app/utils/utils";

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: "app-view-funcionario",
  templateUrl: "./view-funcionario.component.html",
  styleUrl: "./view-funcionario.component.css",
})
export class ViewFuncionarioComponent implements OnInit {
  funcionario: string;
  nombre: string;
  paterno: string;
  materno: string;
  casada: string;
  titulo: string;
  ci: string;
  ext: string;
  fecha_nac: string;
  fecha_ingreso: string;
  fecha_ingreso_text: string;
  fecha_conclusion: string;
  fecha_conclusion_text: string;
  registro: string;
  contrato: string;
  cargo: string;
  unidad: string;
  salario: string;
  nivel: string;
  sigla: string;
  dependencia: string;
  id_secretaria_contratante: string;
  contratante: string;
  cargo_contratante: string;
  genero_contratante: string;
  cite: string;
  decreto_edil: string;
  tipo_contrato: string;

  abreviatura_1: string;

  habilitado: boolean = false;
  nulo: string = "Sin Registro";

  constructor(
    public dialogRef: MatDialogRef<ViewFuncionarioComponent>,
    private cdr: ChangeDetectorRef,
    private nivelService: NivelesService,
    private unidadService: UnidadesService,
    private registroService: RegistrosService,
    private funcionarioService: FuncionariosService,
    private dependenciaService: DependenciasService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.load();
  }

  async load() {
    //console.log(this.data);
    if (this.data) {
      this.nombre = this.data.nombre || "";
      this.paterno = this.data.paterno || "";
      this.materno = this.data.materno || "";
      this.casada = this.data.casada || "";
      this.ci = this.data.ci || "";
      this.ext = this.data.ext || "";
      this.cargo = this.data.registros[0]?.id_cargo.nombre || this.nulo;
      this.contrato = this.data.registros[0]?.id_cargo.contrato || this.nulo;
      this.fecha_ingreso = this.data.registros[0]?.fecha_ingreso || this.nulo;
      this.fecha_conclusion =
        this.data.registros[0]?.fecha_conclusion || this.nulo;
      this.fecha_nac = this.data.fecha_nacimiento || this.nulo;
      this.registro = this.data.registros[0]?.id_cargo.registro || this.nulo;
      this.unidad = this.data.registros[0]?.id_cargo.id_unidad || this.nulo;
      this.funcionario =
        this.nombre +
        " " +
        this.paterno +
        " " +
        this.materno +
        " " +
        this.casada;
      this.id_secretaria_contratante =
        this.data.registros[0]?.id_secretaria_contratante || this.nulo;
      this.tipo_contrato = this.data.registros[0]?.tipo_contrato || this.nulo;
      this.cite = this.data.registros[0]?.cite || this.nulo;
      this.decreto_edil = this.data.registros[0]?.decreto_edil || this.nulo;

      //Obteniendo datos del secretario o alcalde para el contrato
      if (this.id_secretaria_contratante !== this.nulo) {
        const registro_secretaria = await this.registroService
          .getRegistroById(this.id_secretaria_contratante)
          .toPromise();

        const secretario_datos = await this.funcionarioService
          .getFuncionarioById(registro_secretaria.id_funcionario)
          .toPromise();

        this.contratante =
          (secretario_datos.nombre ? secretario_datos.nombre : "") +
          " " +
          (secretario_datos.paterno ? secretario_datos.paterno : "") +
          " " +
          (secretario_datos.materno ? secretario_datos.materno : "") +
          " " +
          (secretario_datos.casada ? secretario_datos.casada : "");

        this.abreviatura_1 = getIniciales(this.contratante);

        this.genero_contratante = secretario_datos.genero
          ? secretario_datos.genero
          : "";

        this.cargo_contratante = registro_secretaria.id_cargo.nombre;
      }

      //convirtiendo a texto fechas
      if (this.fecha_ingreso !== this.nulo) {
        this.fecha_ingreso_text = convertirFecha(this.fecha_ingreso);
      }

      if (this.fecha_conclusion !== this.nulo) {
        this.fecha_conclusion_text = convertirFecha(this.fecha_conclusion);
      }

      //Obteniendo unidad para el cargo de item
      if (this.unidad !== this.nulo) {
        this.unidadService
          .getFiltroCampos("estado", "true")
          .subscribe((element) => {
            const value = element.filter(
              (data: any) => data._id === this.unidad
            );
            if (value.length > 0) {
              this.unidad = ordenPalabras(value[0].nombre);
            }
          });
      }

      //conversion de fecha ISO a formato: 23 de enero de 1989
      if (this.fecha_nac !== this.nulo) {
        this.fecha_nac = convertirFecha(this.fecha_nac);
      }

      //agregamos un cero a los digitos de numero de registro menores a 3
      if (this.registro !== this.nulo) {
        if (
          this.registro.toString().length >= 1 &&
          this.registro.toString().length <= 2
        ) {
          this.registro = "0" + this.registro.toString();
        }
      }

      //Obtenemos el nombre de la sigla para generarlo en texto: Secretaria Municipal De Finanzas Y Administración
      this.dependenciaService
        .getFiltroCampos("sigla", this.data.sigla)
        .subscribe((element) => {
          const campo = element[0]?.nombre || this.nulo;
          this.dependencia = campo !== this.nulo ? ordenPalabras(campo) : campo;
        });

      //Obtenemos valores del id_nivel_salario correspondientes al cargo del contratado
      if (this.data.registros[0]?.id_cargo) {
        this.nivelService
          .getNivelesById(this.data.registros[0]?.id_cargo.id_nivel_salarial)
          .subscribe((element) => {
            this.nivel = element.nombre;
            this.salario = element.haber_basico;
          });
      }
    }
    //control de estados para permitir descargar contratos
    if (
      this.contrato !== undefined &&
      this.contrato &&
      this.registro &&
      this.registro !== this.nulo &&
      this.fecha_ingreso &&
      this.fecha_ingreso !== this.nulo &&
      this.id_secretaria_contratante &&
      this.id_secretaria_contratante !== this.nulo &&
      this.cite !== this.nulo
    ) {
      if (
        this.contrato === "ITEM" ||
        this.contrato === "REMANENTE" ||
        this.contrato === "EVENTUAL"
      ) {
        this.habilitado = true;
      } else {
        this.habilitado = false;
      }
    }

    //console.log(this.data);
    this.cdr.detectChanges();
  }

  downloadPDF() {
    let tamañoHoja;
    let text;
    let abreviatura;
    let pronombre;
    const abreviatura_1 = this.abreviatura_1;
    const abreviatura_2 = "pav";
    const abreviatura_3 = "vnsl";

    const edil =
      this.decreto_edil && this.decreto_edil !== this.nulo
        ? ", " + this.decreto_edil
        : "";
    const contratante = ordenPalabras(this.contratante);
    const ci_ext = this.ext ? this.ci + " - " + this.ext : this.ci;
    const salarioText = numerosALetras(parseFloat(this.salario));

    if (this.genero_contratante === "F") {
      pronombre = "la";
      abreviatura = "Sra.";
    } else {
      pronombre = "el";
      abreviatura = "Sr.";
    }

    if (this.contrato === "EVENTUAL" || this.contrato === "REMANENTE") {
      tamañoHoja = { width: 628.51, height: 936.13 };

      if (this.nivel && this.nivel !== undefined) {
        const detalle_contrato = {
          contrato: this.cite,
          secretario_nombre: contratante,
          secretario_cargo: this.cargo_contratante,
          edil: edil,
          nombre: this.funcionario,
          ci: ci_ext,
          cargo: this.cargo,
          salario: this.salario,
          salario_texto: salarioText,
          fecha_conclusion: this.fecha_conclusion_text,
          fecha_contrato: this.fecha_ingreso_text,
          pronombre: pronombre,
          abreviatura: abreviatura,
          abreviatura_1: abreviatura_1,
          abreviatura_2: abreviatura_2,
          abreviatura_3: abreviatura_3,
        };
        if (parseFloat(this.nivel) === 14 || parseFloat(this.nivel) === 13) {
          text = contratoAuxiliar(detalle_contrato);
        }

        if (
          parseFloat(this.nivel) === 12 ||
          parseFloat(this.nivel) === 11 ||
          parseFloat(this.nivel) === 10 ||
          parseFloat(this.nivel) === 9
        ) {
          text = contratoTecnico(detalle_contrato);
        }

        if (
          parseFloat(this.nivel) === 8 ||
          parseFloat(this.nivel) === 7 ||
          parseFloat(this.nivel) === 6 ||
          parseFloat(this.nivel) === 5
        ) {
          text = contratoProfesional(detalle_contrato);
        }
      }
    }

    if (this.contrato === "ITEM") {
      tamañoHoja = "LETTER";
      const detalle_item = {
        contrato: this.cite,
        secretario_nombre: contratante,
        secretario_cargo: this.cargo_contratante,
        nombre: this.funcionario,
        fecha_contrato: this.fecha_ingreso_text,
        cargo: this.cargo,
        registro: this.registro,
        unidad: this.unidad,
      };

      if (this.tipo_contrato === "MD") {
        text = documentoDesignacion(detalle_item);
      }
      if (this.tipo_contrato === "MR") {
        text = documentoReasignacion(detalle_item);
      }
      if (this.tipo_contrato === "MA") {
        text = documentoAscenso(detalle_item);
      }
    }

    let docDefinition = {
      pageSize: tamañoHoja, // Tamaño de hoja oficio
      pageMargins: [88, 120, 60, 100], // Márgenes: [izquierda, superior, derecha, inferior]
      content: text,
      styles: {
        titulo: {
          fontSize: 11,
          bold: true,
          alignment: "center",
          decoration: "underline",
          margin: [0, 0, 0, 1],
        },
        titulo1: {
          fontSize: 16,
          bold: true,
          alignment: "center",
          margin: [0, 0, 0, 1],
        },
        negrita: {
          bold: true,
        },
        centrado: {
          alignment: "center",
        },
        subrayado: {
          decoration: "underline",
        },
        normal: {
          fontSize: 11,
          alignment: "justify",
          margin: [0, 0, 0, 1],
          lineHeight: 1,
        },
        normal1: {
          fontSize: 10,
          alignment: "justify",
          margin: [0, 0, 0, 1],
        },
        nota: {
          fontSize: 6,
          margin: [0, 0, 0, 1],
        },
        margen: {
          fontSize: 10,
          alignment: "justify",
          margin: [55, 0, 0, 1],
        },
      },
    };

    pdfMake.createPdf(docDefinition).download(this.funcionario + ".pdf");
  }
}
