import Konva from "konva";

let lines = {}
let timer = null

//覆盖了bezier 的实现方式,提高了马克笔的柔顺度
Konva.Line.prototype._sceneFunc = function (context) {
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
    let index = 0;
    if (lines['' + this._id]) {
      index = lines[this._id];
    } else {
      lines = {}
    }
    let _points = [];
    for (let i = 0; i < points.length; i += 2) {
      // 去掉太紧密的点，但不能去掉最始最末的点，否则不跟手
      if (i >= index - 2 && i < points.length - 6 && i > 6) {
        let dis = Math.sqrt(Math.pow(points[i] - points[i + 2], 2) + Math.pow(points[i + 1] - points[i + 3], 2));
        if (dis < 6) points.splice(i + 2, 2);

        lines[this._id] = i;
      }
      _points.push({
        x: points[i],
        y: points[i + 1]
      });
    }
    if (_points.length > 3) {
      let end;
      // context.beginPath();
      for (let i = 1; i < _points.length - 1; i++) {
        end ? context.moveTo(end.x, end.y) : context.moveTo(points[0].x, points[0].y);
        end = {
          x: (_points[i].x + _points[i + 1].x) / 2,
          y: (_points[i].y + _points[i + 1].y) / 2
        };
        const c = _points[i];
        context.quadraticCurveTo(c.x, c.y, end.x, end.y);
      }
    }

    // 清缓存，防止影响下一次
    clearTimeout(timer);
    timer = setTimeout(() => {
      lines = {}
    }, 500)
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
