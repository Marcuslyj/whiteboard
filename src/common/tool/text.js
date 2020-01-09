import { setStyle } from '@common/utils'
import config from '@common/config'
import Konva from 'konva'

let editorDom
let currentStage
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
    editorDom.focus()
  } else {
    editorDom.style.display = 'block'
  }
  stage.on('click tap', function ({ evt }) {
    // 右键不处理
    if (evt.button === 2) {
      return
    }
    // 有文字的话就不再弹框了
    if (editorDom && editorDom.value !== '') {
      // 绘制到layer上
      const shape = new Konva.Text({
        text: editorDom.value,
        fontSize: config.text.lineWidth,
        fill: config.color,
        x: Number(editorDom.style.left.split('px')[0]),
        y: Number(editorDom.style.top.split('px')[0]),
      })
      layer.add(shape)
      layer.draw()
      return
    }
    editorDom.value = ''
    // 增加到当前面板
    const boundingClientRect = stage.content.getBoundingClientRect()
    const offsetX = evt.clientX - boundingClientRect.left
    const offsetY = evt.clientY - boundingClientRect.top
    setStyle(editorDom, {
      left: `${offsetX}px`,
      top: `${offsetY}px`,
      width: `${boundingClientRect.width - offsetX}px`,
      height: `${boundingClientRect.height - offsetY}px`,
      color: config.color,
      fontSize: `${config.fontSize}px`,
    })
  })
}

function destroy() {
  currentStage.off('click tap')
  if (editorDom.style.display === 'block') {
    editorDom.style.display = 'none'
  }
}

export default {
  create,
  destroy,
}
