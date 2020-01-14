import { setStyle, getPoiWithOffset } from '@common/utils'
import config from '@common/config'
import Konva from 'konva'
import Vue from 'vue'
import cManager from '@common/componentManager'

let editorDom
let currentStage
let startPoi
function create(params) {
  const { stage, layer } = params
  currentStage = stage
  if (!editorDom) {
    editorDom = document.createElement('textarea')
    editorDom.className = 'editor-textarea'
    setStyle(editorDom, {
      position: 'absolute',
      'z-index': '99',
      border: 'none',
      background: 'transparent',
      left: '-1000px',
      top: '-1000px',
      resize: 'none',
      outline: '0',
    })
    const konvaContent = stage.content
    konvaContent.insertBefore(editorDom, konvaContent.firstElementChild)
  }
  stage.on('click tap', function ({ evt }) {
    // 右键不处理
    if (evt.button === 2) {
      return
    }
    // 有文字的话就不再弹框了
    if (editorDom && editorDom.value !== '') {
      // 绘制到layer上
      const newPoi = getPoiWithOffset(startPoi, stage)
      const shape = new Konva.Text({
        text: editorDom.value,
        fontSize: config.text.fontSize,
        fill: config.text.color,
        x: newPoi.x,
        y: newPoi.y,
      })
      editorDom.value = ''
      layer.add(shape)
      shape.cache()
      layer.draw()
      cManager.addComponent(shape)
      editorDom.style.display = 'none'
      const style = {
        display: 'none',
      }
      Vue.eventBus.$emit('setMiniMenu', { miniMenuType: 'edit-text', miniMenuStyle: style })
      return
    }
    editorDom.value = ''
    editorDom.style.display = 'block'
    editorDom.focus()
    // 增加到当前面板
    const boundingClientRect = stage.content.getBoundingClientRect()
    const offsetX = evt.clientX - boundingClientRect.left
    const offsetY = evt.clientY - boundingClientRect.top
    startPoi = stage.getPointerPosition()
    setStyle(editorDom, {
      left: `${offsetX}px`,
      top: `${offsetY}px`,
      width: `${boundingClientRect.width - offsetX}px`,
      height: `${boundingClientRect.height - offsetY}px`,
      color: config.color,
      fontSize: `${config.fontSize}px`,
    })
    // 启动miniMenu
    const style = {
      display: 'block',
      position: 'absolute',
      left: offsetX > 0 ? `${offsetX}px` : 0,
      top: offsetY > 0 ? `${offsetY - 80}px` : 0,
    }
    Vue.eventBus.$emit('setMiniMenu', { miniMenuType: 'edit-text', miniMenuStyle: style })
  })
}

function destroy() {
  if (!currentStage) return
  currentStage.off('click tap')
  if (editorDom.style.display === 'block') {
    editorDom.style.display = 'none'
  }
}

export default {
  create,
  destroy,
}
