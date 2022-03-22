
import { Evento } from "../Evento";

//Evento emitido cuando se obtiene un nuevo veredicto para un problema que no se había resuelto antes

class EventoVeredicto extends Evento {

    id_envio: string;

    id_equipo: string;
    equipo: string;
    id_problema: string;
    problema: string;
    resultado: string;

    n_intento: number;

    constructor(id_envio: string, id_equipo:string, equipo: string, id_problema: string, problema: string, resultado: string, n_intento: number) {
        super("create","veredicto",null,[]);
        this.id_envio = id_envio;
        this.id_equipo = id_equipo;
        this.equipo = equipo;
        this.id_problema = id_problema;
        this.problema = problema;
        this.resultado = resultado;
        this.n_intento = n_intento;
    }

}

export{EventoVeredicto};