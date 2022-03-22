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

    constructor(json : any, op: string) {
        super(op, "judgement_type", json, ["id","name","penalty","solved"]);
    }

}

export {JudgementTypeEvent}