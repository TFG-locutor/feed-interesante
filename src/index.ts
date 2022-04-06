
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

console.log("Iniciando Programa...");

//Punto de inicio del programa

try{
    console.log("Cargando configuración")
    let conf : Configuration = ConfigurationLoader.load();

    let eventEmiter : Subject<Evento> = new Subject<Evento>();
    let apiReader = new APIReader(conf.url, conf.port, conf.contest_id, conf.api_version, conf.api_user, conf.api_password);
    
    eventEmiter
    const cbIniciar = () => {
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
