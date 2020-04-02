import Konva from 'konva'
import Vue from 'vue'
import { generateUID, getPoiWithOffset } from '@common/utils'
import cManager from '@common/componentManager'
import { setCustomCursor, cancelCustomCursor } from './customCursor'

let currentStage
function create(params) {
  const { stage, layer } = params
  currentStage = stage
  let line
  // 标记正在画线
  let isDrawing = false
  stage.on('mousedown touchstart', () => {
    isDrawing = true
    const poi = getPoiWithOffset(stage.getPointerPosition(), stage)
    const toolConfig = Vue.prototype.$globalConf.pencil
    const lineConfig = {
      id: generateUID(),
      stroke: toolConfig.color,
      strokeWidth: toolConfig.lineWidth,
      lineJoin: 'round',
      lineCap: 'round',
      globalCompositeOperation: 'source-over',
      points: [poi.x, poi.y],
      opacity: 0.5,
      bezier: true,
    }
    line = new Konva.Line(lineConfig)
    layer.add(line)
  })
  stage.on('mousemove touchmove', () => {
    if (!isDrawing) {
      return
    }
    const poi = getPoiWithOffset(stage.getPointerPosition(), stage)
    line.points(line.points().concat(poi.x, poi.y))
    layer.batchDraw()
  })
  // 清除事件
  stage.on('mouseup touchend', () => {
    if (isDrawing) {
      isDrawing = false
      if (line.points().length === 2) {
        const toolConfig = Vue.prototype.$globalConf.pencil
        line = new Konva.Circle({
          id: generateUID(),
          fill: toolConfig.color,
          x: line.points()[0],
          y: line.points()[1],
          radius: toolConfig.lineWidth / 2,
          opacity: 0.5,
        })
        layer.add(line)
        layer.draw()
      }
      // 性能优化
      line.cache()
      cManager.addComponent(JSON.parse(line.toJSON()))
      line = null
    }
  })
  setCustomCursor(stage, 'markPencil')
}

function destroy() {
  if (!currentStage) return
  currentStage.off('mousedown touchstart mousemove touchmove mouseup touchend')
  cancelCustomCursor(currentStage)
}

export default {
  create,
  destroy,
}
