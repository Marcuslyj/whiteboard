import Konva from 'konva'
import Vue from 'vue'
import { generateUID, getPoiWithOffset } from '@common/utils'
import config from '@common/config'
import cManager from '../componentManager'
import { setCustomCursor, cancelCustomCursor } from './customCursor'

let currentStage
function create(params) {
  const { stage, layer } = params
  currentStage = stage
  const drawingLayer = config.layerManager[config.layerIds.DRAW_LAYER]
  let line
  // 标记正在画线
  let isDrawing = false
  stage.on('mousedown touchstart', ({ evt }) => {
    evt.preventDefault()
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
    drawingLayer.add(line)
  })
  stage.on('mousemove touchmove', ({ evt }) => {
    evt.preventDefault()
    if (!isDrawing) {
      return
    }
    const poi = getPoiWithOffset(stage.getPointerPosition(), stage)
    line.points(line.points().concat(poi.x, poi.y))
    drawingLayer.batchDraw()
  })
  // 清除事件
  stage.on('mouseup touchend mouseleave', ({ evt }) => {
    evt.preventDefault()
    if (isDrawing) {
      isDrawing = false
      if (line.points().length && line.points().length <= 2) {
        line.remove()
        const toolConfig = Vue.prototype.$globalConf.pencil
        line = new Konva.Circle({
          id: generateUID(),
          fill: toolConfig.color,
          x: line.points()[0],
          y: line.points()[1],
          radius: toolConfig.lineWidth / 2,
        })
      }
      // 性能优化
      layer.add(line)
      layer.draw()
      line.cache()
      cManager.addComponent(JSON.parse(line.toJSON()))
      line = null
      drawingLayer.destroyChildren()
      drawingLayer.draw()
    }
  })
  setCustomCursor(stage, 'pen')
}

function destroy() {
  if (!currentStage) return
  currentStage.off('mousedown touchstart mousemove touchmove mouseup touchend mouseleave')
  cancelCustomCursor()
}

export default {
  create,
  destroy,
}
