import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Component, Inject, OnInit, ChangeDetectorRef } from "@angular/core";

import { DependenciasService } from "../../../../services/dependencias.service";
import { NivelesService } from "../../../../services/niveles.service";
import { PartidasService } from "../../../../services/partidas.service";
import { UnidadesService } from "../../../../services/unidades.service";
import { CargosService } from "../../../../services/cargos.service";

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
  unidades: any[] = [];
  partida: any[] = [];
  options: any[] = [];
  cargos: any[] = [];

  idPartidaControl = new FormControl();
  idUnidadControl = new FormControl(
    { value: "", disabled: true },
    Validators.required
  );
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
        Validators.pattern("[a-zA-Z\\s\\.\\-\\(\\)\\ñ\\Ñ]*"),
      ],
    ],
    id_dependencia: ["", Validators.required],
    id_unidad: this.idUnidadControl,
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
  filteredUnits!: Observable<any[]>;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogCargoComponent>,
    private cdr: ChangeDetectorRef,
    private dependenciaService: DependenciasService,
    private unidadService: UnidadesService,
    private nivelService: NivelesService,
    private partidaService: PartidasService,
    private cargoService: CargosService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loadPartidas();
    this.loadCargos();
    this.filters();
    this.loadDependencias();
    this.loadUnidades();
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
    this.formDatos();

    this.cdr.detectChanges();
  }

  formDatos() {
    if (this.data) {
      this.cargoService.getCargosById(this.data.id).subscribe((element) => {
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

        this.idPartidaControl.setValue(element.id_partida);
        this.idUnidadControl.setValue(element.id_unidad);
        this.idCargoControl.setValue(element.id_cargo_superior);
        this.fillRegistro();
        this.toggleFields(this.data.asignacion);

        // Cuando el cargo se encuentra deshabilitado, al habilitarlo el numero de registro no pasar por una verificacion y puede generar duplicidad, asi que se establecio quitar el valor del registro para validar la informacion y no generar duplicidad de registro.
        if (element.estado === false) {
          this.FormJob.get("registro")?.setValue("");
        }
      });
    }
  }

  toggleFields(enable: boolean) {
    const controls = this.FormJob.controls;
    for (let controlName in controls) {
      if (enable) {
        controls[controlName].enable({ emitEvent: false });
      } else {
        controls[controlName].disable({ emitEvent: false });
      }
    }

    if (enable) {
      this.FormJob.get("contrato")?.enable({ emitEvent: false });
    }

    if (this.FormJob.value.contrato === "ITEM" && enable) {
      this.idUnidadControl.enable({ emitEvent: false });
      this.FormJob.get("categoria")?.enable({ emitEvent: false });
    } else {
      this.idUnidadControl.disable({ emitEvent: false });
      this.FormJob.get("categoria")?.disable({ emitEvent: false });
    }
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

    this.filteredUnits = this.idUnidadControl.valueChanges.pipe(
      startWith(""),
      map((value) => this._filterUnit(value || ""))
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

  private _filterUnit(value: string): any[] {
    // Si el valor no es una cadena, no filtramos nada
    if (typeof value !== "string") {
      return this.unidades;
    }

    let filterValue = value.toUpperCase();
    return this.unidades.filter((unidad) =>
      unidad.nombre.toUpperCase().includes(filterValue)
    );
  }

  loadPartidas() {
    this.partidaService
      .getFiltroCampos("estado", "true")
      .subscribe((partida) => {
        this.options = partida;
      });
  }

  loadDependencias() {
    this.dependenciaService
      .getFiltroCampos("estado", "true")
      .subscribe((dependencia) => {
        this.dependence = dependencia;
      });
  }

  loadUnidades() {
    this.unidadService.getFiltroCampos("estado", "true").subscribe((unidad) => {
      this.unidades = unidad;
    });
  }

  loadNiveles() {
    this.nivelService.getFiltroCampos("estado", "true").subscribe((nivel) => {
      this.level = nivel;
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

  agregarNivel(nivel: any) {
    this.FormJob.get("id_nivel_salarial")?.setValue(nivel.value);
  }

  agregarDependencia(dependencia: any) {
    this.FormJob.get("id_dependencia")?.setValue(dependencia.value);
  }

  agregarCargo(cargo: any) {
    this.FormJob.get("id_dependencia")?.setValue(cargo.value);
  }

  selectJob(job: any) {
    this.FormJob.get("superior")?.setValue(job._id);
  }

  fillRegistro() {
    const contrato = this.FormJob.get("contrato")?.value;
    const unidad = this.idUnidadControl;
    const categoria = this.FormJob.get("categoria");

    if (contrato === "ITEM") {
      unidad?.enable();
      categoria?.enable();
    } else {
      unidad?.disable();
      categoria?.disable();
    }
    if (!this.data) {
      this.cargoService
        .getFiltroCampos("estado", "true")
        .subscribe((charge) => {
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
    let id;
    if (this.data) {
      id = this.data.id;
    }
    return this.existsValidator(control, "registro", id, this.cargos);
  }

  existsValidator(
    control: AbstractControl,
    campo: string,
    id: any,
    cargos: any[]
  ): { [key: string]: any } | null {
    let value = control.value;
    if (!value) {
      return null;
    }

    // filtrado por tipo de contrato seleccionado
    let contrato = this.FormJob.value.contrato;
    let filter = cargos.filter((cargo) => cargo.contrato === contrato);

    // búsqueda del número de registro introducido en el input registro, el resultado retorna un valor booleano (true, false)
    let exists = filter.some(
      (cargo) =>
        cargo[campo] && cargo[campo].toString() === value && cargo._id !== id
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

  private clearCargos() {}

  validar() {
    //eliminando el elemento de control del campo del formulario
    delete this.FormJob.value.disableCargoControl;

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
    //console.log(this.FormJob.value);
    if (this.data) {
      this.cargoService.updateCargo(this.data.id, this.FormJob.value).subscribe(
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
