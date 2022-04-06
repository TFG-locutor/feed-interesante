import moment from "moment";


abstract class Evento{
    
    tipo: string;
    op: string;
    moment : moment.Moment;

    [k: string]: any;

    constructor(op: string, tipo: string, _moment: string, json: any, campos: Array<string>) {
        this.op = op;
        this.tipo = tipo;
        this.moment = moment(_moment);
        if(op=="delete") this.id = json["id"];
        else for(var prop of campos) {
            var prop_name = prop;
            var prop_value = null;
            var arr = prop.split("@");
            if(arr.length==2) {
                prop_name = arr[0];
                switch(arr[1]) {
                    case "moment":
                        prop_value = moment(new Date(json[prop_name]));
                        break;
                    default: throw "Tipo '' no reconocido para construir un campo";
                }
            } else if(arr.length==1) {
                prop_value = json[prop]==undefined?null:json[prop];
            } else throw "Indicaciones no válidas para construir un campo: "+prop;
            
            this[prop_name] = prop_value;
            if(this[prop_name]===undefined/*||this[prop]==null*/) throw "No se puede construir un evento de tipo "+tipo+" porque el valor de "+prop_name+" es "+prop_value;
        }
    }

};

export{Evento};