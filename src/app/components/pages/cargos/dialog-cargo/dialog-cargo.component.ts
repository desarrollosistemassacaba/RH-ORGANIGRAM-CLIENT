import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Component, Inject, OnInit } from "@angular/core";

import { DependenciasService } from "../../../../services/dependencias.service";
import { NivelesService } from "../../../../services/niveles.service";
import { PartidasService } from "../../../../services/partidas.service";
import { CargosService } from "../../../../services/cargos.service";
import { OrganigramaService } from "src/app/services/organigrama.service";

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
  selector: "app-dialog-cargo",
  templateUrl: "./dialog-cargo.component.html",
  styleUrl: "./dialog-cargo.component.css",
})
export class DialogCargoComponent implements OnInit {
  level: any[] = [];
  dependence: any[] = [];
  partida: any[] = [];
  options: any[] = [];
  cargos: any[] = [];

  unidades = [
    "DESPACHO DEL ALCALDE",
    "DIRECCION JURIDICA",
    "DIRECCION AUDITORIA INTERNA",
    "DIRECCION DE COODINACION Y RELACIONES INTERINSTITUCIONALES",
    "UNIDAD DE VENTANILLA UNICA",
    "UNIDAD DE COMUNICACIÓN E IMAGEN INSTITUCIONAL",
    "UNIDAD DE TRANSPARENCIA Y LUCHA CONTRA LA CORRUPCION",
    "SECRETARIA MUNICIPAL DE PLANIFICACIÓN Y DESARROLLO TERRITORIAL",
    "DIRECCION DE PLANIFICACION Y DESARROLLO INTEGRAL",
    "UNIDAD DE PROYECTOS DE PRE-INVERSION",
    "UNIDAD DE PROGRAMACION DE OPERACIONES Y SEGUIMIENTO P.O.A.",
    "UNIDAD DE PLANIFICACION ESTRATEGICA",
    "DIRECCION DE CATASTRO MULTIFINALITARIO Y ADMINISTRACION DE TIERRAS",
    "DIRECCION DE GESTION URBANA Y TERRITORIAL",
    "UNIDAD DE SERVICIOS DE URBANISMO",
    "UNIDAD DE ORDENAMIENTO TERRITORIAL",
    "UNIDAD DE SANEAMIENTO DE BIENES INMUEBLES MUNICIPALES",
    "SECRETARIA MUNICIPAL DE FINANZAS Y ADMINISTRACION",
    "DIRECION DE ORGANIZACIÓN ADMINISTRATIVA Y RECURSOS HUMANOS",
    "UNIDAD DE ADMINISTRACION Y DESARROLLO DE PERSONAL",
    "DIRECCION DE FINANZAS",
    "UNIDAD DE TESORERIA Y CREDITO PUBLICO",
    "UNIDAD DE CONTABILIDAD",
    "UNIDAD DE PRESUPUESTOS",
    "DIRECTOR (A) ADMINISTRATIVO",
    "UNIDAD DE ARCHIVOS INSTITUCIONALES",
    "UNIDAD DE CONTRATACIONES",
    "UNIDAD DE ALMACENES",
    "UNIDAD DE SERVICIOS GENERALES",
    "UNIDAD DE ACTIVOS FIJOS",
    "DIRECCION DE INGRESOS Y SERVICIOS MUNICIPALES",
    "UNIDAD DE COBRANZA COACTIVA",
    "UNIDAD DE FISCALIZACION TRIBUTARIA",
    "UNIDAD DE VEHICULOS",
    "UNIDAD DE BIENES INMUEBLES",
    "UNIDAD DE ADMINISTRACION DE SERVICIOS MUNICIPALES",
    "UNIDAD DE ACTIVIDADES ECONOMICAS",
    "UNIDAD DE GOBIERNO ELECTRONICO",
    "SECRETARIA MUNICIPAL DE INFRAESTRUCTURA Y SERVICIOS",
    "DIRECCION DE OBRAS PUBLICAS Y SUPERVISION",
    "UNIDAD DE OBRAS PUBLICAS",
    "UNIDAD DE PLANTA DE ASFALTO Y SEÑALIZACION VIAL",
    "DIRECCION DE TRANSPORTES Y SERVICIOS ELECTRICOS",
    "UNIDAD DE MANTENIMIENTO DE INFRAESTRUCTURA ELECTRICA Y SEMAFORIZACION",
    "UNIDAD DE TRANSPORTES Y MAQUINARIA",
    "SECRETARIA MUNICIPAL DE LA MADRE TIERRA Y DESARROLLO PRODUCTIVO",
    "DIRECCION DE MEDIO AMBIENTE Y MADRE TIERRA",
    "UNIDAD DE GESTION DE RIESGOS",
    "UNIDAD DE AREAS VERDES, PARQUES Y JARDINES",
    "DIRECCION DE DESARROLLO PRODUCTIVO Y ECONOMIA PLURAL",
    "UNIDAD DE MATADERO MUNICIPAL",
    "UNIDAD DE TURISMO",
    "UNIDAD DE FORTALECIMIENTO Y DESARROLLO PRODUCTIVO",
    "UNIDAD AGROFORESTAL",
    "SECRETARIA MUNICIPAL DE DESARROLLO HUMANO INTEGRAL",
    "DIRECCION DE DESARROLLO HUMANO",
    "UNIDAD DE GENERO GENERACIONAL Y FAMILIA",
    "UNIDAD DE CULTURA",
    "UNIDAD DE EDUCACION",
    "UNIDAD DE DEPORTES Y PROMOCION",
    "UNIDAD DE SEGURIDAD CIUDADANA Y MOVILIDAD MUNICIPAL",
    "UNIDAD DE INTENDENCIA MUNICIPAL",
    "SECRETARIA MUNICIPAL DE SALUD",
    "DIRECCION DE ADMINISTRACION DE SALUD",
    "UNIDAD DE CONTROL SANITARIO Y ZOONOSIS",
    "UNIDAD ADMINISTRATIVO HOSPITAL MEXICO",
    "UNIDAD ADMINISTRATIVO HOSPITAL SOLOMON KLEIN",
    "UNIDAD ADMINISTRATIVO DE PROGRAMAS Y ESTABLECIMIENTOS DE SALUD DE 1º NIVEL",
    "UNIDAD DE ADMINISTRACION FINANCIERA DE SALUD",
    "UNIDAD DE CONTRATACIONES DE SALUD",
  ];

