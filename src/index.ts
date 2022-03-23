
import { APIReader } from "./apiReader";
import { Configuration, ConfigurationLoader } from "./config";

console.log("Iniciando Programa...");

//Punto de inicio del programa

try{
    console.log("Cargando configuración")
    let conf : Configuration = ConfigurationLoader.load();
    
    let apiReader = new APIReader(conf.url, conf.port, conf.contest_id, conf.api_version);

    apiReader.start_listen();

} catch (err) {
    console.log("ERROR: "+err)
}
