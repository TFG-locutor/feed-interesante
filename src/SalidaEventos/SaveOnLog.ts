import { Observable } from "rxjs";
import { EventHandler } from "./EventHandler";
import { configure, getLogger, Log4js, Logger } from "log4js";

import { writeFile } from 'fs';
import moment from "moment";
import { EventoSalida } from "../PuntosDeVista/PuntoDeVista";

class SaveOnLog extends EventHandler{
    constructor(){
        super();
        
        configure({
            appenders: { 'file': { type: 'file', filename: 'logs/'+moment().format("DDMMYYYYhhmmss")+'eventFeed.log' } },
            categories: { default: { appenders: ['file'], level: 'debug' }}
          });       
        
    }
    
    procesar(evento: EventoSalida): void {

        getLogger().debug(evento);
        /* writeFile('log.txt', evento, (err) => {
            if (err) throw err;
            //console.log('The file has been saved!');
        });
    } */
    }
}

export { SaveOnLog };