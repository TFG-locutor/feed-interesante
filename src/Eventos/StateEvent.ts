/*
started: '2022-03-23T12:40:00.000+01:00',
ended: null,
frozen: null,
thawed: null,
finalized: null,
end_of_updates: null
*/

import { Evento } from "./Evento";

class StateEvent extends Evento {

    started!: string;
    ended!: string;
    frozen!: string;
    thawed!: string;
    finalized!: string;
    end_of_updates!: string;

    constructor(json : any, op: string) {
        super(op, "language", json, ["started","ended","frozen","thawed","finalized","end_of_updates"]);
    }

}

export{StateEvent}