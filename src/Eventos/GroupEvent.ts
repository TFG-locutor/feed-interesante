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

    id: string;
    hidden: true;
    icpc_id: string;
    name: string;
    sortorder: number;
    color: string;

    constructor(json : any, op: string) {
        super(op,"group")
        this.id = json.id;
        assert(this.id!=undefined&&this.id!=null);
        this.hidden = json.hidden;
        assert(this.hidden!=undefined&&this.hidden!=null);
        this.icpc_id = json.icpc_id;
        assert(this.icpc_id!=undefined&&this.icpc_id!=null);
        this.name = json.name;
        assert(this.name!=undefined&&this.name!=null);
        this.sortorder = json.sortorder;
        assert(this.sortorder!=undefined&&this.sortorder!=null);
        this.color = json.color;
        assert(this.color!=undefined&&this.color!=null);

    }

}

export {GroupEvent}