  idPartidaControl = new FormControl();
  idCargoControl = new FormControl();

  jobs: any[] = [];
  noJob: boolean = false;
  dependentJobs: any[] = [];

  FormJob: FormGroup = this.fb.group({
    nombre: [
      "",
      [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern("[a-zA-Z\\s.-]*"),
      ],
    ],
    id_dependencia: ["", Validators.required],
    id_unidad: [{ value: "", disabled: true }, Validators.required],
    categoria: [{ value: "", disabled: true }, Validators.required],
    id_nivel_salarial: ["", Validators.required],
    registro: [
      "",
      [
        Validators.required,
        Validators.minLength(1),
        Validators.pattern("^[0-9]+$"),
        this.registroExistsValidator.bind(this),
      ],
    ],
    cargo_principal: [false],
    estado: [true, Validators.required],
    contrato: ["", Validators.required],
    id_partida: this.idPartidaControl,
    denominacion: [""],
    duracion_contrato: [""],
    objetivo: [""],
    id_cargo_superior: this.idCargoControl,
    id_cargo_dependiente: [""],
    disableCargoControl: [false],
  });

  filteredOptions!: Observable<any[]>;
  filteredCharges!: Observable<any[]>;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogCargoComponent>,
    private dependenciaService: DependenciasService,
    private nivelService: NivelesService,
    private partidaService: PartidasService,
    private cargoService: CargosService,
    private organigramaService: OrganigramaService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.load();
    this.charge();
  }
  charge() {
    if (this.data) {
      this.cargoService.getCargosById(this.data).subscribe((element) => {
        this.FormJob.patchValue({
          nombre: element.nombre || "",
          id_dependencia: element.id_dependencia?._id || "",
          id_unidad: element.id_unidad || "",
          categoria: element.categoria || "",
          id_nivel_salarial: element.id_nivel_salarial?._id || "",
          registro: element.registro || "",
          cargo_principal: element.cargo_principal || false,
          estado: element.estado || false,
          contrato: element.contrato || "",
          id_partida: element.id_partida || "",
          denominacion: element.denominacion || "",
          duracion_contrato: element.duracion_contrato || "",
          objetivo: element.objetivo || "",
          id_cargo_superior: element.id_cargo_superior || "",
        });

        if (element.estado === false) {
          this.FormJob.get("registro")?.setValue("");
          this.FormJob.get("registro")?.markAsUntouched();
          this.FormJob.get("registro")?.markAsPristine();
        }

        this.idPartidaControl.setValue(element.id_partida);
        this.idCargoControl.setValue(element.id_cargo_superior);
      });
    }
  }

  load() {
    this.loadPartidas();
    this.loadCargos();
    this.filters();
    this.loadDependencias();
    this.loadNiveles();
    const contratoControl = this.FormJob.get("contrato");
    if (contratoControl) {
      contratoControl.valueChanges.subscribe((value) => {
        if (value === "EVENTUAL" || value === "REMANENTE") {
          this.setValidarDatosOcultos(true);
        } else {
          this.setValidarDatosOcultos(false);
        }
      });
    }
    this.removeCargoSuperior();
  }

  displayFn(option: any): string {
    return option ? option.nombre : "";
  }

  filters() {
    this.filteredOptions = this.idPartidaControl.valueChanges.pipe(
      startWith(""),
      map((value) => this._filter(value || ""))
    );

    this.filteredCharges = this.idCargoControl.valueChanges.pipe(
      startWith(""),
      map((value) => this._filterCharge(value || ""))
    );
  }

  private _filter(value: string): any[] {
    // Si el valor no es una cadena, no filtramos nada
    if (typeof value !== "string") {
      return this.options;
    }

    let filterValue = value.toUpperCase();
    return this.options.filter((option) =>
      option.nombre.toUpperCase().includes(filterValue)
    );
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

  loadPartidas() {
    this.partidaService.getPartidas().subscribe((items) => {
      const value = items.filter((item: any) => item.estado === true);
      //this.options = value.map((item: any) => item.nombre);
      this.options = value;
    });
  }

  loadDependencias() {
    this.dependenciaService.getDependencias().subscribe((dependences) => {
      const estado = dependences.filter(
        (dependencia: any) => dependencia.estado === true
      );
      this.dependence = estado;
    });
  }

  loadNiveles() {
    this.nivelService.getFiltroCampos("estado", "true").subscribe((levels) => {
      this.level = levels;
      const datosFiltradosYOrdenados = this.level.sort((a, b) => {
        if (a.nombre < b.nombre) {
          return -1;
        }
        if (a.nombre > b.nombre) {
          return 1;
        }
        return 0;
      });
      this.level = datosFiltradosYOrdenados;
    });
  }

  loadCargos() {
    this.cargoService.getFiltroCampos("estado", "true").subscribe((items) => {
      this.cargos = items;
    });
  }

  agregarPartida(partida: any) {
    this.FormJob.get("idPartidaControl")?.setValue(partida);
  }

  agregarNivel(level: any) {
    this.FormJob.get("id_nivel_salarial")?.setValue(level.value);
  }

  agregarDependencia(dependence: any) {
    this.FormJob.get("id_dependencia")?.setValue(dependence.value);
  }

  agregarCargo(charge: any) {
    this.FormJob.get("id_dependencia")?.setValue(charge.value);
  }

  selectJob(job: any) {
    this.FormJob.get("superior")?.setValue(job._id);
  }

  fillRegistro() {
    const contrato = this.FormJob.get("contrato")?.value;
    const idUnidadControl = this.FormJob.get("id_unidad");
    const categoria = this.FormJob.get("categoria");

    if (contrato === "ITEM") {
      idUnidadControl?.enable();
      categoria?.enable();
    } else {
      idUnidadControl?.disable();
      categoria?.disable();
    }

    this.cargoService.getFiltroCampos("estado", "true").subscribe((charge) => {
      if (contrato) {
        // Filtrar los datos según el tipo de contrato seleccionado
        let filteredRegistros;
        if (contrato === "EVENTUAL" || contrato == "REMANENTE") {
          filteredRegistros = charge.filter(
            (partida: any) => partida.contrato !== "ITEM"
          );
        } else {
          filteredRegistros = charge.filter(
            (cargo: any) => cargo.contrato === contrato
          );
        }

        // Filtrar los registros no numéricos
        const registrosNumericos = filteredRegistros
          .map((cargo: any) => parseInt(cargo.registro, 10))
          .filter((registro: number) => !isNaN(registro));
        // Verificar si hay registros numéricos
        if (registrosNumericos.length > 0) {
          // Obtener el registro más alto de las partidas filtradas
          const maxRegistro = Math.max(...registrosNumericos) + 1;
          // Asignar el registro más alto al campo de entrada
          this.FormJob.patchValue({ registro: maxRegistro });
        }
      }
    });
  }

  searchDependents(text: string) {
    //filtramos todos los elementos que coincidan con las condiciones
    const fil = this.cargos.filter(
      (data) =>
        (data.id_cargo_superior === undefined ||
          data.id_cargo_superior === null) &&
        data.cargo_principal === false &&
        data.estado === true
    );
    //obtenemos el valor del form para realizar un nuevo filtrado
    const dependencia = this.FormJob.get("id_dependencia")?.value;
    //filtramos todos los elementos que no coincidan con dependencia, para ello agregamos el return
    this.jobs = fil.filter((element) => {
      return element.id_dependencia?._id === dependencia;
    });
  }

  selectDependents(value: any) {
    const job = value;
    if (this.dependentJobs.some((element) => element._id === job._id)) return;
    this.dependentJobs.unshift(job);
    this.jobs = [];
  }

  removeDependentJob(position: number) {
    if (this.data) {
      //   const dependent = this.dependentJobs[position];
      //   this.cargoService
      //     .removeDependent(dependent._id)
      //     .subscribe((_) => this.dependentJobs.splice(position, 1));
    } else {
      this.dependentJobs.splice(position, 1);
    }
  }

  removeCargoSuperior() {
    this.FormJob.get("disableCargoControl")?.valueChanges.subscribe(
      (checked) => {
        if (checked) {
          this.idCargoControl.disable();
        } else {
          this.idCargoControl.enable();
        }
      }
    );
  }

  setValidarDatosOcultos(applyValidators: boolean): void {
    const hiddenFields = [
      "id_partida",
      "denominacion",
      "duracion_contrato",
      "objetivo",
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

  registroExistsValidator(
    control: AbstractControl
  ): { [key: string]: any } | null {
    return this.existsValidator(control, "registro", this.data, this.cargos);
  }

  existsValidator(
    control: AbstractControl,
    field: string,
    data: any,
    cargos: any[]
  ): { [key: string]: any } | null {
    let value = control.value;
    if (!value) {
      return null;
    }

    if (typeof value === "string") {
      value = value.toUpperCase();
    }

    let element = "";
    if (data) {
      element = data._id;
    }
    let exists = cargos.some(
      (cargo) =>
        cargo[field] &&
        cargo[field].toString() === value &&
        cargo._id !== element
    );

    return exists ? { [`${field}Exists`]: { value } } : null;
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

  private clearCargos() {}

  validar() {
    //eliminando el elemento de control del campo del formulario
    delete this.FormJob.value.disableCargoControl;

    // if (this.data && this.FormJob.value.estado === false) {
    //   this.organigramaService.updateOrganigram(this.data, "").subscribe(
    //     (response) => {
    //       this.dialogRef.close(response);
    //     },
    //     (error) => {
    //       console.error("Error al deshabilitar el cargo:", error);
    //     }
    //   );
    // }

    if (
      this.FormJob.value.estado === false &&
      this.FormJob.value.id_cargo_superior
    ) {
      delete this.FormJob.value.id_cargo_superior;
    }

    this.clearCampos();
    this.convertToUpperCase("nombre");
    this.convertToUpperCase("categoria");
    this.convertToUpperCase("contrato");
    this.convertToUpperCase("denominacion");
    this.convertToUpperCase("objetivo");
    this.convertToNumber("registro");
    this.convertToNumber("duracion_contrato");
    this.guardar();
  }

  guardar() {
    if (this.data) {
      this.cargoService.updateCargo(this.data, this.FormJob.value).subscribe(
        (response) => {
          this.dialogRef.close(response);
        },
        (error) => {
          //console.error("Error al llamar al servicio:", error);
        }
      );
    } else {
      this.cargoService.addCargo(this.FormJob.value).subscribe(
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
