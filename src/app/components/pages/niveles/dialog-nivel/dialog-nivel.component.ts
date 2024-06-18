import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NivelesService } from "src/app/services/niveles.service";
import { Component, Inject } from "@angular/core";
import { UtilsService } from "src/app/services/utils.service";

@Component({
  selector: "app-dialog-nivel",
  templateUrl: "./dialog-nivel.component.html",
  styleUrl: "./dialog-nivel.component.css",
})
export class DialogNivelComponent {
  niveles: any[] = [];

  FormNivel: FormGroup = this.fb.group({
    nombre: [
      "",
      [
        Validators.required,
        Validators.minLength(1),
        Validators.pattern("^[0-9]+$"),
        this.nombreExistsValidator.bind(this),
      ],
    ],
    haber_basico: [
      "",
      [
        Validators.required,
        Validators.minLength(1),
        Validators.pattern("^[0-9]+(?:\\.[0-9]+)?$"),
      ],
    ],
    cns: [
      "",
      [
        Validators.required,
        Validators.minLength(1),
        Validators.pattern("^[0-9]+(?:\\.[0-9]+)?$"),
      ],
    ],
    solidario: [
      "",
      [
        Validators.required,
        Validators.minLength(1),
        Validators.pattern("^[0-9]+(?:\\.[0-9]+)?$"),
      ],
    ],
    provivienda: [
      "",
      [
        Validators.required,
        Validators.minLength(1),
        Validators.pattern("^[0-9]+(?:\\.[0-9]+)?$"),
      ],
    ],
    profesional: [
      "",
      [
        Validators.required,
        Validators.minLength(1),
        Validators.pattern("^[0-9]+(?:\\.[0-9]+)?$"),
      ],
    ],
    estado: [true, Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogNivelComponent>,
    private nivelesService: NivelesService,
    private utils: UtilsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.FormNivel.patchValue(this.data);
    }
    this.loadPartidas();
  }

  loadPartidas() {
    this.nivelesService.getFiltroCampos("estado", "true").subscribe(
      (data) => {
        this.niveles = data;
      },
      (error) => {
        //console.error("Error al obtener los cargos:", error);
      }
    );
  }

  private clearCampos() {
    Object.keys(this.FormNivel.value).forEach((key) => {
      // Verifica si el valor del campo es null o undefined
      if (
        this.FormNivel.value[key] === null ||
        this.FormNivel.value[key] === undefined ||
        this.FormNivel.value[key] === ""
      ) {
        // Elimina el campo del objeto this.FormNivel.value
        delete this.FormNivel.value[key];
      }
    });
  }

  existsValidator(
    control: AbstractControl,
    field: string,
    data: any,
    niveles: any[]
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

    let exists = niveles.some(
      (partida) =>
        partida[field].toString() === value && partida._id !== element
    );

    return exists ? { [`${field}Exists`]: { value } } : null;
  }

  nombreExistsValidator(
    control: AbstractControl
  ): { [key: string]: any } | null {
    return this.existsValidator(control, "nombre", this.data, this.niveles);
  }

  guardar() {
    this.clearCampos();
    this.utils.convertToDecimal(this.FormNivel, "nombre");
    this.utils.convertToDecimal(this.FormNivel, "haber_basico");
    this.utils.convertToDecimal(this.FormNivel, "cns");
    this.utils.convertToDecimal(this.FormNivel, "solidario");
    this.utils.convertToDecimal(this.FormNivel, "provivienda");
    this.utils.convertToDecimal(this.FormNivel, "profesional");

    if (this.data) {
      this.nivelesService
        .updateNivel(this.data._id, this.FormNivel.value)
        .subscribe(
          (response) => {
            // Manejo de la respuesta del servicio si es necesario
            this.dialogRef.close(response);
            //console.log("Respuesta del servicio:", response);
          },
          (error) => {
            // Manejo de errores si ocurre alguno al llamar al servicio
            //console.error("Error al llamar al servicio:", error);
          }
        );
    } else {
      this.nivelesService.addNivel(this.FormNivel.value).subscribe(
        (response) => {
          // Manejo de la respuesta del servicio si es necesario
          this.dialogRef.close(response);
          //console.log("Respuesta del servicio:", response);
        },
        (error) => {
          // Manejo de errores si ocurre alguno al llamar al servicio
          //console.error("Error al llamar al servicio:", error);
        }
      );
    }
  }
}
