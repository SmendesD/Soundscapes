mapboxgl.accessToken =
  "pk.eyJ1Ijoic2FyaXhkIiwiYSI6ImNrbXcyOWg3eTBhdG8ycG16M3V0d3loaHYifQ.3EJgFxKQrNa10lyNYceH9g";
//pk.eyJ1Ijoib3JvdXJiMjQiLCJhIjoiY2o3amk0OW1pMjBtdzMyb2VpNTFoMDNybSJ9.jBYCFJWvjLRiVqXihQwo8w
//mapbox://styles/orourb24/cjm0mi4h0282w2slccj7qox9w

// "pk.eyJ1Ijoic2FyaXhkIiwiYSI6ImNrbXcyOWg3eTBhdG8ycG16M3V0d3loaHYifQ.3EJgFxKQrNa10lyNYceH9g"
//"mapbox://styles/sarixd/ckmw7g1ga18h217r4ah4ry1z2"

var mapa = new mapboxgl.Map({
  container: "mapa", // container ID
  style: "mapbox://styles/sarixd/ckmw7g1ga18h217r4ah4ry1z2",
  center: [-9.139670133590698, 38.71402866367757], // longitude e latitude
  zoom: 5, // zoom de 0 a 22-mais perto
  minZoom: 4,
});

// desativa a rotação no mapa
mapa.dragRotate.disable();

////////////////////////////////////////////LOAD MAPA////////////////////////////////
mapa.on("load", () => {
  ///vai buscar a informação ao github
  mapa.addSource("pontosSonS", {
    type: "geojson",
    data:
      "https://raw.githubusercontent.com/SmendesD/Pontos/master/locaisP.geojson",
    cluster: true, //junta os pontos proximos
    clusterMaxZoom: 14,
    clusterRadius: 50,
  });

  /////////////////////////////// clusters estilo
  mapa.addLayer({
    id: "clusters",
    type: "circle",
    source: "pontosSonS",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": "white",
      "circle-stroke-width": 2,
      // raio dos clusters -> nº de pontos: 20px -> >5, 30px -> 5 a 9, 40px -> =>9
      "circle-radius": ["step", ["get", "point_count"], 15, 10, 30, 15, 40],
    },
  });

  ////////////////////aparecer o numero de pontos no cluster
  mapa.addLayer({
    id: "contagem",
    type: "symbol",
    source: "pontosSonS",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count}",
      // tamanho dos números -> nº de pontos: 14 -> >5, 16 -> 5 a 9, 24 -> =>9
      "text-size": ["step", ["get", "point_count"], 14, 10, 16, 15, 24],
    },
  });

  /////////////////////////////////só um ponto
  mapa.addLayer({
    id: "ponto",
    type: "circle",
    source: "pontosSonS",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-radius": 10,
      "circle-stroke-width": 2,
      "circle-color": "white",
    }
  });

  //para o rato mudar de forma quando está em cima de um cluster
  mapa.on("mouseenter", "clusters", () => {
    mapa.getCanvas().style.cursor = "pointer";
  }); //rato volta ao normal
  mapa.on("mouseleave", "clusters", () => {
    //rato volta ao normal
    mapa.getCanvas().style.cursor = "";
  });
  //para o rato mudar de forma quando está em cima de um ponto
  mapa.on("mouseenter", "ponto", () => {
    mapa.getCanvas().style.cursor = "pointer";
  }); //rato volta ao normal
  mapa.on("mouseleave", "ponto", () => {
    mapa.getCanvas().style.cursor = "";
  });

  //////////////////////////////////////////popup
  mapa.on("click", "ponto", (e) => {
    const result = mapa.queryRenderedFeatures(e.point, {});
    if (result.length) {
      const popup = new mapboxgl.Popup({
        // closeButton: false,
      });
      const texto = result[1];
      popup
        .setLngLat(e.lngLat)
        .setHTML(
          "<h1>" +
            "Som" +
            "</h1>" +
            "<h3>" +
            "Author's name: " +
            "</h3>" +
            "<p>" +
            texto.properties.Nome +
            "</p>" +
            "<h3>" +
            "Recording date: " +
            "</h3>" +
            "<p>" +
            texto.properties.Data +
            "</p>" +
            "<h3>" +
            "Recording time: " +
            "</h3>" +
            "<p>" +
            texto.properties.Tempo +
            "</p>" +
            "<h3>" +
            "Location of the recording: " +
            "</h3>" +
            "<p>" +
            texto.properties.Local +
            "</p>" +
            "<h3>" +
            "Recording coordinates: " +
            "</h3>" +
            "<p>" +
            texto.properties.Coordenadas +
            "</p>" +
            "<h3>" +
            "Equipment used: " +
            "</h3>" +
            "<p>" +
            texto.properties.Equipamento +
            "</p>" +
            "<h3>" +
            "Categories and subcategories: " +
            "</h3>" +
            "<p>" +
            texto.properties.Categorias +
            "</p>" +
            "<h3>" +
            "Additional Comment: " +
            "</h3>" +
            "<p>" +
            texto.properties.Comentário +
            "</p>" +
            "<h3>" +
            "Audio: " +
            "</h3>" +
            texto.properties.Audio
        )
        .addTo(mapa);
    }

    console.log("click", e.lngLat); //coordenadas do rato
  });

  /////////////////////////////////////fazer zoom ao clicar num cluster
  mapa.on("click", "clusters", (e) => {
    const features = mapa.queryRenderedFeatures(e.point, {
      layers: ["clusters"],
    });
    const clusterId = features[0].properties.cluster_id;
    mapa
      .getSource("pontosSonS")
      .getClusterExpansionZoom(clusterId, (z, zoom) => {
        if (z) return;

        mapa.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom,
        });
      });
  });
});

