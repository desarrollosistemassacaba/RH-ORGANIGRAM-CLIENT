import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { PartidasService } from "../../../../services/partidas.service";
import { Component, Inject } from "@angular/core";

@Component({
  selector: "app-dialog-partida",
  templateUrl: "./dialog-partida.component.html",
  styleUrl: "./dialog-partida.component.css",
})
export class DialogPartidaComponent {
  partidas: any[] = [];

  FormPartida: FormGroup = this.fb.group({
    nombre: [
      "",
      [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern("[a-zA-Z\\s]*"),
        this.nombreExistsValidator.bind(this),
      ],
    ],
    codigo: [
      "",
      [
        Validators.required,
        Validators.pattern("^[0-9]+$"),
        this.codigoExistsValidator.bind(this),
      ],
    ],
    fuente: [
      "",
      [
        Validators.required,
        Validators.minLength(1),
        Validators.pattern("^[0-9]+$"),
      ],
    ],
    organismo: [
      "",
      [
        Validators.required,
        Validators.minLength(1),
        Validators.pattern("^[0-9]+$"),
      ],
    ],
    monto_asignado: [
      "",
      [Validators.required, Validators.pattern("^[0-9]+(?:\\.[0-9]+)?$")],
    ],

    monto_refuerzo: ["", [Validators.pattern("^[0-9]+(?:.[0-9]+)?$")]],
    tipo: [
      "",
      [
        Validators.required,
        Validators.minLength(5),
        Validators.pattern("[a-zA-Z\\s]*"),
      ],
    ],
    estado: [true, Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogPartidaComponent>,
    private partidaService: PartidasService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.FormPartida.patchValue(this.data);
    }
    this.loadPartidas();
  }

  loadPartidas() {
    this.partidaService.getFiltradoEstado().subscribe(
      (data) => {
        this.partidas = data;
      },
      (error) => {
        console.error("Error al obtener los cargos:", error);
      }
    );
  }

  guardar() {
    this.clearCampos();
    this.convertToUpperCase("nombre");
    this.convertToUpperCase("tipo");
    this.convertToNumber("codigo");
    this.convertToNumber("fuente");
    this.convertToNumber("organismo");
    this.convertToNumber("codigo");

    if (this.data) {
      console.log(this.FormPartida.value);
      const valueN = this.FormPartida.value;
      console.log(valueN);
      this.partidaService
        .updatePartida(this.data._id, this.FormPartida.value)
        .subscribe(
          (response) => {
            // Manejo de la respuesta del servicio si es necesario
            this.dialogRef.close(response);
            console.log("Respuesta del servicio:", response);
          },
          (error) => {
            // Manejo de errores si ocurre alguno al llamar al servicio
            console.error("Error al llamar al servicio:", error);
          }
        );
      //   this.usuariosService
      //     .edit(this.data._id, this.FormPartida.value)
      //     .subscribe((dependences) => {
      //       this.dialogRef.close(dependences);
      //     });
    } else {
      console.log(this.FormPartida.value);

      this.partidaService.addPartida(this.FormPartida.value).subscribe(
        (response) => {
          // Manejo de la respuesta del servicio si es necesario
          this.dialogRef.close(response);
          console.log("Respuesta del servicio:", response);
        },
        (error) => {
          // Manejo de errores si ocurre alguno al llamar al servicio
          console.error("Error al llamar al servicio:", error);
        }
      );
    }
  }

  private clearCampos() {
    Object.keys(this.FormPartida.value).forEach((key) => {
      // Verifica si el valor del campo es null o undefined
      if (
        this.FormPartida.value[key] === null ||
        this.FormPartida.value[key] === undefined ||
        this.FormPartida.value[key] === ""
      ) {
        // Elimina el campo del objeto this.FormPartida.value
        delete this.FormPartida.value[key];
      }
    });
  }

  private convertToUpperCase(fieldName: string): void {
    if (
      this.FormPartida.value[fieldName] &&
      this.FormPartida.value[fieldName] !== null &&
      this.FormPartida.value[fieldName] !== undefined
    ) {
      this.FormPartida.value[fieldName] =
        this.FormPartida.value[fieldName].toUpperCase();
    }
  }

  private convertToNumber(fieldName: string): void {
    if (
      this.FormPartida.value[fieldName] &&
      this.FormPartida.value[fieldName] !== null &&
      this.FormPartida.value[fieldName] !== undefined
    ) {
      this.FormPartida.value[fieldName] = parseInt(
        this.FormPartida.value[fieldName]
      );
    }
  }

  existsValidator(
    control: AbstractControl,
    field: string,
    data: any,
    partidas: any[]
  ): { [key: string]: any } | null {
    let value = control.value;
    if (!value) {
      return null;
    }
    console.log(value);
    if (typeof value === "string") {
      value = value.toUpperCase();
    }

    // if (!isNaN(Number(value))) {
    //   numericValue = Number(value);
    // }

    let element = "";
    if (data) {
      element = data._id;
    }
    console.log(element);
    console.log(typeof value);
    let exists = partidas.some(
      (partida) =>
        partida[field].toString() === value && partida._id !== element
    );

    // if (numericValue) {
    //   exists = partidas.some(
    //     (partida) =>
    //       partida[field] === parseInt(value) && partida._id !== element
    //   );
    // } else {
    //   exists = partidas.some(
    //     (partida) => partida[field] === value && partida._id !== element
    //   );
    // }
    return exists ? { [`${field}Exists`]: { value } } : null;
  }

  nombreExistsValidator(
    control: AbstractControl
  ): { [key: string]: any } | null {
    return this.existsValidator(control, "nombre", this.data, this.partidas);
  }

  codigoExistsValidator(
    control: AbstractControl
  ): { [key: string]: any } | null {
    return this.existsValidator(control, "codigo", this.data, this.partidas);
  }
}
