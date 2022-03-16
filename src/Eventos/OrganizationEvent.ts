/*
"shortname": "string",
"id": "string",
"icpc_id": "string",
"name": "string",
"formal_name": "string",
"country": "string",
"logo": [
{
    "href": "string",
    "mime": "string",
    "width": 0,
    "height": 0
}
]
*/

import { assert } from "console";
import { Evento } from "./Evento";

class OrganizationEvent extends Evento {

    id: string;
    shortname: string;
    icpc_id: string;
    name: string;
    formal_name: string;
    country: string;
    logo: [{
        href: string,
        mime: string,
        width: number,
        height: number
    }];

    constructor(json : any, op: string) {
        super(op,"organization")
        this.id = json.id;
        assert(this.id!=undefined&&this.id!=null);
        this.shortname = json.shortname;
        assert(this.shortname!=undefined&&this.shortname!=null);
        this.icpc_id = json.icpc_id;
        assert(this.icpc_id!=undefined&&this.icpc_id!=null);
        this.name = json.name;
        assert(this.name!=undefined&&this.name!=null);
        this.formal_name = json.formal_name;
        assert(this.formal_name!=undefined&&this.formal_name!=null);
        this.country = json.country;
        assert(this.country!=undefined&&this.country!=null);
        this.logo = json.logo;
        assert(this.logo!=undefined&&this.logo!=null);

    }

}

export {OrganizationEvent}