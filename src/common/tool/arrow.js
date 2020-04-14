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
  let arrow
  let isDrawing = false
  let firstPoi
  const drawingLayer = config.layerManager[config.layerIds.DRAW_LAYER]
  stage.on('mousedown touchstart', () => {
    isDrawing = true
    firstPoi = getPoiWithOffset(stage.getPointerPosition(), stage)
  })
  stage.on('mousemove touchmove', () => {
    if (!isDrawing) return
    const poi = getPoiWithOffset(stage.getPointerPosition(), stage)
    if (!arrow) {
      const toolConfig = Vue.prototype.$globalConf.pencil
      const arrowConfig = {
        id: generateUID(),
        pointerLength: 12,
        pointerWidth: 12,
        strokeWidth: toolConfig.lineWidth,
        fill: toolConfig.color,
        stroke: toolConfig.color,
        points: [firstPoi.x, firstPoi.y, poi.x, poi.y],
      }
      arrow = new Konva.Arrow(arrowConfig)
      drawingLayer.add(arrow)
    } else {
      arrow.points([firstPoi.x, firstPoi.y, poi.x, poi.y])
    }
    drawingLayer.batchDraw()
  })
  stage.on('mouseup touchend', () => {
    if (isDrawing) {
      isDrawing = false
      if (arrow) {
        layer.add(arrow)
        layer.draw()
        arrow && arrow.cache({ offset: 5 })
        cManager.addComponent(JSON.parse(arrow.toJSON()))
        arrow = null
        drawingLayer.destroyChildren()
        drawingLayer.draw()
      }
    }
  })
  setCustomCursor(stage, 'arrow')
}

function destroy() {
  currentStage.off('mousedown touchstart mousemove touchmove mouseup touchend')
  cancelCustomCursor()
}

export default {
  create,
  destroy,
}
