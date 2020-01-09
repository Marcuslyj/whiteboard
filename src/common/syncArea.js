// 此处的方法都是为了保持不同尺寸屏幕的可视范围一致

import { sComponentId } from '@common/common'
import config from './config'
import socketUtil from './socketUtil'
import { formateComponent } from './utils'

// 设置scale
function setLayerScale() {
  console.log(`layer 缩放${config.scale}`)
  const textLayer = config.layerManager[config.layerIds.TEXT_LAYER]
  const remarkLayer = config.layerManager[config.layerIds.REMARK_LAYER]
  textLayer.scale({
    x: config.scale,
    y: config.scale,
  })
  remarkLayer.scale({
    x: config.scale,
    y: config.scale,
  })
  textLayer.draw()
  remarkLayer.draw()
}

function addSpeakerSize(size) {
  const params = {
    componentType: 2,
    componentId: sComponentId.speakerSize,
    component: JSON.stringify({
      componentId: sComponentId.speakerSize,
      type: sComponentId.speakerSize,
      speakerSize: size,
    }),
  }
  config.speakerSize = size
  socketUtil.addComponent(formateComponent(params))
}

function updateSpeakerSize(size) {
  const params = {
    componentType: 2,
    componentId: sComponentId.speakerSize,
    component: JSON.stringify({
      componentId: sComponentId.speakerSize,
      type: sComponentId.speakerSize,
      speakerSize: size,
    }),
  }
  config.speakerSize = size
  socketUtil.updateComponent(formateComponent(params))
}

function addStageXY() {
  const params = {
    componentType: 2,
    componentId: sComponentId.stageXY,
    component: JSON.stringify({
      componentId: sComponentId.stageXY,
      type: sComponentId.stageXY,
      stageXY: { x: 0, y: 0 },
    }),
  }
  config.stageXy = { x: 0, y: 0 }
  socketUtil.addComponent(formateComponent(params))
}


function updateStageXY(x, y) {
  const params = {
    componentType: 2,
    componentId: sComponentId.stageXY,
    component: JSON.stringify({
      componentId: sComponentId.stageXY,
      type: sComponentId.stageXY,
      stageXY: { x, y },
    }),
  }
  config.stageXy = { x, y }
  socketUtil.updateComponent(formateComponent(params))
}

function addBaseWidth() {
  const params = {
    componentType: 2,
    componentId: sComponentId.baseWidth,
    component: JSON.stringify({
      componentId: sComponentId.baseWidth,
      baseWidth: '',
      type: sComponentId.baseWidth,
    }),
  }
  config.baseWidth = ''
  socketUtil.addComponent(formateComponent(params))
}

function updateBaseWidth(baseWidth) {
  const params = {
    componentType: 2,
    componentId: sComponentId.baseWidth,
    component: JSON.stringify({
      componentId: sComponentId.baseWidth,
      baseWidth,
      type: sComponentId.baseWidth,
    }),
  }
  config.baseWidth = baseWidth
  socketUtil.updateComponent(formateComponent(params))
}


export default ({
  setLayerScale,
  updateSpeakerSize,
  addSpeakerSize,
  addStageXY,
  updateStageXY,
  addBaseWidth,
  updateBaseWidth,
})
