'use strict';

class Controls {
  constructor(body, options) {
    this.body = body;
    this.options = options;

    this.left = null;
    this.top = null;
    this.width = null;
    this.height = null;
  }

  _updateBoundingBox(x, y) {
    if (this.width == null) {
      this.width = this.options.size * 2;
      this.height = this.options.size; // height is doubled actually
    }
    this.left = x - this.options.size;
    this.top = y - this.options.size * 3/2;
  }

  checkButton(x, y) {
    if (this.left == null || this.top == null) {
      return false;
    }
    if (x < this.left || this.left + this.width < x) {
      return false;
    }
    if (y < this.top || this.top + this.height / 2 < y) {
      return false;
    }
    // quick & dirty
    let r = (x - this.left) / this.width;
    return r < 0.3 ? 'close' : r > 0.7 ? 'pin' : false;
  }

  draw(ctx, x, y) {
    this._updateBoundingBox(x, y);
    this._drawPinBtn(ctx, x, y);
    this._drawRemoveBtn(ctx, x, y);
    // ctx.strokeRect(this.left, this.top, this.width, this.height);
  }

  _drawPinBtn(ctx, x, y) {
    let btnSize = (this.options.size / 4), gap = (btnSize / 3);

    ctx.save();
    ctx.translate(x, y);
    ctx.translate(0.5 * (this.options.size + btnSize + gap),
      -0.86 * (this.options.size + btnSize + gap));

    ctx.fillStyle = '#3F51B5';
    ctx.beginPath();
    ctx.arc(0, 0, btnSize, 0, 2*Math.PI);
    ctx.fill();

    if (this.options.fixed === false ||
        this.options.fixed.x === false ||
        this.options.fixed.y === false) {
      ctx.rotate(Math.PI/6);
    }

    ctx.fillStyle = '#BBB';
    ctx.font = '' + btnSize + 'px FontAwesome';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\uF08D', 0, 0);

    ctx.restore();
  }

  _drawRemoveBtn(ctx, x, y) {
    let btnSize = (this.options.size / 4), gap = (btnSize / 3);

    ctx.save();
    ctx.translate(x, y);
    ctx.translate(-0.5 * (this.options.size + btnSize + gap),
      -0.86 * (this.options.size + btnSize + gap));

    ctx.fillStyle = '#C62828';
    ctx.beginPath();
    ctx.arc(0, 0, btnSize, 0, 2*Math.PI);
    ctx.fill();

    ctx.fillStyle = '#FFF';
    ctx.font = '' + btnSize + 'px FontAwesome';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\uF00D', 0, 0);

    ctx.restore();
  }

  clear() {
    this.top = this.left = null;
  }

  isOverlappingWith(obj) {
    return (
      this.left < obj.right &&
      this.left + this.width > obj.left &&
      this.top < obj.bottom &&
      this.top + this.height > obj.top
    );
  }
}

export default Controls;
