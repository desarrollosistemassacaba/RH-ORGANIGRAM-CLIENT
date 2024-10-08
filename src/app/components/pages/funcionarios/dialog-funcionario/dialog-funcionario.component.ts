import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from "@angular/material/dialog";
import { Component, Inject, OnInit, ChangeDetectorRef } from "@angular/core";

import { CargosService } from "../../../../services/cargos.service";
import { FuncionariosService } from "src/app/services/funcionarios.service";
import { RegistrosService } from "src/app/services/registros.service";
import { MessageDialogComponent } from "src/app/shared/components/message-dialog/message-dialog.component";

import {
  convertToUpperCase,
  convertToNumber,
  convertirFecha,
  getCurrentISODateTime,
} from "src/app/utils/utils";

import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  AbstractControl,
} from "@angular/forms";

@Component({
  selector: "app-dialog-funcionario",
  templateUrl: "./dialog-funcionario.component.html",
  styleUrl: "./dialog-funcionario.component.css",
})
export class DialogFuncionarioComponent implements OnInit {
  funcionarios: any[] = [];
  registros: any[] = [];
  cargos: any[] = [];
  contrato: string;
  sigla: string;
  cite: string;
  numero_contrato: string;
  selectedContrato: string;
  selectedRegistro: string;
  selectedCargoId: string;

  cargo_seleccionado: any;

  idCargoControl = new FormControl();

  idTipoControl = new FormControl(
    { value: "", disabled: true },
    Validators.required
  );

  idDescripcionControl = new FormControl({ value: "", disabled: true });

  FormJob: FormGroup = this.fb.group({
    nombre: [
      "",
      [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern("[a-zA-Z\\s\\ñ\\Ñ]*"),
      ],
    ],
    paterno: [
      "",
      [
        //Validators.required,
        Validators.minLength(2),
        Validators.pattern("[a-zA-Z\\s\\ñ\\Ñ]*"),
      ],
    ],
    materno: [
      "",
      [Validators.minLength(2), Validators.pattern("[a-zA-Z\\s\\ñ\\Ñ]*")],
    ],
    casada: [
      "",
      [Validators.minLength(2), Validators.pattern("[a-zA-Z\\s\\ñ\\Ñ]*")],
    ],
    ci: [
      "",
      [
        Validators.required,
        Validators.minLength(5),
        Validators.pattern("^[0-9]+$"),
        this.ciExistsValidator.bind(this),
      ],
    ],
    ext: [
      "",
      [
        Validators.minLength(1),
        Validators.pattern("^[a-zA-Z1-9]*$"),
        this.ciExistsValidator.bind(this),
      ],
    ],
    // expedido: [
    //   "",
    //   [
    //     //Validators.required,
    //     Validators.minLength(2),
    //     Validators.pattern("[a-zA-Z]*"),
    //   ],
    // ],
    genero: [
      "",
      [
        Validators.required,
        Validators.minLength(1),
        Validators.pattern("[a-zA-Z]*"),
      ],
    ],
    fecha_nacimiento: ["", Validators.required],
    telefono: ["", [Validators.minLength(7), Validators.pattern("^[0-9]+$")]],
    correo: [
      "",
      [
        Validators.minLength(10),
        Validators.pattern("[a-zA-Z0-9\\s\\.\\-\\_\\@]*"),
      ],
    ],
    distrito: [
      "",
      [
        //Validators.required,
        Validators.minLength(2),
        Validators.pattern("[a-zA-Z0-9\\s\\.\\-\\_]*"),
      ],
    ],
    zona: [
      "",
      [
        Validators.minLength(2),
        Validators.pattern("[a-zA-Z0-9\\s\\ñ\\Ñ\\.\\,\\-\\#]*"),
      ],
    ],
    pasaje: [
      "",
      [
        Validators.minLength(2),
        Validators.pattern("[a-zA-Z0-9\\s\\ñ\\Ñ\\.\\,\\-\\#]*"),
      ],
    ],
    calle: [
      "",
      [
        Validators.minLength(2),
        Validators.pattern("[a-zA-Z0-9\\s\\ñ\\Ñ\\.\\,\\-\\#]*"),
      ],
    ],
    numero_casa: [
      "",
      [Validators.minLength(1), Validators.pattern("^[0-9]+$")],
    ],
    id_cargo: this.idCargoControl,
    tipo: this.idTipoControl,
    descripcion: this.idDescripcionControl,
    fecha_ingreso: [""],
    fecha_conclusion: [""],
    disableCargoControl: [false],
    estado: [true, Validators.required],
    tipo_contrato: [{ value: "", disabled: true }],
  });

