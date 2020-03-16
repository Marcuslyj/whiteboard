import Konva from 'konva'
import cManager from '@common/componentManager'
import Vue from 'vue'
import { generateUID,cache } from '@common/utils'

let currentLayer
let currentStage
let origin
let opeTarget
function create(params) {
  const { stage } = params
  currentStage = stage
  stage.on('click tap', function ({ target }) {
    // stage 非目标
    if (target === stage) {
      save()
      return
    }
    if (target === opeTarget) {
      return
    }
    if (opeTarget) {
      save()
    }
    // 初始化边框
    currentLayer = target.getLayer()
    stage.find('Transformer').destroy()
    // 防止浅克隆问题
    origin =JSON.parse(target.toJSON())
    opeTarget = target
    opeTarget.draggable(true)
    const tr = new Konva.Transformer({
      node: target,
      borderStrokeWidth: 2,
      anchorStrokeWidth: 2,
      // padding: 40,
    //   enabledAnchors: ['bottom-right'],
    })
    tr.on('transform', () => {
      setMenu()
    })
    opeTarget.on('dragend', () => {
      setMenu()
    })
    currentLayer.add(tr)
    currentLayer.draw()
    // 增加便捷工具条
    setMenu()
  })
}

// 对上一次做收尾保存
function save() {
  currentStage.find('Transformer').destroy()
  currentLayer && currentLayer.draw()
  if (opeTarget) {
    add()
  }
}
function setMenu() {
  const clientRect = opeTarget.getClientRect()
  const style = {
    display: 'block',
    position: 'absolute',
    left: clientRect.x > 0 ? `${clientRect.x}px` : 0,
    top: clientRect.y > 0 ? `${clientRect.y - 40}px` : 0,
  }
  let miniMenuType
  let color
  if (opeTarget.className === 'Text') {
    miniMenuType = 'select-text'
    color = opeTarget.getAttr('fill')
  } else if (opeTarget.className === 'Line' || opeTarget.className === 'Arrow') {
    miniMenuType = 'select-others'
    color = opeTarget.stroke()
  }
  Vue.eventBus.$emit('setMiniMenu', { miniMenuType, miniMenuStyle: style, textColor: color })
}

function destroy() {
  const stage = currentStage
  save()
  stage.off('click tap')
}

// 正在操作的对象更新到layer 中
function add() {
  const target=JSON.parse(opeTarget.toJSON())
  if (opeTarget.className === 'Text') {
    cManager.updateComponent(target, 0, 'text', true, origin)
  } else if (opeTarget.className === 'Line'||opeTarget.className === 'Arrow') {
    cManager.updateComponent(target, 0, 'remark', true, origin)
  }
  // 关闭2个可能4存在的工具
  Vue.eventBus.$emit('setMiniMenu', { miniMenuType: 'select-text', miniMenuStyle: { display: 'none' } })
  Vue.eventBus.$emit('setMiniMenu', { miniMenuType: 'select-others', miniMenuStyle: { display: 'none' } })
  opeTarget.draggable(false)
  origin = opeTarget = null
}

// 对外抛出的删除方法
function del() {
  cManager.updateComponentState(opeTarget.getAttr('id'), 0, 0)
  currentStage.find('Transformer').destroy()
  Vue.eventBus.$emit('setMiniMenu', { miniMenuType: 'select-text', miniMenuStyle: { display: 'none' } })
  Vue.eventBus.$emit('setMiniMenu', { miniMenuType: 'select-others', miniMenuStyle: { display: 'none' } })
}

// 对外抛出的copy方法
function copy() {
  let poi = opeTarget.position()
  const newAttrs = Object.assign(opeTarget.getAttrs(), { id: generateUID(), x: poi.x - 100, y: poi.y - 100 })
  const copyShape = new Konva[opeTarget.className](newAttrs)
  currentLayer.add(copyShape)
  currentLayer.draw()
  cManager.addComponent(copyShape, 0, opeTarget.className === 'Text' ? 'text' : 'remark')
}

function changeColor(color) {
  if (opeTarget.className === 'Text') {
    opeTarget.fill(color)
  } else if (opeTarget.className === 'Line') {
    opeTarget.stroke(color)
  } else if (opeTarget.className === 'Arrow') {
    opeTarget.stroke(color)
    opeTarget.fill(color)
  }
  opeTarget.clearCache()
  currentLayer.draw()
  cache(opeTarget)
}

function changeFontsize(size) {
  opeTarget.setAttrs({
    fontSize: size,
  })
  opeTarget.clearCache()
  currentLayer.draw()
  cache(opeTarget)
}

export default {
  create,
  destroy,
  del,
  copy,
  changeColor,
  changeFontsize,
}
