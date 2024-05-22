import { Component, Inject } from "@angular/core";
import { OrganigramaComponent } from "../organigrama.component";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-dialog-organigrama",
  templateUrl: "./dialog-organigrama.component.html",
  styleUrl: "./dialog-organigrama.component.css",
})
export class DialogOrganigramaComponent {
  nodeId: string;
  node: any;
  private date: any;
  constructor(
    private dialogRef: MatDialogRef<OrganigramaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { nodeId: string }
  ) {
    if (data.nodeId) {
      this.nodeId = data.nodeId;
    }

    this.date = {
      id: 1,
      puesto: "Gerente",
      nombre: "Nodo 1",
      hijos: [
        {
          id: 2,
          puesto: "Supervisor",
          nombre: "Nodo 1-1",
          hijos: [
            {
              id: 3,
              puesto: "Supervisor",
              nombre: "Nodo 1-1-1",
              hijos: [
                {
                  id: 4,
                  puesto: "Supervisor",
                  nombre: "Nodo 1-1-1-1",
                  hijos: [
                    {
                      id: 5,
                      puesto: "Supervisor",
                      nombre: "Nodo 1-1-1-1-1",
                      hijos: [],
                    },
                    {
                      id: 6,
                      puesto: "Supervisor",
                      nombre: "Nodo 1-1-1-1-2",
                      hijos: [
                        {
                          id: 30,
                          puesto: "Supervisor",
                          nombre: "Nodo 1-1-1-1-2-1",
                          hijos: [],
                        },
                        {
                          id: 31,
                          puesto: "Supervisor",
                          nombre: "Nodo 1-1-1-1-2-2",
                          hijos: [],
                        },
                        {
                          id: 32,
                          puesto: "Supervisor",
                          nombre: "Nodo 1-1-1-1-2-3",
                          hijos: [],
                        },
                        {
                          id: 33,
                          puesto: "Supervisor",
                          nombre: "Nodo 1-1-1-1-2-4",
                          hijos: [],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: 7,
              puesto: "Supervisor",
              nombre: "Nodo 1-1-2",
              hijos: [],
            },
            {
              id: 8,
              puesto: "Supervisor",
              nombre: "Nodo 1-1-3",
              hijos: [],
            },
          ],
        },
        {
          id: 9,
          puesto: "Supervisor",
          nombre: "Nodo 1-2",
          hijos: [],
        },
        {
          id: 10,
          puesto: "Supervisor",
          nombre: "Nodo 1-3",
          hijos: [
            {
              id: 11,
              puesto: "Supervisor",
              nombre: "Nodo 1-3-1",
              hijos: [
                {
                  id: 12,
                  puesto: "Supervisor",
                  nombre: "Nodo 1-3-1-1",
                  hijos: [],
                },
                {
                  id: 13,
                  puesto: "Supervisor",
                  nombre: "Nodo 1-3-1-2",
                  hijos: [
                    {
                      id: 14,
                      puesto: "Supervisor",
                      nombre: "Nodo 1-3-1-2-1",
                      hijos: [
                        {
                          id: 15,
                          puesto: "Supervisor",
                          nombre: "Nodo 1-3-1-2-1-1",
                          hijos: [
                            {
                              id: 16,
                              puesto: "Supervisor",
                              nombre: "Nodo 1-3-1-2-1-1-1",
                              hijos: [
                                {
                                  id: 17,
                                  puesto1: "Supervisor",
                                  nombre: "Nodo 1-3-1-2-1-1-1-1",
                                  hijos: [],
                                },
                                {
                                  id: 18,
                                  puesto: "Supervisor",
                                  nombre: "Nodo 1-3-1-2-1-1-1-2",
                                  hijos: [],
                                },
                              ],
                            },
                            {
                              id: 19,
                              puesto: "Supervisor",
                              nombre: "Nodo 1-3-1-2-1-1-2",
                              hijos: [],
                            },
                          ],
                        },
                        {
                          id: 20,
                          puesto: "Supervisor",
                          nombre: "Nodo 1-3-1-2-1-2",
                          hijos: [],
                        },
                      ],
                    },
                    {
                      id: 21,
                      puesto: "Supervisor",
                      nombre: "Nodo 1-3-1-2-2",
                      hijos: [],
                    },
                  ],
                },
                {
                  id: 22,
                  puesto: "Supervisor",
                  nombre: "Nodo 1-3-1-3",
                  hijos: [],
                },
                {
                  id: 23,
                  puesto: "Supervisor",
                  nombre: "Nodo 1-3-1-4",
                  hijos: [],
                },
              ],
            },
            {
              id: 24,
              puesto: "Supervisor",
              nombre: "Nodo 1-3-2",
              hijos: [],
            },
          ],
        },
        {
          id: 25,
          puesto: "Supervisor",
          nombre: "Nodo 1-4",
          hijos: [],
        },
        {
          id: 26,
          puesto: "Supervisor",
          nombre: "Nodo 1-5",
          hijos: [],
        },
        {
          id: 27,
          puesto: "Supervisor",
          nombre: "Nodo 1-6",
          hijos: [
            {
              id: 28,
              puesto: "Supervisor",
              nombre: "Nodo 1-6-1",
              hijos: [
                {
                  id: 29,
                  puesto: "Supervisor",
                  nombre: "Nodo 1-6-1-1",
                  hijos: [
                    {
                      id: 34,
                      puesto: "Supervisor",
                      nombre: "Nodo 1-6-1-1-1",
                      hijos: [],
                    },
                    {
                      id: 35,
                      puesto: "Supervisor",
                      nombre: "Nodo 1-6-1-1-2",
                      hijos: [],
                    },
                    {
                      id: 36,
                      puesto: "Supervisor",
                      nombre: "Nodo 1-6-1-1-3",
                      hijos: [],
                    },
                    {
                      id: 37,
                      puesto: "Supervisor",
                      nombre: "Nodo 1-6-1-1-4",
                      hijos: [
                        {
                          id: 38,
                          puesto: "Supervisor",
                          nombre: "Nodo 1-6-1-1-4-1",
                          hijos: [],
                        },
                        {
                          id: 38,
                          puesto: "Supervisor",
                          nombre: "Nodo 1-6-1-1-4-2",
                          hijos: [],
                        },
                        {
                          id: 39,
                          puesto: "Supervisor",
                          nombre: "Nodo 1-6-1-1-4-3",
                          hijos: [],
                        },
                        {
                          id: 40,
                          puesto: "Supervisor",
                          nombre: "Nodo 1-6-1-1-4-4",
                          hijos: [],
                        },
                        {
                          id: 41,
                          puesto: "Supervisor",
                          nombre: "Nodo 1-6-1-1-4-5",
                          hijos: [],
                        },
                        {
                          id: 42,
                          puesto: "Supervisor",
                          nombre: "Nodo 1-6-1-1-4-6",
                          hijos: [],
                        },
                        {
                          id: 43,
                          puesto: "Supervisor",
                          nombre: "Nodo 1-6-1-1-4-7",
                          hijos: [],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
  }

  ngOnInit(): void {
    // Buscar el nodo por ID al inicializar el componente
    this.node = this.findNodeById(parseInt(this.nodeId), this.date);
  }

  findNodeById(id: number, data: any): any {
    if (data.id === id) {
      return data;
    } else if (data.hijos && data.hijos.length > 0) {
      for (let i = 0; i < data.hijos.length; i++) {
        const result = this.findNodeById(id, data.hijos[i]);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }
}
