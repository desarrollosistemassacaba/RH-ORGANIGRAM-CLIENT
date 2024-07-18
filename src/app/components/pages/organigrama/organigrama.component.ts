// organigrama.component.ts
import {
  Component,
  ElementRef,
  ChangeDetectorRef,
  AfterViewInit,
  ViewChild,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { DialogOrganigramaComponent } from "./dialog-organigrama/dialog-organigrama.component";
import { OrganigramaService } from "src/app/services/organigrama.service";
import { RegistrosService } from "src/app/services/registros.service";

import { getColor } from "src/app/utils/utils";

interface Nodo {
  _id: string;
  puesto?: string;
  nombre: string;
  registro?: number;
  contrato: string;
  hijos?: Nodo[];
  id_cargo_superior?: { _id: string }[];
}

@Component({
  selector: "app-organigram",
  templateUrl: "./organigrama.component.html",
  styleUrls: ["./organigrama.component.css"],
})
export class OrganigramaComponent implements AfterViewInit {
  @ViewChild("organigramaContainer", { static: true })
  organigramaContainer?: ElementRef;
  @ViewChild("grid", { static: true }) grid!: ElementRef;

  // Variables para almacenar el estado del arrastre
  startX: number | null = null;
  startY: number | null = null;
  startScrollLeft: number | null = null;
  startScrollTop: number | null = null;

  zoomLevel: number = 1;

  registros: any;
  cargos: any;

  constructor(
    private organigramaService: OrganigramaService,
    private registrosService: RegistrosService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    let valor = "DESPACHO";
    this.load(valor);
  }
  generarDiagrama(valor: string): void {
    this.load(valor);
  }

  inicializarDatos() {
    this.registrosService
      .getRegistros()
      .subscribe((cargo) => (this.cargos = cargo));
  }
  load(valor: string) {
    let elemento = "id_dependencia";
    let campo = "sigla";
    //dado que sub alcaldias pertenece a la secretaria de despacho se requiere dividir, por tanto  al agregar una variable booleana se realiza el filtrado correspondiente simplemente eliminando un cargo superior, dado que son dos, al no encontrar uno de ellos crea con el que encuentra.

    let subelementos = false;
    if (valor === "SUB-ALCALDIA") {
      valor = "DESPACHO";
      subelementos = true;
    }
    this.clearContents();
    this.inicializarDatos();

    this.registrosService.getRegistros().subscribe((register) => {
      this.organigramaService
        .getFiltroElementos(elemento, campo, valor)
        .subscribe(
          (data) => {
            let filteredData;
            if (subelementos) {
              filteredData = data.filter(
                (objeto: any) => objeto.registro !== 1
              );
            } else {
              filteredData = data;
            }

            //console.log(register);
            const combinedData = filteredData.map((cargo: any) => {
              const registroEncontrado = register.find(
                (registro: any) => registro.id_cargo?._id === cargo._id
              );

              if (registroEncontrado) {
                const funcionario = registroEncontrado.id_funcionario;
                cargo.personal = `${
                  funcionario.nombre && funcionario.nombre !== null
                    ? funcionario.nombre
                    : ""
                } ${funcionario.paterno ? funcionario.paterno : ""} ${
                  funcionario.materno ? funcionario.materno : ""
                } ${funcionario.casada ? funcionario.casada : ""}`;
              } else {
                cargo.personal = "SIN PERSONAL";
              }
              return cargo;
            });

            //console.log(combinedData);
            const datos = filteredData.map((objeto: any) =>
              this.modelarEstructura(objeto)
            );

            const datosEstructurados = this.transformarEstructura(datos);
            //console.log(datos);
            this.setupZoomAndPan();
            //this.addStuffToContents();

            this.getNode(datosEstructurados);
            this.cdr.detectChanges();
          },
          (error) => {
            //console.error("Error al obtener los cargos:", error);
          }
        );
    });
  }

  modelarEstructura(dato: any) {
    let nodo;
    if (dato.id_cargo_superior) {
      nodo = {
        _id: dato._id,
        nombre: dato.nombre,
        registro: dato.registro,
        contrato: dato.contrato,
        personal: dato.personal,
        id_cargo_superior: [{ _id: dato.id_cargo_superior }],
      };
    } else {
      nodo = {
        _id: dato._id,
        nombre: dato.nombre,
        registro: dato.registro,
        contrato: dato.contrato,
        personal: dato.personal,
      };
    }
    return nodo;
  }

  //estructurar datos a arbol id_cargo_superior-hijos
  transformarEstructura(estructuraSimplificada: Nodo[]): Nodo[] {
    const mapa = new Map<string, Nodo>();
    // Paso 1: Construir un mapa con los nodos por ID e inicializar hijos
    estructuraSimplificada.forEach((item) => {
      mapa.set(item._id, { ...item, hijos: [] });
    });
    // Paso 2: Asignar los hijos a los nodos correspondientes
    estructuraSimplificada.forEach((item) => {
      const id_cargo_superior = mapa.get(item._id);
      if (id_cargo_superior && item.id_cargo_superior) {
        item.id_cargo_superior.forEach((p) => {
          const nodoid_cargo_superior = mapa.get(p._id);
          if (nodoid_cargo_superior) {
            if (!nodoid_cargo_superior.hijos) {
              nodoid_cargo_superior.hijos = []; // Asegurar que hijos esté inicializado
            }
            nodoid_cargo_superior.hijos.push(id_cargo_superior); // Agregar el nodo como hijo
          }
        });
      }
    });
    // Paso 3: Retornar los nodos raíz
    const nodosRaiz = estructuraSimplificada.filter(
      (item) => !item.id_cargo_superior
    );
    return nodosRaiz.map((raiz) => mapa.get(raiz._id)!);
  }

  //logica para dibujar el diagrama
  getNode(estructura: any[]): void {
    if (estructura) {
      if (this.organigramaContainer) {
        this.addNode(this.organigramaContainer.nativeElement, estructura[0]);
        this.createControls(this.organigramaContainer.nativeElement);
        this.addEventListeners();
        //this.expandCollapseAutomatically();
      } else {
        //console.error("Error: organigramaContainer no está inicializado.");
      }
    } else {
      //console.error("Error: Los datos no estan inicializados.");
    }
  }

  addEventListeners(): void {
    if (this.organigramaContainer) {
      const btnAdds =
        this.organigramaContainer.nativeElement.querySelectorAll(
          ".nodo .btn-add"
        );
      const btnEdits =
        this.organigramaContainer.nativeElement.querySelectorAll(
          ".nodo .btn-edit"
        );

      btnAdds.forEach((btn: HTMLButtonElement) => {
        btn.addEventListener("click", () => {
          const id = parseInt(btn.getAttribute("data-id") || "0", 10); // Convertir a número entero
          if (!isNaN(id)) {
            const dialogRef = this.dialog.open(DialogOrganigramaComponent, {
              width: "200px",
              data: { node_id: id },
            });
          }
        });
      });

      btnEdits.forEach((btn: HTMLButtonElement) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          if (id) {
            //this.openNodeDetailModal(id);
          }
        });
      });
    }
  }

  //   handleAddEvent(_id: string): void {
  //     // Encuentra el nodo correspondiente al ID
  //     const nodo = this.findNodeById(this.data, id);
  //     if (nodo) {
  //       // Abre el componente de detalles del nodo y pasa la información del nodo
  //       this.openNodeDetailModal(nodo);
  //     }
  //   }

  //   openNodeDetailModal(nodo: any): void {
  //     // Aquí abrirías un modal o componente de detalles de nodo
  //     // y pasarías la información del nodo a través de una propiedad o un servicio.
  //   }

  handleEditEvent(_id: string): void {
    // Implementa la lógica para el evento Edit aquí
    //console.log("Evento Edit para el _id:", _id);
  }

  addNode(parent: HTMLElement, data: any): void {
    const row = document.createElement("tr");
    //row.style.backgroundColor = "black";
    row.style.alignItems = "center";
    const cell = document.createElement("td");
    const nodo = document.createElement("div");
    nodo.style.width = "200px";
    nodo.style.height = "13.5vh";
    nodo.style.borderRadius = "7px";
    nodo.className = "nodo";
    nodo.setAttribute("data-id", data._id.toString());
    row.className = "nodo-header";

    if (data !== undefined) {
      const childs = data.hijos !== undefined ? data.hijos.length * 2 : 0;

      cell.setAttribute("colspan", (childs * 2).toString());

      let item = document.createElement("div");
      //item.innerText = data._id.toString();
      item.innerText = data.registro ? data.registro : "";
      item.className = "nodo-id badge";
      nodo.appendChild(item);

      item = document.createElement("div");
      item.innerText = data.nombre;
      item.style.fontSize = "10px";
      item.style.color = "black";
      item.style.width = "100%";
      item.style.lineHeight = "1";
      item.className = "nodo-nombre";
      item.style.height = "6.5vh";
      nodo.appendChild(item);

      item = document.createElement("div");
      item.innerText = data.personal;
      item.style.fontSize = "9px";
      item.style.width = "100%";
      item.style.color = "white";
      item.style.lineHeight = "1";
      item.style.height = "3.4vh";
      item.style.paddingTop = "5px";
      item.style.borderTopLeftRadius = "5px";
      item.style.borderTopRightRadius = "5px";
      item.style.background =
        data.personal && data.personal == "SIN PERSONAL"
          ? "#F33232"
          : "#101D26";

      item.className = "nodo-puesto";

      nodo.appendChild(item);

      cell.appendChild(nodo);
      row.appendChild(cell);
      parent.appendChild(row);

      if (data.contrato) {
        nodo.style.backgroundColor = getColor(data.contrato);
      }

      if (childs !== 0) {
        const btnExpand = document.createElement("div");
        btnExpand.className = "btn-collapse glyphicon glyphicon-minus";
        nodo.appendChild(btnExpand);
        btnExpand.addEventListener("click", this.expandCollapse.bind(this));

        let trs = document.createElement("tr");
        let tds = document.createElement("td");
        let div = document.createElement("div");
        trs.className = "nodo-child";
        div.className = "line-down";
        div.innerHTML = "&nbsp;";

        tds.appendChild(div);
        tds.setAttribute("colspan", childs.toString());
        trs.appendChild(tds);
        parent.appendChild(trs);

        trs = document.createElement("tr");
        trs.className = "nodo-child";

        for (let i = 0; i < childs; i++) {
          tds = document.createElement("td");
          tds.className = "line ";
          tds.innerHTML = "&nbsp;";
          if (childs === 2) {
            tds.className += i % 2 === 0 ? "right" : "left";
          }
          if (i !== 0 && i !== childs - 1) {
            tds.className += i % 2 === 0 ? "right up" : "left up";
          }
          trs.appendChild(tds);
        }

        parent.appendChild(trs);

        trs = document.createElement("tr");
        trs.className = "nodo-child";
        parent.appendChild(trs);

        for (let i = 0; i < childs / 2; i++) {
          tds = document.createElement("td");
          tds.setAttribute("colspan", "2");
          trs.appendChild(tds);
          const child = document.createElement("table");
          tds.appendChild(child);

          this.addNode(child, data.hijos[i]);
        }
      }
    } else {
      nodo.innerText = "Empty";
      cell.appendChild(nodo);
      row.appendChild(cell);
      parent.appendChild(row);
    }
  }

  createControls(tabla: HTMLElement): void {
    const nodos = tabla.querySelectorAll(".nodo");
    for (let i = 0; i < nodos.length; i++) {
      const id = nodos[i].getAttribute("data-id");
      const div = document.createElement("div");
      div.className = "controls";

      // Btn Add
      //   let btn = document.createElement("button");
      //   btn.setAttribute("type", "button");
      //   btn.setAttribute("data-id", id ?? "");
      //   btn.className = "btn btn-primary btn-block btn-add";

      //   let icon = document.createElement("i");
      //   icon.className = "glyphicon glyphicon-plus";
      //   btn.appendChild(icon);
      //   div.appendChild(btn);

      // Btn Edit
      //   btn = document.createElement("button");
      //   btn.setAttribute("type", "button");
      //   btn.setAttribute("data-id", id ?? "");
      //   btn.className = "btn btn-success btn-block btn-edit";

      //   icon = document.createElement("i");
      //   icon.className = "glyphicon glyphicon-pencil";
      //   btn.appendChild(icon);
      //   div.appendChild(btn);

      nodos[i].appendChild(div);
    }
  }

  expandCollapse(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    let table =
      target.parentElement?.parentElement?.parentElement?.parentElement;

    if (!table) {
      table = target.parentElement?.parentElement?.parentElement?.parentElement;
    }

    if (!table) {
      return;
    }

    const childs = table.querySelectorAll(".nodo-child");
    for (let i = 0; i < childs.length; i++) {
      const classname = childs[i].className;
      childs[i].className =
        classname.indexOf("hidden") !== -1
          ? classname.replace(" hidden", "")
          : classname + " hidden";
    }

    if (childs.length > 1) {
      target.className =
        target.className.indexOf("minus") !== -1
          ? target.className.replace("minus", "plus")
          : target.className.replace("plus", "minus");
    }
  }

  toggleCollapse(target: HTMLElement): void {
    let table =
      target.parentElement?.parentElement?.parentElement?.parentElement;

    if (!table) {
      table = target.parentElement?.parentElement?.parentElement?.parentElement;
    }

    if (!table) {
      return;
    }

    const childs = table.querySelectorAll(".nodo-child");
    for (let i = 0; i < childs.length; i++) {
      const classname = childs[i].className;
      childs[i].className =
        classname.indexOf("hidden") !== -1
          ? classname.replace("hidden", "")
          : classname + " hidden";
    }

    if (childs.length > 1) {
      target.className =
        target.className.indexOf("plus") !== -1
          ? target.className.replace("plus", "minus")
          : target.className.replace("minus", "plus");
    }
  }

  expandCollapseAutomatically(): void {
    const allBtnCollapse = document.querySelectorAll(".btn-collapse");
    allBtnCollapse.forEach((btnCollapse) => {
      this.toggleCollapse(btnCollapse as HTMLElement);
    });
  }

  addStuffToContents(): void {
    // const blockSize = 25;
    // const contents = this.grid.nativeElement.querySelector(".contents");
    // for (let i = 0; i < 50; i++) {
    //   const color = {
    //     r: Math.random() * 255,
    //     g: Math.random() * 255,
    //     b: Math.random() * 255,
    //   };
    //   const rect = document.createElement("div");
    //   rect.style.width = `${blockSize}px`;
    //   rect.style.height = `${blockSize}px`;
    //   rect.style.position = "absolute";
    //   rect.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
    //   rect.style.opacity = ".6";
    //   const left = Math.floor(Math.random() * contents.offsetWidth);
    //   const top = Math.floor(Math.random() * contents.offsetHeight);
    //   rect.style.left = `${left}px`;
    //   rect.style.top = `${top}px`;
    //   contents.appendChild(rect);
    // }
    // const origSize = document.createElement("div");
    // origSize.style.position = "absolute";
    // origSize.style.width = `${contents.offsetWidth}px`;
    // origSize.style.height = `${contents.offsetHeight}px`;
    // origSize.style.border = "10px solid red";
    // origSize.style.boxSizing = "border-box";
    // contents.appendChild(origSize);
  }

  setupZoomAndPan(): void {
    const gridElement = this.grid.nativeElement;
    const contents = gridElement.querySelector(".contents");
    const gridSize = gridElement.getBoundingClientRect();

    let panningAllowed = false;
    let zoomFactor = 1;

    const translate = { scale: zoomFactor, translateX: 0, translateY: 0 };
    const initialContentsPos = { x: 0, y: 0 };
    const pinnedMousePosition = { x: 0, y: 0 };
    const mousePosition = { x: 0, y: 0 };

    const mousedown = (event: MouseEvent) => {
      initialContentsPos.x = translate.translateX;
      initialContentsPos.y = translate.translateY;
      pinnedMousePosition.x = event.clientX;
      pinnedMousePosition.y = event.clientY;
      panningAllowed = true;
    };

    const mousemove = (event: MouseEvent) => {
      mousePosition.x = event.clientX;
      mousePosition.y = event.clientY;
      if (panningAllowed) {
        const diffX = mousePosition.x - pinnedMousePosition.x;
        const diffY = mousePosition.y - pinnedMousePosition.y;
        translate.translateX = initialContentsPos.x + diffX;
        translate.translateY = initialContentsPos.y + diffY;
      }
      update();
    };

    const mouseup = () => {
      panningAllowed = false;
    };

    const zoom = (event: WheelEvent) => {
      if (
        zoomFactor + event.deltaY / 5000 > 3 ||
        zoomFactor + event.deltaY / 5000 < 0.4
      ) {
        return;
      }

      const oldZoomFactor = zoomFactor;
      zoomFactor += event.deltaY / 5000;

      mousePosition.x = event.clientX - gridSize.x;
      mousePosition.y = event.clientY - gridSize.y;

      translate.scale = zoomFactor;

      const contentMousePosX = mousePosition.x - translate.translateX;
      const contentMousePosY = mousePosition.y - translate.translateY;
      const x =
        mousePosition.x - contentMousePosX * (zoomFactor / oldZoomFactor);
      const y =
        mousePosition.y - contentMousePosY * (zoomFactor / oldZoomFactor);

      translate.translateX = x;
      translate.translateY = y;

      update();
    };

    const update = () => {
      const matrix = `matrix(${translate.scale},0,0,${translate.scale},${translate.translateX},${translate.translateY})`;
      contents.style.transform = matrix;
    };

    gridElement.addEventListener("wheel", zoom);
    gridElement.addEventListener("mousedown", mousedown);
    gridElement.addEventListener("mousemove", mousemove);
    gridElement.addEventListener("mouseup", mouseup);
  }

  //limpiar datos
  clearContents(): void {
    if (this.organigramaContainer) {
      // Eliminar todos los elementos hijos del contenedor
      while (this.organigramaContainer.nativeElement.firstChild) {
        this.organigramaContainer.nativeElement.removeChild(
          this.organigramaContainer.nativeElement.firstChild
        );
      }
    }
  }

  //menu seleccion
  tabSelected(event: MatTabChangeEvent): void {
    // Obtener el índice de la pestaña seleccionada
    const selectedIndex = event.index;

    // Dependiendo del índice, puedes llamar a la función correspondiente
    switch (selectedIndex) {
      case 0:
        this.generarDiagrama("DESPACHO");
        break;
      case 1:
        this.generarDiagrama("SUB-ALCALDIA");
        break;
      case 2:
        this.generarDiagrama("SMPDT");
        break;
      case 3:
        this.generarDiagrama("SMFA");
        break;
      case 4:
        this.generarDiagrama("SMIS");
        break;
      case 5:
        this.generarDiagrama("SMMTDP");
        break;
      case 6:
        this.generarDiagrama("SMS");
        break;
      case 7:
        this.generarDiagrama("SMDHI");
        break;

      default:
        break;
    }
  }
}
