
import { APIReader } from "./apiReader";
import { Configuration, ConfigurationLoader } from "./config";
import { concatMap, filter, map, mergeMap, Observable, onErrorResumeNext, share } from 'rxjs';
import { EventFactory } from "./Eventos/EventFactory";
import { ManagerPuntosDeVista } from "./PuntosDeVista/ManagerPuntosDeVista";
import { PuntoDeVistaProblema } from "./PuntosDeVista/PuntoDeVistaProblema";
import { Evento } from "./Eventos/Evento";
import { PuntoDeVista } from "./PuntosDeVista/PuntoDeVista";
import { EventHandler } from "./SalidaEventos/EventHandler";
import { EmitOnConsole } from "./SalidaEventos/EmitOnConsole";

console.log("Iniciando Programa...");

//Punto de inicio del programa

try{
    console.log("Cargando configuración")
    let conf : Configuration = ConfigurationLoader.load();
    let apiReader = new APIReader(conf.url, conf.port, conf.contest_id, conf.api_version, conf.api_user, conf.api_password);
    
    //apiReader.start_listen();

    var obs = apiReader.suscribe_to_feed().pipe(
        share(), //una misma ejecucion de la request
        //map(obj=>EventFactory.obtenerEventoDesdeJSON(obj)),
        //concatMap((e) => new Observable<Evento>((subscriber)=>{
        //    subscriber.next(EventFactory.ProcesarYEnriquecerEvento(e));
        //})),
        filter(e=> e!==null),
    );

    //var p1 = new PuntoDeVistaProblema(obs,"script_hello_judge")
    ManagerPuntosDeVista.setObservable(obs);

    let evHandler : EventHandler = new EmitOnConsole();
    ManagerPuntosDeVista.getviewpoint_data().forEach(pv=>{
        evHandler.observeNewEventFeed(pv.getEventEmiter());
    });

} catch (err) {
    console.log("ERROR: "+err)
}
