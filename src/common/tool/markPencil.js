import Konva from 'konva'
import Vue from 'vue'
import { generateUID, getPoiWithOffset } from '@common/utils'
import graphicManager from '@common/graphicManager'

function create(params) {
  const { stage, layer } = params
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
      graphicManager.addGraphic(line)
      line = null
    }
  })
}

function destroy(params) {
  const { stage } = params
  stage.off('mousedown touchstart mousemove touchmove mouseup touchend')
}

export default {
  create,
  destroy,
}
