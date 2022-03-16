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

import { assert } from "console";
import { Evento } from "./Evento";

class ProblemEvent extends Evento {

    id: string;
    label: string;
    short_name: string;
    name: string;
    ordinal: number;
    rgb: string;
    color: string;
    time_limit: number;
    test_data_count: number;

    constructor(json : any, op: string) {
        super(op,"problem")
        this.id = json.id;
        assert(this.id!=undefined&&this.id!=null);
        this.label = json.label;
        assert(this.label!=undefined&&this.label!=null);
        this.short_name = json.short_name;
        assert(this.short_name!=undefined&&this.short_name!=null);
        this.name = json.name;
        assert(this.name!=undefined&&this.name!=null);
        this.ordinal = json.ordinal;
        assert(this.ordinal!=undefined&&this.ordinal!=null);
        this.rgb = json.rgb;
        assert(this.rgb!=undefined&&this.rgb!=null);
        this.color = json.color;
        assert(this.color!=undefined&&this.color!=null);
        this.time_limit = json.time_limit;
        assert(this.time_limit!=undefined&&this.time_limit!=null);
        this.test_data_count = json.test_data_count;
        assert(this.test_data_count!=undefined&&this.test_data_count!=null);

    }

}

export {ProblemEvent}