"use strict";

class Queue {
  constructor() {
    this.elements = {};
    this.head = 0;
    this.tail = 0;
  }
  push(element) {
    this.elements[this.tail] = element;
    this.tail++;
  }
  pop() {
    const item = this.elements[this.head];
    delete this.elements[this.head];
    this.head++;
    return item;
  }
  peek() {
    return this.elements[this.head];
  }
  get length() {
    return this.tail - this.head;
  }
  get empty() {
    return this.length === 0;
  }
}


//TODAS ESTAS VARIABLES DEBERÍAN SER NÚMEROS ENTEROS

//Duración de la animación de aparecer y desaparecer de un mensaje en décimas de segundo
//(este tiempo no se comparte con la duración del mensaje como tal)
const duracion_fade = 10;

//Tiempo que cada mensaje debe aparecer en pantalla en décimas de segundo
const tiempo_por_mensaje = 50;




//----------------NO TOCAR---------------

let cola_mensajes = new Queue();

//Unidades de tiempo que lleva el mensaje actual en pantalla en décimas de segundo (-1 si no hay mensaje)
let tiempo_mensaje = -1;
let animando = false;

function update_mensaje() {
    
    if(cola_mensajes.empty) return;
    if(animando) return;
    //No se está animado y la cola no está vacia
    
    //Si el mensaje no se ha empezado a mostrar
    if(tiempo_mensaje==-1) {
        //Crear y mostrar nuevo mensaje
        animando = true;
        tiempo_mensaje = 0;
        $("#texto_mensaje").text(cola_mensajes.peek());
        $("#mensaje").fadeIn(duracion_fade*100,()=>{
            animando = false;
        });
        return;
    }
    
    //Si el mensaje ya es visible
    //Se va sumando al contador (1 vez cada 0.1s)
    if(++tiempo_mensaje === tiempo_por_mensaje) {
        animando = true;
        $("#mensaje").fadeOut((duracion_fade*100),()=>{
            cola_mensajes.pop();
            tiempo_mensaje = -1;
            animando = false;
        });
    }
    
}

function peticion() {

    let oReq = new XMLHttpRequest();

    let indexData = 0; //El siguiente dato (carácter) a procesar
    let lastIndex = 0; //Último indice que no se ha incluido en una respuesta
    let numParentesis = 0; //Número de paréntesis abiertos
    let insideComillas = false;
    let anteriorIgualAEscape = false;

    function progre(param) {
        //console.log("Progress");
        //console.log(oReq.response);

        for(;indexData<oReq.response.length;++indexData) {
            var ch = oReq.response.charAt(indexData);
            if(!anteriorIgualAEscape && ch==='"') insideComillas = !insideComillas;
            anteriorIgualAEscape = (/\\/).test(ch);
            if(insideComillas) continue;
            if(ch=='{') ++numParentesis;
            if(ch=='}') --numParentesis;
            
            if(numParentesis===0) {
                
                let dataSTR = oReq.response.substring(lastIndex,indexData+1);
                //console.log("dataSTR:"+dataSTR)
                lastIndex = indexData+1;
                insideComillas = false;
                anteriorIgualAEscape = false;
                //Si se trata solo de un salto de linea, se ignora
                
                //console.log(dataSTR);
                try{
                    var jsonData = JSON.parse(dataSTR);
                    
                    //TODO: aquí se tiene que filtrar, e ignorar mensajes que no contengas tags que nos interesan
                    //también se puede filtrar por tiempo

                    console.log(jsonData);

                    try{
                        if(jsonData.prioridad && parseInt(jsonData.prioridad) >= 2)
                            if( jsonData.tags && !jsonData.tags.includes("scoreboard_organizacion") )
                                if(jsonData.message) cola_mensajes.push(jsonData.message);
                    } catch(err) {
                        console.log(err);
                    }

                    
                } catch (e) {
                    console.log(e);
                }

            }
        }
    }
    
    //oReq.addEventListener("load", reqListener);
    oReq.addEventListener("progress", progre, false);
    let errReset = (err) =>  {
        console.log(err);
        setTimeout(()=>{peticion()}, 2000);
    }
    oReq.addEventListener("error", errReset);
    oReq.addEventListener("load", errReset);
    oReq.open("GET", "http://powergaia.fdi.ucm.es:21252");
    oReq.timeout = Number.MAX_SAFE_INTEGER;
    oReq.send();
}

$(()=>{
    
    $("#mensaje").fadeOut(0);
    
    setInterval( update_mensaje , 100);
    
    peticion();
    
});

function generadorMensaje() {
    let letras="qwertyuiopasdfghjklñzxcvbnm,.-1234567890!\"·$%&/()=                ";
    let nLetras = Math.random()*200 + 10;
    let texto = "";
    for(var i=0;i<nLetras;++i) {
        texto += letras.charAt(Math.random()*letras.length);
    }
    cola_mensajes.push(texto);
    setTimeout(generadorMensaje, Math.random()*20000)
}
//COMENTAR ESTA LLAMADA PARA QUE NO SE GENEREN MENSAJES ALEATORIOS
//generadorMensaje();