////////////////////////////////////////////controlos do mapa
var controlos = new mapboxgl.NavigationControl({
  //container: "controlos",
  showCompass: false,
  showZoom: true,
});
mapa.addControl(controlos, "top-left"); //no css mudou-se manualmente para baixo e centro

///////////////////////////////// CATEGORIAS ////////////////////////////////////////
var cat1Sel,
  cat2Sel,
  cat3Sel,
  cat4Sel,
  cat5Sel,
  cat6Sel,
  cat7Sel = false;

// ponteiro do rato muda para pointer
document.getElementById("cat1").style.cursor = "pointer";
document.getElementById("cat2").style.cursor = "pointer";
document.getElementById("cat3").style.cursor = "pointer";
document.getElementById("cat4").style.cursor = "pointer";
document.getElementById("cat5").style.cursor = "pointer";
document.getElementById("cat6").style.cursor = "pointer";
document.getElementById("cat7").style.cursor = "pointer";

document.getElementById("cat1").addEventListener("click", function (a) {
  // clico no 1º quadrado

  if (cat1Sel) {
    //se já estiver selecionada -> passa a branco

    mapa.setPaintProperty("ponto", "circle-color", "white");
    cat1Sel = false;
  } else {
    //se não -> vai pintar os sons que pertencem à categoria da mesma cor que o quadrado e os que não pertecem passam a preto     e desseleccionar as restantes cat
    ////////////////////aparecer o numero de pontos no cluster
  
       /* https://docs.mapbox.com/mapbox-gl-js/api/map/#setlayoutproperty-parameters*/
    
    /*mapa.addLayer({
    id: "contagem1",
    type: "symbol",
    source: "pontosSonS",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count}",
      // tamanho dos números -> nº de pontos: 14 -> >5, 16 -> 5 a 9, 24 -> =>9
      "text-size": ["step", ["get", "point_count"], 14, 5, 16, 9, 24],
    },
  });*/
    /* mapa.setFilter ("contagem", ["==", ["get", "Sons de objetos"], "{point_count}"]);*/
    /*  mapa.setFilter ("ponto", "text-field", ["macth",
      ["get", "Sons de objetos"], "{point_count}" ]) ;*/
    /*filterCat= ["match", ["get","Sons de objetos"], "contagem"];
    mapa.setFilter ("contagem",filterCat);*/

    /* mapa.setFilter("contagem","text-field", ["match",["get", "Sons de objetos"] ,"1", "{point_count}"]);*/

    /*mapa.addLayer({
    id: "ponto",
    type: "circle",
    source: "pontosSonS",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-radius": 10,
      "circle-stroke-width": 2,
      "circle-color": "white",
    },
  });*/
    mapa.setPaintProperty("ponto", "circle-color", [
      "match",
      ["get", "Sons de objetos"],
      "1",
      "#FFD6A5",
      "#3d3d3d",
    ]);

    cat1Sel = true;
    cat2Sel = false;
    cat3Sel = false;
    cat4Sel = false;
    cat5Sel = false;
    cat6Sel = false;
    cat7Sel = false;
  }

  //cores dos botões
  if (cat1Sel == true) {
    //popup das subcategorias
    document.getElementById("categoria1").style.display = "block";
    document.getElementById("categoria2").style.display = "none";
    document.getElementById("categoria3").style.display = "none";
    document.getElementById("categoria4").style.display = "none";
    document.getElementById("categoria5").style.display = "none";
    document.getElementById("categoria6").style.display = "none";
    document.getElementById("categoria7").style.display = "none";

    //cor das categorias
    document.getElementById("cat1").style.backgroundColor = "#FFD6A5";
    document.getElementById("cat2").style.backgroundColor = "#FAF6B999";
    document.getElementById("cat3").style.backgroundColor = "#CFE5B999";
    document.getElementById("cat4").style.backgroundColor = "#AADFED99";
    document.getElementById("cat5").style.backgroundColor = "#90A4D799";
    document.getElementById("cat6").style.backgroundColor = "#EDC8DF99";
    document.getElementById("cat7").style.backgroundColor = "#E89E9E99";
  } else {
    document.getElementById("categoria1").style.display = "none";

    document.getElementById("cat1").style.backgroundColor = "#FFD6A599";
  }
});

