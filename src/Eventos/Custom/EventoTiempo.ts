import { Evento } from "../Evento";


class EventoTiempo extends Evento {

    mensaje : string;

    constructor(_moment: string, mensaje: string) {
        super("update", "tiempo", _moment, null, []);
        
        this.mensaje = mensaje;
    }

}

export{EventoTiempo}