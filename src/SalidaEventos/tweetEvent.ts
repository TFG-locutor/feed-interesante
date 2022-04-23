import { connectLogger } from "log4js";
import { Observable } from "rxjs";
import { TwitterClient } from "twitter-api-client";
import { EventHandler } from "./EventHandler";

class tweetEvent extends EventHandler{
    twitterClient : TwitterClient;
    constructor(){
        super();
        this.twitterClient = new TwitterClient();
    }
    
    procesar(evento: string): void {

        if(!evento.match(/iniesta/)) return
        try {
            console.log("voy a twittear:"+evento)
            this.twitterClient.tweets.statusesUpdate({status:evento}).then(function(data){
                console.log(data);
            }).catch(function(err){
                console.log(err);
            }
            );

        } catch (error) {
            console.log(error);
        }
    }

}

export { tweetEvent };