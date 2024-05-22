//auth.service.ts

import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, BehaviorSubject } from "rxjs";
import { tap } from "rxjs/operators";
import { environment } from "src/environments/environment";
const base_url = environment.base_url;

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private data: any;
  private loggedIn = new BehaviorSubject<boolean>(false);
  private userRole = new BehaviorSubject<string>("");
  private userName = new BehaviorSubject<string>("");

  constructor(private http: HttpClient, private router: Router) {}

  getNodos(): Observable<any> {
    console.log("organigrama.service");
    return this.http
      .get<any>(`${base_url}/nodos`)
      .pipe(
        tap((data) => console.log("Tipo de datos recibidos:", typeof data))
      );
  }

  getUserByUsername(username: string): Observable<any> {
    return this.http.get<any>(`${base_url}/admin?username=${username}`);
  }

  getUserRole(): Observable<string> {
    return this.userRole.asObservable();
  }

  getUserName(): Observable<string> {
    return this.userName;
  }

  getAllUsers(): Observable<any> {
    return this.http.get(`${base_url}/admin`);
  }

  getUserById(id: string): Observable<any> {
    return this.http.get<any>(`${base_url}/admin/${id}`);
  }

  createUser(user: any): Observable<any> {
    return this.http.post<any>(`${base_url}/admin`, user);
  }

  updateUser(id: string, user: any): Observable<any> {
    return this.http.put<any>(`${base_url}/admin/${id}`, user);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${base_url}/admin/${id}`);
  }

  login(credentials: { username: string; password: string }) {
    return this.http.post<any>(`${base_url}/login`, credentials).pipe(
      tap((user) => {
        if (user) {
          this.loggedIn.next(true);
          localStorage.setItem("token", user.token);
          this.userRole.next(user.role);
          this.userName = user.name;
        }
      })
    );
  }

  register(user: {
    name: string;
    surname_pa: string;
    surname_ma: string;
    ci: string;
    extension: string;
    phone: string;
    username: string;
    password: string;
    role: string;
  }) {
    return this.http.post<any>(`${base_url}/register`, user);
  }

  logout(): boolean {
    localStorage.removeItem("token");
    this.loggedIn.next(false);
    this.userRole.next("");
    this.router.navigate(["/login"]); // Redirige al usuario a la página de inicio de sesión después de cerrar sesión
    return true;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem("token");
  }
}
