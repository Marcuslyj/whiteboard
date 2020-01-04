import Konva from 'konva'
import Vue from 'vue'
import { generateUID, getPoiWithOffset } from '@common/utils'

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
      strokeWidth: toolConfig.lineWidth / 2,
      opacity: 1,
      lineJoin: 'round',
      lineCap: 'round',
      globalCompositeOperation: 'source-over',
      points: [poi.x, poi.y],
      bezier: true,
    }
    line = new Konva.Line(lineConfig)
    layer.add(line)
    layer.batchDraw()
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
      // 性能优化
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
