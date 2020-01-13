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
  const bgLayer = config.layerManager[config.layerIds.BG_LAYER]
  textLayer.scale({
    x: config.scale,
    y: config.scale,
  })
  remarkLayer.scale({
    x: config.scale,
    y: config.scale,
  })
  console.log(config.mode)
  // 首页背景层做缩放
  if (config.mode === 'board') {
    bgLayer.scale({
      x: config.scale,
      y: config.scale,
    })
    bgLayer.draw()
  }
  textLayer.draw()
  remarkLayer.draw()
}

function setStageXY() {
  console.log(`stage 偏移${config.stageXY.x} ${config.stageXY.y} `)
  config.board.position(config.stageXY)
  config.board.draw()
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


function updateStageXY(obj) {
  const params = {
    componentType: 2,
    componentId: sComponentId.stageXY,
    component: JSON.stringify({
      componentId: sComponentId.stageXY,
      type: sComponentId.stageXY,
      stageXY: obj,
    }),
  }
  config.stageXy = obj
  socketUtil.updateComponent(formateComponent(params))
}

function addBaseWidth() {
  const params = {
    componentType: 2,
    componentId: sComponentId.baseWidth,
    component: JSON.stringify({
      componentId: sComponentId.baseWidth,
      baseWidth: config.board.getAttr('width'),
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
  setStageXY,
  updateSpeakerSize,
  addSpeakerSize,
  addStageXY,
  updateStageXY,
  addBaseWidth,
  updateBaseWidth,
})
