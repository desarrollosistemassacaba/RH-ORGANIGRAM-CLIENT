import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Component, Inject, OnInit, ChangeDetectorRef } from "@angular/core";

import { DependenciasService } from "src/app/services/dependencias.service";
import { NivelesService } from "src/app/services/niveles.service";
import { UnidadesService } from "src/app/services/unidades.service";
import { UtilsService } from "src/app/services/utils.service";

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { FormBuilder } from "@angular/forms";

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
  titulo: string;
  ci: string;
  ext: string;
  fecha_nac: string;
  fecha_ingreso: string;
  fecha_ingreso_text: string;
  fecha_conclusion: string;
  fecha_conclusion_text: string;
  registro: string;
  codigo: string;
  contrato: string;
  cargo: string;
  unidad: string;
  salario: string;
  nivel: string;
  sigla: string;
  dependencia: string;
  abreviatura: string;
  contratante: string;
  cargo_contratante: string;
  numero_contrato: string;
  detalle_contrato: string;
  tipo_contrato: string;
  habilitado: boolean = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ViewFuncionarioComponent>,
    private cdr: ChangeDetectorRef,
    private nivelService: NivelesService,
    private unidadService: UnidadesService,
    private dependenciaService: DependenciasService,
    private util: UtilsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    console.log(this.data);
    if (this.data) {
      const value = "Sin Registro";
      this.nombre = this.data.nombre || "";
      this.paterno = this.data.paterno || "";
      this.materno = this.data.materno || "";
      this.ci = this.data.ci || "";
      this.ext = this.data.ext || "";
      this.cargo = this.data.registros[0]?.id_cargo.nombre || value;
      this.contrato = this.data.registros[0]?.id_cargo.contrato || value;
      this.fecha_ingreso = this.data.registros[0]?.fecha_ingreso || value;
      this.fecha_conclusion = this.data.registros[0]?.fecha_conclusion || value;
      this.fecha_nac = this.data.fecha_nacimiento || value;
      this.registro = this.data.registros[0]?.id_cargo.registro || value;
      this.unidad = this.data.registros[0]?.id_cargo.id_unidad || value;
      this.funcionario = this.nombre + " " + this.paterno + " " + this.materno;
<<<<<<< HEAD
      this.codigo = this.data.registros[0]?.numero_contrato || value;
=======
>>>>>>> 0c843b4bb0801e9f10c09a2cae0f31726396e4d0
      this.abreviatura = this.data.registros[0]?.abreviatura || value;
      this.contratante = this.data.registros[0]?.contratante || value;
      this.cargo_contratante =
        this.data.registros[0]?.cargo_contratante || value;
      this.tipo_contrato = this.data.registros[0]?.tipo_contrato || value;
      this.numero_contrato = this.data.registros[0]?.numero_contrato || value;
      this.detalle_contrato = this.data.registros[0]?.detalle_contrato || value;

      if (this.fecha_ingreso !== value) {
<<<<<<< HEAD
        this.fecha_ingreso_text = this.util.convertirFecha(this.fecha_ingreso);
=======
        this.fecha_ingreso = this.util.convertirFecha(this.fecha_ingreso);
        if (this.contrato === "ITEM") {
          this.year = this.fecha_ingreso.slice(-4);
        } else {
          this.year = this.fecha_ingreso.slice(-2);
        }
>>>>>>> 0c843b4bb0801e9f10c09a2cae0f31726396e4d0
      }

      if (this.fecha_conclusion !== value) {
        this.fecha_conclusion_text = this.util.convertirFecha(
          this.fecha_conclusion
        );
<<<<<<< HEAD
      }

      if (this.unidad !== value) {
        this.unidadService
          .getFiltroCampos("estado", "true")
          .subscribe((element) => {
            const values = element.filter(
              (data: any) => data._id === this.unidad
            );
            if (values.length > 0) {
              console.log(values);
              this.unidad = this.util.ordenPalabras(values[0].nombre);
            }
          });
=======
      }

      if (this.unidad !== value) {
        this.unidadService
          .getFiltroCampos("estado", "true")
          .subscribe((element) => {
            const values = element.filter(
              (data: any) => data._id === this.unidad
            );
            if (values.length > 0) {
              console.log(values);
              this.unidad = this.util.ordenPalabras(values[0].nombre);
            }
          });
      }

      if (this.fecha_contrato !== value) {
        this.fecha_contrato_text = this.util.convertirFecha(
          this.fecha_contrato
        );
>>>>>>> 0c843b4bb0801e9f10c09a2cae0f31726396e4d0
      }

      if (this.fecha_nac !== value) {
        this.fecha_nac = this.util.convertirFecha(this.fecha_nac);
      }

      if (this.registro !== value) {
        if (
          this.registro.toString().length >= 1 &&
          this.registro.toString().length <= 2
        ) {
          this.registro = "0" + this.registro.toString();
        }
      }

      this.dependenciaService
        .getFiltroCampos("sigla", this.data.sigla)
        .subscribe((element) => {
          const campo = element[0]?.nombre || value;
          this.dependencia =
            campo !== value ? this.util.ordenPalabras(campo) : campo;
        });

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
      this.registro !== "Sin Registro" &&
      this.fecha_ingreso &&
      this.fecha_ingreso !== "Sin Registro" &&
      this.contratante &&
      this.contratante !== "Sin Registro" &&
      this.cargo_contratante &&
      this.cargo_contratante !== "Sin Registro" &&
      this.numero_contrato !== "Sin Registro"
    ) {
      if (this.contrato === "ITEM") {
<<<<<<< HEAD
=======
        this.codigo =
          "GAMS-" +
          this.sigla +
          "/DRH/" +
          this.tipo_contrato +
          "/" +
          this.numero_contrato +
          "/" +
          this.year;
      } else {
        this.codigo =
          "GAMS-" +
          this.sigla +
          "/CAPE/" +
          this.numero_contrato +
          "/" +
          this.year;
      }
    }
    //control de estados para permitir descargar contratos
    if (
      this.contrato !== undefined &&
      this.contrato &&
      this.registro &&
      this.registro !== "Sin Registro" &&
      this.fecha_contrato &&
      this.fecha_contrato !== "Sin Registro" &&
      this.contratante &&
      this.contratante !== "Sin Registro" &&
      this.cargo_contratante &&
      this.cargo_contratante !== "Sin Registro" &&
      this.numero_contrato !== "Sin Registro"
    ) {
      if (this.contrato === "ITEM") {
>>>>>>> 0c843b4bb0801e9f10c09a2cae0f31726396e4d0
        this.habilitado = true;
      }
      if (
        (this.contrato === "REMANENTE" || this.contrato === "EVENTUAL") &&
        this.abreviatura !== "Sin Registro"
      ) {
        this.habilitado = true;
      }
    }

    //console.log(this.data);
    this.cdr.detectChanges();
  }

  downloadPDF() {
    const detalle =
      this.detalle_contrato && this.detalle_contrato !== "Sin Registro"
        ? ", " + this.detalle_contrato
        : "";
    const contratante = this.util.ordenPalabras(this.contratante);
    const contratante_cargo = this.cargo_contratante;
<<<<<<< HEAD
    const fecha_contrato = this.fecha_ingreso_text;
=======

    this.fecha_contrato = this.fecha_contrato_text;
>>>>>>> 0c843b4bb0801e9f10c09a2cae0f31726396e4d0
    // Bfecha_conclusion: string = "31 de diciembre de 2024";

    const ci_ext = this.ext ? this.ci + " - " + this.ext : this.ci;
    const salarioText = this.util.numerosALetras(parseFloat(this.salario));
    let abreviatura;
    if (this.abreviatura === "SR.") {
      abreviatura = "el " + this.util.ordenPalabras(this.abreviatura);
    } else {
      abreviatura = "la " + this.util.ordenPalabras(this.abreviatura);
    }

    const abreviatura_1 = "GVB";
    const abreviatura_2 = "pav";
    const abreviatura_3 = "vnsl";

    let tamañoHoja;

    const auxiliar = [
      {
        text: "CONTRATO ADMINISTRATIVO DE PERSONAL EVENTUAL",
        style: ["titulo"],
      },
      { text: this.codigo, style: "titulo" },
      { text: "\n", style: "normal" },
      {
        text: [
          {
            text: `Conste por el tenor del presente `,
          },
          {
            text: `CONTRATO ADMINISTRATIVO DE PERSONAL EVENTUAL`,
            style: "negrita",
          },
          {
            text: `, que es suscrito en los términos y condiciones siguientes:`,
          },
        ],
        style: "normal",
      },

      {
        text: "PRIMERA.- (DE LAS PARTES).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        ol: [
          {
            text: [
              {
                text: "El ",
              },
              {
                text: "GOBIERNO AUTONOMO MUNICIPAL DE SACABA",
                style: "negrita",
              },
              {
                text: ", representado por ",
              },
              {
                text: `${abreviatura} ${contratante} ${contratante_cargo} ${detalle}`,
                style: "negrita",
              },
              {
                text: ", con domicilio legal en pasaje consistorial NS-002, de esta ciudad de Sacaba, en el marco de las atribuciones conferidas por la Ley 482 de Gobiernos Autónomos Municipales, a los efectos del presente contrato se denominará el  G.A.M.S.",
              },
            ],
          },
          {
            text: [
              { text: this.funcionario, style: "negrita" },
              {
                text: ", con C.I. Nº ",
              },
              {
                text: ci_ext,
              },
              {
                text: ", mayor de edad, hábil por derecho, con domicilio en esta ciudad de Sacaba, quien para efectos del presente documento se denominará el (la) ",
              },
              {
                text: "CONTRATADO(A).",
                style: "negrita",
              },
            ],
          },
        ],
        style: ["normal"],
      },
      {
        text: "SEGUNDA.- (ANTECEDENTES).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: "El Gobierno Autónomo Municipal de Sacaba es una Entidad Territorial Autónoma Metropolitana que impulsa el desarrollo económico local, humano y territorial a través de la prestación de servicios públicos a la población de los distritos urbanos y rurales para contribuir al vivir bien, basados en los principios de democracia participativa, efectividad y equidad de sus políticas públicas.",
        style: "normal",
      },
      {
        text: "Mediante solicitud de contratación de personal eventual, remitido por la unidad pertinente, en su calidad de unidad solicitante, requiere la contratación de personal técnico y operativo, adjuntando para ello la descripción de funciones, y la certificación presupuestaria correspondiente.",
        style: "normal",
      },
      {
        text: "TERCERA.- (BASE LEGAL DEL CONTRATO).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: `El presente contrato se rige por las disposiciones legales contenidas en la Ley 1178 (Ley SAFCO), Decreto Supremo 23318-A y sus modificaciones por el Decreto Supremo 26237; Reglamento Interno de Personal del G.A.M.S; Ley 482 de Gobiernos Autónomos; Art. 60 del D.S. 26115.`,
        style: "normal",
      },
      {
        text: [
          { text: "Se determina que el presente documento, es un " },
          { text: "CONTRATO ADMINISTRATIVO", style: "negrita" },
          {
            text: ", quedando expresamente establecido que no se encuentra sometido al ámbito del Estatuto del Funcionario Público ni a la Ley General del Trabajo, estando sus derechos y obligaciones previstos en el presente documento.",
          },
        ],
        style: "normal",
      },
      {
        text: "CUARTA.- (DEL OBJETO).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          {
            text: "El objeto del presente contrato, es la prestación de servicios de forma ",
          },
          { text: "EVENTUAL", style: "negrita" },
          { text: " por el (la) " },
          { text: "CONTRATADO(A)", style: "negrita" },
          { text: ", como " },
          { text: this.cargo, style: "negrita" },
          {
            text: ", debiendo cumplir con carácter eventual las actividades, tareas y funciones específicas asignadas por el responsable del área y encomendadas por el responsable de Recursos Humanos, haciendo constar que estas tareas descritas no son limitativas pudiendo determinarse otras tareas complementarias conducentes al logro de los objetivos previstos.",
          },
        ],
        style: "normal",
      },
      {
        text: "QUINTA.- (DEL PAGO).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          { text: "El pago por el servicio prestado por el (la) " },
          { text: "CONTRATADO(A)", style: "negrita" },
          { text: ", es de " },
          { text: `Bs ${this.salario},00`, style: "negrita" },
          {
            text: ` (${salarioText} 00/100 bolivianos) a ser cancelados al cumplimiento de cada mes previa presentación de su informe mensual.`,
          },
        ],
        style: "normal",
      },
      {
        text: "SEXTA.- (DE LA VIGENCIA).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          {
            text: "El presente contrato entrara en vigencia a partir de la fecha de suscripción del mismo, hasta el ",
          },
          { text: `${this.fecha_conclusion_text}.`, style: "negrita" },
        ],
        style: "normal",
      },
      {
        text: [
          { text: "Debido a la naturaleza " },
          { text: "ADMINISTRATIVA y EVENTUAL", style: "negrita" },
          {
            text: " del presente contrato, no es admisible la tácita reconducción, requiriéndose obligatoriamente un nuevo contrato o una adenda si la necesidad de la prestación de servicio eventual así lo requiere y previo consentimiento de ambas partes, aclarando que la nueva contratación, de ninguna manera significa su consideración como personal permanente. Por lo que, cumplido el plazo establecido en el presente contrato, el (la) ",
          },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: " , quedará cesante sin necesidad de aviso previo; quedando en consecuencia formalizada la desvinculación contractual entre ambas partes.",
          },
        ],
        style: "normal",
      },
      {
        text: "SEPTIMA.- (DE LAS OBLIGACIONES, RESPONSABILIDADES Y DERECHOS DEL CONTRATADO(A) Y EL G.A.M.S.).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: "Las partes para efectivizar el objeto del presente contrato, asumen las siguientes obligaciones:",
        style: "normal",
      },
      { text: "EL (LA) CONTRATADO(A):", style: ["normal", "negrita"] },
      {
        text: [
          {
            text: "7.1. A cumplir con el alcance total de la prestación del servicio eventual, conforme a lo descrito en la ",
          },
          { text: "cláusula cuarta", style: "negrita" },
          { text: " del presente contrato." },
        ],
        style: "normal",
      },
      {
        text: "7.2. A no subrogar, ceder o transferir los derechos u obligaciones emergentes del presente contrato.",
        style: "normal",
      },
      {
        text: [
          { text: "7.3. A velar por el interés, prestigio y bienestar del " },
          { text: "G.A.M.S.", style: "negrita" },
        ],
        style: "normal",
      },
      {
        text: "7.4. A prestar sus servicios utilizando el tiempo que fuese necesario para el cumplimiento de sus tareas y actividades asignadas.",
        style: "normal",
      },
      {
        text: [
          {
            text: "7.5. A cuidar y preservar los bienes, materiales e insumos recibidos para el desempeño de sus tareas asignadas por el ",
          },
          { text: "G.A.M.S.", style: "negrita" },
        ],
        style: "normal",
      },
      {
        text: "7.6. A realizarse el examen pre-ocupacional y los trámites correspondientes, para su afiliación ante el ente gestor de seguridad social a corto plazo. ",
        style: "normal",
      },
      {
        text: "7.7. A realizar trabajos comunitarios y de carácter social, en emergencias sanitarias, desastres y otras eventualidades fuera de horarios y días laborales, instruidos por su responsable del área y/o la Dirección de Organización Administrativa y Recursos Humanos.",
        style: "normal",
      },
      {
        text: "EL G.A.M.S.:",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          {
            text: "7.8. A realizar los desembolsos establecidos en la ",
          },
          { text: "CLÁUSULA QUINTA", style: "negrita" },
          {
            text: " del presente contrato y otros pagos establecidos por normativa legal vigente, cuando corresponda.",
          },
        ],
        style: "normal",
      },
      {
        text: [
          { text: "7.9. Entregar al " },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: " la información, así como el material y las herramientas necesarias para el cumplimiento de sus servicios.",
          },
        ],
        style: "normal",
      },
      {
        text: [
          {
            text: "7.10. A realizar el pago de los Aportes de Ley por los servicios prestados por el ",
          },
          { text: "CONTRATADO(A)", style: "negrita" },
          { text: "." },
        ],
        style: "normal",
      },
      {
        text: [
          { text: "7.11. En caso de que el " },
          { text: "G.A.M.S", style: "negrita" },
          { text: " requiera comisionar al " },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: ", para prestar servicios en un lugar distinto al de la sede de sus servicios, le proporcionará los medios necesarios para el desarrollo de sus actividades.",
          },
        ],
        style: "normal",
      },
      {
        text: "OCTAVA.- (LUGAR DE PRESTACION DE SERVICIOS). ",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          { text: "Dependiendo del requerimiento del " },
          {
            text: "G.A.M.S.",
            style: ["negrita"],
          },
          { text: ", el lugar donde prestara sus servicios el " },
          { text: "CONTRATADO(A)", style: ["negrita"] },
          { text: ", podrá ser fuera o dentro las dependencias del " },
          {
            text: "G.A.M.S.",
            style: ["negrita"],
          },
          {
            text: ", no pudiendo erogar por ello, el pago de alquiler por el uso de ambientes que utilice.",
          },
        ],
        style: "normal",
      },
      {
        text: "NOVENA.- (DE LA INEXISTENCIA DE COMPENSACIONES).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          { text: "Por la naturaleza del presente " },
          {
            text: "CONTRATO ADMINISTRATIVO",
            style: "negrita",
          },
          { text: ", el " },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: ", no gozará de más beneficios que los reconocidos expresamente en el presente contrato, no pudiendo exigir indemnización, desahucio, bono de antigüedad, horas extras y otras compensaciones que son propias de otro cuerpo normativo.",
          },
        ],
        style: "normal",
      },
      {
        text: "DECIMA.- (DE LA LIBRE MOVILIDAD).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          { text: "El " },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: ", podrá ser sujeto de Rotación o Transferencia a otras Unidades, de acuerdo a las necesidades eventuales del ",
          },
          { text: "G.A.M.S.", style: "negrita" },
        ],
        style: "normal",
      },
      {
        text: "DECIMA PRIMERA.- (CLAUSULA ADICIONAL).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          {
            text: "En cumplimiento a la Ley 065 (Ley de Pensiones), su reglamento y disposiciones vigentes establecidas por la Autoridad de Fiscalización y Control de Pensiones y Servicios, el ",
          },
          {
            text: "G.A.M.S",
            style: "negrita",
          },
          {
            text: " se constituirá en agente de retención por los pagos de contribución a la Administradora del Fondo de Pensiones (AFP), o a la Gestora Publica de Seguridad Social de Largo Plazo, a ser descontados de la remuneración mensual del (la) ",
          },
          { text: "CONTRATADO(A)", style: "negrita" },
        ],
        style: "normal",
      },
      {
        text: "DECIMA SEGUNDA .- (RESPONSABILIDAD).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          {
            text: "El (la) ",
          },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: ", se compromete a prestar sus servicios de acuerdo a lo establecido en el presente contrato, con las normas pertinentes y en actual vigencia, con integridad y ética, aplicando de forma eficiente y efectiva sus conocimientos y experiencia utilizando los métodos y procedimientos que considere más convenientes para el logro de los objetivos planteados, de igual forma reconoce su responsabilidad directa ante el ",
          },
          {
            text: "G.A.M.S",
            style: "negrita",
          },
          {
            text: " por la utilización y aplicación de métodos, procedimientos o elementos que fueren de propiedad de terceros, así como por casos de negligencia, error u omisión en el desempeño de sus funciones, librando al ",
          },
          {
            text: "G.A.M.S",
            style: "negrita",
          },
          {
            text: " de cualquier acción judicial o extrajudicial por este concepto.",
          },
        ],
        style: "normal",
      },
      {
        text: "DECIMA TERCERA.- (DE LA CONDUCTA Y PENALIDADES).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          { text: "En caso de que el (la) " },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: " incumpliera en todo o en parte lo pactado en el presente contrato, sea por acción u omisión, causando perjuicio al ",
          },
          {
            text: "G.A.M.S",
            style: "negrita",
          },
          {
            text: ", se hará pasible a responsabilidades administrativas, civiles y penales, según corresponda, conforme a Ley Nº 1178, además de asumir la responsabilidad total por posibles daños y perjuicios que pudieran ocasionar a la entidad.",
          },
        ],
        style: "normal",
      },
      {
        text: "Así mismo, la parte contratada, evitará todo acto y en particular cualquier clase de pronunciamiento público que pueda tener efectos negativos sobre la relación convenida o sobre la integridad, independencia o imparcialidad requerida por la mencionada relación, ni afectar el principio de confidencialidad.",
        style: "normal",
      },
      {
        text: "DECIMA CUARTA.- (SOLUCION DE CONTROVERSIAS).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          {
            text: "De acuerdo a la normativa legal que rige las contrataciones de personal de esta Entidad Municipal, descrita en la ",
          },
          { text: "CLÁUSULA TERCERA", style: "negrita" },
          { text: " de este contrato, " },
          {
            text: "las controversias o conflictos deberán ser resueltos en la vía Judicial",
            style: "negrita",
          },
          { text: ", aclarando que " },
          {
            text: "el presente contrato no es de competencia de ninguna instancia administrativa de conciliación",
            style: "negrita",
          },
          {
            text: ", porque las normas del sector público prohíben su conciliación.",
          },
        ],
        style: "normal",
      },
      {
        text: "DECIMA QUINTA.- (RESOLUCION DEL CONTRATO).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          { text: "El(la) " },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: ", reconoce la conclusión de su vínculo contractual con la institución en la fecha estipulada en la ",
          },
          { text: "CLÁUSULA SEXTA", style: "negrita" },
          {
            text: ", no siendo aplicable la inamovilidad por ningún concepto.",
          },
        ],
        style: "normal",
      },
      {
        text: [
          { text: "Así mismo el " },
          {
            text: "G.A.M.S",
            style: "negrita",
          },
          {
            text: " por así convenir a sus intereses, puede prescindir de sus servicios eventuales, sin necesidad de aviso previo ni de intervención judicial dejando sin efecto el contrato; De igual forma se dará lugar a la ",
          },
          {
            text: "RESOLUCIÓN DEL CONTRATO",
            style: "negrita",
          },
          {
            text: ", cuando el(la) ",
          },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: " deje de realizar la prestación de servicios sin justificativo alguno. Así como incurrir en faltas disciplinarias o de cualquier otra índole y/o incumpliere las tareas que le fueren asignadas, la comisión de algún acto contrario a las leyes y reglamentos internos; cometer actos que resulten atentatorios a los intereses del ",
          },
          {
            text: "G.A.M.S",
            style: "negrita",
          },
          {
            text: "; Omisión, negligencia, inobservancia o incumplimiento de las cláusulas establecidas en el presente documento contractual y otras que tengan relación con el desenvolvimiento de sus funciones.",
          },
        ],
        style: "normal",
      },
      {
        text: [
          { text: "Por su parte el " },
          { text: "CONTRATADO", style: "negrita" },
          { text: ", podrá también solicitar la " },
          { text: "RESOLUCIÓN", style: "negrita" },
          {
            text: " del presente contrato comunicando en forma escrita este extremo al ",
          },
          {
            text: "G.A.M.S.",
            style: "negrita",
          },
        ],
        style: "normal",
      },
      {
        text: [
          { text: "El " },
          {
            text: "G.A.M.S.",
            style: "negrita",
          },
          {
            text: " no estará sujeto a desembolso por daños y perjuicios resuelto el contrato, el (la) ",
          },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: " deberá devolver toda la documentación, información y material que tenga bajo su custodia y la que hubiese generado durante su vínculo contractual con el ",
          },
          {
            text: "G.A.M.S",
            style: "negrita",
          },
          {
            text: ", debiendo concluir con todas sus labores pendientes si las tuviera, bajo el advertido de iniciar las acciones que correspondan en su contra en caso de incumplimiento.",
          },
        ],
        style: "normal",
      },
      {
        text: "DECIMA SEXTA.-  (ACEPTACIÓN Y CONFORMIDAD).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          { text: "El " },
          {
            text: "G.A.M.S",
            style: "negrita",
          },
          {
            text: " por una parte y por otra el (la) ",
          },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: ", declaran su conformidad con todas y cada una de las cláusulas precedentemente descritas, comprometiéndose a su fiel y estricto cumplimiento. En señal de conformidad y sin que medie presión de ninguna naturaleza alguna, firman al pie del presente documento.",
          },
        ],
        style: "normal",
      },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      {
        text: [{ text: "Sacaba, " }, { text: fecha_contrato }],
        style: ["normal", "centrado"],
      },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      {
        text: `${abreviatura_1}/${abreviatura_2}/${abreviatura_3}`,
        style: "nota",
      },
      { text: "Cc./Arch.", style: "nota" },
      { text: "Cc./File personal", style: "nota" },
    ];

    const tecnico = [
      {
        text: "CONTRATO ADMINISTRATIVO DE PERSONAL EVENTUAL",
        style: ["titulo"],
      },
      { text: this.codigo, style: "titulo" },
      { text: "\n", style: "normal" },
      {
        text: [
          {
            text: `Conste por el tenor del presente `,
          },
          {
            text: `CONTRATO ADMINISTRATIVO DE PERSONAL EVENTUAL`,
            style: "negrita",
          },
          {
            text: `, que es suscrito en los términos y condiciones siguientes:`,
          },
        ],
        style: "normal",
      },

      {
        text: "PRIMERA.- (DE LAS PARTES).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        ol: [
          {
            text: [
              {
                text: "El ",
              },
              {
                text: "GOBIERNO AUTONOMO MUNICIPAL DE SACABA",
                style: "negrita",
              },
              {
                text: ", representado por ",
              },
              {
                text: `${abreviatura} ${contratante} ${contratante_cargo} ${detalle}`,
                style: "negrita",
              },
              {
                text: ", con domicilio legal en pasaje consistorial NS-002, de esta ciudad de Sacaba, en el marco de las atribuciones conferidas por la Ley 482 de Gobiernos Autónomos Municipales, a los efectos del presente contrato se denominará el  G.A.M.S.",
              },
            ],
          },
          {
            text: [
              { text: this.funcionario, style: "negrita" },
              {
                text: ", con C.I. Nº ",
              },
              {
                text: ci_ext,
              },
              {
                text: ", mayor de edad, hábil por derecho, con domicilio en esta ciudad de Sacaba, quien para efectos del presente documento se denominará el (la) ",
              },
              {
                text: "CONTRATADO(A).",
                style: "negrita",
              },
            ],
          },
        ],
        style: ["normal"],
      },
      {
        text: "SEGUNDA.- (ANTECEDENTES).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: "El Gobierno Autónomo Municipal de Sacaba es una Entidad Territorial Autónoma Metropolitana que impulsa el desarrollo económico local, humano y territorial a través de la prestación de servicios públicos a la población de los distritos urbanos y rurales para contribuir al vivir bien, basados en los principios de democracia participativa, efectividad y equidad de sus políticas públicas.",
        style: "normal",
      },
      {
        text: "Mediante solicitud de contratación de personal eventual, remitido por la unidad pertinente, en su calidad de unidad solicitante, requiere la contratación de personal técnico y operativo, adjuntando para ello la descripción de funciones, y la certificación presupuestaria correspondiente.",
        style: "normal",
      },
      {
        text: "TERCERA.- (BASE LEGAL DEL CONTRATO).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: `El presente contrato se rige por las disposiciones legales contenidas en la Ley 1178 (Ley SAFCO), Decreto Supremo 23318-A y sus modificaciones por el Decreto Supremo 26237; Reglamento Interno de Personal del G.A.M.S; Ley 482 de Gobiernos Autónomos; Art. 60 del D.S. 26115.`,
        style: "normal",
      },
      {
        text: [
          { text: "Se determina que el presente documento, es un " },
          { text: "CONTRATO ADMINISTRATIVO", style: "negrita" },
          {
            text: ", quedando expresamente establecido que no se encuentra sometido al ámbito del Estatuto del Funcionario Público ni a la Ley General del Trabajo, estando sus derechos y obligaciones previstos en el presente documento.",
          },
        ],
        style: "normal",
      },
      {
        text: "CUARTA.- (DEL OBJETO).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          {
            text: "El objeto del presente contrato, es la prestación de servicios de forma ",
          },
          { text: "EVENTUAL", style: "negrita" },
          { text: " por el (la) " },
          { text: "CONTRATADO(A)", style: "negrita" },
          { text: ", como " },
          { text: this.cargo, style: "negrita" },
          {
            text: ", debiendo cumplir con carácter eventual las actividades, tareas y funciones específicas asignadas por el responsable del área y encomendadas por el responsable de Recursos Humanos, haciendo constar que estas tareas descritas no son limitativas pudiendo determinarse otras tareas complementarias conducentes al logro de los objetivos previstos.",
          },
        ],
        style: "normal",
      },
      {
        text: "QUINTA.- (DEL PAGO).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          { text: "El pago por el servicio prestado por el (la) " },
          { text: "CONTRATADO(A)", style: "negrita" },
          { text: ", es de " },
          { text: `Bs ${this.salario},00`, style: "negrita" },
          {
            text: ` (${salarioText} 00/100 bolivianos) a ser cancelados al cumplimiento de cada mes previa presentación de su informe mensual.`,
          },
        ],
        style: "normal",
      },
      {
        text: "SEXTA.- (DE LA VIGENCIA).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          {
            text: "El presente contrato entrara en vigencia a partir de la fecha de suscripción del mismo, hasta el ",
          },
          { text: `${this.fecha_conclusion_text}.`, style: "negrita" },
        ],
        style: "normal",
      },
      {
        text: [
          { text: "Debido a la naturaleza " },
          { text: "ADMINISTRATIVA y EVENTUAL", style: "negrita" },
          {
            text: " del presente contrato, no es admisible la tácita reconducción, requiriéndose obligatoriamente un nuevo contrato o una adenda si la necesidad de la prestación de servicio eventual así lo requiere y previo consentimiento de ambas partes, aclarando que la nueva contratación, de ninguna manera significa su consideración como personal permanente. Por lo que, cumplido el plazo establecido en el presente contrato, el (la) ",
          },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: " , quedará cesante sin necesidad de aviso previo; quedando en consecuencia formalizada la desvinculación contractual entre ambas partes.",
          },
        ],
        style: "normal",
      },
      {
        text: "SEPTIMA.- (DE LAS OBLIGACIONES, RESPONSABILIDADES Y DERECHOS DEL CONTRATADO(A) Y EL G.A.M.S.).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: "Las partes para efectivizar el objeto del presente contrato, asumen las siguientes obligaciones:",
        style: "normal",
      },
      { text: "EL (LA) CONTRATADO(A):", style: ["normal", "negrita"] },
      {
        text: [
          {
            text: "7.1. A cumplir con el alcance total de la prestación del servicio eventual, conforme a lo descrito en la ",
          },
          { text: "cláusula cuarta", style: "negrita" },
          { text: " del presente contrato." },
        ],
        style: "normal",
      },
      {
        text: "7.2. A no subrogar, ceder o transferir los derechos u obligaciones emergentes del presente contrato.",
        style: "normal",
      },
      {
        text: [
          { text: "7.3. A presentar informes requeridos por el " },
          { text: "G.A.M.S.", style: "negrita" },
          { text: ", o por sus superiores y en el plazo establecido. " },
        ],
        style: "normal",
      },
      {
        text: [
          { text: "7.4. A velar por el interés, prestigio y bienestar del " },
          { text: "G.A.M.S.", style: "negrita" },
        ],
        style: "normal",
      },
      {
        text: [
          {
            text: "7.5. A cuidar y preservar los bienes, materiales e insumos recibidos para el desempeño de sus tareas asignadas por el ",
          },
          { text: "G.A.M.S.", style: "negrita" },
        ],
        style: "normal",
      },
      {
        text: [
          {
            text: "7.6. No revelar ningún dato o información reservada concernientes a las actividades propias del ",
          },
          { text: "G.A.M.S.", style: "negrita" },
          {
            text: ", mediante notas, planos y otros medios, durante ni después de concluida la vigencia del presente contrato, bajo apercibimiento de iniciar las acciones legales que correspondan.",
          },
        ],
        style: "normal",
      },
      {
        text: "7.7. Presentar informes mensuales y finales ante su inmediato superior, sobre las tareas y actividades eventuales realizadas en el transcurso del mismo.",
        style: "normal",
      },
      {
        text: "7.8. A realizarse el examen pre-ocupacional y los trámites correspondientes, para su afiliación ante el ente gestor de seguridad social a corto plazo. ",
        style: "normal",
      },
      {
        text: "7.9. A realizar trabajos comunitarios y de carácter social, en emergencias sanitarias, desastres y otras eventualidades fuera de horarios y días laborales, instruidos por su responsable del área y/o la Dirección de Organización Administrativa y Recursos Humanos.",
        style: "normal",
      },
      {
        text: "7.10. Aplicar los procedimientos administrativos establecidos para la optimización de los recursos disponibles.",
        style: "normal",
      },
      {
        text: "7.11. Apoyar en todas las tareas requeridas por su inmediato superior.",
        style: "normal",
      },
      {
        text: "7.12. Realizar informes de cumplimiento de actividades de manera periódica y a solicitud de las instancias superiores y cumplir los plazos establecidos para la entrega de informes requeridos.",
        style: "normal",
      },
      {
        text: "7.13. Preservar y precautelar los bienes asignados a su cargo.",
        style: "normal",
      },
      {
        text: "7.14. Cumplir otras funciones y tareas asignadas por su inmediato superior o autoridad competente.",
        style: "normal",
      },
      {
        text: "7.15. Reportar informes periódicos al inmediato superior y a requerimiento de este por cualquier unidad requerida.",
        style: "normal",
      },
      {
        text: "7.16. Preparar, revisar y remitir documentación generada para su respectivo archivo.",
        style: "normal",
      },
      {
        text: "EL G.A.M.S.:",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          {
            text: "7.17. A realizar los desembolsos establecidos en la ",
          },
          { text: "CLÁUSULA QUINTA", style: "negrita" },
          {
            text: " del presente contrato y otros pagos establecidos por normativa legal vigente, cuando corresponda.",
          },
        ],
        style: "normal",
      },
      {
        text: [
          { text: "7.18. Entregar al " },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: " la información, así como el material y las herramientas necesarias para el cumplimiento de sus servicios.",
          },
        ],
        style: "normal",
      },
      {
        text: [
          {
            text: "7.19. A realizar el pago de los Aportes de Ley por los servicios prestados por el ",
          },
          { text: "CONTRATADO(A)", style: "negrita" },
          { text: "." },
        ],
        style: "normal",
      },
      {
        text: [
          { text: "7.20. En caso de que el " },
          { text: "G.A.M.S", style: "negrita" },
          { text: " requiera comisionar al " },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: ", para prestar servicios en un lugar distinto al de la sede de sus servicios, le proporcionará los medios necesarios para el desarrollo de sus actividades.",
          },
        ],
        style: "normal",
      },
      {
        text: "OCTAVA.- (LUGAR DE PRESTACION DE SERVICIOS). ",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          { text: "Dependiendo del requerimiento del " },
          {
            text: "G.A.M.S.",
            style: ["negrita"],
          },
          { text: ", el lugar donde prestara sus servicios el " },
          { text: "CONTRATADO(A)", style: ["negrita"] },
          { text: ", podrá ser fuera o dentro las dependencias del " },
          {
            text: "G.A.M.S.",
            style: ["negrita"],
          },
          {
            text: ", no pudiendo erogar por ello, el pago de alquiler por el uso de ambientes que utilice.",
          },
        ],
        style: "normal",
      },
      {
        text: "NOVENA.- (DE LA INEXISTENCIA DE COMPENSACIONES).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          { text: "Por la naturaleza del presente " },
          {
            text: "CONTRATO ADMINISTRATIVO",
            style: "negrita",
          },
          { text: ", el " },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: ", no gozará de más beneficios que los reconocidos expresamente en el presente contrato, no pudiendo exigir indemnización, desahucio, bono de antigüedad, horas extras y otras compensaciones que son propias de otro cuerpo normativo.",
          },
        ],
        style: "normal",
      },
      {
        text: "DECIMA.- (DE LA LIBRE MOVILIDAD).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          { text: "El " },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: ", podrá ser sujeto de Rotación o Transferencia a otras Unidades, de acuerdo a las necesidades eventuales del ",
          },
          { text: "G.A.M.S.", style: "negrita" },
        ],
        style: "normal",
      },
      {
        text: "DECIMA PRIMERA.- (CLAUSULA ADICIONAL).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          {
            text: "En cumplimiento a la Ley 065 (Ley de Pensiones), su reglamento y disposiciones vigentes establecidas por la Autoridad de Fiscalización y Control de Pensiones y Servicios, el ",
          },
          {
            text: "G.A.M.S",
            style: "negrita",
          },
          {
            text: " se constituirá en agente de retención por los pagos de contribución a la Administradora del Fondo de Pensiones (AFP), o a la Gestora Publica de Seguridad Social de Largo Plazo, a ser descontados de la remuneración mensual del (la) ",
          },
          { text: "CONTRATADO(A)", style: "negrita" },
        ],
        style: "normal",
      },
      {
        text: "DECIMA SEGUNDA .- (RESPONSABILIDAD).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          {
            text: "El (la) ",
          },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: ", se compromete a prestar sus servicios de acuerdo a lo establecido en el presente contrato, con las normas pertinentes y en actual vigencia, con integridad y ética, aplicando de forma eficiente y efectiva sus conocimientos y experiencia utilizando los métodos y procedimientos que considere más convenientes para el logro de los objetivos planteados, de igual forma reconoce su responsabilidad directa ante el ",
          },
          {
            text: "G.A.M.S",
            style: "negrita",
          },
          {
            text: " por la utilización y aplicación de métodos, procedimientos o elementos que fueren de propiedad de terceros, así como por casos de negligencia, error u omisión en el desempeño de sus funciones, librando al ",
          },
          {
            text: "G.A.M.S",
            style: "negrita",
          },
          {
            text: " de cualquier acción judicial o extrajudicial por este concepto.",
          },
        ],
        style: "normal",
      },
      {
        text: "DECIMA TERCERA.- (DE LA CONDUCTA Y PENALIDADES).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          { text: "En caso de que el (la) " },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: " incumpliera en todo o en parte lo pactado en el presente contrato, sea por acción u omisión, causando perjuicio al ",
          },
          {
            text: "G.A.M.S",
            style: "negrita",
          },
          {
            text: ", se hará pasible a responsabilidades administrativas, civiles y penales, según corresponda, conforme a Ley Nº 1178, además de asumir la responsabilidad total por posibles daños y perjuicios que pudieran ocasionar a la entidad.",
          },
        ],
        style: "normal",
      },
      {
        text: "Así mismo, la parte contratada, evitará todo acto y en particular cualquier clase de pronunciamiento público que pueda tener efectos negativos sobre la relación convenida o sobre la integridad, independencia o imparcialidad requerida por la mencionada relación, ni afectar el principio de confidencialidad.",
        style: "normal",
      },
      {
        text: "DECIMA CUARTA.- (SOLUCION DE CONTROVERSIAS).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          {
            text: "De acuerdo a la normativa legal que rige las contrataciones de personal de esta Entidad Municipal, descrita en la ",
          },
          { text: "CLÁUSULA TERCERA", style: "negrita" },
          { text: " de este contrato, " },
          {
            text: "las controversias o conflictos deberán ser resueltos en la vía Judicial",
            style: "negrita",
          },
          { text: ", aclarando que " },
          {
            text: "el presente contrato no es de competencia de ninguna instancia administrativa de conciliación",
            style: "negrita",
          },
          {
            text: ", porque las normas del sector público prohíben su conciliación.",
          },
        ],
        style: "normal",
      },
      {
        text: "DECIMA QUINTA.- (RESOLUCION DEL CONTRATO).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          { text: "El(la) " },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: ", reconoce la conclusión de su vínculo contractual con la institución en la fecha estipulada en la ",
          },
          { text: "CLÁUSULA SEXTA", style: "negrita" },
          {
            text: ", no siendo aplicable la inamovilidad por ningún concepto.",
          },
        ],
        style: "normal",
      },
      {
        text: [
          { text: "Así mismo el " },
          {
            text: "G.A.M.S",
            style: "negrita",
          },
          {
            text: " por así convenir a sus intereses, puede prescindir de sus servicios eventuales, sin necesidad de aviso previo ni de intervención judicial dejando sin efecto el contrato; De igual forma se dará lugar a la ",
          },
          {
            text: "RESOLUCIÓN DEL CONTRATO",
            style: "negrita",
          },
          {
            text: ", cuando el(la) ",
          },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: " deje de realizar la prestación de servicios sin justificativo alguno. Así como incurrir en faltas disciplinarias o de cualquier otra índole y/o incumpliere las tareas que le fueren asignadas, la comisión de algún acto contrario a las leyes y reglamentos internos; cometer actos que resulten atentatorios a los intereses del ",
          },
          {
            text: "G.A.M.S",
            style: "negrita",
          },
          {
            text: "; Omisión, negligencia, inobservancia o incumplimiento de las cláusulas establecidas en el presente documento contractual y otras que tengan relación con el desenvolvimiento de sus funciones.",
          },
        ],
        style: "normal",
      },
      {
        text: [
          { text: "Por su parte el " },
          { text: "CONTRATADO", style: "negrita" },
          { text: ", podrá también solicitar la " },
          { text: "RESOLUCIÓN", style: "negrita" },
          {
            text: " del presente contrato comunicando en forma escrita este extremo al ",
          },
          {
            text: "G.A.M.S.",
            style: "negrita",
          },
        ],
        style: "normal",
      },
      {
        text: [
          { text: "El " },
          {
            text: "G.A.M.S.",
            style: "negrita",
          },
          {
            text: " no estará sujeto a desembolso por daños y perjuicios resuelto el contrato, el (la) ",
          },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: " deberá devolver toda la documentación, información y material que tenga bajo su custodia y la que hubiese generado durante su vínculo contractual con el ",
          },
          {
            text: "G.A.M.S",
            style: "negrita",
          },
          {
            text: ", debiendo concluir con todas sus labores pendientes si las tuviera, bajo el advertido de iniciar las acciones que correspondan en su contra en caso de incumplimiento.",
          },
        ],
        style: "normal",
      },
      {
        text: "DECIMA SEXTA.-  (ACEPTACIÓN Y CONFORMIDAD).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          { text: "El " },
          {
            text: "G.A.M.S",
            style: "negrita",
          },
          {
            text: " por una parte y por otra el (la) ",
          },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: ", declaran su conformidad con todas y cada una de las cláusulas precedentemente descritas, comprometiéndose a su fiel y estricto cumplimiento. En señal de conformidad y sin que medie presión de ninguna naturaleza alguna, firman al pie del presente documento.",
          },
        ],
        style: "normal",
      },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      {
        text: [{ text: "Sacaba, " }, { text: fecha_contrato }],
        style: ["normal", "centrado"],
      },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      {
        text: `${abreviatura_1}/${abreviatura_2}/${abreviatura_3}`,
        style: "nota",
      },
      { text: "Cc./Arch.", style: "nota" },
      { text: "Cc./File personal", style: "nota" },
    ];

    const profesional = [
      {
        text: "CONTRATO ADMINISTRATIVO DE PERSONAL EVENTUAL",
        style: ["titulo"],
      },
      { text: this.codigo, style: "titulo" },
      { text: "\n", style: "normal" },
      {
        text: [
          {
            text: `Conste por el tenor del presente `,
          },
          {
            text: `CONTRATO ADMINISTRATIVO DE PERSONAL EVENTUAL`,
            style: "negrita",
          },
          {
            text: `, que es suscrito en los términos y condiciones siguientes:`,
          },
        ],
        style: "normal",
      },

      {
        text: "PRIMERA.- (DE LAS PARTES).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        ol: [
          {
            text: [
              {
                text: "El ",
              },
              {
                text: "GOBIERNO AUTONOMO MUNICIPAL DE SACABA",
                style: "negrita",
              },
              {
                text: ", representado por ",
              },
              {
                text: `${abreviatura} ${contratante} ${contratante_cargo} ${detalle}`,
                style: "negrita",
              },
              {
                text: ", con domicilio legal en pasaje consistorial NS-002, de esta ciudad de Sacaba, en el marco de las atribuciones conferidas por la Ley 482 de Gobiernos Autónomos Municipales, a los efectos del presente contrato se denominará el  G.A.M.S.",
              },
            ],
          },
          {
            text: [
              { text: this.funcionario, style: "negrita" },
              {
                text: ", con C.I. Nº ",
              },
              {
                text: ci_ext,
              },
              {
                text: ", mayor de edad, hábil por derecho, con domicilio en esta ciudad de Sacaba, quien para efectos del presente documento se denominará el (la) ",
              },
              {
                text: "CONTRATADO(A).",
                style: "negrita",
              },
            ],
          },
        ],
        style: ["normal"],
      },
      {
        text: "SEGUNDA.- (ANTECEDENTES).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: "El Gobierno Autónomo Municipal de Sacaba es una Entidad Territorial Autónoma Metropolitana que impulsa el desarrollo económico local, humano y territorial a través de la prestación de servicios públicos a la población de los distritos urbanos y rurales para contribuir al vivir bien, basados en los principios de democracia participativa, efectividad y equidad de sus políticas públicas.",
        style: "normal",
      },
      {
        text: "Mediante solicitud de contratación de personal eventual, remitido por la unidad pertinente, en su calidad de unidad solicitante, requiere la contratación de personal técnico y operativo, adjuntando para ello la descripción de funciones, y la certificación presupuestaria correspondiente.",
        style: "normal",
      },
      {
        text: "TERCERA.- (BASE LEGAL DEL CONTRATO).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: `El presente contrato se rige por las disposiciones legales contenidas en la Ley 1178 (Ley SAFCO), Decreto Supremo 23318-A y sus modificaciones por el Decreto Supremo 26237; Reglamento Interno de Personal del G.A.M.S; Ley 482 de Gobiernos Autónomos; Art. 60 del D.S. 26115.`,
        style: "normal",
      },
      {
        text: [
          { text: "Se determina que el presente documento, es un " },
          { text: "CONTRATO ADMINISTRATIVO", style: "negrita" },
          {
            text: ", quedando expresamente establecido que no se encuentra sometido al ámbito del Estatuto del Funcionario Público ni a la Ley General del Trabajo, estando sus derechos y obligaciones previstos en el presente documento.",
          },
        ],
        style: "normal",
      },
      {
        text: "CUARTA.- (DEL OBJETO).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          {
            text: "El objeto del presente contrato, es la prestación de servicios de forma ",
          },
          { text: "EVENTUAL", style: "negrita" },
          { text: " por el (la) " },
          { text: "CONTRATADO(A)", style: "negrita" },
          { text: ", como " },
          { text: this.cargo, style: "negrita" },
          {
            text: ", debiendo cumplir con carácter eventual las actividades, tareas y funciones específicas asignadas por el responsable del área y encomendadas por el responsable de Recursos Humanos, haciendo constar que estas tareas descritas no son limitativas pudiendo determinarse otras tareas complementarias conducentes al logro de los objetivos previstos.",
          },
        ],
        style: "normal",
      },
      {
        text: "QUINTA.- (DEL PAGO).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          { text: "El pago por el servicio prestado por el (la) " },
          { text: "CONTRATADO(A)", style: "negrita" },
          { text: ", es de " },
          { text: `Bs ${this.salario},00`, style: "negrita" },
          {
            text: ` (${salarioText} 00/100 bolivianos) a ser cancelados al cumplimiento de cada mes previa presentación de su informe mensual.`,
          },
        ],
        style: "normal",
      },
      {
        text: "SEXTA.- (DE LA VIGENCIA).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          {
            text: "El presente contrato entrara en vigencia a partir de la fecha de suscripción del mismo, hasta el ",
          },
          { text: `${this.fecha_conclusion_text}.`, style: "negrita" },
        ],
        style: "normal",
      },
      {
        text: [
          { text: "Debido a la naturaleza " },
          { text: "ADMINISTRATIVA y EVENTUAL", style: "negrita" },
          {
            text: " del presente contrato, no es admisible la tácita reconducción, requiriéndose obligatoriamente un nuevo contrato o una adenda si la necesidad de la prestación de servicio eventual así lo requiere y previo consentimiento de ambas partes, aclarando que la nueva contratación, de ninguna manera significa su consideración como personal permanente. Por lo que, cumplido el plazo establecido en el presente contrato, el (la) ",
          },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: " , quedará cesante sin necesidad de aviso previo; quedando en consecuencia formalizada la desvinculación contractual entre ambas partes.",
          },
        ],
        style: "normal",
      },
      {
        text: "SEPTIMA.- (DE LAS OBLIGACIONES, RESPONSABILIDADES Y DERECHOS DEL CONTRATADO(A) Y EL G.A.M.S.).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: "Las partes para efectivizar el objeto del presente contrato, asumen las siguientes obligaciones:",
        style: "normal",
      },
      { text: "EL (LA) CONTRATADO(A):", style: ["normal", "negrita"] },
      {
        text: [
          {
            text: "7.1. A cumplir con el alcance total de la prestación del servicio eventual, conforme a lo descrito en la ",
          },
          { text: "cláusula cuarta", style: "negrita" },
          { text: " del presente contrato." },
        ],
        style: "normal",
      },
      {
        text: "7.2. A no subrogar, ceder o transferir los derechos u obligaciones emergentes del presente contrato.",
        style: "normal",
      },
      {
        text: [
          { text: "7.3. Realizar cualquier comunicación al " },
          { text: "G.A.M.S.", style: "negrita" },
          { text: ", en forma escrita y por conducto regular." },
        ],
        style: "normal",
      },
      {
        text: [
          { text: "7.4. A presentar informes requeridos por el " },
          { text: "G.A.M.S.", style: "negrita" },
          { text: ", o por sus superiores y en el plazo establecido. " },
        ],
        style: "normal",
      },
      {
        text: [
          { text: "7.5. A velar por el interés, prestigio y bienestar del " },
          { text: "G.A.M.S.", style: "negrita" },
        ],
        style: "normal",
      },
      {
        text: "7.6. Prestar sus servicios utilizando el tiempo que fuese necesario para el cumplimiento de sus tareas y actividades asignadas.",
        style: "normal",
      },
      {
        text: [
          {
            text: "7.7. A cuidar y preservar los bienes, materiales e insumos recibidos para el desempeño de sus tareas asignadas por el ",
          },
          { text: "G.A.M.S.", style: "negrita" },
        ],
        style: "normal",
      },
      {
        text: [
          {
            text: "7.8. No revelar ningún dato o información reservada concernientes a las actividades propias del ",
          },
          { text: "G.A.M.S.", style: "negrita" },
          {
            text: ", mediante notas, planos y otros medios, durante ni después de concluida la vigencia del presente contrato, bajo apercibimiento de iniciar las acciones legales que correspondan.",
          },
        ],
        style: "normal",
      },
      {
        text: "7.9. Presentar informes mensuales y finales ante su inmediato superior, sobre las tareas y actividades eventuales realizadas en el transcurso del mismo.",
        style: "normal",
      },
      {
        text: "7.10. Desempeñar sus actividades con profesionalismo, bajo los principios y valores de integridad, imparcialidad, probidad, ética, transparencia, responsabilidad y eficiencia que garanticen un adecuado servicio a la colectividad.",
        style: "normal",
      },
      {
        text: "7.11. A realizarse el examen pre-ocupacional y los trámites correspondientes, para su afiliación ante el ente gestor de seguridad social a corto plazo. ",
        style: "normal",
      },
      {
        text: "7.12. A realizar trabajos comunitarios y de carácter social, en emergencias sanitarias, desastres y otras eventualidades fuera de horarios y días laborales, instruidos por su responsable del área y/o la Dirección de Organización Administrativa y Recursos Humanos.",
        style: "normal",
      },
      {
        text: "7.13. Aplicar los procedimientos administrativos establecidos para la optimización de los recursos disponibles.",
        style: "normal",
      },
      {
        text: "7.14. Participar de reuniones, coordinar actividades de planificación, organización y ejecución.",
        style: "normal",
      },
      {
        text: "7.15. Realizar informes de cumplimiento de actividades de manera periódica y a solicitud de las instancias superiores y cumplir los plazos establecidos para la entrega de informes requeridos.",
        style: "normal",
      },
      {
        text: "7.16. Preservar y precautelar los bienes asignados a su cargo.",
        style: "normal",
      },
      {
        text: "7.17. Reportar informes periódicos al inmediato superior y a requerimiento de este por cualquier unidad requerida.",
        style: "normal",
      },
      {
        text: "7.18. Preparar, revisar y remitir documentación generada para su respectivo archivo.",
        style: "normal",
      },
      {
        text: "EL G.A.M.S.:",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          {
            text: "7.19. A realizar los desembolsos establecidos en la ",
          },
          { text: "CLÁUSULA QUINTA", style: "negrita" },
          {
            text: " del presente contrato y otros pagos establecidos por normativa legal vigente, cuando corresponda.",
          },
        ],
        style: "normal",
      },
      {
        text: [
          { text: "7.20. Entregar al " },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: " la información, así como el material y las herramientas necesarias para el cumplimiento de sus servicios.",
          },
        ],
        style: "normal",
      },
      {
        text: [
          {
            text: "7.21. A realizar el pago de los Aportes de Ley por los servicios prestados por el ",
          },
          { text: "CONTRATADO(A)", style: "negrita" },
          { text: "." },
        ],
        style: "normal",
      },
      {
        text: [
          { text: "7.22. En caso de que el " },
          { text: "G.A.M.S", style: "negrita" },
          { text: " requiera comisionar al " },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: ", para prestar servicios en un lugar distinto al de la sede de sus servicios, le proporcionará los medios necesarios para el desarrollo de sus actividades.",
          },
        ],
        style: "normal",
      },
      {
        text: "OCTAVA.- (LUGAR DE PRESTACION DE SERVICIOS). ",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          { text: "Dependiendo del requerimiento del " },
          {
            text: "G.A.M.S.",
            style: ["negrita"],
          },
          { text: ", el lugar donde prestara sus servicios el " },
          { text: "CONTRATADO(A)", style: ["negrita"] },
          { text: ", podrá ser fuera o dentro las dependencias del " },
          {
            text: "G.A.M.S.",
            style: ["negrita"],
          },
          {
            text: ", no pudiendo erogar por ello, el pago de alquiler por el uso de ambientes que utilice.",
          },
        ],
        style: "normal",
      },
      {
        text: "NOVENA.- (DE LA INEXISTENCIA DE COMPENSACIONES).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          { text: "Por la naturaleza del presente " },
          {
            text: "CONTRATO ADMINISTRATIVO",
            style: "negrita",
          },
          { text: ", el " },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: ", no gozará de más beneficios que los reconocidos expresamente en el presente contrato, no pudiendo exigir indemnización, desahucio, bono de antigüedad, horas extras y otras compensaciones que son propias de otro cuerpo normativo.",
          },
        ],
        style: "normal",
      },
      {
        text: "DECIMA.- (DE LA LIBRE MOVILIDAD).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          { text: "El " },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: ", podrá ser sujeto de Rotación o Transferencia a otras Unidades, de acuerdo a las necesidades eventuales del ",
          },
          { text: "G.A.M.S.", style: "negrita" },
        ],
        style: "normal",
      },
      {
        text: "DECIMA PRIMERA.- (CLAUSULA ADICIONAL).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          {
            text: "En cumplimiento a la Ley 065 (Ley de Pensiones), su reglamento y disposiciones vigentes establecidas por la Autoridad de Fiscalización y Control de Pensiones y Servicios, el ",
          },
          {
            text: "G.A.M.S",
            style: "negrita",
          },
          {
            text: " se constituirá en agente de retención por los pagos de contribución a la Administradora del Fondo de Pensiones (AFP), o a la Gestora Publica de Seguridad Social de Largo Plazo, a ser descontados de la remuneración mensual del (la) ",
          },
          { text: "CONTRATADO(A)", style: "negrita" },
        ],
        style: "normal",
      },
      {
        text: "DECIMA SEGUNDA .- (RESPONSABILIDAD).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          {
            text: "El (la) ",
          },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: ", se compromete a prestar sus servicios de acuerdo a lo establecido en el presente contrato, con las normas pertinentes y en actual vigencia, con integridad y ética, aplicando de forma eficiente y efectiva sus conocimientos y experiencia utilizando los métodos y procedimientos que considere más convenientes para el logro de los objetivos planteados, de igual forma reconoce su responsabilidad directa ante el ",
          },
          {
            text: "G.A.M.S",
            style: "negrita",
          },
          {
            text: " por la utilización y aplicación de métodos, procedimientos o elementos que fueren de propiedad de terceros, así como por casos de negligencia, error u omisión en el desempeño de sus funciones, librando al ",
          },
          {
            text: "G.A.M.S",
            style: "negrita",
          },
          {
            text: " de cualquier acción judicial o extrajudicial por este concepto.",
          },
        ],
        style: "normal",
      },
      {
        text: "DECIMA TERCERA.- (DE LA CONDUCTA Y PENALIDADES).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          { text: "En caso de que el (la) " },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: " incumpliera en todo o en parte lo pactado en el presente contrato, sea por acción u omisión, causando perjuicio al ",
          },
          {
            text: "G.A.M.S",
            style: "negrita",
          },
          {
            text: ", se hará pasible a responsabilidades administrativas, civiles y penales, según corresponda, conforme a Ley Nº 1178, además de asumir la responsabilidad total por posibles daños y perjuicios que pudieran ocasionar a la entidad.",
          },
        ],
        style: "normal",
      },
      {
        text: "Así mismo, la parte contratada, evitará todo acto y en particular cualquier clase de pronunciamiento público que pueda tener efectos negativos sobre la relación convenida o sobre la integridad, independencia o imparcialidad requerida por la mencionada relación, ni afectar el principio de confidencialidad.",
        style: "normal",
      },
      {
        text: "DECIMA CUARTA.- (SOLUCION DE CONTROVERSIAS).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          {
            text: "De acuerdo a la normativa legal que rige las contrataciones de personal de esta Entidad Municipal, descrita en la ",
          },
          { text: "CLÁUSULA TERCERA", style: "negrita" },
          { text: " de este contrato, " },
          {
            text: "las controversias o conflictos deberán ser resueltos en la vía Judicial",
            style: "negrita",
          },
          { text: ", aclarando que " },
          {
            text: "el presente contrato no es de competencia de ninguna instancia administrativa de conciliación",
            style: "negrita",
          },
          {
            text: ", porque las normas del sector público prohíben su conciliación.",
          },
        ],
        style: "normal",
      },
      {
        text: "DECIMA QUINTA.- (RESOLUCION DEL CONTRATO).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          { text: "El(la) " },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: ", reconoce la conclusión de su vínculo contractual con la institución en la fecha estipulada en la ",
          },
          { text: "CLÁUSULA SEXTA", style: "negrita" },
          {
            text: ", no siendo aplicable la inamovilidad por ningún concepto.",
          },
        ],
        style: "normal",
      },
      {
        text: [
          { text: "Así mismo el " },
          {
            text: "G.A.M.S",
            style: "negrita",
          },
          {
            text: " por así convenir a sus intereses, puede prescindir de sus servicios eventuales, sin necesidad de aviso previo ni de intervención judicial dejando sin efecto el contrato; De igual forma se dará lugar a la ",
          },
          {
            text: "RESOLUCIÓN DEL CONTRATO",
            style: "negrita",
          },
          {
            text: ", cuando el(la) ",
          },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: " deje de realizar la prestación de servicios sin justificativo alguno. Así como incurrir en faltas disciplinarias o de cualquier otra índole y/o incumpliere las tareas que le fueren asignadas, la comisión de algún acto contrario a las leyes y reglamentos internos; cometer actos que resulten atentatorios a los intereses del ",
          },
          {
            text: "G.A.M.S",
            style: "negrita",
          },
          {
            text: "; Omisión, negligencia, inobservancia o incumplimiento de las cláusulas establecidas en el presente documento contractual y otras que tengan relación con el desenvolvimiento de sus funciones.",
          },
        ],
        style: "normal",
      },
      {
        text: [
          { text: "Por su parte el " },
          { text: "CONTRATADO", style: "negrita" },
          { text: ", podrá también solicitar la " },
          { text: "RESOLUCIÓN", style: "negrita" },
          {
            text: " del presente contrato comunicando en forma escrita este extremo al ",
          },
          {
            text: "G.A.M.S.",
            style: "negrita",
          },
        ],
        style: "normal",
      },
      {
        text: [
          { text: "El " },
          {
            text: "G.A.M.S.",
            style: "negrita",
          },
          {
            text: " no estará sujeto a desembolso por daños y perjuicios resuelto el contrato, el (la) ",
          },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: " deberá devolver toda la documentación, información y material que tenga bajo su custodia y la que hubiese generado durante su vínculo contractual con el ",
          },
          {
            text: "G.A.M.S",
            style: "negrita",
          },
          {
            text: ", debiendo concluir con todas sus labores pendientes si las tuviera, bajo el advertido de iniciar las acciones que correspondan en su contra en caso de incumplimiento.",
          },
        ],
        style: "normal",
      },
      {
        text: "DECIMA SEXTA.-  (ACEPTACIÓN Y CONFORMIDAD).",
        style: ["normal", "negrita", "subrayado"],
      },
      {
        text: [
          { text: "El " },
          {
            text: "G.A.M.S",
            style: "negrita",
          },
          {
            text: " por una parte y por otra el (la) ",
          },
          { text: "CONTRATADO(A)", style: "negrita" },
          {
            text: ", declaran su conformidad con todas y cada una de las cláusulas precedentemente descritas, comprometiéndose a su fiel y estricto cumplimiento. En señal de conformidad y sin que medie presión de ninguna naturaleza alguna, firman al pie del presente documento.",
          },
        ],
        style: "normal",
      },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      {
        text: [{ text: "Sacaba, " }, { text: fecha_contrato }],
        style: ["normal", "centrado"],
      },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      {
        text: `${abreviatura_1}/${abreviatura_2}/${abreviatura_3}`,
        style: "nota",
      },
      { text: "Cc./Arch.", style: "nota" },
      { text: "Cc./File personal", style: "nota" },
    ];

    const designacion = [
      {
        text: "MEMORANDUM",
        style: ["titulo1", "subrayado"],
      },
      { text: this.codigo, style: ["normal1", "negrita", "centrado"] },
      { text: "\n" },
      {
        text: [{ text: "De         :       " }, { text: contratante }],
        style: "normal1",
      },
      {
        text: { text: contratante_cargo },
        style: ["margen", "negrita"],
      },
      { text: "\n" },
      {
        text: [{ text: "A           :       " }, { text: this.funcionario }],
        style: "normal1",
      },
      { text: "\n" },
      {
        text: [
          { text: "Fecha   :       " },
          { text: `Sacaba, ${fecha_contrato}` },
        ],
        style: "normal1",
      },
      { text: "\n" },
      {
        table: {
          widths: ["105%", "20%", "20%"],
          body: [[{ text: "DESIGNACION", style: "titulo1" }]],
        },
      },
      { text: "\n" },
      {
        text: [
          {
            text: "En mérito a las atribuciones conferidas por la Ley 482 (Ley de Gobiernos Autónomos Municipales) y conforme al procedimiento establecido en las Normas Básicas del Sistema de Administración de Personal, se le comunica que a partir de la fecha su persona ha sido designada, en el cargo de ",
          },
          {
            text: this.cargo,
            style: "negrita",
          },
          { text: ", con el " },
          {
            text: `ITEM Nº ${this.registro} dependiente de ${this.unidad}`,
            style: "negrita",
          },
          {
            text: ", funciones que deberá desempeñar dentro las disposiciones establecidas por la ley 1178 (SAFCO), Decreto supremo 23318-A, D.S. 4469 y demás normas Conexas. ",
          },
        ],
        style: "normal1",
      },
      { text: "\n" },
      {
        text: "Así mismo, antes de tomar posesión del cargo y cumplimiento del Art. 4 del D.S. N° 1233 de 16 de mayo de 2012, deberá efectuar su Declaración Jurada de Bienes y Rentas, ante la contraloría General del estado y presentar dos (2) copias a la Dirección de Organización Administrativa y Recursos Humanos.",
        style: "normal1",
      },
      { text: "\n" },
      {
        text: "Sin otro particular saludo a Ud. deseándole éxito en sus funciones. ",
        style: "normal1",
      },
      { text: "\n" },
      { text: "Atentamente, ", style: "normal1" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      {
        text: `${abreviatura_1}/${abreviatura_2}`,
        style: "nota",
      },
      { text: "Cc./File personal", style: "nota" },
      { text: "Cc./Arch.", style: "nota" },
      { text: "Adj./ manual de funciones", style: "nota" },
    ];
    const ascenso = [
      {
        text: "MEMORANDUM",
        style: ["titulo1", "subrayado"],
      },
      { text: this.codigo, style: ["normal1", "negrita", "centrado"] },
      { text: "\n" },
      {
        text: [{ text: "De         :       " }, { text: contratante }],
        style: "normal1",
      },
      {
        text: { text: contratante_cargo },
        style: ["margen", "negrita"],
      },
      { text: "\n" },
      {
        text: [{ text: "A           :       " }, { text: this.funcionario }],
        style: "normal1",
      },
      { text: "\n" },
      {
        text: [
          { text: "Fecha   :       " },
          { text: `Sacaba, ${fecha_contrato}` },
        ],
        style: "normal1",
      },
      { text: "\n" },
      {
        table: {
          widths: ["105%", "20%", "20%"],
          body: [[{ text: "ASCENSO", style: "titulo1" }]],
        },
      },
      { text: "\n" },
      {
        text: [
          {
            text: "En el marco de lo establecido por el Art. 29 (PROCESO DE PROMOCION) del D.S. 26115 NORMAS BÁSICAS - SISTEMA DE ADMINISTRACION DE PERSONAL y por determinación de esta Secretaría Municipal, su persona ha sido ascendida al cargo de ",
          },
          {
            text: this.cargo,
            style: "negrita",
          },
          { text: ", con el " },
          {
            text: `ITEM Nº ${this.registro}`,
            style: "negrita",
          },
          {
            text: ", funciones que deberá desempeñar a partir de la fecha, en estricto apego de las disposiciones establecidas por la ley 1178 (SAFCO), Decreto Supremo 23318-A y demás normas conexas. ",
          },
        ],
        style: "normal1",
      },
      { text: "\n" },
      {
        text: "Por lo que, en cumplimiento de lo dispuesto, se solicita a su persona hacer la entrega de la información, activos y documentación bajo inventario en el cargo que venía desempeñando y deberá de recibir la documentación y activos del nuevo cargo asignado.",
        style: "normal1",
      },
      { text: "\n" },
      {
        text: "Sin otro particular, sírvase cumplir las nuevas funciones designadas.",
        style: "normal1",
      },
      { text: "\n" },
      { text: "Atentamente, ", style: "normal1" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      {
        text: `${abreviatura_1}/${abreviatura_2}`,
        style: "nota",
      },
      { text: "Cc./File personal", style: "nota" },
      { text: "Cc./Arch.", style: "nota" },
      { text: "Adj./ manual de funciones", style: "nota" },
    ];
    const reasignacion = [
      {
        text: "MEMORANDUM",
        style: ["titulo1", "subrayado"],
      },
      { text: this.codigo, style: ["normal1", "negrita", "centrado"] },
      { text: "\n" },
      {
        text: [{ text: "De         :       " }, { text: contratante }],
        style: "normal1",
      },
      {
        text: { text: contratante_cargo },
        style: ["margen", "negrita"],
      },
      { text: "\n" },
      {
        text: [{ text: "A           :       " }, { text: this.funcionario }],
        style: "normal1",
      },
      { text: "\n" },
      {
        text: [
          { text: "Fecha   :       " },
          { text: `Sacaba, ${fecha_contrato}` },
        ],
        style: "normal1",
      },
      { text: "\n" },
      {
        table: {
          widths: ["105%", "20%", "20%"],
          body: [[{ text: "REASIGNACION", style: "titulo1" }]],
        },
      },
      { text: "\n" },
      {
        text: [
          {
            text: "Por determinación de esta instancia municipal, se comunica a su persona que, a partir de la fecha asumirá el Cargo de: ",
          },
          {
            text: this.cargo,
            style: "negrita",
          },
          { text: ", con " },
          {
            text: `ITEM Nº ${this.registro}`,
            style: "negrita",
          },
          {
            text: " por lo que, en cumplimiento a la normativa en actual vigencia, deberá hacer la entrega de los activos, información y documentación a su cargo, y asumir sus nuevas funciones en estricto apego a las disposiciones emanadas por la Ley 1178 y normas conexas. ",
          },
        ],
        style: "normal1",
      },
      { text: "\n" },
      {
        text: "En cuya consecuencia deberá recibir la documentación y activos que serán puestos a su cargo bajo inventario por la unidad correspondiente.",
        style: "normal1",
      },
      { text: "\n" },
      {
        text: "Con este particular, saludo a Ud. Deseándoles éxito en el desempeño de sus funciones.",
        style: "normal1",
      },
      { text: "\n" },
      { text: "Atentamente, ", style: "normal1" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      { text: "\n" },
      {
        text: `${abreviatura_1}/${abreviatura_2}`,
        style: "nota",
      },
      { text: "Cc./File personal", style: "nota" },
      { text: "Cc./Arch.", style: "nota" },
      { text: "Adj./ manual de funciones", style: "nota" },
    ];

    let text;

    if (this.contrato === "EVENTUAL" || this.contrato === "REMANENTE") {
      tamañoHoja = "LEGAL";
      if (this.nivel && this.nivel !== undefined) {
        if (parseFloat(this.nivel) === 14 || parseFloat(this.nivel) === 13) {
          text = auxiliar;
        }

        if (
          parseFloat(this.nivel) === 12 ||
          parseFloat(this.nivel) === 11 ||
          parseFloat(this.nivel) === 10 ||
          parseFloat(this.nivel) === 9
        ) {
          text = tecnico;
        }

        if (
          parseFloat(this.nivel) === 8 ||
          parseFloat(this.nivel) === 7 ||
          parseFloat(this.nivel) === 6 ||
          parseFloat(this.nivel) === 5
        ) {
          text = profesional;
        }
      }
    }

    if (this.contrato === "ITEM") {
      tamañoHoja = "LETTER";
      if (this.tipo_contrato === "MD") {
        text = designacion;
      }
      if (this.tipo_contrato === "MR") {
        text = reasignacion;
      }
      if (this.tipo_contrato === "MA") {
        text = ascenso;
      }
    }

    let docDefinition = {
      pageSize: tamañoHoja, // Tamaño de hoja oficio
      pageMargins: [88, 113, 60, 72], // Márgenes: [izquierda, superior, derecha, inferior]
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

    pdfMake.createPdf(docDefinition).download("document.pdf");
  }
}
