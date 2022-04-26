import { connectLogger } from "log4js";
import { Observable } from "rxjs";


import Twitter, { TwitterApi, TwitterApiReadWrite } from 'twitter-api-v2'
import { EventoSalida } from "../../PuntosDeVista/PuntoDeVista";
import { EventHandler } from "../EventHandler";
import { twitterConfig } from "./tweetConfig";


class tweetEvent extends EventHandler{


	client: TwitterApiReadWrite;
	interested_in_tags: string[];
	minimum_priority_all_events: number
    minimum_priority_interestedin_events: number
    constructor(){
        super();   
		this.client = new Twitter(twitterConfig.twitter_bot).readWrite
		this.interested_in_tags = twitterConfig.interested_in_tags  
		this.minimum_priority_all_events = twitterConfig.minimum_priority_all_events
		this.minimum_priority_interestedin_events = twitterConfig.minimum_priority_interestedin_events
    }

	tweet (message: string) {
		this.client.v2.tweet(message).then((val) => {
			console.log(val)
			console.log("wrote tweet")
		}).catch((err) => {
			console.log(err)
		})
	}
    procesar(evento: EventoSalida): void {
        //console.log("tweetEvent");
		if(evento.gettags().some(tag => this.interested_in_tags.includes(tag))) {
			if(evento.getprioridad() >= this.minimum_priority_interestedin_events) {
				this.tweet(evento.getmessage());
			}
		}
		else{
			if(evento.getprioridad() >= this.minimum_priority_all_events){
				this.tweet(evento.getmessage());
			}
		}
		
	}
}

export { tweetEvent };