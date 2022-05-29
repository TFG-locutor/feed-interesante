# feed-interesante
Hemos desarrollado un locutor automático de concursos de programación. Su comportamiento se basa en la recopilación de información estática y dinámica de concursos en tiempo real, y su posterior procesamiento para generar comentarios interesantes y mantener la emoción. La arquitectura de este locutor busca ser extensible, dando la posibilidad de que se añadan nuevos tipos de mensajes fácilmente, ampliando la funcionalidad del programa. Además, ofrece la posibilidad de conectar distintos clientes, ya sea para enriquecer una retransmisión en streaming, publicar tweets periódicos, alimentar bots de Telegram o incluso ayudar a un locutor humano en su labor.

# Configuración variables del sistema
Se pueden configurar las siguientes variables de entorno:
- **url** (Requerido. String): IP o nombre de dominio donde se encuentra desplegado el servidor CDS al que se desea conectar el locutor automático.
 - **port** (Requerido. Number): Puerto en el que está escuchando el servidor CDS.
contest\_id (Requerido. String): ID del concurso que se desea escuchar.
- **https** (Opcional. Boolean)}: Indica si el servidor utiliza o requiere una conexión segura para poder acceder a los datos. Su valor por defecto es **true**.
- **allow\_expired\_tls** (Opcional. Boolean): Indica si el sistema debe ignorar la validez de los certificados TLS en servidores seguros. Esta propiedad es útil para probar el locutor en entornos controlados donde puede ser complicado conseguir un certificado válido, pero no es recomendable activarla en entornos de producción. La propiedad se ignora si se indica, mediante la propiedad anterior, que el servidor no requiere una conexión segura. Su valor por defecto es **false**.
- **api\_user** (Opcional. String): Si el servidor requiere autentificación, el programa utiliza este campo como usuario para autenticarse. Si se deja vacío, se intenta acceder de forma anónima.
- **api\_password** (Opcional. String)}: Si el servidor requiere autentificación, el programa utiliza este campo como contraseña para autenticarse. Este campo se ignora si el campo anterior está vacío.



El sistema, en caso de encontrar como mínimo las variables de entorno requeridas, utilizará este método como forma de configuración de la conexión del sistema por encima de otras. Mediante estas variables de entorno, podremos configurar la conexión con el servidor CDS. 

También puede realizarse la configuración editando el archivo FeedInteresante.config.json
# Desplegado

Al haber programado la aplicación en TypeScript, el código debe ser compilado a JavaScript. Por ello, si se desea desplegar el locutor mediante Node, pero sin modificar el código fuente, ya sea para implementar alguna característica descrita en la sección 6.2 o para introducir otros cambios, se debe descargar el código fuente de la aplicación contenido este repositorio. Tras introducir los cambios necesarios y configurar el archivo FeedInteresante.config.json o configurar las variables de entorno deseadas, se debe ejecutar el comando `npm install` para instalar las dependencias de la aplicación. Posteriormente, para ejecutar el locutor, se debe ejecutar el comando `npm start`, el cual compilará el código a JavaScript en la carpeta build y lanzará el sistema.

En caso de desear desplegar el locutor mediante Node, pero sin modificar el código fuente, se ofrece en el apartado Releases del repositorio (https://github.com/TFG-locutor/feed-interesante/releases) una versión del código previamente compilado a JavaScript. El proceso consiste en descargarse el código de cualquier release, editar el archivo FeedInteresante.config.json o configurar las variables de entorno necesarias, y lanzar el locutor ejecutando mediante el comando `node build/index.js`.

También existe una imagen Docker de este proyecto: https://hub.docker.com/r/bdmariobd/locutor-concursos
