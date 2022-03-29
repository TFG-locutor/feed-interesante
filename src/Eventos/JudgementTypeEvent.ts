/*
"id": "string",
"name": "string",
"penalty": true,
"solved": true
*/

import { Evento } from "./Evento";

class JudgementTypeEvent extends Evento {

    id!: string;
    name!: string;
    penalty!: boolean;
    solved!: boolean;

    constructor(json : any, op: string, _moment: string) {
        super(op, "judgement_type", _moment, json, ["id","name","penalty","solved"]);
    }

}

export {JudgementTypeEvent}