"use strict";

import { IncomingMessage } from "http";
import moment from "moment";
import { Observable, Subject } from "rxjs";
import { Configuration } from "./config";
import { EventoBump } from "./Eventos/Custom/EventoBump";
import { EventFactory } from "./Eventos/EventFactory";
import { Evento } from "./Eventos/Evento";

const http = require('http');
const https = require('https');

class APIReader {

    hostname: string;
    port: number;
    contest_id: string;
    https: boolean;
    authuser: string;
    authpasswd: string;


    constructor(conf : Configuration) {
        this.hostname = conf.cds.url;
        this.contest_id = conf.cds.contest_id;
        this.port = conf.cds.port;
        this.https = conf.cds.https;
        this.authuser = conf.cds.api_user;
        this.authpasswd = conf.cds.api_password;
    }


    public suscribe_feed(eventEmiter : Subject<Evento>) {

            console.log("Iniciando escucha en el servidor "+this.hostname+", puerto "+this.port);
            let options = {
                hostname: this.hostname,
                port: this.port,
                path: '/api/contests/'+this.contest_id+'/event-feed',
                method: 'GET',
                auth: this.authuser.length>0 ? this.authuser+':'+this.authpasswd : null,
                qs: {
                    strict: false,
                    stream: true
                }
            }
            var proto = this.https ? https : http;
            proto.get(options, ( res : IncomingMessage) => {
                const { statusCode} = res;
                const contentType:any = res.headers['content-type'];
                if (statusCode !== 200) {
                    eventEmiter.error( new Error('Request Failed.\n' +
                        `Status Code: ${statusCode}`));
                } /* else if (!/^application\/x-ndjson/.test(contentType)) {
                    eventEmiter.error(new Error('Invalid content-type.\n' +
                        `Expected application/x-ndjson but received ${contentType}`));
                } */
                res.setEncoding('utf8');
                let rawData : string = '';
                let indexData : number = 0; //El siguiente dato (carácter) a procesar
                let numParentesis : number = 0; //Número de paréntesis abiertos
                let insideComillas : boolean = false;
                let anteriorIgualAEscape : boolean = false;
                res.on('data', (chunk : any) => {

                    //suscriber.next(new EventoBump("null"));

                    if((/^\n$/).test(chunk)) {
                        console.log("...");
                        return;
                    }

                    rawData += chunk;
                    
                    for(;indexData<rawData.length;++indexData) {
                        var ch = rawData.charAt(indexData);
                        if(!anteriorIgualAEscape && ch==='"') insideComillas = !insideComillas;
                        anteriorIgualAEscape = (/\\/).test(ch);
                        if(insideComillas) continue;
                        if(ch=='{') ++numParentesis;
                        if(ch=='}') --numParentesis;
                        
                        if(numParentesis===0) {
                            
                            let dataSTR = rawData.substring(0,indexData+1);
                            //console.log("dataSTR:"+dataSTR)
                            rawData = rawData.substring(indexData+1);
                            indexData = -1;
                            insideComillas = false;
                            anteriorIgualAEscape = false;
                            //Si se trata solo de un salto de linea, se ignora
                            if(/^\n$/.test(dataSTR)) continue;
                            let obj : JSON;
                            try{
                                obj = JSON.parse(dataSTR);
                                //console.log(obj)
                                //suscriber.next(obj);
                                var ev = EventFactory.obtenerEventoDesdeJSON(obj);
                                if(ev!=null) {
                                    eventEmiter.next(ev);
                                    var evs = EventFactory.ProcesarYEnriquecerEvento(ev);
                                    for(var _ev of evs) eventEmiter.next(_ev);
                                }
                            } catch( e : any ) {
                                //if(e.constructor.name!="SyntaxError")
                                    console.log("[ERROR]: " + e);
                                //else console.log("..."); 
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
                    eventEmiter.complete();
                });
                setInterval(() => {
                    var bumpSecondaryEvents = EventFactory.ProcesarYEnriquecerEvento(new EventoBump(moment().format()));
                    for(var bumpSecondaryEvent of bumpSecondaryEvents) eventEmiter.next(bumpSecondaryEvent);
                }, 1000);
            
            }).on("error", (err : Error) => {
                eventEmiter.error(err)
            });
    }
}

export {APIReader}