'use strict'

class ControlsHandler {
  constructor(body, canvas) {
    this.body = body;
    this.canvas = canvas;
  }

  checkButtonClick(pointer) {
    let canvasPos = this.canvas.DOMtoCanvas(pointer);
    let nodes = this.body.nodes;
    let clicks = [];
    Object.keys(nodes).filter(function (key) {
      return key.substr(0, 7) !== 'edgeId:';
    }).forEach(function (key) {
      let btn = nodes[key].controlsModule.checkButton(canvasPos.x, canvasPos.y, nodes[key]);
      if (btn) {
        clicks.push({ node: key, button: btn });
      }
    });
    clicks.forEach((click) => {
      this.body.emitter.emit('control', click);
    });
    return clicks.length > 0;
  }
}

export default ControlsHandler;
