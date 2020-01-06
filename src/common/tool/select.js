import Konva from 'konva'

let currentLayer
let currentStage
// 存储矩形一开始的左上角坐标
let lefTopPoi
let bgRect
function create(params) {
  const { stage } = params
  currentStage = stage
  stage.on('click tap', function ({ target }) {
    // stage 非目标
    if (target === stage) {
      stage.find('Transformer').destroy()
      bgRect && bgRect.destroy()
      currentLayer && currentLayer.draw()
      return
    }
    // 重复点击背景矩形
    if (target === bgRect) {
      return
    }

    currentLayer = target.getLayer()
    stage.find('Transformer').destroy()
    const tr = new Konva.Transformer({
      // centeredScaling: true,
      borderStrokeWidth: 2,
      anchorStrokeWidth: 2,
      // padding: 40,
      // enabledAnchors: ['bottom-right'],
    })
    const selfRect = target.getClientRect()
    bgRect = new Konva.Rect({
      ...selfRect,
      fill: 'red',
      opacity: 0.5,
    })
    lefTopPoi = bgRect.position()
    currentLayer.add(tr, bgRect)
    tr.attachTo(bgRect)
    currentLayer.draw()
    bgRect.draggable(true)
    // target.scaleX(1.5)
    currentLayer.draw()
    // 拖动矩形重新处理组件
    bgRect.on('transform', function ({ currentTarget }) {
      let {
        scaleX, scaleY, rotation = 0,
      } = currentTarget.attrs
      rotation *= (Math.PI / 180)
      // console.log(currentTarget.attrs)
      // 需要调整真正目标组件的位置，scale因子 会让起始点，结束点都发生变化。
      let dx = currentTarget.x() * scaleX - tr.padding() - target.offsetX() * scaleX
      let dy = currentTarget.y() * scaleY - tr.padding() - target.offsetX() * scaleY
      target.setAttrs({
        x: currentTarget.x() - (dx * Math.cos(rotation) + dy * Math.sin(-rotation)),
        y: currentTarget.y() - (dy * Math.cos(rotation) + dx * Math.sin(rotation)),
        scaleX,
        scaleY,
        rotation,
      })
      currentLayer.draw()
    })
    bgRect.on('dragmove', function () {
      target.x(bgRect.x() - lefTopPoi.x)
      target.y(bgRect.y() - lefTopPoi.y)
      currentLayer.draw()
    })
  })
}

function destroy() {
  const stage = currentStage
  stage.find('Transformer').destroy()
  bgRect && bgRect.destroy()
  currentLayer.draw()
  bgRect = null
  stage.off('click tap')
}

export default {
  create,
  destroy,
}
