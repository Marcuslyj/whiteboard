import konva from "konva";

//覆盖了bezier 的实现方式,提高了马克笔的柔顺度
konva.Line.prototype._sceneFunc = function(context) {
  var points = this.points(),
    length = points.length,
    tension = this.tension(),
    closed = this.closed(),
    bezier = this.bezier(),
    tp,
    len,
    n;

  if (!length) {
    return;
  }

  context.beginPath();
  context.moveTo(points[0], points[1]);

  // tension
  if (tension !== 0 && length > 4) {
    tp = this.getTensionPoints();
    len = tp.length;
    n = closed ? 0 : 4;

    if (!closed) {
      context.quadraticCurveTo(tp[0], tp[1], tp[2], tp[3]);
    }

    while (n < len - 2) {
      context.bezierCurveTo(
        tp[n++],
        tp[n++],
        tp[n++],
        tp[n++],
        tp[n++],
        tp[n++]
      );
    }

    if (!closed) {
      context.quadraticCurveTo(
        tp[len - 2],
        tp[len - 1],
        points[length - 2],
        points[length - 1]
      );
    }
  } else if (bezier) {
    let i = 0;
    let arr = [];
    while (i < points.length) {
      arr.push({
        x: points[i],
        y: points[++i]
      });
      i++;
    }
    if (points.length >= 3) {
      let end;
      context.beginPath();
      for (let i = 1; i < arr.length - 1; i++) {
        end ? context.moveTo(end.x, end.y) : context.moveTo(arr[0].x, arr[0].y);
        end = {
          x: (arr[i].x + arr[i + 1].x) / 2,
          y: (arr[i].y + arr[i + 1].y) / 2
        };
        const c = arr[i];
        context.quadraticCurveTo(c.x, c.y, end.x, end.y);
      }
    }
  } else {
    // no tension
    for (n = 2; n < length; n += 2) {
      context.lineTo(points[n], points[n + 1]);
    }
  }

  // closed e.g. polygons and blobs
  if (closed) {
    context.closePath();
    context.fillStrokeShape(this);
  } else {
    // open e.g. lines and splines
    context.strokeShape(this);
  }
};
