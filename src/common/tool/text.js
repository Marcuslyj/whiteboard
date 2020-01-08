import { setStyle } from '@common/utils'
import config from '@common/config'

let editorDom
// 是否有文字
let hasText
let currentStage
function create(params) {
  const { stage } = params
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
    editorDom.oninput = function () {
      if (this.value !== '') {
        hasText = true
      } else {
        hasText = false
      }
      console.log(hasText)
    }
    const konvaContent = stage.content
    konvaContent.insertBefore(editorDom, konvaContent.firstElementChild)
    editorDom.focus()
  }
  stage.on('click tap', function ({ evt }) {
    // 右键不处理
    if (evt.button === 2) {
      return
    }
    // 有文字的话就不再弹框了
    if (hasText) {
      hasText = false
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
}

export default {
  create,
  destroy,
}
