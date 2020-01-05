import Konva from 'konva'
import { getPoiWithOffset } from '@common/utils'

/**
 * 1. 了解 x,y stage.x  stage.y  特殊 shape.x()  shape.y() 相对于原本文档位置的偏移。类似relative,
 *    常规shape 圆形，矩形等是相对于canvas左上角坐标， shape自己拖动会修改shape.x，shape.y  stage，layer 同理改变自己
 * 2. 点击stage.pointerPosition() 是相对于canvas左上角（不考虑stage transform）
 * 3. 理解getClientRect transform 包含了 (position, rotation, scale, offset, etc)
*/

let currentLayer
let currentStage
// 存储矩形一开始的左上角坐标
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
    console.log(target)
    currentLayer = target.getLayer()
    stage.find('Transformer').destroy()
    const tr = new Konva.Transformer({
      // centeredScaling: true,
      borderStrokeWidth: 2,
      anchorStrokeWidth: 2,
      // padding: 40,
      // enabledAnchors: ['bottom-right'],
    })
    let rect = target.getClientRect()
    let newPoi = getPoiWithOffset({ x: rect.x, y: rect.y }, stage)
    bgRect = new Konva.Rect({
      x: newPoi.x,
      y: newPoi.y,
      width: rect.width,
      height: rect.height,
      fill: 'red',
      opacity: 0.5,
    })
    console.log(rect)
    currentLayer.add(tr, bgRect)
    tr.attachTo(target)
    bgRect.draggable(true)
    currentLayer.draw()
    // 缩放监听处理
    target.on('transform', function () {
      // 获取线的rect 数据
      rect = target.getClientRect()
      console.log(rect)
      console.log(target.getAttrs())
      newPoi = getPoiWithOffset(rect)
      const { width, height } = rect
      bgRect.setAttrs({
        ...newPoi,
        width,
        height,
      })
      currentLayer.draw()
    })
    bgRect.on('dragmove', function () {
      // 如何确定线的偏移位置，尤其是线缩放了之后。x,y 中途就变化了
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
