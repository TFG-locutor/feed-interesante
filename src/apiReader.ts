"use strict";

import { IncomingMessage } from "http";
import { EventFactory } from "./Eventos/EventFactory";
import { PtoVistaProblem } from "./PuntosDeVista/PtoVistaProblem";

const http = require('http');


function callbackEjemplo(evento:string) {
    console.log("Evento interesante: " + evento);
    //console.log(evento);
}

let p1 = new PtoVistaProblem(callbackEjemplo,"script_hello_judge");

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
            auth: 'apiuser:apiuser',
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
            if (error) {
                console.error(error.message);
                // Consume response data to free up memory
                res.resume();
                return;
            }
        
            res.setEncoding('utf8');
        
            let rawData = '';
            let indexData : number = 0; //El siguiente dato (carácter) a procesar
            let numParentesis = 0; //Número de paréntesis abiertos
            res.on('data', (chunk : any) => {
                console.log("CHUNK: " + chunk + "\n");
                rawData += chunk;
                
                for(;indexData<rawData.length;++indexData) {
                    if(rawData.charAt(indexData)=='{') ++numParentesis;
                    if(rawData.charAt(indexData)=='}') --numParentesis;
                    if(numParentesis==0) {
                        
                        console.log("hola")

                        let dataSTR = rawData.substring(0,indexData+1);
                        rawData = rawData.substring(indexData+1);
                        indexData = 0;

                        let obj : JSON;
                        try{
                            obj = JSON.parse(dataSTR);
                
                            var ev = EventFactory.obtenerEventoDesdeJSON(obj);
                
                            if(ev!=null) {
                                p1.procesar(ev);
                                ev = EventFactory.ProcesarYEnriquecerEvento(ev);
                                if(ev!=null) p1.procesar(ev);
                            }
                
                        } catch( e : any ) {
                            if(e.constructor.name!="SyntaxError") console.log("[ERROR]: " + e);
                            else console.log("...");
                        }

                    }
                }

                //recorrer TODOS LOS PV
                
        
            });
            res.on('end', () => {
                try {
                    console.log("---FIN---\n");
                    const parsedData = JSON.parse(rawData);
                    console.log(parsedData);
                } catch (e:any) {
                    console.error(e.message);
                }
            });
        
        }).on("error", (err : Error) => {
            console.log("Error: " + err.message);
        });
    }

}




/*
http.get('http://192.168.1.152/api/v4/contests/1234/event-feed', () ,(resp) => {
    let data = '';

    // A chunk of data has been received.
    resp.on('data', (chunk) => {
        console.log("chunk: "+chunk);
        data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
        console.log("-------FIN---------")
        console.log(data);
        //console.log(JSON.parse(data).explanation);
    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
});
*/

export {APIReader}