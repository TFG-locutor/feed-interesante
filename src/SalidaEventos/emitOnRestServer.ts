import { EventoSalida } from "../PuntosDeVista/PuntoDeVista";
import { EventHandler } from "./EventHandler";

import {createServer, IncomingMessage, Server, ServerResponse} from "http"

class emitOnRestServer extends EventHandler {
    responses  : ServerResponse[]
    server : Server
    constructor() {
        super();
        this.responses = [];
        this.server = createServer((request , response) => {
            const { headers, method, url } = request;
            let body: any[] = [];
            request.on('error', (err) => {
                console.error(err);
            }).on('data', (chunk) => {
                body.push(chunk);
            }).on('end', () => {
                let msg = Buffer.concat(body).toString();
                //body = Buffer.concat(body).toString();
                // BEGINNING OF NEW STUFF
            
                response.on('error', (err) => {
                    console.error(err);
                });
                response.writeHead(200, {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": "false",
                    "Access-Control-Allow-Methods": "GET",
                    "Access-Control-Allow-Headers": "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
                });
            
                const responseBody = { headers, method, url, msg };
        
                this.responses.push(response);
                //response.write(JSON.stringify(responseBody));
        
                /* let i = 0;
                let interval = setInterval(()=>{
                    response.write(" hola "+(i++));
                }, 100); */
        
                //response.end();
            });
        }).listen(1337); // Activates this server.

    }



    procesar(evento : EventoSalida) : void {
        this.responses.forEach(response => {
            response.write(JSON.stringify(evento));
        });
        
    }
}

export { emitOnRestServer }