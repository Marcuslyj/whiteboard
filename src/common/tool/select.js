import Konva from 'konva'
import cManager from '@common/componentManager'
import Vue from 'vue'
import { generateUID, cache, isSameObject } from '@common/utils'

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
      return
    }
    // 初始化边框
    currentLayer = target.getLayer()
    stage.find('Transformer').destroy()
    // 防止浅克隆问题
    origin = JSON.parse(target.toJSON())
    opeTarget = target
    opeTarget.draggable(true)
    const tr = new Konva.Transformer({
      node: target,
      borderStrokeWidth: 2,
      anchorStrokeWidth: 2,
      // padding: 40,
      enabledAnchors: ['bottom-right', 'top-right', 'bottom-left', 'top-left'],
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

// 对上一次做收尾保存,为了不滥用保存，需要对数据做是否保存的判断（属性是否确实更新了）
function save() {
  currentStage.find('Transformer').destroy()
  currentLayer && currentLayer.draw()
  // 关闭2个可能4存在的工具
  Vue.eventBus.$emit('setMiniMenu', { miniMenuType: 'select-text', miniMenuStyle: { display: 'none' } })
  Vue.eventBus.$emit('setMiniMenu', { miniMenuType: 'select-others', miniMenuStyle: { display: 'none' } })
  if (opeTarget) {
    console.log(opeTarget.getAttrs())
    // 此处opeTarget 可能新增了transformed 属性
    if (!isSameObject(origin.attrs, opeTarget.getAttrs(), ['fill', 'stroke', 'x', 'y', 'rotation', 'scaleX', 'scaleY'])) {
      add()
    }
    opeTarget.draggable(false)
    origin = opeTarget = null
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
  } else if (opeTarget.className === 'Line' || opeTarget.className === 'Arrow' || opeTarget.className === 'Circle') {
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
  const target = JSON.parse(opeTarget.toJSON())
  if (opeTarget.className === 'Text') {
    cManager.updateComponent(target, 0, 'text', true, origin)
  } else if (opeTarget.className === 'Line' || opeTarget.className === 'Arrow' || opeTarget.className === 'Circle') {
    cManager.updateComponent(target, 0, 'remark', true, origin)
  }
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
  const newAttrs = Object.assign(JSON.parse(opeTarget.toJSON()), { id: generateUID(), x: poi.x - 100, y: poi.y - 100 })
  const copyShape = new Konva[opeTarget.className](newAttrs)
  currentLayer.add(copyShape)
  cManager.addComponent(JSON.parse(copyShape.toJSON()), 0, opeTarget.className === 'Text' ? 'text' : 'remark')
  currentStage.find('Transformer').destroy()
  origin = opeTarget = null
  currentLayer.draw()
  Vue.eventBus.$emit('setMiniMenu', { miniMenuType: 'select-text', miniMenuStyle: { display: 'none' } })
  Vue.eventBus.$emit('setMiniMenu', { miniMenuType: 'select-others', miniMenuStyle: { display: 'none' } })
}

function changeColor(color) {
  if (opeTarget.className === 'Text') {
    opeTarget.fill(color)
  } else if (opeTarget.className === 'Line') {
    opeTarget.stroke(color)
  } else if (opeTarget.className === 'Arrow') {
    opeTarget.stroke(color)
    opeTarget.fill(color)
  } else if (opeTarget.className === 'Circle') {
    opeTarget.fill(color)
  }
  // opeTarget.clearCache()
  currentLayer.draw()
  // cache(opeTarget)
}

function changeFontsize(size) {
  opeTarget.setAttrs({
    fontSize: size,
  })
  // opeTarget.clearCache()
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