document.getElementById("cat2").addEventListener("click", function (a) {
  // clico no 2º quadrado

  if (cat2Sel) {
    //se já estiver selecionada -> passa a branco

    mapa.setPaintProperty("ponto", "circle-color", "white");
    cat2Sel = false;
  } else {
    //se não -> vai pintar os sons que pertencem à categoria da mesma cor que o quadrado e os que não pertecem passam a preto     e desseleccionar as restantes cat
    mapa.setPaintProperty("ponto", "circle-color", [
      "match",
      ["get", "Sons de animais"],
      "1",
      "#FAF6B9",
      "#3d3d3d",
    ]);

    cat1Sel = false;
    cat2Sel = true;
    cat3Sel = false;
    cat4Sel = false;
    cat5Sel = false;
    cat6Sel = false;
    cat7Sel = false;
  }

  //cores dos botões
  if (cat2Sel == true) {
    //popup das subcategorias
    document.getElementById("categoria1").style.display = "none";
    document.getElementById("categoria2").style.display = "block";
    document.getElementById("categoria3").style.display = "none";
    document.getElementById("categoria4").style.display = "none";
    document.getElementById("categoria5").style.display = "none";
    document.getElementById("categoria6").style.display = "none";
    document.getElementById("categoria7").style.display = "none";

    //cor das categorias
    document.getElementById("cat1").style.backgroundColor = "#ffd6a599";
    document.getElementById("cat2").style.backgroundColor = "#FAF6B9";
    document.getElementById("cat3").style.backgroundColor = "#cfe5b999";
    document.getElementById("cat4").style.backgroundColor = "#aadfed99";
    document.getElementById("cat5").style.backgroundColor = "#90a4d799";
    document.getElementById("cat6").style.backgroundColor = "#edc8df99";
    document.getElementById("cat7").style.backgroundColor = "#e89e9e99";
  } else {
    document.getElementById("categoria2").style.display = "none";
    document.getElementById("cat2").style.backgroundColor = "#ffd6a599";
  }
});

