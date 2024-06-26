import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Component, Inject, OnInit, ChangeDetectorRef } from "@angular/core";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";

import { AuthService } from "src/app/services/auth.service";

import { DependenciasService } from "../../../../services/dependencias.service";
import { NivelesService } from "../../../../services/niveles.service";
import { PartidasService } from "../../../../services/partidas.service";
import { UnidadesService } from "../../../../services/unidades.service";
import { CargosService } from "../../../../services/cargos.service";

import {
  convertToUpperCase,
  convertToNumber,
  getColor,
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
  selector: "app-dialog-cargo",
  templateUrl: "./dialog-cargo.component.html",
  styleUrl: "./dialog-cargo.component.css",
})
export class DialogCargoComponent implements OnInit {
  level: any[] = [];
  dependenciaId: any;
  nivelId: any;
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
  idCargoDependiente = new FormControl();

  cargoFiltrado: any[] = [];
  noJob: boolean = false;
  dependientes: any[] = [];

  isDisabling = false;

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
        this.validarRegistro.bind(this),
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
  filteredDependents!: Observable<any[]>;

  userType: string;
  constructor(
    public dialogRef: MatDialogRef<DialogCargoComponent>,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private dependenciaService: DependenciasService,
    private unidadService: UnidadesService,
    private nivelService: NivelesService,
    private partidaService: PartidasService,
    private cargoService: CargosService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.authService.getUserRole().subscribe((userRole) => {
      this.userType = userRole;
    });
  }

  ngOnInit(): void {
    this.load();
  }

  async load() {
    this.loadPartidas();
    await this.loadCargos();
    this.filtros();
    this.loadDependencias();
    this.loadUnidades();
    this.loadNiveles();
    this.habilitarCampos();
    this.removerDependienteSuperior();
    this.formDatos();
    this.cdr.detectChanges();
  }

