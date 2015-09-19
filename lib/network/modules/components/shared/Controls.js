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
    this.width = this.options.size * 2;
    this.height = this._btnSize();
    this.left = x - this.options.size;
    this.top = y - this.options.size - this.height;
  }

  checkButton(x, y) {
    if (this.left == null || this.top == null) {
      return false;
    }
    if (x < this.left || this.left + this.width < x) {
      return false;
    }
    if (y < this.top || this.top + this.height < y) {
      return false;
    }
    // quick & dirty
    let r = (x - this.left) / this.width;
    let bs = this._btnSize() / this.width;
    return r <= bs ? 'remove' : (1-bs) <= r ? 'pin' : false;
  }

  draw(ctx, x, y) {
    this._updateBoundingBox(x, y);
    this._drawPinBtn(ctx, x, y);
    this._drawRemoveBtn(ctx, x, y);
    // ctx.strokeRect(this.left, this.top, this.width, this.height);
  }

  _drawPinBtn(ctx, x, y) {
    let btnSize = this._btnSize();

    ctx.save();
    ctx.translate(x, y);
    ctx.translate(this.options.size, -this.options.size);

    ctx.translate(-btnSize, -btnSize);

    ctx.translate(btnSize/2, btnSize/2);

    ctx.fillStyle = '#3F51B5';
    ctx.beginPath();
    ctx.arc(0, 0, btnSize/2, 0, 2*Math.PI);
    ctx.fill();

    if (this.options.fixed === false ||
        this.options.fixed.x === false ||
        this.options.fixed.y === false) {
      ctx.rotate(Math.PI/6);
    }

    ctx.fillStyle = '#BBB';
    ctx.font = '3px FontAwesome';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\uF08D', 0, 0);

    ctx.restore();
  }

  _drawRemoveBtn(ctx, x, y) {
    let btnSize = this._btnSize();

    ctx.save();
    ctx.translate(x, y);
    ctx.translate(-this.options.size, -this.options.size);

    ctx.translate(0, -btnSize);

    ctx.translate(btnSize/2, btnSize/2);

    ctx.fillStyle = '#C62828';
    ctx.beginPath();
    ctx.arc(0, 0, btnSize/2, 0, 2*Math.PI);
    ctx.fill();

    ctx.fillStyle = '#FFF';
    ctx.font = '3px FontAwesome';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\uF00D', 0, 0);

    ctx.restore();
  }

  /* Normalize button size on scaled canvas */
  _btnSize(minSize=20, maxSize=35) {
    let k = this.body.view.scale, baseSize = 5;
    return Math.min(Math.max(k*baseSize, minSize), maxSize) / k;
  }

  clear() {
    // this.top = this.left = null;
  }

  isOverlappingWith(obj) {
    let p = obj.left - this.left, q = obj.top - this.top;
    return !(p < 0 || this.width < p || q < 0 || this.height*1.2 < q);
  }
}

export default Controls;