document.getElementById("cat3").addEventListener("click", function (a) {
  // clico no 3º quadrado

  if (cat3Sel) {
    //se já estiver selecionada -> passa a branco

    mapa.setPaintProperty("ponto", "circle-color", "white");
    cat3Sel = false;
  } else {
    //se não -> vai pintar os sons que pertencem à categoria da mesma cor que o quadrado e os que não pertecem passam a preto     e desseleccionar as restantes cat

    mapa.setPaintProperty("ponto", "circle-color", [
      "match",
      ["get", "Sons de humanos"],
      "1",
      "#CFE5B9",
      "#3d3d3d",
    ]);

    cat1Sel = false;
    cat2Sel = false;
    cat3Sel = true;
    cat4Sel = false;
    cat5Sel = false;
    cat6Sel = false;
    cat7Sel = false;
  }

  //cores dos botões
  if (cat3Sel == true) {
    //popup das subcategorias
    document.getElementById("categoria1").style.display = "none";
    document.getElementById("categoria2").style.display = "none";
    document.getElementById("categoria3").style.display = "block";
    document.getElementById("categoria4").style.display = "none";
    document.getElementById("categoria5").style.display = "none";
    document.getElementById("categoria6").style.display = "none";
    document.getElementById("categoria7").style.display = "none";

    //cor das categorias
    document.getElementById("cat1").style.backgroundColor = "#ffd6a599";
    document.getElementById("cat2").style.backgroundColor = "#ffd6a599";
    document.getElementById("cat3").style.backgroundColor = "#CFE5B9";
    document.getElementById("cat4").style.backgroundColor = "#aadfed99";
    document.getElementById("cat5").style.backgroundColor = "#90a4d799";
    document.getElementById("cat6").style.backgroundColor = "#edc8df99";
    document.getElementById("cat7").style.backgroundColor = "#e89e9e99";
  } else {
    document.getElementById("categoria3").style.display = "none";
    document.getElementById("cat3").style.backgroundColor = "#cfe5b999";
  }
});

document.getElementById("cat4").addEventListener("click", function (a) {
  // clico no 4º quadrado

  if (cat4Sel) {
    //se já estiver selecionada -> passa a branco

    mapa.setPaintProperty("ponto", "circle-color", "white");
    cat4Sel = false;
  } else {
    //se não -> vai pintar os sons que pertencem à categoria da mesma cor que o quadrado e os que não pertecem passam a preto     e desseleccionar as restantes cat
    mapa.setPaintProperty("ponto", "circle-color", [
      "match",
      ["get", "Música"],
      "1",
      "#AADFED",
      "#3d3d3d",
    ]);

    cat1Sel = false;
    cat2Sel = false;
    cat3Sel = false;
    cat4Sel = true;
    cat5Sel = false;
    cat6Sel = false;
    cat7Sel = false;
  }

  //cores dos botões
  if (cat4Sel == true) {
    //popup das subcategorias
    document.getElementById("categoria1").style.display = "none";
    document.getElementById("categoria2").style.display = "none";
    document.getElementById("categoria3").style.display = "none";
    document.getElementById("categoria4").style.display = "block";
    document.getElementById("categoria5").style.display = "none";
    document.getElementById("categoria6").style.display = "none";
    document.getElementById("categoria7").style.display = "none";

    //cor das categorias
    document.getElementById("cat1").style.backgroundColor = "#ffd6a599";
    document.getElementById("cat2").style.backgroundColor = "#ffd6a599";
    document.getElementById("cat3").style.backgroundColor = "#cfe5b999";
    document.getElementById("cat4").style.backgroundColor = "#AADFED";
    document.getElementById("cat5").style.backgroundColor = "#90a4d799";
    document.getElementById("cat6").style.backgroundColor = "#edc8df99";
    document.getElementById("cat7").style.backgroundColor = "#e89e9e99";
  } else {
    document.getElementById("categoria4").style.display = "none";
    document.getElementById("cat4").style.backgroundColor = "#aadfed99";
  }
});

