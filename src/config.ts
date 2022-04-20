import { booleanItem, Confinode, ConfinodeResult, literal, numberItem, stringItem } from "confinode"
import path from "path"

//Manuales para cambiar la configuración:
//  https://www.npmjs.com/package/confinode
//  https://github.com/slune-org/confinode/blob/HEAD/doc/en/devmanual.md

interface Configuration {
    readonly url: string;
    readonly port: number;
    readonly https: boolean;
    readonly allow_expired_tls: boolean;
    readonly contest_id: string;
    readonly api_user: string;
    readonly api_password: string;
}


abstract class ConfigurationLoader {

    public static load() : Configuration {
        const description = literal<Configuration>({
            url: stringItem(),
            port: numberItem(),
            https: booleanItem(),
            allow_expired_tls: booleanItem(),
            contest_id: stringItem(),
            api_user: stringItem(),
            api_password: stringItem()
        });
        const confinod = new Confinode("FeedInteresante", description , {
            cache: false,
            //logger: msg => console.log(msg)
        } );

        var dir = path.join( path.dirname(__dirname) , "FeedInteresante.config.json" );


        var datos : ConfinodeResult<Configuration> | undefined = confinod.load.sync(dir);

        if(datos==undefined) throw "Imposible cargar la configuración";

        return {
            url: datos.configuration.url,
            port: datos.configuration.port,
            https: datos.configuration.https,
            allow_expired_tls: datos.configuration.allow_expired_tls,
            contest_id: datos.configuration.contest_id,
            api_user: datos.configuration.api_user,
            api_password: datos.configuration.api_password
        };
    }

}

export{ConfigurationLoader, Configuration}