import Konva from 'konva'

let lines = {}
let timer = null

// 覆盖了bezier 的实现方式,提高了马克笔的柔顺度
Konva.Line.prototype._sceneFunc = function (context) {
  const points = this.points()
  const { length } = points
  const tension = this.tension()
  const closed = this.closed()
  const bezier = this.bezier()
  let tp
  let len
  let n

  if (!length) {
    return
  }

  context.beginPath()
  context.moveTo(points[0], points[1])

  // tension
  if (tension !== 0 && length > 4) {
    tp = this.getTensionPoints()
    len = tp.length
    n = closed ? 0 : 4

    if (!closed) {
      context.quadraticCurveTo(tp[0], tp[1], tp[2], tp[3])
    }

    while (n < len - 2) {
      context.bezierCurveTo(
        tp[n++],
        tp[n++],
        tp[n++],
        tp[n++],
        tp[n++],
        tp[n++],
      )
    }

    if (!closed) {
      context.quadraticCurveTo(
        tp[len - 2],
        tp[len - 1],
        points[length - 2],
        points[length - 1],
      )
    }
  } else if (bezier) {
    let index = 0
    if (lines[`${this._id}`]) {
      index = lines[this._id]
    } else {
      lines = {}
    }
    const _points = []
    for (let i = 0; i < points.length; i += 2) {
      // 去掉太紧密的点，但不能去掉最始最末的点，否则不跟手
      if (i >= index - 2 && i < points.length - 6 && i > 6) {
        const dis = Math.sqrt(Math.pow(points[i] - points[i + 2], 2) + Math.pow(points[i + 1] - points[i + 3], 2))
        if (dis < 6) points.splice(i + 2, 2)

        lines[this._id] = i
      }
      _points.push({
        x: points[i],
        y: points[i + 1],
      })
    }
    if (_points.length > 3) {
      let end
      // context.beginPath();
      for (let i = 1; i < _points.length - 1; i++) {
        end ? context.moveTo(end.x, end.y) : context.moveTo(points[0].x, points[0].y)
        end = {
          x: (_points[i].x + _points[i + 1].x) / 2,
          y: (_points[i].y + _points[i + 1].y) / 2,
        }
        const c = _points[i]
        context.quadraticCurveTo(c.x, c.y, end.x, end.y)
      }
    }

    // 清缓存，防止影响下一次
    clearTimeout(timer)
    timer = setTimeout(() => {
      lines = {}
    }, 500)
  } else {
    // no tension
    for (n = 2; n < length; n += 2) {
      context.lineTo(points[n], points[n + 1])
    }
  }

  // closed e.g. polygons and blobs
  if (closed) {
    context.closePath()
    context.fillStrokeShape(this)
  } else {
    // open e.g. lines and splines
    context.strokeShape(this)
  }
}

// 区域拖动组件
TransformerExtend()
function TransformerExtend() {
  let EVENTS_NAME = 'tr-konva'
  let TRANSFORM_CHANGE_STR = [
    'widthChange',
    'heightChange',
    'scaleXChange',
    'scaleYChange',
    'skewXChange',
    'skewYChange',
    'rotationChange',
    'offsetXChange',
    'offsetYChange',
    'transformsEnabledChange',
    'strokeWidthChange',
  ]
  // 转换一下
  let $TRANSFORM_CHANGE_STR = TRANSFORM_CHANGE_STR.map((v) => `${v}.${EVENTS_NAME}`).join(' ')

  Konva.Transformer.prototype.setNode = function (node) {
    let _this = this
    if (this._node) {
      this.detach()
    }
    this._node = node
    this._resetTransformCache()
    let additionalEvents = node._attrsAffectingSize
      .map(function (prop) { return `${prop}Change.${EVENTS_NAME}` })
      .join(' ')
    let onChange = function () {
      // 标记拦截
      if (_this._node.passiveMove) return
      _this._resetTransformCache()
      if (!_this._transforming) {
        _this.update()
      }
    }
    node.on(additionalEvents, onChange)
    node.on($TRANSFORM_CHANGE_STR, onChange)
    // 标记拦截
    node.on(`xChange.${EVENTS_NAME} yChange.${EVENTS_NAME}`, function () {
      if (_this._node.passiveMove) return
      return _this._resetTransformCache()
    })
    let elementsCreated = !!this.findOne('.top-left')
    if (elementsCreated) {
      this.update()
    }
    return this
  }

  let { _createBack } = Konva.Transformer.prototype
  Konva.Transformer.prototype._createBack = function () {
    // 原型拦截
    _createBack.call(this)
    let back = this.findOne('.back')
    // 可拖动
    back.setAttrs({
      listening: true,
      draggable: true,
    })

    // drag事件
    // 这里--
    // 取矩形的position变化，保证同步
    let _this = this
    let { x: lastX, y: lastY } = back.getPosition()
    let nowX
    let nowY
    let nowPosition
    back.on('dragmove', function () {
      nowPosition = back.getPosition()
      nowX = nowPosition.x
      nowY = nowPosition.y
      let deltaX = nowX - lastX
      let deltaY = nowY - lastY
      lastX = nowX
      lastY = nowY

      // anchors的旋转角度一直为零，因为旋转的是Transformer
      // 旋转元素需要自己计算角度旋转后的坐标
      let m = { x: deltaX, y: deltaY }
      // let cos = Math.cos(Global_1.Konva.getAngle(_this._node.rotation()))
      // let sin = Math.sin(Global_1.Konva.getAngle(_this._node.rotation()))
      let cos = Math.cos(Konva.getAngle(_this._node.rotation()))
      let sin = Math.sin(Konva.getAngle(_this._node.rotation()))
      let m2 = { x: deltaX * cos - deltaY * sin, y: deltaY * cos + deltaX * sin }
      _this._node.move(m2)

      _this.findOne('.top-left').move(m)
      _this.findOne('.top-right').move(m)
      _this.findOne('.bottom-right').move(m)
      _this.findOne('.bottom-left').move(m)
      _this.findOne('.rotater').move(m)
    })

    back.on('dragstart', function () {
      // console.log('start')
      // 加标记
      _this._node.passiveMove = true
    })
    back.on('dragend', function () {
      // console.log('end')
      _this._node.passiveMove = false
      // 触发dragmoveend时间，让transformer重新创建实例，否则后续旋转缩放有问题
      _this._fire('dragmoveend')
    })
  }
}