document.getElementById("cat5").addEventListener("click", function (a) {
  // clico no 6º quadrado

  if (cat5Sel) {
    //se já estiver selecionada -> passa a branco

    mapa.setPaintProperty("ponto", "circle-color", "white");
    cat5Sel = false;
  } else {
    //se não -> vai pintar os sons que pertencem à categoria da mesma cor que o quadrado e os que não pertecem passam a preto     e desseleccionar as restantes cat
    mapa.setPaintProperty("ponto", "circle-color", [
      "match",
      ["get", "Sons naturais"],
      "1",
      "#90A4D7",
      "#3d3d3d",
    ]);

    cat1Sel = false;
    cat2Sel = false;
    cat3Sel = false;
    cat4Sel = false;
    cat5Sel = true;
    cat6Sel = false;
    cat7Sel = false;
  }

  //cores dos botões
  if (cat5Sel == true) {
    //popup das subcategorias
    document.getElementById("categoria1").style.display = "none";
    document.getElementById("categoria2").style.display = "none";
    document.getElementById("categoria3").style.display = "none";
    document.getElementById("categoria4").style.display = "none";
    document.getElementById("categoria5").style.display = "block";
    document.getElementById("categoria6").style.display = "none";
    document.getElementById("categoria7").style.display = "none";

    //cor das categorias
    document.getElementById("cat1").style.backgroundColor = "#ffd6a599";
    document.getElementById("cat2").style.backgroundColor = "#ffd6a599";
    document.getElementById("cat3").style.backgroundColor = "#cfe5b999";
    document.getElementById("cat4").style.backgroundColor = "#aadfed99";
    document.getElementById("cat5").style.backgroundColor = "#90A4D7";
    document.getElementById("cat6").style.backgroundColor = "#edc8df99";
    document.getElementById("cat7").style.backgroundColor = "#e89e9e99";
  } else {
    document.getElementById("categoria5").style.display = "none";
    document.getElementById("cat5").style.backgroundColor = "#90a4d799";
  }
});

document.getElementById("cat6").addEventListener("click", function (a) {
  // clico no 7º quadrado

  if (cat6Sel) {
    //se já estiver selecionada -> passa a branco

    mapa.setPaintProperty("ponto", "circle-color", "white");
    cat6Sel = false;
  } else {
    //se não -> vai pintar os sons que pertencem à categoria da mesma cor que o quadrado e os que não pertecem passam a preto     e desseleccionar as restantes cat
    mapa.setPaintProperty("ponto", "circle-color", [
      "match",
      ["get", "Sons de origem desconhecida"],
      "1",
      "#EDC8DF",
      "#3d3d3d",
    ]);

    cat1Sel = false;
    cat2Sel = false;
    cat3Sel = false;
    cat4Sel = false;
    cat5Sel = false;
    cat6Sel = true;
    cat7Sel = false;
  }

  //cores dos botões
  if (cat6Sel == true) {
    //popup das subcategorias
    document.getElementById("categoria1").style.display = "none";
    document.getElementById("categoria2").style.display = "none";
    document.getElementById("categoria3").style.display = "none";
    document.getElementById("categoria4").style.display = "none";
    document.getElementById("categoria5").style.display = "none";
    document.getElementById("categoria6").style.display = "block";
    document.getElementById("categoria7").style.display = "none";

    //cor das categorias
    document.getElementById("cat1").style.backgroundColor = "#ffd6a599";
    document.getElementById("cat2").style.backgroundColor = "#ffd6a599";
    document.getElementById("cat3").style.backgroundColor = "#cfe5b999";
    document.getElementById("cat4").style.backgroundColor = "#aadfed99";
    document.getElementById("cat5").style.backgroundColor = "#90a4d799";
    document.getElementById("cat6").style.backgroundColor = "#EDC8DF";
    document.getElementById("cat7").style.backgroundColor = "#E89E9E99";
  } else {
    document.getElementById("categoria6").style.display = "none";
    document.getElementById("cat6").style.backgroundColor = "#EDC8DF99";
  }
});

