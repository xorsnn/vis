
module.exports = {
  getToolbuttonParams: function (node, btnName) {
    var res = {};
    if (btnName == 'close_button') {
      var closeButtonRadius = Math.round(10 / node.networkScale);
      var closeButtonRelativeX = Math.round((node.options.radius + closeButtonRadius) * Math.sin(Math.PI / 180 * 30));
      var closeButtonRelativeY = Math.round((node.options.radius + closeButtonRadius) * Math.cos(Math.PI / 180 * 30));
      if (closeButtonRadius > closeButtonRelativeX) {
        closeButtonRelativeX = closeButtonRadius;
        closeButtonRelativeY = Math.round(Math.sqrt(1 - Math.pow(closeButtonRelativeX / (closeButtonRadius + node.options.radius), 2)) * (closeButtonRadius + node.options.radius));
      }
      var closeButtonX = Math.round(node.x - closeButtonRelativeX);
      var closeButtonY = Math.round(node.y - closeButtonRelativeY);
      res = {
        radius: closeButtonRadius,
        x: closeButtonX,
        y: closeButtonY
      };
    }
    else if (btnName == 'pin_button') {
      var pinButtonRadius = Math.round(10 / node.networkScale);
      var pinButtonRelativeX = Math.round((node.options.radius + pinButtonRadius) * Math.sin(Math.PI / 180 * 30));
      var pinButtonRelativeY = Math.round((node.options.radius + pinButtonRadius) * Math.cos(Math.PI / 180 * 30));
      if (pinButtonRadius > pinButtonRelativeX) {
        pinButtonRelativeX = pinButtonRadius;
        pinButtonRelativeY = Math.round(Math.sqrt(1 - Math.pow(pinButtonRelativeX / (pinButtonRadius + node.options.radius), 2)) * (pinButtonRadius + node.options.radius));
      }
      var pinButtonX = Math.round(node.x + pinButtonRelativeX);
      var pinButtonY = Math.round(node.y - pinButtonRelativeY);
      res = {
        radius: pinButtonRadius,
        x: pinButtonX,
        y: pinButtonY
      };
    }
    return res;
  }
};
