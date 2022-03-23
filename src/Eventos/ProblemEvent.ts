/*
"id": "string",
"label": "string",
"short_name": "string",
"name": "string",
"ordinal": 0,
"rgb": "string",
"color": "string",
"time_limit": 0,
"test_data_count": 0
*/

import { Evento } from "./Evento";

class ProblemEvent extends Evento {

    id!: string;
    //label!: string;
    //short_name!: string;
    name!: string;
    ordinal!: number;
    //rgb!: string;
    //color!: string;
    time_limit!: number;
    test_data_count!: number;

    constructor(json : any, op: string) {
        //console.log(op);
        //console.log(json);
        super(op, "problem", json, ["id",/*"label",*//*"short_name",*/"name","ordinal",/*"rgb","color",*/"time_limit","test_data_count"]);
    }

}

export {ProblemEvent}