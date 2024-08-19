import { Component, Inject } from "@angular/core";
import { OrganigramaComponent } from "../organigrama.component";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from "@angular/material/dialog";
import { RegistrosService } from "src/app/services/registros.service";
import { CargosService } from "src/app/services/cargos.service";
import { ViewFuncionarioComponent } from "../../funcionarios/view-funcionario/view-funcionario.component";

@Component({
  selector: "app-dialog-organigrama",
  templateUrl: "./dialog-organigrama.component.html",
  styleUrl: "./dialog-organigrama.component.css",
})
export class DialogOrganigramaComponent {
  private cargos: any[] = [];
  private nodo: any[] = [];

  constructor(
    private dialogRef: MatDialogRef<OrganigramaComponent>,
    private registroService: RegistrosService,
    private cargoService: CargosService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.nodo = this.data.data;
    this.recuperarDatos();
  }

  async recuperarDatos() {
    let register = await this.registroService.getRegistros().toPromise();

    register = register.filter(
      (element: any) =>
        element.estado === true && this.nodo.includes(element.id_cargo?._id)
    );

    for (let index = 0; index < this.nodo.length; index++) {
      let elemento: any = await this.cargoService
        .getCargosById(this.nodo[index])
        .toPromise();
      this.cargos.push(elemento);
    }

    if (this.cargos.length === 1) {
      if (register.length > 0) {
        const dialogRef = this.dialog.open(ViewFuncionarioComponent, {
          data: register[0]._id, // Pasar los datos del cargo al componente de edición
        });

        dialogRef.afterClosed().subscribe((result) => {});
      }
    }
    // console.log(this.cargos.length);
    // console.log(register);
  }
}