  formDatos() {
    if (this.data) {
      //console.log(this.data);

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
        this.fieldsEstatico(this.data.asignacion);
        this.cargarDependientes();

        // Cuando el cargo se encuentra deshabilitado, al habilitarlo el numero de registro no pasar por una verificacion y puede generar duplicidad, asi que se establecio quitar el valor del registro para validar la informacion y no generar duplicidad de registro.
        if (element.estado === false) {
          this.FormJob.get("registro")?.setValue("");
        }
      });
    }
  }

  habilitarCampos() {
    //habilitar campos segun tipo de contrato
    const contratoControl = this.FormJob.get("contrato");
    if (contratoControl) {
      contratoControl.valueChanges.subscribe((value) => {
        if (value === "EVENTUAL" || value === "REMANENTE") {
          this.fieldsDinamicoCargo(true);
        } else {
          this.fieldsDinamicoCargo(false);
        }
      });
    }
    //habilitar campos segun cargos dependientes
    this.FormJob.get("id_dependencia")?.valueChanges.subscribe((value) => {
      if (!this.isDisabling) {
        this.dependenciaId = value;
        this.handleValueChanges();
      }
    });
    this.FormJob.get("id_nivel_salarial")?.valueChanges.subscribe((value) => {
      if (!this.isDisabling) {
        this.nivelId = value;
        this.handleValueChanges();
      }
    });
  }

  getColors(value: any) {
    return getColor(value);
  }

  fieldsEstatico(enable: boolean) {
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

    //habilitar campos segun cargos dependientes, evita configurar el cambio de cargo de item a remanente o eventual, dado que tienen campos distintos
    if (this.FormJob.value.contrato !== "") {
      this.FormJob.get("contrato")?.disable();
    } else {
      this.FormJob.get("contrato")?.enable();
    }
  }

  fieldsDinamicoCargo(applyValidators: boolean): void {
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

  fieldsDinamico() {
    /* evita asignar cargos dependientes de distintas secretarias evitando incoherencia y error de datos en diagrama. Por ejemplo, el usuario puede asignar DESPACHO y seleccionar los cargos correspondientes, pero puede cambiar la secretaria y seleccionar SMFA y tambien seleccionar los cargos correspondientes, por ello se evita con esta funcionalidad. */

    let cargoSuperior;
    if (this.data) {
      cargoSuperior = this.idCargoControl.value;
    }

    //console.log(cargoSuperior);
    this.isDisabling = true;
    if (
      (this.dependientes && this.dependientes.length > 0) ||
      (cargoSuperior && cargoSuperior._id)
    ) {
      this.FormJob.get("id_nivel_salarial")?.disable();
      this.FormJob.get("id_dependencia")?.disable();
      this.FormJob.get("categoria")?.disable();
    } else {
      this.FormJob.get("id_nivel_salarial")?.enable();
      this.FormJob.get("id_dependencia")?.enable();
      this.FormJob.get("categoria")?.enable();
    }
    this.isDisabling = false;
  }

  displayFn(option: any): string {
    return option ? option.nombre : "";
  }

  updateCargosByDependencia(dependenciaId: string, nivelId: string) {
    let filteredCargos;
    this.idCargoControl.setValue("");

    const filteredNivel = this.level.filter(
      (level: any) => level._id === nivelId
    );

    if (this.data && this.data.id) {
      filteredCargos = this.cargos.filter(
        (data) =>
          ((data.id_cargo_superior !== undefined &&
            data.id_cargo_superior !== null) ||
            data.cargo_principal === true) &&
          data.id_dependencia?._id === dependenciaId &&
          data.nivel < filteredNivel[0]?.nombre &&
          data._id !== this.data.id
      );
    } else {
      filteredCargos = this.cargos.filter(
        (data) =>
          ((data.id_cargo_superior !== undefined &&
            data.id_cargo_superior !== null) ||
            data.cargo_principal === true) &&
          data.id_dependencia?._id === dependenciaId &&
          data.nivel < filteredNivel[0]?.nombre
      );
    }
    this.filteredCharges = this.filtroTexto(
      this.idCargoControl,
      filteredCargos
    );
  }

  updateCargosByDependientes(dependenciaId: string, nivelId: string) {
    let filteredCargos;
    this.idCargoDependiente.setValue("");

    const filteredNivel = this.level.filter(
      (level: any) => level._id === nivelId
    );

    if (this.data && this.data.id) {
      filteredCargos = this.cargos.filter(
        (data) =>
          (data.id_cargo_superior === undefined ||
            data.id_cargo_superior === null) &&
          data.cargo_principal === false &&
          data.id_dependencia?._id === dependenciaId &&
          data.nivel > filteredNivel[0]?.nombre &&
          data._id !== this.data.id
      );
    } else {
      filteredCargos = this.cargos.filter(
        (data) =>
          (data.id_cargo_superior === undefined ||
            data.id_cargo_superior === null) &&
          data.cargo_principal === false &&
          data.id_dependencia?._id === dependenciaId &&
          data.nivel > filteredNivel[0]?.nombre
      );
    }

    this.filteredDependents = this.filtroTexto(
      this.idCargoDependiente,
      filteredCargos
    );
  }

  filtros() {
    this.filteredOptions = this.idPartidaControl.valueChanges.pipe(
      startWith(""),
      map((value) => this._filter(value || ""))
    );

    this.filteredCharges = this.idCargoControl.valueChanges.pipe(
      startWith(""),
      map((value) => this._filterCharge(value || ""))
    );

    this.filteredDependents = this.idCargoDependiente.valueChanges.pipe(
      startWith(""),
      map((value) => this._filterCharge(value || ""))
    );

    this.filteredUnits = this.idUnidadControl.valueChanges.pipe(
      startWith(""),
      map((value) => this._filterUnit(value || ""))
    );
  }

  filtroTexto(control: FormControl, filteredCargos: any[]): Observable<any[]> {
    return control.valueChanges.pipe(
      startWith(""),
      map((value) => {
        const filterValue = (value || "").toString().toUpperCase();
        return filteredCargos.filter((cargo) =>
          (cargo.nombre || "").toString().toUpperCase().includes(filterValue)
        );
      })
    );
  }

  handleValueChanges() {
    if (this.dependenciaId !== "" && this.nivelId !== "") {
      this.updateCargosByDependencia(this.dependenciaId, this.nivelId);
      this.updateCargosByDependientes(this.dependenciaId, this.nivelId);
      //this.fieldsDinamico();
    }
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
    let valueDependencia = this.FormJob.get("id_dependencia")?.value;
    let valueNivel = this.FormJob.get("id_nivel_salarial")?.value;
    if (
      typeof value !== "string" ||
      value === "" ||
      valueDependencia === "" ||
      valueNivel === ""
    ) {
      return [];
    }

    let filterValue = value.toUpperCase();

    return this.cargos.filter((cargo) =>
      cargo.nombre.toUpperCase().includes(filterValue)
    );
  }

  private _filterUnit(value: string): any[] {
    let valueDependencia = this.FormJob.get("id_dependencia")?.value;
    // Si el valor no es una cadena, no filtramos nada
    if (typeof value !== "string" || value === "" || valueDependencia === "") {
      return [];
    }
    let filterValue = value.toUpperCase();
    //Retornamos las unidades que sólo coincidan con la dependencia seleccionada
    if (valueDependencia !== "") {
      return this.unidades.filter(
        (unidad) =>
          unidad.nombre.toUpperCase().includes(filterValue) &&
          unidad.id_dependencia &&
          valueDependencia === unidad.id_dependencia._id
      );
    } else {
      return this.unidades.filter((unidad) =>
        unidad.nombre.toUpperCase().includes(filterValue)
      );
    }
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

  async loadCargos() {
    this.cargos = await this.cargoService
      .getFiltroCampos("estado", "true")
      .toPromise();
  }

  agregarNivel(nivel: any) {
    this.FormJob.get("id_nivel_salarial")?.setValue(nivel.value);
  }

  agregarDependencia(dependencia: any) {
    this.FormJob.get("id_dependencia")?.setValue(dependencia.value);
    //Realizar a verificacion de la dependencia para habilitar los campos categoria y buscar unidad, referentes a item
    this.fillRegistro();
  }

  fillRegistro() {
    const contrato = this.FormJob.get("contrato")?.value;
    const unidad = this.idUnidadControl;
    const categoria = this.FormJob.get("categoria");
    let dependencia = this.FormJob.get("id_dependencia")?.value;

    this.FormJob.get("id_dependencia")?.valueChanges.subscribe((value) => {
      dependencia = value;
    });

    if (contrato === "ITEM" && dependencia !== "") {
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

  /*Funcionalidades para cargos Dependientes*/
  cargarDependientes() {
    if (
      this.cargos.some((element) => element.id_cargo_superior === this.data.id)
    ) {
      this.dependientes = this.cargos.filter(
        (element) => element.id_cargo_superior === this.data.id
      );
    }
    this.fieldsDinamico();
  }

  buscarDependientes(text: string) {
    const dependencia = this.FormJob.get("id_dependencia")?.value;
    //filtramos todos los elementos que coincidan con las condiciones
    this.cargoFiltrado = this.cargos.filter(
      (data) =>
        (data.id_cargo_superior === undefined ||
          data.id_cargo_superior === null) &&
        data.cargo_principal === false &&
        data.id_dependencia?._id === dependencia
    );
    this.fieldsDinamico();
  }

  seleccionarDependientes(event: MatAutocompleteSelectedEvent): void {
    const cargo = event.option.value;
    if (this.dependientes.some((element) => element._id === cargo._id)) return;
    this.dependientes.unshift(cargo);
    this.idCargoDependiente.setValue("");
    this.fieldsDinamico();
  }

  agregarDependientes() {
    this.dependientes.map((elements) => {
      this.cargoService.getCargosById(elements._id).subscribe(
        (element) => {
          let campo = {
            nombre: element.nombre,
            contrato: element.contrato,
            registro: element.registro,
            id_nivel_salarial: element.id_nivel_salarial._id,
            id_dependencia: element.id_dependencia._id,
            cargo_principal: element.cargo_principal,
            id_cargo_superior: this.data.id,
          };

          this.cargoService.updateCargo(elements._id, campo).subscribe(
            (response) => {
              this.dialogRef.close(response);
            },
            (error) => {
              //console.error("Error al llamar al servicio:", error);
            }
          );
        },
        (error) => {
          //console.error("Error al llamar al servicio:", error);
        }
      );
    });
  }

  removerDependientes(position: number) {
    if (this.data) {
      const dependiente = this.dependientes[position];
      let campo = {
        nombre: dependiente.nombre,
        contrato: dependiente.contrato,
        registro: dependiente.registro,
        id_nivel_salarial: dependiente.id_nivel_salarial._id,
        id_dependencia: dependiente.id_dependencia._id,
        cargo_principal: dependiente.cargo_principal,
      };

      this.cargoService.updateCargo(dependiente._id, campo).subscribe(
        (response) => {
          this.dependientes.splice(position, 1);
          this.fieldsDinamico();
        },
        (error) => {
          //console.error("Error al llamar al servicio:", error);
        }
      );
    } else {
      this.dependientes.splice(position, 1);
      this.fieldsDinamico();
    }
  }

  removerDependienteSuperior() {
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

  validarRegistro(control: AbstractControl): { [key: string]: any } | null {
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
    let filter;
    if (contrato === "REMANENTE" || contrato == "EVENTUAL") {
      filter = cargos.filter(
        (cargo) =>
          cargo.contrato === "REMANENTE" || cargo.contrato === "EVENTUAL"
      );
    } else {
      filter = cargos.filter((cargo) => cargo.contrato === contrato);
    }

    // búsqueda del número de registro introducido en el input registro, el resultado retorna un valor booleano (true, false)
    let exists = filter.some(
      (cargo) =>
        cargo[campo] && cargo[campo].toString() === value && cargo._id !== id
    );

    return exists ? { [`${campo}Exists`]: { value } } : null;
  }

  private limpiarCampos() {
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

  verificar() {
    //restaurar valores de nivel y dependencia al guardar, tambien tomar en cuenta que habilitara todos los campos this.isDisabling en el modo edicion, por tanto, una vez finalizado el if se reestableceran los campos y sus valores. IMPORTANT!
    this.isDisabling = true;
    this.FormJob.get("id_nivel_salarial")?.enable();
    this.FormJob.get("id_dependencia")?.enable();
    this.FormJob.get("contrato")?.enable();

    if (this.FormJob.value.contrato === "ITEM") {
      let state_unidad = false;
      let state_cargo = false;

      if (this.FormJob.value.id_unidad && this.FormJob.value.id_unidad._id) {
        state_unidad = this.unidades.some(
          (unidad) => unidad._id === this.FormJob.value.id_unidad._id
        );
      }

      if (
        this.FormJob.value.id_cargo_superior &&
        this.FormJob.value.id_cargo_superior._id
      ) {
        state_cargo = this.cargos.some(
          (cargo) =>
            this.FormJob.value.id_cargo_superior._id !== undefined &&
            cargo._id === this.FormJob.value.id_cargo_superior._id
        );
      } else {
        if (!this.FormJob.value.id_cargo_superior) {
          state_cargo = true;
        }
      }

      if (state_unidad && state_cargo) {
        this.validar();
      } else {
        if (!state_unidad) {
          this.idUnidadControl.setValue("");
        }
        if (!state_cargo) {
          this.idCargoControl.setValue("");
        }
        this.isDisabling = false;
        this.fieldsDinamico();
      }
    }

    if (
      this.FormJob.value.contrato === "EVENTUAL" ||
      this.FormJob.value.contrato === "REMANENTE"
    ) {
      let state_partida = false;
      let state_cargo = false;

      if (this.FormJob.value.id_partida && this.FormJob.value.id_partida._id) {
        state_partida = this.options.some(
          (partida) => partida._id === this.FormJob.value.id_partida._id
        );
      }

      if (
        this.FormJob.value.id_cargo_superior &&
        this.FormJob.value.id_cargo_superior._id
      ) {
        state_cargo = this.cargos.some(
          (cargo) =>
            this.FormJob.value.id_cargo_superior._id !== undefined &&
            cargo._id === this.FormJob.value.id_cargo_superior._id
        );
      } else {
        if (!this.FormJob.value.id_cargo_superior) {
          state_cargo = true;
        }
      }

      if (state_partida && state_cargo) {
        this.validar();
      } else {
        if (!state_partida) {
          this.idPartidaControl.setValue("");
        }
        if (!state_cargo) {
          this.idCargoControl.setValue("");
        }
        this.isDisabling = false;
        this.fieldsDinamico();
      }
    }
  }

  validar() {
    //eliminando el elemento de control del campo del formulario
    delete this.FormJob.value.disableCargoControl;

    //eliminando campo de cargo superior dependiente al deshabilitar el cargo
    if (
      this.FormJob.value.estado === false &&
      this.FormJob.value.id_cargo_superior
    ) {
      delete this.FormJob.value.id_cargo_superior;
    }

    //eliminando campos no correspondientes a item
    if (this.FormJob.value.contrato === "ITEM") {
      delete this.FormJob.value.id_partida;
      delete this.FormJob.value.denominacion;
      delete this.FormJob.value.duracion_contrato;
      delete this.FormJob.value.objetivo;
    }

    //eliminando campos no correspondientes a eventual o remanente
    if (
      this.FormJob.value.contrato === "EVENTUAL" ||
      this.FormJob.value.contrato === "REMANENTE"
    ) {
      delete this.FormJob.value.categoria;
      delete this.FormJob.value.id_unidad;
    }

    this.limpiarCampos();
    convertToUpperCase(this.FormJob, "nombre");
    convertToUpperCase(this.FormJob, "categoria");
    convertToUpperCase(this.FormJob, "contrato");
    convertToUpperCase(this.FormJob, "denominacion");
    convertToUpperCase(this.FormJob, "objetivo");
    convertToNumber(this.FormJob, "registro");
    convertToNumber(this.FormJob, "duracion_contrato");

    this.guardar();
    if (this.dependientes.length > 0) {
      this.agregarDependientes();
    }
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
