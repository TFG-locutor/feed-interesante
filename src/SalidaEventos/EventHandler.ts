import { Observable } from "rxjs";

abstract class EventHandler {
    eventFeeds : Array<Observable<String>>;
    constructor() {
        this.eventFeeds = new Array<Observable<String>>();
    }

    observeNewEventFeed(eventFeed : Observable<String>){
        this.eventFeeds.push(eventFeed);

        const that = this;
        eventFeed.subscribe({
            next(event) { that.procesar(event) },
            error(err) { console.error('something wrong occurred: ' + err); },
            complete() { console.log('done');}
        });
    }
    abstract procesar( evento : String ) : void;
}

export { EventHandler };