
import { Evento } from "../Evento";

//Evento emitido cuando se realza un envío a un problema que no se había resuelto antes

class EventoEnvio extends Evento {

    id_envio: string;

    id_equipo: string;
    equipo: string;
    id_problema: string;
    problema: string;

    constructor(id_envio: string, id_equipo:string, equipo: string, id_problema: string, problema: string) {
        super("create","envio",null,[]);
        this.id_envio = id_envio;
        this.id_equipo = id_equipo;
        this.equipo = equipo;
        this.id_problema = id_problema;
        this.problema = problema;
    }

}

export{EventoEnvio};