import NodeBase from '../util/NodeBase'

class ShapeBase extends NodeBase {
  constructor(options, body, labelModule, controlsModule) {
    super(options, body, labelModule, controlsModule);
  }

  _resizeShape() {
    if (this.width === undefined) {
      var size = 2 * this.options.size;
      this.width = size;
      this.height = size;
      this.radius = 0.5*this.width;
    }
  }

  _drawShape(ctx, shape, sizeMultiplier, x, y, selected, hover) {
    this._resizeShape();

    this.left = x - this.width / 2;
    this.top = y - this.height / 2;

    var borderWidth = this.options.borderWidth;
    var selectionLineWidth = this.options.borderWidthSelected || 2 * this.options.borderWidth;

    ctx.strokeStyle = selected ? this.options.color.highlight.border : hover ? this.options.color.hover.border : this.options.color.border;
    ctx.lineWidth = (selected ? selectionLineWidth : borderWidth);
    ctx.lineWidth /= this.body.view.scale;
    ctx.lineWidth = Math.min(this.width, ctx.lineWidth);
    ctx.fillStyle = selected ? this.options.color.highlight.background : hover ? this.options.color.hover.background : this.options.color.background;
    ctx[shape](x, y, this.options.size);

    // draw shadow if enabled
    this.enableShadow(ctx);
    // draw the background
    ctx.fill();
    // disable shadows for other elements.
    this.disableShadow(ctx);

    //draw dashed border if enabled, save and restore is required for firefox not to crash on unix.
    ctx.save();
    
    this.enableBorderDashes(ctx);
    
    //draw the border
    ctx.stroke();

    //**
    //* XORS, draw border
    //*
    
    if (selected) {
        var initial_angle = 0;
        ctx.strokeStyle = '#F7941E';
        ctx.beginPath();
        ctx.arc(x, y, this.radius, initial_angle, Math.PI / 4 + initial_angle);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, this.radius, Math.PI / 2 + initial_angle, Math.PI * 3 / 4 + initial_angle);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, this.radius, Math.PI + initial_angle, Math.PI * 5 / 4 + initial_angle);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, this.radius, Math.PI * 3 / 2 + initial_angle, Math.PI * 7 / 4 + initial_angle);
        ctx.stroke();
    }

    //disable dashed border for other elements
    this.disableBorderDashes(ctx);
    ctx.restore();

    if (this.options.label !== undefined) {
      let yLabel = y + 0.5 * this.height + 14; // the + 14 is to offset it a bit below the node.
      this.labelModule.draw(ctx, x, yLabel, selected, 'top');
    }

    if (this.options.controls) {
      hover ? this.controlsModule.draw(ctx, x, y)
        : this.controlsModule.clear();
    }

    this.updateBoundingBox(x,y);
  }

  updateBoundingBox(x,y) {
    this.boundingBox.top = y - this.options.size;
    this.boundingBox.left = x - this.options.size;
    this.boundingBox.right = x + this.options.size;
    this.boundingBox.bottom = y + this.options.size;

    if (this.options.label !== undefined && this.labelModule.size.width > 0) {
      this.boundingBox.left = Math.min(this.boundingBox.left, this.labelModule.size.left);
      this.boundingBox.right = Math.max(this.boundingBox.right, this.labelModule.size.left + this.labelModule.size.width);
      this.boundingBox.bottom = Math.max(this.boundingBox.bottom, this.boundingBox.bottom + this.labelModule.size.height + 3);
    }
  }



}

export default ShapeBase;
