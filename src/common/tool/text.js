import {
  setStyle, getPoiWithOffset, generateUID, isSameObject, toRGB,
} from '@common/utils'
import config from '@common/config'
import Konva from 'konva'
import Vue from 'vue'
import cManager from '@common/componentManager'

let editorDom
let currentStage
let currentLayer
let startPoi
let mode
let currentTarget

const global = typeof global !== 'undefined' ? global
  : typeof window !== 'undefined' ? window : {}

const TOUCH_DEVICE = 'ontouchstart' in global

function create(params) {
  const { stage, layer } = params
  currentStage = stage
  currentLayer = layer
  // 只用内存editorDom 判断会出现 dom 销毁，而 内存仍存在的情况
  editorDom = document.querySelector('.editor-textarea')
  if (!editorDom) {
    editorDom = document.createElement('textarea')
    editorDom.className = 'editor-textarea'
    setStyle(editorDom, {
      position: 'absolute',
      'z-index': '99',
      border: 'none',
      // border: '1px solid red',
      background: 'transparent',
      left: '-1000px',
      top: '-1000px',
      resize: 'none',
      outline: '0',
      padding: 0,
    })
    const konvaContent = stage.content
    // 增加到当前面板
    konvaContent.insertBefore(editorDom, konvaContent.firstElementChild)
  }
  const start = function () {
    // 点击文字编辑时默认在页面中间初始化文字编辑
    mode = 'add'
    editorDom.value = ''
    editorDom.style.display = 'block'
    editorDom.focus()
    const boundingClientRect = stage.content.getBoundingClientRect()
    let offsetX = document.documentElement.clientWidth / 2 - boundingClientRect.left
    let offsetY = document.documentElement.clientHeight / 2 - boundingClientRect.top
    startPoi = { x: document.documentElement.clientWidth / 2, y: document.documentElement.clientHeight / 2 }
    let { color, fontSize } = config.text

    setStyle(editorDom, {
      left: `${offsetX}px`,
      top: `${offsetY}px`,
      width: `${boundingClientRect.width - offsetX}px`,
      height: `${boundingClientRect.height - offsetY}px`,
      color,
      fontSize: `${fontSize}px`,
    })
    // 启动miniMenu
    const style = {
      display: 'block',
      position: 'absolute',
      left: offsetX > 0 ? `${offsetX}px` : 0,
      top: offsetY > 0 ? `${offsetY - 40}px` : 0,
    }
    Vue.eventBus.$emit('setMiniMenu', { miniMenuType: 'edit-text', miniMenuStyle: style, color })
  }
  // 如果是resize 窗口不需要默认
  if (config.resizeFlag) {
    config.resizeFlag = false
  } else {
    start()
  }

  stage.on('click tap', function ({ evt, target }) {
    // 右键不处理
    if (evt.button === 2) {
      return
    }
    // 有文字的话就不再弹框，（完成）
    if (editorDom && editorDom.value !== '') {
      // 绘制到layer上
      if (mode === 'add') {
        // 新增完成
        const newPoi = getPoiWithOffset(startPoi, stage)
        add(newPoi)
      } else {
        // 编辑完成
        update()
      }
      editorDom.value = ''
      editorDom.style.display = 'none'
      const style = {
        display: 'none',
      }
      Vue.eventBus.$emit('setMiniMenu', { miniMenuType: 'edit-text', miniMenuStyle: style })
      return
    }
    let offsetX
    let offsetY
    let color
    let fontSize
    const boundingClientRect = stage.content.getBoundingClientRect()
    // 点击到文字上，允许编辑
    if (target.className === 'Text') {
      mode = 'edit'
      target.visible(false)
      currentLayer.draw()
      startPoi = {
        x: target.x(),
        y: target.y(),
      }
      currentTarget = target
      editorDom.value = target.getAttr('text')
      editorDom.style.display = 'block'
      editorDom.focus()
      offsetX = target.getClientRect().x
      offsetY = target.getClientRect().y
      color = target.fill()
      fontSize = target.getAttr('fontSize')
    } else {
      // 点击到其他地方，新增一个
      mode = 'add'
      editorDom.value = ''
      editorDom.style.display = 'block'
      editorDom.focus()
      // 增加到当前面板
      offsetX = evt.clientX - boundingClientRect.left
      offsetY = evt.clientY - boundingClientRect.top
      startPoi = stage.getPointerPosition()
      color = config.text.color
      fontSize = config.text.fontSize
    }
    setStyle(editorDom, {
      left: `${offsetX}px`,
      top: `${offsetY}px`,
      width: `${boundingClientRect.width - offsetX}px`,
      height: `${boundingClientRect.height - offsetY}px`,
      color,
      fontSize: `${fontSize}px`,
    })
    // 启动miniMenu
    const style = {
      display: 'block',
      position: 'absolute',
      left: offsetX > 0 ? `${offsetX}px` : 0,
      top: offsetY > 0 ? `${offsetY - 40}px` : 0,
    }
    Vue.eventBus.$emit('setMiniMenu', { miniMenuType: 'edit-text', miniMenuStyle: style, textColor: color })
  })
}

