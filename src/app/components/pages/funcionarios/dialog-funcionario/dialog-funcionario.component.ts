import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Component, Inject, OnInit, ChangeDetectorRef } from "@angular/core";

import { CargosService } from "../../../../services/cargos.service";
import { FuncionariosService } from "src/app/services/funcionarios.service";
import { RegistrosService } from "src/app/services/registros.service";

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
  selectedContrato: string;

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
        Validators.required,
        Validators.minLength(2),
        Validators.pattern("[a-zA-Z\\s\\ñ\\Ñ]*"),
      ],
    ],
    materno: [
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
    ext: ["", [Validators.minLength(1), Validators.pattern("^[a-zA-Z1-9]*$")]],
    expedido: [
      "",
      [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern("[a-zA-Z]*"),
      ],
    ],
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
        Validators.required,
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
    contratante: [
      "",
      [Validators.minLength(2), Validators.pattern("[a-zA-Z\\s\\ñ\\Ñ]*")],
    ],
    cargo_contratante: [
      "",
      [Validators.minLength(2), Validators.pattern("[a-zA-Z\\s\\ñ\\Ñ]*")],
    ],
    tipo_contrato: [""],
    detalle_contrato: [""],
    fecha_contrato: [""],
  });

  filteredCharges!: Observable<any[]>;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogFuncionarioComponent>,
    private cdr: ChangeDetectorRef,
    private cargoService: CargosService,
    private funcionarioService: FuncionariosService,
    private registroService: RegistrosService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loadCargos();
    this.loadRegistros();
    this.loadFuncionarios();
    this.filters();
    this.removeCargo();
    this.formDatos();
    this.cdr.detectChanges();
  }

  formDatos() {
    if (this.data) {
      console.log(this.data);
      this.FormJob.patchValue({
        nombre: this.data.nombre || "",
        paterno: this.data.paterno || "",
        materno: this.data.materno || "",
        ci: this.data.ci || "",
        ext: this.data.ext || "",
        expedido: this.data.expedido || "",
        genero: this.data.genero || "",
        telefono: this.data.telefono || "",
        fecha_nacimiento: this.data.fecha_nacimiento || "",
        // correo: this.data.correo || "",
        distrito: this.data.domicilio?.distrito || "",
        zona: this.data.domicilio?.zona || "",
        pasaje: this.data.domicilio?.pasaje || "",
        calle: this.data.domicilio?.calle || "",
        numero_casa: this.data.domicilio?.numero_casa || "",
        id_cargo: this.data.registros[0]?.id_cargo || "",
        fecha_ingreso: this.data.registros[0]?.fecha_ingreso || "",
        fecha_conclusion: this.data.registros[0]?.fecha_conclusion || "",
        contratante: this.data.registros[0]?.contratante || "",
        cargo_contratante: this.data.registros[0]?.cargo_contratante || "",
        fecha_contrato: this.data.registros[0]?.fecha_contrato || "",
        tipo_contrato: this.data.registros[0]?.tipo_contrato || "",
        detalle_contrato: this.data.registros[0]?.detalle_contrato || "",
      });

      this.contrato = this.data.registros[0]?.id_cargo.contrato || "";

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

  setValidarDatosOcultos(applyValidators: boolean): void {
    const hiddenFields = [
      "fecha_ingreso",
      "fecha_conclusion",
      "id_cargo",
      "tipo",
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
      if (selectedCargo && selectedCargo.contrato) {
        this.selectedContrato = selectedCargo.contrato;
      } else {
        this.selectedContrato = "";
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

  loadRegistros() {
    this.registroService
      .getFiltroCampos("estado", "true")
      .subscribe((items) => {
        this.registros = items;
      });
  }

  loadFuncionarios() {
    this.funcionarioService.getFuncionarios().subscribe((items) => {
      this.funcionarios = items;
    });
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
    let value = control.value;
    if (!value) {
      return null;
    }

    let exists = funcionarios.some(
      (element) =>
        element[campo] &&
        element[campo].toString() === value &&
        element._id !== id
    );

    return exists ? { [`${campo}Exists`]: { value } } : null;
  }

  private convertToUpperCase(fieldName: string): void {
    if (
      this.FormJob.value[fieldName] &&
      this.FormJob.value[fieldName] !== null &&
      this.FormJob.value[fieldName] !== undefined
    ) {
      this.FormJob.value[fieldName] =
        this.FormJob.value[fieldName].toUpperCase();
    }
  }

  private convertToNumber(fieldName: string): void {
    if (
      this.FormJob.value[fieldName] &&
      this.FormJob.value[fieldName] !== null &&
      this.FormJob.value[fieldName] !== undefined
    ) {
      this.FormJob.value[fieldName] = parseInt(this.FormJob.value[fieldName]);
    }
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

  getCurrentISODateTime(): string {
    return new Date().toISOString();
  }

  convertToISO8601(dateString: string): string {
    // Intentar crear el objeto Date directamente
    let date = new Date(dateString);

    // Verificar si la fecha es inválida
    if (isNaN(date.getTime())) {
      // Limpiar la cadena de fecha para eliminar la parte de la zona horaria localizada y otros posibles formatos
      const cleanedDateString = dateString
        .replace(/\sGMT[^)]*\([^)]*\)/, "")
        .replace(/\s+/g, " ");

      // Intentar crear el objeto Date nuevamente con la cadena limpiada
      date = new Date(cleanedDateString);

      // Verificar si la fecha sigue siendo inválida
      if (isNaN(date.getTime())) {
        throw new Error("Formato invalido!");
      }
    }

    // Obtener año, mes y día
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);

    // Formatear la fecha en ISO 8601 (YYYY-MM-DD)
    return `${year}-${month}-${day}`;
  }

  convertFromISO8601(isoDateString: string): Date {
    const date = new Date(isoDateString);

    if (isNaN(date.getTime())) {
      throw new Error("Formato invalido ISO 8601");
    }

    return date;
  }

  validar() {
    let date_start;
    let date_final;
    if (this.data && this.data.estado === true) {
      date_start = this.convertToISO8601(this.FormJob.value.fecha_ingreso);
      date_final = this.convertToISO8601(this.FormJob.value.fecha_conclusion);

      this.FormJob.removeControl("fecha_ingreso");
      this.FormJob.removeControl("fecha_conclusion");

      this.FormJob.addControl("fecha_ingreso", this.fb.control(date_start));
      this.FormJob.addControl("fecha_conclusion", this.fb.control(date_final));
    }

    let fecha_nac = this.convertToISO8601(this.FormJob.value.fecha_nacimiento);
    this.FormJob.removeControl("fecha_nacimiento");
    this.FormJob.addControl("fecha_nacimiento", this.fb.control(fecha_nac));

    this.convertToUpperCase("distrito");
    this.convertToUpperCase("zona");
    this.convertToUpperCase("pasaje");
    this.convertToUpperCase("calle");
    this.convertToNumber("numero_casa");

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

    this.clearCampos();
    this.convertToUpperCase("nombre");
    this.convertToUpperCase("paterno");
    this.convertToUpperCase("materno");
    this.convertToUpperCase("ext");
    this.convertToUpperCase("expedido");
    this.convertToUpperCase("genero");
    this.convertToUpperCase("descripcion");

    this.convertToUpperCase("contratante");
    this.convertToUpperCase("cargo_contratante");
    this.convertToUpperCase("tipo_contrato");
    //this.convertToUpperCase("correo");

    this.convertToNumber("ci");
    this.convertToNumber("telefono");

    if (this.data && this.data.estado === true) {
      let FormRegister = {
        id_cargo: this.FormJob.value.id_cargo,
        fecha_ingreso: this.FormJob.value.fecha_ingreso,
        fecha_conclusion: this.FormJob.value.fecha_conclusion,
        contratante: this.FormJob.value.contratante,
        cargo_contratante: this.FormJob.value.cargo_contratante,
        tipo_contrato: this.FormJob.value.tipo_contrato,
        fecha_contrato: this.FormJob.value.fecha_contrato,
        detalle_contrato: this.FormJob.value.detalle_contrato,
        fecha_baja:
          !this.FormJob.value.disableCargoControl === false
            ? this.getCurrentISODateTime()
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
    //console.log(register);
    if (Object.keys(register).length > 0) {
      this.registroService.updateRegistro(register[0]._id, form).subscribe(
        (response) => {
          this.dialogRef.close(response);
        },
        (error) => {
          //console.error("Error al llamar al servicio:", error);
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
          //console.error("Error al llamar al servicio:", error);
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
