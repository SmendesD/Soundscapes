class PSom {
  constructor(lat, lng, x, y, w, h, som) {
    this.lat = lat;
    this.lng = lng;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.som = som;
    //this.rollover = false; // Is the mouse over the ellipse?
  }

 

  //ellipse para cada som
  show() {
    stroke(0);
    strokeWeight(2);
    fill(255);
    ellipse(this.x, this.y - this.h / 2, 20, 20);
   text(this.som, this.x + 5, this.y + 2);
    
  }

  //atualizar ponto sempre que o mapa muda de posição
  updatePos(_x, _y, _zoom) {
    let zoomExpWidth = map(_zoom, 0, 22, 0, 6);
    let zoomExpHeight = map(_zoom, 0, 22, 0, 6);
    this.x = _x;
    this.y = _y;
    this.w = exp(zoomExpWidth);
    this.h = exp(zoomExpHeight);
  }

  // mostrar popups
 /* popup(px, py) {
    let d = dist(px, py, this.x, this.y);
    if (d < this.w) {
      //this.y = this.y-10;

      noStroke();
      textSize(20);
      fill(255);
      text(this.title, this.x + 5, this.y + 2);
    }
  }*/

  //atualizar popup sempre que o mapa muda de posição
  updatePopup(_x, _y, _zoom) {
    let zoomExpWidth = map(_zoom, 0, 22, 0, 6);
    let zoomExpHeight = map(_zoom, 0, 22, 0, 6);
    this.x = _x;
    this.y = _y;
    this.w = exp(zoomExpWidth);
    this.h = exp(zoomExpHeight);
  }
}
