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
  let isDrawing = false
  let line
  setCustomCursor(stage)
  const drawingLayer = config.layerManager[config.layerIds.DRAW_LAYER]
  stage.on('mousedown touchstart', ({ evt }) => {
    evt.preventDefault()
    isDrawing = true
    const poi = getPoiWithOffset(stage.getPointerPosition(), stage)
    const toolConfig = Vue.prototype.$globalConf.eraser
    const eraserConfig = {
      id: generateUID(),
      stroke: toolConfig.color,
      strokeWidth: toolConfig.lineWidth,
      lineJoin: 'round',
      lineCap: 'round',
      // globalCompositeOperation: 'destination-out',
      points: [poi.x, poi.y],
      besizer: true,
    }
    line = new Konva.Line(eraserConfig)
    drawingLayer.add(line)
  })
  stage.on('mousemove touchmove', ({ evt }) => {
    evt.preventDefault()
    if (!isDrawing) return
    const poi = getPoiWithOffset(stage.getPointerPosition(), stage)
    line.points(line.points().concat(poi.x, poi.y))
    drawingLayer.add(line)
    drawingLayer.draw()
  })
  stage.on('mouseup touchend', ({ evt }) => {
    evt.preventDefault()
    if (isDrawing) {
      isDrawing = false
      if (line.points().length === 2) {
        line.remove()
        // 只有一个点，提交一个圆
        const toolConfig = Vue.prototype.$globalConf.eraser
        line = new Konva.Circle({
          id: generateUID(),
          fill: toolConfig.color,
          x: line.points()[0],
          y: line.points()[1],
          radius: toolConfig.lineWidth / 2,
        })
      }
      layer.add(line)
      layer.draw()
      line.cache()
      cManager.addComponent(JSON.parse(line.toJSON()))
      line = null
      drawingLayer.destroyChildren()
      drawingLayer.draw()
    }
  })
}

function destroy() {
  if (!currentStage) return
  currentStage.off('mousedown touchstart mousemove touchmove mouseup touchend')
  cancelCustomCursor()
}

export default {
  create,
  destroy,
}
