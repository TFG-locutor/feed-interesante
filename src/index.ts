
import { APIReader } from "./apiReader";
import { Configuration, ConfigurationLoader } from "./config";
import { concatMap, filter, map, mergeMap, Observable, onErrorResumeNext, share, Subject } from 'rxjs';
import { EventFactory } from "./Eventos/EventFactory";
import { ManagerPuntosDeVista } from "./PuntosDeVista/ManagerPuntosDeVista";
import { PuntoDeVistaProblema } from "./PuntosDeVista/PuntoDeVistaProblema";
import { Evento } from "./Eventos/Evento";
import { PuntoDeVista } from "./PuntosDeVista/PuntoDeVista";
import { EventHandler } from "./SalidaEventos/EventHandler";
import { EmitOnConsole } from "./SalidaEventos/EmitOnConsole";
import { EventoBump } from "./Eventos/Custom/EventoBump";
import { SaveOnLog } from "./SalidaEventos/SaveOnLog";
import * as fs from 'fs';
import { exit } from "process";
import { tweetEvent } from "./SalidaEventos/twittterBot/tweetEvent";
import { emitOnRestServer } from "./SalidaEventos/emitOnRestServer";

console.log("Iniciando Programa...");

//console.log("Argumentos: ");
//console.log(process.argv);

//Se mira si se ha pasado algún argumento de entrada
if(process.argv.length>2) {
    var dir : string = process.argv[2];
    var stats : fs.Stats | null = null;
    try {
        stats = fs.statSync(dir);
    } catch (err) {
        console.log("Error, no existe el fichero o directorio '"+dir+"'");
        process.exit(1);
    }
    
    if(stats==null||!stats.isFile() ) {
        console.log("Error, '"+dir+"' no es un fichero");
        process.exit(1);
    }

    console.log("Leyendo feed de fichero '"+dir+"'")

    var rawData = fs.readFileSync(dir);
    try{
        //console.log(rawData.toString());
        
        //TODO: implementar esto
        //hay que valorar si se hacen o no las llamadas a la API
        console.log("Lectura desde fichero aún no implementada, terminando programa");
        
        process.exit(0);
    } catch(err) {
        console.log("Formato de json no válido");
        process.exit(1);
    }
}

//Punto de inicio del programa

try{
    console.log("Cargando configuración")
    if (process.env.url && process.env.port && process.env.contest_id) {
        console.log("Cargando configuración desde variables de entorno");
    }
    else{
        console.log("Cargando configuración desde archivo");
    }
    let conf : Configuration = ConfigurationLoader.load();

    if(conf.cds.allow_expired_tls) process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    let eventEmiter : Subject<Evento> = new Subject<Evento>();
    let apiReader = new APIReader(conf);
    
    const cbIniciar = (err: Error | null) => {

        if(err!=null) {
            console.log("Error mientras se realizaban las llamadas a la API: "+err.message);
            return;
        }

        console.log("Se han terminado las llamadas a la API");
        apiReader.suscribe_feed(eventEmiter);

         let evHandler : EventHandler = new EmitOnConsole();
        ManagerPuntosDeVista.getviewpoint_data().forEach(pv=>{
            evHandler.observeNewEventFeed(pv.getEventEmiter());
        }); 

        let logEvHandler : EventHandler = new SaveOnLog();
        ManagerPuntosDeVista.getviewpoint_data().forEach(pv=>{
            logEvHandler.observeNewEventFeed(pv.getEventEmiter());
        });

        let tweetEventHandler : EventHandler = new tweetEvent();
        ManagerPuntosDeVista.getviewpoint_data().forEach(pv=>{
            tweetEventHandler.observeNewEventFeed(pv.getEventEmiter());
        }); 

        let serverEmit : EventHandler = new emitOnRestServer();
        ManagerPuntosDeVista.getviewpoint_data().forEach(pv=>{
            serverEmit.observeNewEventFeed(pv.getEventEmiter());
        });
    }

    ManagerPuntosDeVista.setObservable(eventEmiter.asObservable());
    console.log("Obteniendo información del concurso mediante llamadas a sus endpoints");
    ManagerPuntosDeVista.emitCreationEvents(eventEmiter, cbIniciar);

    

    /* var obs = eventEmiter.asObservable().pipe(
        share(), //una misma ejecucion de la request
        //map(obj=>EventFactory.obtenerEventoDesdeJSON(obj)),
        //concatMap((e) => new Observable<Evento>((subscriber)=>{
        //    subscriber.next(EventFactory.ProcesarYEnriquecerEvento(e));
        //})),
        filter(e=> e!==null),
    ); */


    

} catch (err) {
    console.log("ERROR: "+err)
}
