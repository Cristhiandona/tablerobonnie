var canvas;
var ctx;
var FPS = 50;

var anchoF = 50;
var altoF = 50;

var muro = "#731773";
var puerta = "#3a1700";
var tierra = "#ba6c5b";
var llave = "#c6bc00";

var enemigo = [];

var protagonista;
var tileMap;

var escenario = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [0, 2, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2],
  [0, 2, 0, 2, 2, 2, 2, 2, 0, 0, 0, 2, 2, 2, 0],
  [0, 2, 0, 2, 2, 0, 0, 2, 0, 0, 0, 2, 0, 2, 0],
  [0, 2, 0, 0, 2, 0, 0, 2, 2, 0, 0, 2, 2, 2, 0],
  [0, 2, 2, 2, 2, 0, 0, 0, 2, 0, 0, 2, 0, 2, 0],
  [0, 2, 0, 2, 0, 0, 0, 2, 2, 2, 0, 2, 2, 0, 0],
  [0, 0, 2, 2, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0],
  [0, 3, 2, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

function dibujaEscenario() {
  var color;

  for (y = 0; y < 10; y++) {
    for (x = 0; x < 15; x++) {
      var tile = escenario[y][x];
      ctx.drawImage(
        tileMap,
        tile * 32,0,32,32,anchoF * x,altoF * y,anchoF,altoF
      );
    }
  }
}
var antorcha = function(x, y){
    this.x = x;
    this.y = y;

    this.retraso = 10;
    this.contador = 0;
    this.fotograma = 0; //0-3

    this.cambiarFotograma = function(){
        if(this.fotograma < 3){

            this.fotograma++;

        }else{

            this.fotograma = 0;

        }
    }

    this.dibuja = function(){

        if(this.contador < this.retraso){

            this.contador++;

        }else{
            this.contador = 0;
            this.cambiarFotograma();
        }

        ctx.drawImage(tileMap,this.fotograma*32,64,32,32,anchoF*x, altoF*y, anchoF, altoF);
    }

}

//CLASE ENEMIGA
var malo = function (x, y) {
  this.x = x;
  this.y = y;

  this.direccion = Math.floor(Math.random() * 4);

  this.retraso = 9;//Velocidad del Enemigo
  this.fotograma = 0;

  this.dibuja = function () {
    //Dibujar enemigo
    ctx.drawImage(
      tileMap,
      0,
      32,
      32,
      32,
      this.x * anchoF,
      this.y * altoF,
      anchoF,
      altoF
    );
  };

  this.compruebaColision = function (x, y) {
    var colisiona = false;

    // Verificar si el enemigo intenta moverse fuera de los límites del escenario
    if (x < 0 || x >= escenario[0].length || y < 0 || y >= escenario.length) {
        colisiona = true;
    }
    // Verificar si la casilla no es una zona válida para el enemigo (solo puede moverse en las zonas '2')
    else if (escenario[y][x] != 2) {
        colisiona = true;
    }
    // Verificar si la casilla es la posición actual del jugador
    else if (x == protagonista.x && y == protagonista.y) {
        colisiona = true;
    }

    return colisiona;
};

this.mueve = function () {
    protagonista.colisionEnemigo(this.x, this.y);

    if (this.contador < this.retraso) {
        this.contador++;
    } else {
        this.contador = 0;

        // Arriba
        if (this.direccion == 0) {
            if (!this.compruebaColision(this.x, this.y - 1)) {
                this.y--;
            } else {
                this.direccion = Math.floor(Math.random() * 4);
            }
        }

        // Abajo
        if (this.direccion == 1) {
            if (!this.compruebaColision(this.x, this.y + 1)) {
                this.y++;
            } else {
                this.direccion = Math.floor(Math.random() * 4);
            }
        }

        // Izquierda
        if (this.direccion == 2) {
            if (!this.compruebaColision(this.x - 1, this.y)) {
                this.x--;
            } else {
                this.direccion = Math.floor(Math.random() * 4);
            }
        }

        // Derecha
        if (this.direccion == 3) {
            if (!this.compruebaColision(this.x + 1, this.y)) {
                this.x++;
            } else {
                this.direccion = Math.floor(Math.random() * 4);
            }
        }
    }
};


};

var jugador = function () {
  this.x = 1;
  this.y = 1;
  this.color = "#e1300a"; //Posicion del jugador
  this.llave = false;

  this.dibuja = function () {
    //Cargar imagen del jugador
    ctx.drawImage(
      tileMap,
      32,
      32,
      32,
      32,
      this.x * anchoF,
      this.y * altoF,
      anchoF,
      altoF
    );
  };

  this.colisionEnemigo = function (x, y) {
    if (this.x == x && this.y == y) {
      this.muerte();
    }
  };

  //Margenes para que el jugador no se salga de la zona
  this.margenes = function (x, y) {
    var colision = false;

    if (escenario[y][x] == 0) {
      colision = true;
    }

    return colision;
  };

  //Mover a todos los lados
  this.arriba = function () {
    if (this.margenes(this.x, this.y - 1) == false) this.y--;
    this.logicaObjetos();
  };

  this.abajo = function () {
    if (this.margenes(this.x, this.y + 1) == false) this.y++;
    this.logicaObjetos();
  };

  this.derecha = function () {
    if (this.margenes(this.x + 1, this.y) == false) this.x++;
    this.logicaObjetos();
  };

  this.izquierda = function () {
    if (this.margenes(this.x - 1, this.y) == false) this.x--;
    this.logicaObjetos();
  };

  this.victoria = function () {
    console.log("Has Ganado !!");
    this.x = 1;
    this.y = 1;

    this.llave = false;
    escenario[8][3] = 3;

    window.location.href = "nivel5.html"; // Cambia a la página del siguiente nivel
  };

  this.muerte = function () {

    // Mostrar mensaje de muerte en pantalla
    var mensajeMuerte = document.getElementById("mensajeMuerte");
    mensajeMuerte.style.display = "block";

    // Ocultar el mensaje después de 3 segundos
    setTimeout(function() {
        mensajeMuerte.style.display = "none";
    }, 3000);

    // Reiniciar posición del jugador
    this.x = 1;
    this.y = 1;

    // Reiniciar el estado de la llave
    this.llave = false;
    escenario[8][3] = 3;
};


  this.logicaObjetos = function () {
    var objeto = escenario[this.y][this.x];

        //OBTENER LA LLAVE
        if (objeto == 3) {
        
        this.llave = true;
        escenario[this.y][this.x] = 2;

        // Mostrar mensaje de muerte en pantalla
        var mensajeLlave = document.getElementById("mensajeLlave");
        mensajeLlave.style.display = "block";

        // Ocultar el mensaje después de 3 segundos
        setTimeout(function() {
            mensajeLlave.style.display = "none";
        }, 3000);
      
    }

    //ABRIMOS LA PUERTA
    if (objeto == 1) {
      if (this.llave == true) {

        // Mostrar mensaje de muerte en pantalla
        var mensajeGanar = document.getElementById("mensajeGanar");
        mensajeGanar.style.display = "block";

        // Ocultar el mensaje después de 3 segundos
        setTimeout(function() {
            mensajeGanar.style.display = "none";
        }, 3000);

        this.victoria();
      } else {

        // Mostrar mensaje de muerte en pantalla
        var mensajeSinLlave = document.getElementById("mensajeSinLlave");
        mensajeSinLlave.style.display = "block";

        // Ocultar el mensaje después de 3 segundos
        setTimeout(function() {
            mensajeSinLlave.style.display = "none";
        }, 3000);
      }
    }
  };
};

function inicializa() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  //Cargar imagen del mapa
  tileMap = new Image();
  tileMap.src = "mapa4.png";

  //Crear Jugador
  protagonista = new jugador();

  //Creamos la Antorcha
  imagenAntorcha = new antorcha(0,0);

  //Crear los enemigos
  enemigo.push(new malo(4, 1));
  enemigo.push(new malo(3, 6));
  enemigo.push(new malo(8, 6));
  enemigo.push(new malo(11, 5));
  enemigo.push(new malo(11, 3));
  enemigo.push(new malo(12, 5));

  //LECTURA DE TECLADO
  document.addEventListener("keydown", function (tecla) {
    console.log(tecla.keyCode);
    //ARRIBA
    if (tecla.keyCode == 38) {
      protagonista.arriba();
    }

    //ABAJO
    if (tecla.keyCode == 40) {
      protagonista.abajo();
    }

    //IZQUIERDA
    if (tecla.keyCode == 37) {
      protagonista.izquierda();
    }

    //DERECHA
    if (tecla.keyCode == 39) {
      protagonista.derecha();
    }
  });

  setInterval(function () {
    principal();
  }, 1000 / FPS);
}

function borrarCanvas() {
  canvas.width = 800;
  canvas.height = 500;
}

function principal() {
  borrarCanvas();
  dibujaEscenario();
  imagenAntorcha.dibuja();
  protagonista.dibuja();

  for (c = 0; c < enemigo.length; c++) {
    enemigo[c].mueve();
    enemigo[c].dibuja();
  }
}