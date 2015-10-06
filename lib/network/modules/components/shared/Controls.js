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
    this.width = Math.max(this.options.size * 2, this._btnSize() * 3);
    this.height = this._btnSize();
    this.left = x - this.width/2;
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
    let r = (x - this.left), bs = this._btnSize();  // quick & dirty
    return r <= bs ? 'remove' : (this.width - bs) <= r ? 'pin' : false;
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
   
    var buttonRelativeX = Math.round((this.options.size + btnSize/2) * Math.sin(Math.PI / 180 * 30));
    var buttonRelativeY = -Math.round((this.options.size + btnSize/2) * Math.cos(Math.PI / 180 * 30));

    if (buttonRelativeX < btnSize/2) {
        var alfa = Math.asin((btnSize/2)/(btnSize/2+this.options.size));
        buttonRelativeX = Math.round((this.options.size + btnSize/2) * Math.sin(alfa));
        buttonRelativeY = -Math.round((this.options.size + btnSize/2) * Math.cos(alfa));
    }

    ctx.translate(buttonRelativeX, buttonRelativeY);


    ctx.fillStyle = '#3F51B5';
    ctx.beginPath();
    ctx.arc(0, 0, btnSize/2, 0, 2*Math.PI);
    ctx.fill();

    if (!this.options.pinned) {
      ctx.rotate(Math.PI/6);
    }

    ctx.scale(1/this.body.view.scale, 1/this.body.view.scale);

    ctx.fillStyle = '#BBB';
    ctx.font = '10pt FontAwesome';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\uF08D', 0, 0);

    ctx.restore();
  }

  _drawRemoveBtn(ctx, x, y) {
    let btnSize = this._btnSize();

    ctx.save();
    ctx.translate(x, y);

    var buttonRelativeX = -Math.round((this.options.size + btnSize/2) * Math.sin(Math.PI / 180 * 30));
    var buttonRelativeY = -Math.round((this.options.size + btnSize/2) * Math.cos(Math.PI / 180 * 30));

    if (buttonRelativeX > -btnSize/2) {
        var alfa = Math.asin((btnSize/2)/(btnSize/2+this.options.size));
        buttonRelativeX = -Math.round((this.options.size + btnSize/2) * Math.sin(alfa));
        buttonRelativeY = -Math.round((this.options.size + btnSize/2) * Math.cos(alfa));
    }

    ctx.translate(buttonRelativeX, buttonRelativeY);

    ctx.fillStyle = '#C62828';
    ctx.beginPath();
    ctx.arc(0, 0, btnSize/2, 0, 2*Math.PI);
    ctx.fill();

    ctx.scale(1/this.body.view.scale, 1/this.body.view.scale);

    ctx.fillStyle = '#FFF';
    ctx.font = '10pt FontAwesome';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\uF00D', 0, 0);

    ctx.restore();
  }

  /* Normalize button size on scaled canvas */
  _btnSize(minSize=20, maxSize=30) {
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
