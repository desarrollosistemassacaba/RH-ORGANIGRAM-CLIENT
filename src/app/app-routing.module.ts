import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./components/home/home.component";
import { OrganigramaComponent } from "./components/pages/organigrama/organigrama.component";
const routes: Routes = [
  {
    path: "",
    component: HomeComponent,
    children: [
      {
        path: "",
        loadChildren: () =>
          import(`./components/pages/page-routing.module`).then(
            (m) => m.PageRoutingModule
          ),
      },
    ],
  },
  { path: "organigrama", component: OrganigramaComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
