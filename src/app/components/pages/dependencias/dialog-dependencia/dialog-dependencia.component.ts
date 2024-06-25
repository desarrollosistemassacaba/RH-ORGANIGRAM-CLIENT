import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  AbstractControl,
} from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DependenciasService } from "../../../../services/dependencias.service";
import { Component, Inject } from "@angular/core";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

import { convertToUpperCase } from "src/app/utils/utils";

@Component({
  selector: "app-dialog-dependencia",
  templateUrl: "./dialog-dependencia.component.html",
  styleUrl: "./dialog-dependencia.component.css",
})
export class DialogDependenciaComponent {
  availableDependences: any[] = [];
  noDependence: boolean = false;
  dependences: any[] = [];

  filteredDependents!: Observable<any[]>;

  idDependencia = new FormControl();

  FormDependence: FormGroup = this.fb.group({
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
    sigla: [
      "",
      [
        Validators.required,
        Validators.pattern("[a-zA-Z]*"),
        this.siglaExistsValidator.bind(this),
      ],
    ],
    tipo: ["", Validators.required],
    estado: [true, Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogDependenciaComponent>,
    private dependenciaService: DependenciasService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.FormDependence.patchValue(this.data);
      this.idDependencia.setValue(this.data.id_dependencia);
    }
    this.loadDependencias();
    this.filtro();
  }

  private loadDependencias() {
    this.dependenciaService.getFiltroCampos("estado", "true").subscribe(
      (data) => {
        this.dependences = data;
      },
      (error) => {
        //console.error("Error al obtener los cargos:", error);
      }
    );
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
    Object.keys(this.FormDependence.value).forEach((key) => {
      // Verifica si el valor del campo es null o undefined
      if (
        this.FormDependence.value[key] === null ||
        this.FormDependence.value[key] === undefined
      ) {
        // Elimina el campo del objeto this.FormDependence.value
        delete this.FormDependence.value[key];
      }
    });
  }

  searchDependence(value: any) {
    this.loadDependencias();
    this.dependenciaService.getFiltroCampos("estado", "true").subscribe(
      (data) => {
        this.availableDependences = data;
      },
      (error) => {
        //console.error("Error al obtener los cargos:", error);
      }
    );
  }

  selectDependence(dependence: any) {
    this.FormDependence.get("id_dependencia")?.setValue(dependence._id);
  }

  removeDependence() {
    if (this.noDependence) {
      this.FormDependence.removeControl("id_dependencia");
    } else {
      this.FormDependence.addControl(
        "id_dependencia",
        new FormControl(
          this.data?.id_dependencia ? this.data.id_dependencia._id : "",
          Validators.required
        )
      );
    }
  }

  private existsValidator(
    control: AbstractControl,
    field: string,
    data: any,
    dependences: any[]
  ): { [key: string]: any } | null {
    const value = control.value;
    if (!value) {
      return null;
    }

    let element = "";
    if (data) {
      element = data._id;
    }

    const exists = dependences.some(
      (dependence) =>
        dependence[field] === value.toUpperCase() && dependence._id !== element
    );
    return exists ? { [`${field}Exists`]: { value } } : null;
  }

  private nombreExistsValidator(
    control: AbstractControl
  ): { [key: string]: any } | null {
    return this.existsValidator(control, "nombre", this.data, this.dependences);
  }

  private siglaExistsValidator(
    control: AbstractControl
  ): { [key: string]: any } | null {
    return this.existsValidator(control, "sigla", this.data, this.dependences);
  }

  guardar() {
    this.FormDependence.value.id_dependencia =
      this.FormDependence.value.id_dependencia?._id ||
      this.FormDependence.value.id_dependencia;

    this.clearCampos();
    convertToUpperCase(this.FormDependence, "nombre");
    convertToUpperCase(this.FormDependence, "sigla");

    if (this.data) {
      this.dependenciaService
        .updateDependencia(this.data._id, this.FormDependence.value)
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
      this.dependenciaService
        .addDependencia(this.FormDependence.value)
        .subscribe(
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