// 新增一个到stage 上
function add(newPoi) {
  const shape = new Konva.Text({
    id: generateUID(),
    text: editorDom.value,
    fontSize: config.text.fontSize,
    fill: config.text.color,
    x: newPoi.x,
    y: newPoi.y + 5,
    width: editorDom.clientWidth,
    hitStrokeWidth: TOUCH_DEVICE ? 10 : 'auto',
    // dash: [10, 5],
    keepRatio: true,
  })
  currentLayer.add(shape)
  // shape.cache()
  currentLayer.draw()
  cManager.addComponent(JSON.parse(shape.toJSON()), 0, 'text')
  currentTarget = null
}

// 编辑更新
function update() {
  const old = JSON.parse(currentTarget.toJSON())
  // 编辑时修改了，存到缓存必须可见
  old.attrs.visible = true
  // dom会把颜色转成rgb
  old.attrs.fill = old.attrs.fill.indexOf('rgb') > -1 ? old.attrs.fill : toRGB(old.attrs.fill)
  console.log(old.attrs.fill)
  currentTarget.clearCache()
  currentTarget.setAttrs({
    fontSize: Number(editorDom.style.fontSize.split('px')[0]),
    fill: editorDom.style.color,
    text: editorDom.value,
  })
  currentTarget.visible(true)
  currentLayer.draw()
  editorDom.value = ''
  // 检测组件是否发生了改变，是否需要保存到后台和缓存
  const newAttrs = currentTarget.getAttrs()
  // rgb(51, 51 ,51) 带空格了
  newAttrs.fill = newAttrs.fill.replace(/\s/g, '')
  if (!isSameObject(old.attrs, newAttrs, ['fontSize', 'fill', 'text'])) {
    cManager.updateComponent(JSON.parse(currentTarget.toJSON()), 0, 'text', true, old)
  }
}

function destroy() {
  if (!currentStage) return
  currentStage.off('click tap')
  if (editorDom.style.display === 'block') {
    editorDom.style.display = 'none'
  }
  // 正在编辑的恢复
  if (currentTarget) {
    // currentTarget.clearCache()
    currentTarget.visible(true)
    currentLayer.draw()
  }
  Vue.eventBus.$emit('setMiniMenu', { miniMenuType: 'edit-text', miniMenuStyle: { display: 'none' } })
  mode = ''
}

// 新增，编辑中对外的复制方法
function copy() {
  const copyPoi = {
    x: startPoi.x - 100,
    y: startPoi.y - 100,
  }
  add(getPoiWithOffset(copyPoi, currentStage))
}

// 新增，编辑中,对外抛出的删除方法
function del() {
  if (mode === 'edit') {
  // 删除编辑组件
    // currentTarget.visible(false)
    // currentLayer.draw()
    cManager.updateComponentState(currentTarget.getAttr('id'), 0, 0)
  }
  editorDom.style.display = 'none'
  editorDom.value = ''
  mode = ''
  Vue.eventBus.$emit('setMiniMenu', { miniMenuType: 'edit-text', miniMenuStyle: { display: 'none' } })
}

export default {
  create,
  destroy,
  copy,
  del,
}
