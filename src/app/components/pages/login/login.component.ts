//login.component.ts
import { Component } from "@angular/core";
import { AuthService } from "../auth.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent {
  username: string;
  password: string;
  errorMessage: string;

  constructor(private authService: AuthService, private router: Router) {}
  hidePassword = true;

  onSubmit() {
    if (!this.username || !this.password) {
      this.errorMessage = "Por favor, complete todos los campos.";
      return;
    }

    this.authService
      .login({ username: this.username.toUpperCase(), password: this.password })
      .subscribe(
        () => {
          this.authService.getUserRole().subscribe((userRole) => {
            if (userRole === "user" || userRole === "visitor") {
              this.router.navigate(["/home/officers"]);
            } else if (userRole === "admin") {
              this.router.navigate(["/admin"]);
            } else {
              //this.errorMessage = "Error: Usuario sin rol válido.";
            }
          });
        },
        (error) => {
          this.errorMessage = error.error.error;
          if (error.error.error) {
            this.errorMessage = error.error.message;
          }
        }
      );
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }
}