document.getElementById("cat7").addEventListener("click", function (a) {
  // clico no 8º quadrado

  if (cat7Sel) {
    //se já estiver selecionada -> passa a branco

    mapa.setPaintProperty("ponto", "circle-color", "white");
    cat7Sel = false;
  } else {
    //se não -> vai pintar os sons que pertencem à categoria da mesma cor que o quadrado e os que não pertecem passam a preto     e desseleccionar as restantes cat
    mapa.setPaintProperty("ponto", "circle-color", [
      "match",
      ["get", "Ambiente e Plano de fundo"],
      "1",
      "#E89E9E",
      "#3d3d3d",
    ]);

    cat1Sel = false;
    cat2Sel = false;
    cat3Sel = false;
    cat4Sel = false;
    cat5Sel = false;
    cat6Sel = false;
    cat7Sel = true;
  }

  //cores dos botões
  if (cat7Sel == true) {
    //popup das subcategorias
    document.getElementById("categoria1").style.display = "none";
    document.getElementById("categoria2").style.display = "none";
    document.getElementById("categoria3").style.display = "none";
    document.getElementById("categoria4").style.display = "none";
    document.getElementById("categoria5").style.display = "none";
    document.getElementById("categoria6").style.display = "none";
    document.getElementById("categoria7").style.display = "block";

    //cor das categorias
    document.getElementById("cat1").style.backgroundColor = "#ffd6a599";
    document.getElementById("cat2").style.backgroundColor = "#ffd6a599";
    document.getElementById("cat3").style.backgroundColor = "#cfe5b999";
    document.getElementById("cat4").style.backgroundColor = "#aadfed99";
    document.getElementById("cat5").style.backgroundColor = "#90a4d799";
    document.getElementById("cat6").style.backgroundColor = "#EDC8DF99";
    document.getElementById("cat7").style.backgroundColor = "#E89E9E";
  } else {
    document.getElementById("categoria7").style.display = "none";
    document.getElementById("cat7").style.backgroundColor = "#E89E9E99";
  }
});

/*
var closeS = document.getElementsByClassName("x");

function closeSubcategorias(x){
  var sub = document.getElementById("subcategorias");
  
  if(sub.style.display === "none"){
    sub.style.display = "block";
    cat1Sel =true;
  }else {
    sub.style.display = "none";
    cat1Sel = false;
  }
}

for (var i = 0; i < closeS.length; i++) {
  closeS[i].addEventListener("click", closeSubcategorias);
}*/

var closeS = document.getElementsByClassName("x");

function closeSubcategorias(x) {
  document.getElementById("categoria1").style.display = "none";
  document.getElementById("categoria2").style.display = "none";
  document.getElementById("categoria3").style.display = "none";
  document.getElementById("categoria4").style.display = "none";
  document.getElementById("categoria5").style.display = "none";
  document.getElementById("categoria6").style.display = "none";
  document.getElementById("categoria7").style.display = "none";
  //document.getElementById("cat1").style.backgroundColor = "#FFD6A599";
}

for (var i = 0; i < closeS.length; i++) {
  closeS[i].addEventListener("click", closeSubcategorias);
}

function setup() {
  //createCanvas(400, 400);
}

function draw() {
  background(220);
}
