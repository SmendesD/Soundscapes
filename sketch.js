// token de acesso para aceder à API da minha conta mapbox  
const token =
  "pk.eyJ1Ijoic2FyaXhkIiwiYSI6ImNrbXcyOWg3eTBhdG8ycG16M3V0d3loaHYifQ.3EJgFxKQrNa10lyNYceH9g";

// Opções para o mapa
var opçoes = {
  lat: 39.399872, //centrado em Portugal
  lng: -8.224454,
  zoom: 5,
  minZoom: 4,
  style: "mapbox://styles/sarixd/ckmw7g1ga18h217r4ah4ry1z2", 
};

const mappa = new Mappa("MapboxGL", token);

let mapaF;
var dados;
var tPontos = [];
var pWidth = 50;
var pHeight = 50;

function preload() {
  dados = loadJSON(
    "https://raw.githubusercontent.com/SmendesD/Pontos/master/locaisP.geojson"
  ); //vai buscar ao github a informação dos sons submetidos (onde vão sendo atualizados)
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  dC = createGraphics(windowWidth, windowHeight); //camada da "laterna"

  mapaF = mappa.tileMap(opçoes); // Cria os tiles e onde é centrado
  mapaF.overlay(canvas); // coloca o mapa no canvas

  console.log(dados);
}

///////////////////////////////////camda "laterna"//////////////////////////////////
function desenhaCamada(lados, r) {
  var angulo = 360 / lados;

  dC.beginShape();
  dC.noStroke();
  dC.fill(0, 0, 0, 2);
  dC.vertex(-width, -height);
  dC.vertex(-width, height);
  dC.vertex(width, height);
  dC.vertex(width, -height);

  dC.beginContour();
  for (var i = 0; i < lados; i++) {
    var x = cos(radians(i * angulo)) * r;
    var y = sin(radians(i * angulo)) * r;
    dC.vertex(x, y);
  }
  dC.endContour();

  dC.endShape(CLOSE);
}
/////////////////////////////////////////////////////////////////////////////////

var loaded = false;

//////////////////////ligar os dados do Json ao objeto PSom//////////////////////
function dadosPontosSons() {
  var psons = dados.features;

  for (let i = 0; i < psons.length; i++) {
    if (psons[i].properties.Audio) {
      //latLngToPixel faz a passagem da latitude e longitude para x e y
      var pos = mapaF.latLngToPixel(
        psons[i].geometry.coordinates[1],
        psons[i].geometry.coordinates[0]
      );

      var ponto = new PSom(
        //lat, lng, x, y, w, h, text
        psons[i].geometry.coordinates[1],
        psons[i].geometry.coordinates[0],
        pos.x,
        pos.y,
        pWidth,
        pHeight,
        psons[i].properties.Audio2
      );

      tPontos.push(ponto);
    }
    loaded = true;
  }
}
/////////////////////////////////////////////////////////////////////////////////

///////// atualizar o tamanho do canvas sempre a janela é redimensionada/////////
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  mapaF.resize(canvas);
  dC.resizeCanvas(windowWidth, windowHeight);
}
/////////////////////////////////////////////////////////////////////////////////
/*
function mousePressed() {
  for (let i = 0; i < tPontos.length; i++) {
    var pos = mapaF.latLngToPixel(tPontos[i].lat, tPontos[i].lng);

    tPontos[i].popup(mouseX, mouseY);
  }
}*/

function draw() {
  clear();

  //pontos dos sons
  if (mapaF.ready && !loaded) {
    dadosPontosSons();
  }

  if (loaded) {
    for (let i = 0; i < tPontos.length; i++) {
      var pos = mapaF.latLngToPixel(tPontos[i].lat, tPontos[i].lng);

      tPontos[i].updatePos(pos.x, pos.y, mapaF.zoom());
      tPontos[i].show();
      
    }
  }

  /////////////////////////////////camada "laterna"//////////////////////////////
  dC.push();
  dC.translate(width / 2, height / 2);
  desenhaCamada(200, 250); //lados , raio
  dC.pop();
  image(dC, 0, 0);
}
