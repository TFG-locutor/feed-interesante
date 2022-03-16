/*
"id": "string",
"name": "string",
"penalty": true,
"solved": true
*/

import { assert } from "console";
import { Evento } from "./Evento";

class JudgementTypeEvent extends Evento {

    id: string;
    name: string;
    penalty: boolean;
    solved: boolean;

    constructor(json : any, op: string) {
        super(op,"judgement_type")
        this.id = json.id;
        assert(this.id!=undefined&&this.id!=null);
        this.name = json.name;
        assert(this.name!=undefined&&this.name!=null);
        this.penalty = json.penalty;
        assert(this.penalty!=undefined&&this.penalty!=null);
        this.solved = json.solved;
        assert(this.solved!=undefined&&this.solved!=null);

    }

}

export {JudgementTypeEvent}