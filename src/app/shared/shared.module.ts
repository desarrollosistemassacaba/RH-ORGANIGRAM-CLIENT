import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { SeverMatSelectComponent } from "./components/sever-mat-select/sever-mat-select.component";
import { MaterialModule } from "./material/material.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

@NgModule({
  declarations: [SeverMatSelectComponent],
  imports: [
    CommonModule,
    NgxMatSelectSearchModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [SeverMatSelectComponent],
})
export class SharedModule {}