  filteredCharges!: Observable<any[]>;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogFuncionarioComponent>,
    private cdr: ChangeDetectorRef,
    private cargoService: CargosService,
    private funcionarioService: FuncionariosService,
    private registroService: RegistrosService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.load();
  }

  async load() {
    this.loadCargos();
    await this.loadRegistros();
    this.loadFuncionarios();
    this.filters();
    this.removeCargo();
    this.formDatos();
    this.cdr.detectChanges();
  }

  loadCargos() {
    this.cargoService.getFiltroCampos("estado", "true").subscribe((cargos) => {
      this.registroService
        .getFiltroCampos("estado", "true")
        .subscribe((registers) => {
          // Obtener un array de id_cargo de los registros
          const registerCargoIds = registers.map(
            (register: any) => register.id_cargo
          );

          // Filtrar cargos para excluir aquellos cuyo _id está en registerCargoIds
          this.cargos = cargos.filter(
            (cargo: any) => !registerCargoIds.includes(cargo._id)
          );
        });
    });
  }

  async loadRegistros() {
    this.registros = await this.registroService
      .getFiltroCampos("estado", "true")
      .toPromise();
  }

  loadFuncionarios() {
    this.funcionarioService.getFuncionarios().subscribe((items) => {
      this.funcionarios = items;
    });
  }
  async formDatos() {
    if (this.data) {
      //console.log(this.data);
      this.FormJob.patchValue({
        nombre: this.data.nombre || "",
        paterno: this.data.paterno || "",
        materno: this.data.materno || "",
        casada: this.data.casada || "",
        ci: this.data.ci || "",
        ext: this.data.ext || "",
        //expedido: this.data.expedido || "",
        genero: this.data.genero || "",
        telefono: this.data.telefono || "",
        fecha_nacimiento: this.data.fecha_nacimiento || "",
        distrito: this.data.domicilio?.distrito || "",
        zona: this.data.domicilio?.zona || "",
        pasaje: this.data.domicilio?.pasaje || "",
        calle: this.data.domicilio?.calle || "",
        numero_casa: this.data.domicilio?.numero_casa || "",
        id_cargo: this.data.registros[0]?.id_cargo || "",
        fecha_ingreso: this.data.registros[0]?.fecha_ingreso || "",
        fecha_conclusion: this.data.registros[0]?.fecha_conclusion || "",
        id_secretaria_contratante:
          this.data.registros[0]?.id_secretaria_contratante || "",
        tipo_contrato: this.data.registros[0]?.tipo_contrato || "",
        estado: this.data.estado,
      });

      this.cite = this.data.registros[0]?.cite || "";
      this.numero_contrato = this.data.registros[0]?.numero_contrato || "";
      //console.log(this.numero_contrato);
      //console.log(this.cite);

      if (this.data.registros[0]?.tipo_contrato) {
        this.FormJob.get("tipo_contrato")?.disable();
      }

      this.idCargoControl.setValue(this.data.registros[0]?.id_cargo);
      if (this.data && this.data.registros[0]?.id_cargo) {
        this.idCargoControl.disable();
      }
      if (this.data.estado === true) {
        this.setValidarDatosOcultos(true);
      } else {
        this.setValidarDatosOcultos(false);
      }
    } else {
      this.setValidarDatosOcultos(false);
    }
  }

  setContrato() {
    //Habilitar si es tipo contrato y sea un campo requerido
    //console.log(this.selectedContrato);
    if (this.selectedContrato === "ITEM") {
      this.FormJob.get("tipo_contrato")?.enable();
      this.FormJob.get("tipo_contrato")?.setValidators([Validators.required]);
    } else {
      this.FormJob.get("tipo_contrato")?.disable();
      this.FormJob.get("tipo_contrato")?.clearValidators();
    }

    this.FormJob.get("tipo_contrato")?.updateValueAndValidity();
  }

  setValidarDatosOcultos(applyValidators: boolean): void {
    const hiddenFields = [
      "fecha_ingreso",
      "fecha_conclusion",
      "id_cargo",
      "tipo",
      "tipo_contrato",
    ]; // Agrega más campos ocultos si es necesario
    hiddenFields.forEach((fieldName) => {
      const control = this.FormJob.get(fieldName);
      if (control) {
        // Verifica si control no es nulo
        if (applyValidators) {
          control.setValidators([Validators.required]);
        } else {
          control.clearValidators();
        }
        control.updateValueAndValidity();
      }
    });
  }

  displayFn(option: any): string {
    return option ? option.nombre : "";
  }

  filters() {
    this.filteredCharges = this.idCargoControl.valueChanges.pipe(
      startWith(""),
      map((value) => this._filterCharge(value || ""))
    );

    this.idCargoControl.valueChanges.subscribe((selectedCargo) => {
      this.cargo_seleccionado = selectedCargo;

      if (selectedCargo && selectedCargo.contrato) {
        this.selectedContrato = selectedCargo.contrato;
        this.setContrato();
      } else {
        this.selectedContrato = "";
      }

      if (selectedCargo && selectedCargo.registro) {
        this.selectedRegistro = selectedCargo.registro;
      } else {
        this.selectedRegistro = "";
      }

      if (selectedCargo && selectedCargo._id) {
        this.selectedCargoId = selectedCargo._id;
      } else {
        this.selectedRegistro = "";
      }
    });
  }

  private _filterCharge(value: string): any[] {
    // Si el valor no es una cadena, no filtramos nada
    if (typeof value !== "string") {
      return this.cargos;
    }

    let filterValue = value.toUpperCase();
    return this.cargos.filter((cargo) =>
      cargo.nombre.toUpperCase().includes(filterValue)
    );
  }

  removeCargo() {
    this.FormJob.get("disableCargoControl")?.valueChanges.subscribe(
      (checked) => {
        if (checked) {
          //this.idCargoControl.disable();
          this.idTipoControl.enable();
          this.idDescripcionControl.enable();
        } else {
          //this.idCargoControl.enable();
          this.idTipoControl.disable();
          this.idDescripcionControl.disable();
        }
      }
    );
  }

  ciExistsValidator(control: AbstractControl): { [key: string]: any } | null {
    let id;
    if (this.data && this.data.registros > 0) {
      id = this.data.registros[0].id_funcionario._id;
    }

    return this.existsValidator(control, "ci", id, this.funcionarios);
  }

  existsValidator(
    control: AbstractControl,
    campo: string,
    id: any,
    funcionarios: any[]
  ): { [key: string]: any } | null {
    let ext: any;
    let carnet;

    if (!this.FormJob || !this.FormJob.get("ext")) {
      ext = "vacio";
    } else {
      ext = this.FormJob.get("ext")?.value;
    }

    if (!this.FormJob || !this.FormJob.get("ci")) {
      carnet = "vacio";
    } else {
      carnet = this.FormJob.get("ci")?.value;
    }

    //console.log(carnet + ext);
    let value = control.value;
    if (!value) {
      return null;
    }
    let exists;
    if (ext === "vacio" || ext === "") {
      exists = funcionarios.some(
        (element) =>
          element[campo] &&
          element[campo].toString() === value &&
          element._id !== id
      );
    } else {
      exists = funcionarios.some(
        (element) =>
          element[campo] &&
          element[campo].toString() === value &&
          element.ext === ext.toUpperCase() &&
          element._id !== id
      );
    }

    //actualiza el estado de ext al introducir algun valor en el campo ci, pero genera errores y retardo en respuesta
    // if (control === this.FormJob.get("ci")) {
    //   this.FormJob.get("ext")?.updateValueAndValidity({
    //     onlySelf: true,
    //     emitEvent: false,
    //   });
    // }

    //actualiza el estado de ci al introducir algun valor en el campo ext
    if (control === this.FormJob.get("ext")) {
      this.FormJob.get("ci")?.updateValueAndValidity({
        onlySelf: true,
        emitEvent: false,
      });
    }

    return exists ? { [`${campo}Exists`]: { value } } : null;
  }

  private clearCampos() {
    Object.keys(this.FormJob.value).forEach((key) => {
      const value = this.FormJob.value[key];
      // Verifica si el valor del campo es null o undefined
      if (value === null || value === undefined || value === "") {
        // Elimina el campo del objeto this.FormJob.value
        delete this.FormJob.value[key];
      } else if (
        typeof value === "object" &&
        value !== null &&
        "_id" in value
      ) {
        // Si el valor es un objeto y contiene la propiedad _id, reasigna el valor a su _id
        this.FormJob.value[key] = value._id;
      }
    });
  }
  async assignementRegistro() {
    const elements = await this.registroService
      .getFiltroCampos("id_cargo", this.selectedCargoId)
      .toPromise();
    //console.log(elements);
    const year = new Date(this.FormJob.value.fecha_ingreso).getFullYear();

    // Filtrar elementos por año de ingreso
    const elementosFiltradosPorAnio = elements.filter((element: any) => {
      const fechaIngreso = new Date(element.fecha_ingreso);
      return fechaIngreso.getFullYear() === year && element.numero_contrato;
    });
    //console.log(elementosFiltradosPorAnio);
    if (elementosFiltradosPorAnio.length === 0) {
      this.numero_contrato = this.selectedRegistro;
      //console.log("es primer registro");
    } else {
      // Ordenar contratos manualmente
      elementosFiltradosPorAnio.sort((a: any, b: any) => {
        const [numA, letraA] = a.numero_contrato.split("-");
        const [numB, letraB] = b.numero_contrato.split("-");
        if (numA === numB) {
          if (!letraA) return -1;
          if (!letraB) return 1;
          return letraA.localeCompare(letraB);
        }
        return parseInt(numA) - parseInt(numB);
      });
      //.log("ordenado: ", elementosFiltradosPorAnio);
      let ultimoNumeroContrato =
        elementosFiltradosPorAnio.length > 0
          ? elementosFiltradosPorAnio[elementosFiltradosPorAnio.length - 1]
              .numero_contrato
          : null;
      //console.log("último contrato: ", ultimoNumeroContrato);
      if (ultimoNumeroContrato && ultimoNumeroContrato.includes("-")) {
        const partes = ultimoNumeroContrato.split("-");
        const ultimaLetra = partes[1];
        const nuevaLetra = String.fromCharCode(ultimaLetra.charCodeAt(0) + 1);
        this.numero_contrato = `${this.selectedRegistro}-${nuevaLetra}`;
        this.selectedRegistro = this.numero_contrato;
      } else if (ultimoNumeroContrato) {
        this.numero_contrato = `${this.selectedRegistro}-A`;
        this.selectedRegistro = this.numero_contrato;
      } else {
        this.numero_contrato = `${this.selectedRegistro}`;
        this.selectedRegistro = this.numero_contrato;
      }
    }

    //console.log(elementosFiltradosPorAnio.length);
    this.cdr.detectChanges();
  }

  private validarDomicilio() {
    convertToUpperCase(this.FormJob, "distrito");
    convertToUpperCase(this.FormJob, "zona");
    convertToUpperCase(this.FormJob, "pasaje");
    convertToUpperCase(this.FormJob, "calle");
    convertToNumber(this.FormJob, "numero_casa");

    let domicilio = {
      distrito: this.FormJob.value.distrito,
      zona: this.FormJob.value.zona,
      pasaje: this.FormJob.value.pasaje,
      calle: this.FormJob.value.calle,
      numero_casa: this.FormJob.value.numero_casa,
    };

    // Filtrar las entradas con valores vacíos
    let domicilioFiltrado = Object.fromEntries(
      Object.entries(domicilio).filter(([key, value]) => value !== "")
    );

    // Verificar si domicilioFiltrado tiene algún elemento
    if (Object.keys(domicilioFiltrado).length > 0) {
      // Agregar un nuevo campo 'nuevoCampo' con valor 'valorInicial' y sin validadores
      this.FormJob.addControl("domicilio", this.fb.control(domicilioFiltrado));

      delete this.FormJob.value.distrito;
      delete this.FormJob.value.zona;
      delete this.FormJob.value.pasaje;
      delete this.FormJob.value.calle;
      delete this.FormJob.value.numero_casa;
    }
  }

  async validar() {
    this.validarDomicilio();
    if (
      this.selectedContrato === "EVENTUAL" ||
      this.selectedContrato === "REMANENTE"
    ) {
      this.FormJob.value.tipo_contrato = "CO";
    }
    ///console.group(this.FormJob.value.disableCargoControl);
    if (
      this.selectedCargoId &&
      this.selectedCargoId !== undefined &&
      this.FormJob.value.fecha_ingreso &&
      this.FormJob.value.fecha_ingreso !== undefined &&
      this.numero_contrato === "" &&
      this.FormJob.value.disableCargoControl === false
    ) {
      //Si el funcionario esta asignado previamente a un cargo, cargo_seleccionado no recupera todos los datos, dado que ya esta seleccionado, esto suele suceder si se introdujo los campos por la base de datos, para evitar el error, se realiza una busqueda del cargo y se recuperan los valores.
      if (
        this.cargo_seleccionado &&
        !this.cargo_seleccionado.id_dependencia._id
      ) {
        this.cargo_seleccionado = await this.cargoService
          .getCargosById(this.selectedCargoId)
          .toPromise();
      }
      //console.log(this.cargo_seleccionado);

      //El registro numérico si tiene el valor 1, debe visualizar el valor 01
      if (
        this.selectedRegistro.toString().length >= 1 &&
        this.selectedRegistro.toString().length <= 2
      ) {
        this.selectedRegistro = "0" + this.selectedRegistro.toString();
      }

      //obtener el año para el contrato
      let years;
      let fecha_ingreso_text = convertirFecha(this.FormJob.value.fecha_ingreso);

      //obtener la dependencia para el contrato
      this.sigla = this.cargo_seleccionado.id_dependencia.sigla;
      //console.log(this.sigla);

      //Teniendo en cuenta que despacho es de nivel 1, por tanto la designacion no sera por secretaría
      let nivel;
      if (this.sigla === "DESPACHO") {
        nivel = "1";
      } else {
        nivel = "2";
      }

      //Obtenemos los campos de todas las secretarias o alcalde correspondientes a nive 1 o 2.
      const secretarios = await this.cargoService
        .getFiltroElementos("id_nivel_salarial", "nombre", nivel)
        .toPromise();
      //console.log(secretarios);
      let cargo: any;
      if (nivel === "1") {
        cargo = secretarios;
      } else {
        cargo = secretarios.filter((el: any) => el.sigla === this.sigla);
      }

      let registro;
      //que pasa si se modifican secretarios o alcaldes?? lo solucionamos con el siguiente fragmento
      if (
        (this.cargo_seleccionado && this.cargo_seleccionado.nivel === 1) ||
        (this.cargo_seleccionado && this.cargo_seleccionado.nivel === 2)
      ) {
        //lo agregamos dentro de un arreglo porque los elementos del else generan en arreglo
        registro = [this.cargo_seleccionado];
      } else {
        //agregar un mensaje en caso de que el secretario este vacante
        registro = this.registros.filter(
          (el: any) => el.id_cargo === cargo[0]?._id
        );
      }
      //console.log(registro[0]._id);
      //comprobando si se tiene asignado un funcionario al cargo de secretario, teniendo en cuenta que que si no lo tiene asignado no se generará correctamente el contrato y genera error.
      if (registro[0] && registro[0] !== undefined) {
        //Agregando campos al formulario
        this.FormJob.addControl(
          "id_secretaria_contratante",
          this.fb.control(registro[0]._id)
        );
      } else {
        const dialogRef = this.dialog.open(MessageDialogComponent, {
          width: "450px",
          data: {
            message:
              "No puede asignar los cargos dependientes de esta secretaria, debido a que no se tiene asignado al cargo de secretario(a) municipal perteneciente a esta secretaria.",
          },
        });
        dialogRef.afterClosed().subscribe((result) => {});
        return;
      }

      //teniendo en cuenta que la sigla para despacho no es la misma en el contrato
      if (this.sigla === "DESPACHO") {
        this.sigla = "DESP";
      }

      //console.log(this.numero_contrato);
      if (this.numero_contrato === "") {
        //cada tipo de contrato tiene un formato independiente
        //importante que el cite se genere para ambos
        if (this.selectedContrato === "ITEM") {
          years = fecha_ingreso_text.slice(-4);
          await this.assignementRegistro();
          this.selectedRegistro =
            "GAMS-" +
            this.sigla +
            "/DRH/" +
            this.FormJob.value.tipo_contrato +
            "/" +
            this.selectedRegistro +
            "/" +
            years;
        } else {
          years = fecha_ingreso_text.slice(-2);
          await this.assignementRegistro();
          this.selectedRegistro =
            "GAMS-" +
            this.sigla +
            "/CAPE/" +
            this.selectedRegistro +
            "/" +
            years;
        }
      }

      //solo los de contrato ITEM no requiere un valor alfabetico en el contrato
      //console.log(this.selectedRegistro);
      this.FormJob.addControl("cite", this.fb.control(this.selectedRegistro));
      this.FormJob.addControl(
        "numero_contrato",
        this.fb.control(this.numero_contrato)
      );
    }

    //console.log(this.numero_contrato);
    //console.log(this.selectedRegistro);

    this.clearCampos();
    convertToUpperCase(this.FormJob, "nombre");
    convertToUpperCase(this.FormJob, "paterno");
    convertToUpperCase(this.FormJob, "materno");
    convertToUpperCase(this.FormJob, "casada");
    convertToUpperCase(this.FormJob, "ext");
    //convertToUpperCase(this.FormJob, "expedido");
    convertToUpperCase(this.FormJob, "genero");
    convertToUpperCase(this.FormJob, "descripcion");
    convertToUpperCase(this.FormJob, "tipo_contrato");
    convertToNumber(this.FormJob, "ci");
    convertToNumber(this.FormJob, "telefono");

    if (this.data && this.data.estado === true) {
      let FormRegister = {
        id_cargo: this.FormJob.value.id_cargo,
        fecha_ingreso: this.FormJob.value.fecha_ingreso,
        fecha_conclusion: this.FormJob.value.fecha_conclusion,
        id_secretaria_contratante: this.FormJob.value.id_secretaria_contratante,
        tipo_contrato: this.FormJob.value.tipo_contrato,
        cite: this.FormJob.value.cite,
        numero_contrato: this.FormJob.value.numero_contrato,
        fecha_baja:
          !this.FormJob.value.disableCargoControl === false
            ? getCurrentISODateTime()
            : "",
        tipo: this.FormJob.value.tipo,
        descripcion: this.FormJob.value.descripcion,
        estado: !this.FormJob.value.disableCargoControl,
      };

      // Filtrar las entradas con valores vacíos
      let registroFiltrado = Object.fromEntries(
        Object.entries(FormRegister).filter(([key, value]) => value !== "")
      );

      // Verificar si registroFiltrado tiene algún elemento
      if (Object.keys(registroFiltrado).length > 0) {
        //console.log(registroFiltrado);
        this.guardarRegistro(registroFiltrado);
      }
      this.FormJob.value.estado = !this.FormJob.value.disableCargoControl;
      delete this.FormJob.value.disableCargoControl;
    }
    this.guardarFuncionario();
  }

  guardarRegistro(form: any) {
    const register = this.registros.filter(
      (element) => element.id_funcionario === this.data?._id
    );
    //console.log(form);
    if (Object.keys(register).length > 0) {
      this.registroService.updateRegistro(register[0]._id, form).subscribe(
        (response) => {
          this.dialogRef.close(response);
        },
        (error) => {
          console.error("Error al llamar al servicio:", error);
        }
      );
    } else {
      form = {
        ...form,
        id_funcionario: this.data._id,
      };

      this.registroService.addRegistro(form).subscribe(
        (response) => {
          this.dialogRef.close(response);
        },
        (error) => {
          console.error("Error al llamar al servicio:", error);
        }
      );
    }
  }

  guardarFuncionario() {
    if (this.data) {
      //console.log(this.data);
      this.funcionarioService
        .updateFuncionario(this.data._id, this.FormJob.value)
        .subscribe(
          (response) => {
            this.dialogRef.close(response);
          },
          (error) => {
            //console.error("Error al llamar al servicio:", error);
          }
        );
    } else {
      this.funcionarioService.addFuncionario(this.FormJob.value).subscribe(
        (response) => {
          this.dialogRef.close(response);
        },
        (error) => {
          //console.error("Error al llamar al servicio:", error);
        }
      );
    }
  }
}
