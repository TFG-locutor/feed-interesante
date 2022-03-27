"use strict";

import { IncomingMessage } from "http";
import { Observable, Observer, Subscriber } from "rxjs";
import { EventFactory } from "./Eventos/EventFactory";
import { Evento } from "./Eventos/Evento";
import { PtoVistaProblem } from "./PuntosDeVista/PtoVistaProblem";

const http = require('http');


function callbackEjemplo(evento:string) {
    console.log("Evento interesante: " + evento);
    //console.log(evento);
}

//let p1 = new PtoVistaProblem(callbackEjemplo,"script_hello_judge");

class APIReader {

    hostname: string;
    port: number;
    contest_id: string;
    api_version: string;

    constructor(hostname: string, port: number, contest_id: string, api_version: string) {
        this.hostname = hostname;
        this.contest_id = contest_id;
        this.port = port;
        this.api_version = api_version;
    }

    public suscribe_to_feed(){
        return new Observable<JSON>(suscriber =>{
            console.log("Iniciando escucha en el servidor "+this.hostname+", puerto "+this.port);
            const options = {
                hostname: this.hostname,
                port: this.port,
                path: '/api/'+this.api_version+'/contests/'+this.contest_id+'/event-feed',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                auth: 'admin:admin',
                qs: {
                    strict: false,
                    stream: true
                }
            }

        http.get(options, ( res : IncomingMessage) => {
            const { statusCode} = res;
            const contentType:any = res.headers['content-type'];
            if (statusCode !== 200) {
                suscriber.error( new Error('Request Failed.\n' +
                    `Status Code: ${statusCode}`));
            } else if (!/^application\/x-ndjson/.test(contentType)) {
                suscriber.error(new Error('Invalid content-type.\n' +
                    `Expected application/x-ndjson but received ${contentType}`));
            }
            res.setEncoding('utf8');
            let rawData = '';
            let indexData : number = 0; //El siguiente dato (carácter) a procesar
            let numParentesis = 0; //Número de paréntesis abiertos
            let insideComillas = false;
            let anteriorIgualAEscape = false;
            res.on('data', (chunk : any) => {
                rawData += chunk;
                
                for(;indexData<rawData.length;++indexData) {
                    var ch = rawData.charAt(indexData);
                    if(!anteriorIgualAEscape && ch=='"') insideComillas = !insideComillas;
                    anteriorIgualAEscape = (/\\/).test(ch);
                    if(insideComillas) continue;
                    if(ch=='{') ++numParentesis;
                    if(ch=='}') --numParentesis;
                    //let specialCharacter:string = "\\";
                    
                    if(anteriorIgualAEscape) console.log("anterioresxcape")
                    if(numParentesis==0) {
                        
                        let dataSTR = rawData.substring(0,indexData+1);
                        rawData = rawData.substring(indexData+1);
                        indexData = 0;

                        let obj : JSON;

                        try{
                            obj = JSON.parse(dataSTR);
                            //console.log(obj)
                            suscriber.next(obj);
                            /* var ev = EventFactory.obtenerEventoDesdeJSON(obj);
                            if(ev!=null) {
                                p1.procesar(ev);
                                ev = EventFactory.ProcesarYEnriquecerEvento(ev);
                                if(ev!=null) p1.procesar(ev);
                            } */
                        } catch( e : any ) {
                            if(e.constructor.name!="SyntaxError") console.log("[ERROR]: " + e);
                            else console.log("..."); 
                        }
                    }
                }
            });
            res.on('end', () => {
                /* try {
                    console.log("---FIN---\n");
                    const parsedData = JSON.parse(rawData);
                    console.log(parsedData);
                } catch (e:any) {
                    console.error(e.message);
                } */
                suscriber.complete();
            });
        
        }).on("error", (err : Error) => {
            suscriber.error(err)
        });
    })
    }

    public start_listen() {
        console.log("Iniciando escucha en el servidor "+this.hostname+", puerto "+this.port);
        http.get({
            hostname: this.hostname,
            port: this.port,
            path: '/api/'+this.api_version+'/contests/'+this.contest_id+'/event-feed',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            auth: 'admin:admin',
            qs: {
                strict: false,
                stream: true
            }
        }, ( res : IncomingMessage) => {
            const { statusCode} = res;
            const contentType:any = res.headers['content-type'];
            let error;
            if (statusCode !== 200) {
                error = new Error('Request Failed.\n' +
                    `Status Code: ${statusCode}`);
            } else if (!/^application\/x-ndjson/.test(contentType)) {
                error = new Error('Invalid content-type.\n' +
                    `Expected application/x-ndjson but received ${contentType}`);
            }        
            res.setEncoding('utf8');
            let rawData = '';
            let indexData : number = 0; //El siguiente dato (carácter) a procesar
            let numParentesis = 0; //Número de paréntesis abiertos
            let insideComillas = false;
            let anteriorIgualAEscape = false;
            res.on('data', (chunk : any) => {
                //console.log("CHUNK: " + chunk + "\n");
                rawData += chunk;
                
                for(;indexData<rawData.length;++indexData) {
                    var ch = rawData.charAt(indexData);
                    if(!anteriorIgualAEscape && ch=='"') insideComillas = !insideComillas;
                    anteriorIgualAEscape = (/\\/).test(ch);
                    if(insideComillas) continue;
                    if(ch=='{') ++numParentesis;
                    if(ch=='}') --numParentesis;
                    //let specialCharacter:string = "\\";
                    
                    if(anteriorIgualAEscape) console.log("anterioresxcape")
                    if(numParentesis==0) {
                        
                        let dataSTR = rawData.substring(0,indexData+1);
                        rawData = rawData.substring(indexData+1);
                        indexData = 0;

                        let obj : JSON;
                        try{
                            obj = JSON.parse(dataSTR);
                
                            console.log("voy a procesar")
                            console.log(obj)
                            /* var ev = EventFactory.obtenerEventoDesdeJSON(obj);
                
                            if(ev!=null) {
                                p1.procesar(ev);
                                ev = EventFactory.ProcesarYEnriquecerEvento(ev);
                                if(ev!=null) p1.procesar(ev);
                            } */
                
                        } catch( e : any ) {
                            if(e.constructor.name!="SyntaxError") console.log("[ERROR]: " + e);
                            else console.log("...");
                        }

                    }
                }

                //recorrer TODOS LOS PV
                
        
            });
            res.on('end', () => {
                /* try {
                    console.log("---FIN---\n");
                    const parsedData = JSON.parse(rawData);
                    console.log(parsedData);
                } catch (e:any) {
                    console.error(e.message);
                } */
                console.log("fin")
            });
        
        }).on("error", (err : Error) => {
            console.log("Error: " + err.message);
        });
    }

}

export {APIReader}