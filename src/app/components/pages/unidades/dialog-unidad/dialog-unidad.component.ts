import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  AbstractControl,
} from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { UnidadesService } from "src/app/services/unidades.service";
import { Component, Inject } from "@angular/core";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

import { convertToUpperCase } from "src/app/utils/utils";
import { DependenciasService } from "src/app/services/dependencias.service";

@Component({
  selector: "app-dialog-unidad",
  templateUrl: "./dialog-unidad.component.html",
  styleUrl: "./dialog-unidad.component.css",
})
export class DialogUnidadComponent {
  dependences: any[] = [];
  unidades: any[] = [];

  filteredDependents!: Observable<any[]>;

  idDependencia = new FormControl("", Validators.required);

  FormUnidad: FormGroup = this.fb.group({
    nombre: [
      "",
      [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern("[a-zA-Z\\s]*"),
        this.nombreExistsValidator.bind(this),
      ],
    ],
    id_dependencia: this.idDependencia,
    clasificacion: ["", [Validators.required]],
    estado: [true, Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogUnidadComponent>,
    private dependenciaService: DependenciasService,
    private unidadService: UnidadesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loadUnidades();
    this.loadDependencias();
    if (this.data) {
      this.FormUnidad.patchValue(this.data);
      this.idDependencia.setValue(this.data.id_dependencia._id);
    }
    this.filtro();
  }

  loadUnidades() {
    this.unidadService.getFiltroCampos("estado", "true").subscribe(
      (element) => {
        this.unidades = element;
      },
      (error) => {
        //console.error("Error al obtener los cargos:", error);
      }
    );
  }

  loadDependencias() {
    this.dependenciaService.getFiltroCampos("estado", "true").subscribe(
      (data) => {
        this.dependences = data;
      },
      (error) => {
        //console.error("Error al obtener los cargos:", error);
      }
    );
  }

  agregarDependencia(dependencia: any) {
    this.FormUnidad.get("id_dependencia")?.setValue(dependencia.value);
  }

  displayFn(option: any): string {
    return option ? option.nombre : "";
  }

  filtroTexto(
    control: FormControl,
    filtroDependencia: any[]
  ): Observable<any[]> {
    return control.valueChanges.pipe(
      startWith(""),
      map((value) => {
        const filterValue = (value || "").toString().toUpperCase();
        return filtroDependencia.filter((dependencia) =>
          (dependencia.nombre || "")
            .toString()
            .toUpperCase()
            .includes(filterValue)
        );
      })
    );
  }

  filtro() {
    this.filteredDependents = this.idDependencia.valueChanges.pipe(
      startWith(""),
      map((value) => this._filtrado(value || ""))
    );
  }

  private _filtrado(value: string): any[] {
    // Si el valor no es una cadena, no filtramos nada
    if (typeof value !== "string") {
      return [];
    }

    let filterValue = value.toUpperCase();
    return this.dependences.filter((dependencia) =>
      dependencia.nombre.toUpperCase().includes(filterValue)
    );
  }

  private clearCampos() {
    Object.keys(this.FormUnidad.value).forEach((key) => {
      // Verifica si el valor del campo es null o undefined
      if (
        this.FormUnidad.value[key] === null ||
        this.FormUnidad.value[key] === undefined
      ) {
        // Elimina el campo del objeto this.FormUnidad.value
        delete this.FormUnidad.value[key];
      }
    });
  }

  selectDependence(dependence: any) {
    this.FormUnidad.get("id_dependencia")?.setValue(dependence._id);
  }

  private nombreExistsValidator(
    control: AbstractControl
  ): { [key: string]: any } | null {
    return this.existsValidator(control, "nombre", this.data, this.unidades);
  }

  private existsValidator(
    control: AbstractControl,
    field: string,
    data: any,
    unidades: any[]
  ): { [key: string]: any } | null {
    const value = control.value;
    if (!value) {
      return null;
    }

    let element = "";

    if (data) {
      element = data.id_dependencia._id;
    }

    const exists = unidades.some(
      (unidad) =>
        unidad[field] === value.toUpperCase() && unidad._id !== element
    );
    return exists ? { [`${field}Exists`]: { value } } : null;
  }

  guardar() {
    //console.log(this.FormUnidad.value);

    this.clearCampos();
    convertToUpperCase(this.FormUnidad, "nombre");

    if (this.data) {
      this.unidadService
        .updateUnidad(this.data._id, this.FormUnidad.value)
        .subscribe(
          (response) => {
            this.dialogRef.close(response);
            //console.log("Respuesta del servicio:", response);
          },
          (error) => {
            //console.error("Error al llamar al servicio:", error);
          }
        );
    } else {
      this.unidadService.addUnidad(this.FormUnidad.value).subscribe(
        (response) => {
          this.dialogRef.close(response);
          //console.log("Respuesta del servicio:", response);
        },
        (error) => {
          //console.error("Error al llamar al servicio:", error);
        }
      );
    }
  }
}
