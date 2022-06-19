// Servidor de Express
const express  = require('express');
const path     = require('path');
const cors     = require('cors');

class Server {

    constructor() {

        this.app  = express();
        this.port = process.env.PORT;

    }

    middlewares() {
        this.app.use(express.json());
        // Desplegar el directorio público
        this.app.use( express.static( path.resolve( __dirname, '../public' ) ) );
        // CORS
        this.app.use( cors() );

    }

    routes() {
      //Rutas
      this.app.get("/", async (req, res) => {
        res.json({ aplicacion: "Ejercicio para entrevista ML" });
      });
      
      this.app.use("/api/items", require("../routes/items"));
      //Inicio de servidor
    }

    execute() {
      // Inicializar Middlewares
      this.middlewares();

      // Inicializar Rutas
      this.routes();

      // Inicializar Server
      this.app.listen(this.port, () => {
        console.log("Server corriendo en puerto:", this.port);
      });
    }

}


module.exports = Server;