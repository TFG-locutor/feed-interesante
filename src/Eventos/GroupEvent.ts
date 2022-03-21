/*
"hidden": true,
"id": "string",
"icpc_id": "string",
"name": "string",
"sortorder": 0,
"color": "string"
*/

import { assert } from "console";
import { Evento } from "./Evento";

class GroupEvent extends Evento {

    id!: string;
    hidden!: true;
    icpc_id!: string;
    name!: string;
    sortorder!: number;
    color!: string;

    constructor(json : any, op: string) {
        super(op, "group", json, ["id","hidden","icpc_id","name","sortorder","color"]);
    }

}

export {GroupEvent}