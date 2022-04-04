import { Observable } from "rxjs";
import { EventHandler } from "./EventHandler";

class EmitOnConsole extends EventHandler{
    constructor(){
        super();
    }
    
    procesar(evento: String): void {
        console.log(evento);
    }

}

export { EmitOnConsole };