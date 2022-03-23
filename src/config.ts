import { Confinode, ConfinodeResult, literal, numberItem, stringItem } from "confinode"
import path from "path"

//Manuales para cambiar la configuración:
//  https://www.npmjs.com/package/confinode
//  https://github.com/slune-org/confinode/blob/HEAD/doc/en/devmanual.md

interface Configuration {
    readonly url: string;
    readonly port: number;
    readonly api_version: string;
    readonly contest_id: string;
}


abstract class ConfigurationLoader {

    public static load() : Configuration {
        const description = literal<Configuration>({
            url: stringItem(),
            port: numberItem(),
            api_version: stringItem(),
            contest_id: stringItem()
        });
        const confinod = new Confinode("feed-interesante", description , {
            cache: false,
            //logger: msg => console.log(msg)
        } );

        var dir = path.join( path.dirname(__dirname) , "feed-interesante.config.json" );


        var datos : ConfinodeResult<Configuration> | undefined = confinod.load.sync(dir);

        if(datos==undefined) throw "Imposible cargar la configuración";

        return {
            url: datos.configuration.url,
            port: datos.configuration.port,
            api_version: datos.configuration.api_version,
            contest_id: datos.configuration.contest_id
        };
    }

}

export{ConfigurationLoader, Configuration}