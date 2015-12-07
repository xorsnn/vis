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

  checkButton(x, y, node) {
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

    var me = this;
    //XORS
    //check pin		    
    function checkPin() {
      var buttonRelativeX = Math.round((me.options.size + bs/2) * Math.sin(Math.PI / 180 * 30));
      var buttonRelativeY = -Math.round((me.options.size + bs/2) * Math.cos(Math.PI / 180 * 30));

      if (buttonRelativeX < bs/2) {
        var alfa = Math.asin((bs/2)/(bs/2+me.options.size));
        buttonRelativeX = Math.round((me.options.size + bs/2) * Math.sin(alfa));
        buttonRelativeY = -Math.round((me.options.size + bs/2) * Math.cos(alfa));
      }

      buttonRelativeX += node.x;
      buttonRelativeY += node.y;

      if ((Math.pow(buttonRelativeX-x, 2) + Math.pow(buttonRelativeY-y, 2)) < Math.pow(bs/2, 2)) {
        return true;
      } else {
        return false;
      }
    }

    //check delete
    function checkDel() {
      var buttonRelativeX = -Math.round((me.options.size + bs/2) * Math.sin(Math.PI / 180 * 30));
      var buttonRelativeY = -Math.round((me.options.size + bs/2) * Math.cos(Math.PI / 180 * 30));

      if (buttonRelativeX > -bs/2) {
        var alfa = Math.asin((bs/2)/(bs/2+me.options.size));
        buttonRelativeX = -Math.round((me.options.size + bs/2) * Math.sin(alfa));
        buttonRelativeY = -Math.round((me.options.size + bs/2) * Math.cos(alfa));
      }

      buttonRelativeX += node.x;
      buttonRelativeY += node.y;

      if ((Math.pow(buttonRelativeX-x, 2) + Math.pow(buttonRelativeY-y, 2)) < Math.pow(bs/2, 2)) {
        return true;
      } else {
        return false;
      }
    }

    if (checkDel()) {
      return 'remove';
    } else if (checkPin()) {
      return 'pin';
    } else {
      return false;
    }

    //return r <= bs ? 'remove' : (this.width - bs) <= r ? 'pin' : false;
  }

  draw(ctx, x, y) {
    this._updateBoundingBox(x, y);
    this._drawPinBtn(ctx, x, y);
    this._drawRemoveBtn(ctx, x, y);
    // ctx.strokeRect(this.left, this.top, this.width, this.height);
  }

  //
  // chainalysis, pin&del
  //

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

    ctx.rotate(Math.PI);
    ctx.fillStyle = '#BBB';
    if (!this.options.controls.pinned) {
      ctx.rotate(Math.PI / 6);
      ctx.fillStyle = '#FFF';
    }

    var iconOffset = 5.0/this.body.view.scale
    var iconScale = (7*(16/12)/1152) / this.body.view.scale;

    ctx.translate(-btnSize/2+iconOffset,-btnSize/2+iconOffset);
    ctx.scale(iconScale, iconScale);
    
    var img = document.getElementById("csClusterPinIcon");
    ctx.drawImage(img, 0, 0);

    //var path = new Path2D('M480 672v448q0 14 -9 23t-23 9t-23 -9t-9 -23v-448q0 -14 9 -23t23 -9t23 9t9 23zM1152 320q0 -26 -19 -45t-45 -19h-429l-51 -483q-2 -12 -10.5 -20.5t-20.5 -8.5h-1q-27 0 -32 27l-76 485h-404q-26 0 -45 19t-19 45q0 123 78.5 221.5t177.5 98.5v512q-52 0 -90 38 t-38 90t38 90t90 38h640q52 0 90 -38t38 -90t-38 -90t-90 -38v-512q99 0 177.5 -98.5t78.5 -221.5z');

    //ctx.fill(path);

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

    ctx.fillStyle = '#FFF';

    var iconOffset = 4.5/this.body.view.scale;
    var iconScale = (7*(16/12)/1152) / this.body.view.scale;

    ctx.translate(-btnSize/2+iconOffset,-btnSize/2+iconOffset);
    ctx.scale(iconScale, iconScale);
    
    var img = document.getElementById("csClusterRemoveIcon");
    ctx.drawImage(img, 0, 0);
    //var path = new Path2D("M1298 214q0 -40 -28 -68l-136 -136q-28 -28 -68 -28t-68 28l-294 294l-294 -294q-28 -28 -68 -28t-68 28l-136 136q-28 28 -28 68t28 68l294 294l-294 294q-28 28 -28 68t28 68l136 136q28 28 68 28t68 -28l294 -294l294 294q28 28 68 28t68 -28l136 -136q28 -28 28 -68 t-28 -68l-294 -294l294 -294q28 -28 28 -68z");
    
    //ctx.fill(path);

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
