'use strict';

import ShapeBase from '../util/ShapeBase'

class Dot extends ShapeBase {
  constructor(options, body, labelModule, controlsModule) {
    super(options, body, labelModule, controlsModule);
  }

  resize(ctx) {
    this._resizeShape();
  }

  draw(ctx, x, y, selected, hover) {
    this._drawShape(ctx, 'circle', 2, x, y, selected, hover);
  }

  distanceToBorder(ctx, angle) {
    return this.options.size + this.options.borderWidth;
  }
}

export default Dot;