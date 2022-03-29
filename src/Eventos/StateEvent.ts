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

    started!: moment.Moment;
    ended!: moment.Moment;
    frozen!: moment.Moment;
    thawed!: moment.Moment;
    finalized!: moment.Moment;
    end_of_updates!: string;

    constructor(json : any, op: string, _moment: string) {
        super(op, "state", _moment, json, ["started@moment","ended@moment","frozen@moment","thawed@moment","finalized@moment","end_of_updates"]);
    }

}

export{StateEvent}