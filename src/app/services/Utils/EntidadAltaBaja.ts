export class EntidadAltaBaja {
    modificacion: boolean;
    etiquetaAltaBaja: string;
    diasTrabajados: number;

    constructor(){
        //Valores por defecto
        this.modificacion = false;
        this.diasTrabajados = 30;
        this.etiquetaAltaBaja = '';
    }

    public procesarEvento(data: any, mes: number, gestion: any): any{
        const estadoRegistro = data.registro.estado;

        let fechaIngreso = new Date(data.registro.fecha_ingreso);
        let fechaConclusion = new Date(data.registro.fecha_conclusion);
        let diaIngreso = fechaIngreso.getUTCDate(); //#dia del mes

        //Verificar si la baja se dio en el periodo solicitado
        if(estadoRegistro === 'false' || data.registro.fecha_conclusion){

            console.log("Ruta Registro.estado=False para: " + data.ci);

            //Date.getMonth() : valores para Enero[0] a Diciembre[11]
            //Por eso se suma 1
            if((fechaConclusion.getMonth() + 1)===mes && fechaConclusion.getFullYear()===gestion){

                let diaConclusion = fechaConclusion.getUTCDate();

                //Verificar si la fecha de ingreso se dio en el mismo mes
                if((fechaIngreso.getMonth()+1)===mes && fechaIngreso.getFullYear()===gestion){
                   
                    this.diasTrabajados = diaConclusion - diaIngreso;
                    this.etiquetaAltaBaja = "AB"
                    this.modificacion = true;
                }
                else{
                    //Es anterior al presente mes,
                    //se obtienen los dias del mes hasta la fecha de conclusion
                    this.diasTrabajados = diaConclusion;
                    this.etiquetaAltaBaja = 'B';
                    this.modificacion = true;
                }
            }
        }else{
            
            //Verificar si la alta se dio en el mes solicitado
            if((fechaIngreso.getMonth()+1)===mes && fechaIngreso.getFullYear()===gestion){

                console.log("Ruta Registro.estado=True alta para: " + data.ci);
                this.modificacion = true;
                this.diasTrabajados = 30 - diaIngreso + 1;
                this.etiquetaAltaBaja = "A";
            }
        }
        return;
    }
}