import { connectLogger } from "log4js";
import { Observable } from "rxjs";
import { EventHandler } from "./EventHandler";
import { EventoSalida } from "../PuntosDeVista/PuntoDeVista";

import Twitter, { TwitterApi, TwitterApiReadWrite } from 'twitter-api-v2'
import { twitterConfig } from "./tweetConfig";


class tweetEvent extends EventHandler{


	client: TwitterApiReadWrite;

    constructor(){
        super();   
		this.client = new Twitter(twitterConfig).readWrite  
    }
    
    
    
   
    procesar(evento: EventoSalida): void {
        console.log("tweetEvent");

		if(evento.getmessage().match(/iniesta/)){
			this.client.v2.tweet(evento.getmessage()).then((val) => {
				console.log(val)
				console.log("success")
			}).catch((err) => {
				console.log(err)
			})
		}
	}
}

export { tweetEvent };