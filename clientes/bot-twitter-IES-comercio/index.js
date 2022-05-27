"use strict";

import http from 'http';

import twitterClass from './twitter.js';

let twitter = new twitterClass();

http.get({
    hostname: 'powergaia.fdi.ucm.es',
    port: 21252,
    path: '',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    },
}, (res) => {

    const { statusCode } = res;
    const contentType = res.headers['content-type'];
    let error;
    if (statusCode !== 200) {
        error = new Error('Request Failed.\n' +
                        `Status Code: ${statusCode}`);
    } else if (!/^application\/json/.test(contentType)) {
        error = new Error('Invalid content-type.\n' +
                        `Expected application/x-ndjson but received ${contentType}`);
    }
    if (error) {
        console.error(error.message);
        // Consume response data to free up memory
        res.resume();
        return;
    }

    res.setEncoding('utf8');

    console.log("leyendo del locutor automático!");

    let rawData = '';

    let indexData = 0; //El siguiente dato (carácter) a procesar
    let lastIndex = 0; //Último indice que no se ha incluido en una respuesta
    let numParentesis = 0; //Número de paréntesis abiertos
    let insideComillas = false;
    let anteriorIgualAEscape = false;

    res.on('data', (chunk) => {

        rawData += chunk;

        for(;indexData<rawData.length;++indexData) {
            var ch = rawData.charAt(indexData);
            if(!anteriorIgualAEscape && ch==='"') insideComillas = !insideComillas;
            anteriorIgualAEscape = (/\\/).test(ch);
            if(insideComillas) continue;
            if(ch=='{') ++numParentesis;
            if(ch=='}') --numParentesis;
            
            if(numParentesis===0) {
                
                let dataSTR = rawData.substring(lastIndex,indexData+1);
                //console.log("dataSTR:"+dataSTR)
                lastIndex = indexData+1;
                insideComillas = false;
                anteriorIgualAEscape = false;
                //Si se trata solo de un salto de linea, se ignora
                
                //console.log(dataSTR);
                try{
                    var jsonData = JSON.parse(dataSTR);
                    console.log(jsonData);
                    twitter.procesar(jsonData);
                    
                } catch (e) {
                    console.log(e);
                }

            }
        }

    });
    res.on('end', () => {
        try {
            console.log("---FIN---\n");
            const parsedData = JSON.parse(rawData);
            console.log(parsedData);
        } catch (e) {
            console.error(e.message);
        }
    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
});