import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, BehaviorSubject } from "rxjs";
import { tap } from "rxjs/operators";

const base_url = "http://190.181.22.149:3310";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private data: any;
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  private userRole = new BehaviorSubject<string>(this.getUserRoleFromStorage());
  private userName = new BehaviorSubject<string>(this.getUserNameFromStorage());

  constructor(private http: HttpClient, private router: Router) {}

  private hasToken(): boolean {
    return !!localStorage.getItem("token");
  }

  private getUserRoleFromStorage(): string {
    return localStorage.getItem("role") || "";
  }

  private getUserNameFromStorage(): string {
    return localStorage.getItem("name") || "";
  }

  getUserRole(): Observable<string> {
    return this.userRole.asObservable();
  }

  getUserName(): Observable<string> {
    return this.userName.asObservable();
  }

  getUserNameValue(): string {
    return this.userName.getValue();
  }

  login(credentials: { username: string; password: string }) {
    return this.http.post<any>(`${base_url}/login`, credentials).pipe(
      tap((user) => {
        if (user) {
          this.loggedIn.next(true);
          localStorage.setItem("token", user.token);
          localStorage.setItem("role", user.role);
          localStorage.setItem("name", user.name);
          this.userRole.next(user.role);
          this.userName.next(user.name);
          return user;
        }
      })
    );
  }

  logout(): boolean {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    this.loggedIn.next(false);
    this.userRole.next("");
    this.router.navigate(["/login"]); // Redirige al usuario a la página de inicio de sesión después de cerrar sesión
    return true;
  }

  isLoggedIn(): boolean {
    return this.loggedIn.value;
  }
}
