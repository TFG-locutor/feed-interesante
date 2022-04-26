
import { Evento } from "../Evento";

//Evento emitido cuando se realza un envío a un problema que no se había resuelto antes
//TODO: falta info de organizacion y categoria del equipo
class EventoEnvio extends Evento {

    id_envio: string;

    id_equipo: string;
    equipo: string;
    id_problema: string;
    problema: string;

    constructor(_moment: string, id_envio: string, id_equipo:string, equipo: string, id_problema: string, problema: string) {
        super("create","envio",_moment,null,[]);
        this.id_envio = id_envio;
        this.id_equipo = id_equipo;
        this.equipo = equipo;
        this.id_problema = id_problema;
        this.problema = problema;
    }

}

export{EventoEnvio};