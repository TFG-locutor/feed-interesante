import { Observable } from "rxjs";
import { EventoSalida } from "../PuntosDeVista/PuntoDeVista";
import { EventHandler } from "./EventHandler";

class EmitOnConsole extends EventHandler{
    constructor(){
        super();
    }
    
    procesar(evento: EventoSalida): void {
        console.log(evento);
    }

}

export { EmitOnConsole };