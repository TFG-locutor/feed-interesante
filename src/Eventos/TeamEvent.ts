/*
"organization_id": "string",
"group_ids": [
    "string"
],
"affiliation": "string",
"nationality": "string",
"id": "string",
"icpc_id": "string",
"name": "string",
"display_name": "string",
"members": "string",
"photo": [
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

class TeamEvent extends Evento {

    id: string;
    organization_id: string;
    group_ids: [ string ];
    affiliation: string;
    nationality: string;
    icpc_id: string;
    name: string;
    display_name: string;
    members: string;
    photo: [ {
        href: string,
        mime: string,
        width: number,
        height: number
    } ];

    constructor(json : any, op: string) {
        super(op,"team")
        this.id = json.id;
        assert(this.id!=undefined&&this.id!=null);
        this.organization_id = json.organization_id;
        assert(this.organization_id!=undefined&&this.organization_id!=null);
        this.group_ids = json.group_ids;
        assert(this.group_ids!=undefined&&this.group_ids!=null);
        this.affiliation = json.affiliation;
        assert(this.affiliation!=undefined&&this.affiliation!=null);
        this.nationality = json.nationality;
        assert(this.nationality!=undefined&&this.nationality!=null);
        this.icpc_id = json.icpc_id;
        assert(this.icpc_id!=undefined&&this.icpc_id!=null);
        this.name = json.name;
        assert(this.name!=undefined&&this.name!=null);
        this.display_name = json.display_name;
        assert(this.display_name!=undefined&&this.display_name!=null);
        this.members = json.members;
        assert(this.members!=undefined&&this.members!=null);
        this.photo = json.photo;
        assert(this.photo!=undefined&&this.photo!=null);

    }

}

export {TeamEvent}