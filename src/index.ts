
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
    let apiReader = new APIReader(conf.url, conf.port, conf.contest_id, conf.api_version);
    
    let obs = apiReader.suscribe_to_feed().pipe(
        share(),
        map(obj=>EventFactory.obtenerEventoDesdeJSON(obj)),
        concatMap(async (e) => EventFactory.ProcesarYEnriquecerEvento(e)),
        filter(e=> e!==null),
        );

    let p1 = new PtoVistaProblem(obs,"1");



} catch (err) {
    console.log("ERROR: "+err)
}
