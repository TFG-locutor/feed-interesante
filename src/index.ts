
import { APIReader } from "./apiReader";
import { Configuration, ConfigurationLoader } from "./config";
import { concatMap, filter, map, mergeMap, Observable, onErrorResumeNext, share } from 'rxjs';
import { EventFactory } from "./Eventos/EventFactory";
import { PtoVistaProblem } from "./PuntosDeVista/PtoVistaProblem";

console.log("Iniciando Programa...");

//Punto de inicio del programa

try{
    console.log("Cargando configuración")
    let conf : Configuration = ConfigurationLoader.load();
    let apiReader = new APIReader(conf.url, conf.port, conf.contest_id, conf.api_version, conf.api_user, conf.api_password);
    
    //apiReader.start_listen();
    let obs = apiReader.suscribe_to_feed().pipe(
        share(), //una misma ejecucion de la request
        map(obj=>EventFactory.obtenerEventoDesdeJSON(obj)),
        concatMap(async (e) => EventFactory.ProcesarYEnriquecerEvento(e)),
        filter(e=> e!==null),
        );

    let p1 = new PtoVistaProblem(obs,"script_hello_judge"); 



} catch (err) {
    console.log("ERROR: "+err)
}
