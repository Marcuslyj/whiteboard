import Konva from 'konva'
import { getPoiWithOffset } from '@common/utils'

/**
 * 1. 了解 x,y stage.x  stage.y  特殊 shape.x()  shape.y() 相对于原本文档位置的偏移。类似relative,
 *    常规shape 圆形，矩形等是相对于canvas左上角坐标， shape自己拖动会修改shape.x，shape.y  stage，layer 同理改变自己
 * 2. 点击stage.pointerPosition() 是相对于canvas左上角（不考虑stage transform）
 * 3. 理解getClientRect transform 包含了 (position, rotation, scale, offset, etc) 旋转时获取的值不对，放弃此种做法
 * 4. getSelfRect width，height,x,y 不会随着scale 缩放
*/

let currentLayer
let currentStage
// 拖动时存储上个矩形的位置
let lastbgRectPoi
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

    bgRect = new Konva.Rect({
      fill: 'red',
      opacity: 0.5,
      scale: target.scale(),
      rotation: target.rotation(),
    })
    updateBgRect()
    currentLayer.add(tr, bgRect)
    tr.attachTo(target)
    bgRect.draggable(true)
    currentLayer.draw()

    // 图形缩放监听处理
    target.on('transform', function () {
      updateBgRect()
      currentLayer.draw()
    })

    function updateBgRect() {
      // rect 是transfrome 之前的数据
      let rect = target.getSelfRect()
      const width = rect.width * target.scaleX()
      const height = rect.height * target.scaleY()
      const { x, y } = target.position()
      console.log(`${target.x()}  ${target.y()}`)
      // 注意：线的到时的计算方式可能跟常规图形的 x,y 存在不同
      bgRect.setAttrs({
        x: rect.x,
        y: rect.y,
        width,
        height,
        rotation: target.rotation(),
      })
    }
    bgRect.on('dragstart', function () {
      lastbgRectPoi = bgRect.position()
    })
    // 矩形拖动时更新线的位置
    bgRect.on('dragmove', function () {
      // 如何确定线的偏移位置，尤其是线缩放了之后。x,y 中途就变化了
      // 每次在上一次的x,y 基础上重新计算拖动偏差
      const dx = bgRect.x() - lastbgRectPoi.x
      const dy = bgRect.y() - lastbgRectPoi.y
      target.setAttrs(
        {
          x: target.x() + dx,
          y: target.y() + dy,
        },
      )
      lastbgRectPoi = bgRect.position()
      currentLayer.draw()
    })
  })
}

function destroy() {
  const stage = currentStage
  stage.find('Transformer').destroy()
  bgRect && bgRect.destroy()
  currentLayer && currentLayer.draw()
  stage.off('click tap')
}

export default {
  create,
  destroy,
}
