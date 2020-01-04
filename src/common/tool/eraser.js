import Konva from 'konva'
import Vue from 'vue'
import { generateUID, getPoiWithOffset } from '@common/utils'

let currentStage
function create(params) {
  const { stage, layer } = params
  currentStage = stage
  let isDrawing = false
  let line
  stage.on('mousedown touchstart', () => {
    isDrawing = true
    const poi = getPoiWithOffset(stage.getPointerPosition(), stage)
    const toolConfig = Vue.prototype.$globalConf.eraser
    const eraserConfig = {
      id: generateUID(),
      stroke: toolConfig.color,
      strokeWidth: toolConfig.lineWidth,
      lineJoin: 'round',
      lineCap: 'round',
      globalCompositeOperation: 'destination-out',
      points: [poi.x, poi.y],
    }
    line = new Konva.Line(eraserConfig)
    layer.add(line)
    layer.batchDraw()
  })
  stage.on('mousemove touchmove', () => {
    if (!isDrawing) return
    const poi = getPoiWithOffset(stage.getPointerPosition(), stage)
    line.points(line.points().concat(poi.x, poi.y))
    layer.draw()
  })
  stage.on('mouseup touchend', () => {
    if (isDrawing) {
      isDrawing = false
      line.cache()
      line = null
    }
  })
}

function destroy() {
  currentStage.off('mousedown touchstart mousemove touchmove mouseup touchend')
}

export default {
  create,
  destroy,
}
