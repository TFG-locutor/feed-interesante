import { assert } from "console";
import { Evento } from "./Evento";
import { ClarificationEvent } from "./ClarificationEvent";
import { GroupEvent } from "./GroupEvent";
import { JudgementEvent } from "./JudgementEvent";
import { JudgementTypeEvent } from "./JudgementTypeEvent";
import { OrganizationEvent } from "./OrganizationEvent";
import { ProblemEvent } from "./ProblemEvent";
import { TeamEvent } from "./TeamEvent";
import { SubmissionEvent } from "./SubmissionEvent";

abstract class EventFactory {

    static obtenerEventoDesdeJSON(json: any) : Evento | null {

        if(json==undefined||json==null) throw "JSON no existente. No se puede crear la estructura del evento";
        for(var field of ["type","op","data"]) {
            if(json[field]==undefined||json[field]==null)
                throw "No se puede crear la estructura del evento. El campo "+field+" tiene el valor: "+json[field];
        }

        switch(json.type) {
            case "clarifications": return new ClarificationEvent(json.data, json.op);
            case "groups": return new GroupEvent(json.data, json.op);
            case "judgements": return new JudgementEvent(json.data, json.op);
            case "judgement-types": return new JudgementTypeEvent(json.data, json.op);
            case "organizations": return new OrganizationEvent(json.data, json.op);
            case "problems": return new ProblemEvent(json.data, json.op);
            case "submissions": return new SubmissionEvent(json.data, json.op);
            case "teams": return new TeamEvent(json.data, json.op);
            case "runs": case "languages": case "contests": case "state":return null;
        }


        throw "Evento no reconocido: "+json.type;

    }

}

export{EventFactory}