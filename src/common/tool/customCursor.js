import Konva from 'konva'
import config from '@common/config'
import { getPoiWithOffset, setStyle } from '@common/utils'

let currentStage
export function setCustomCursor(stage, props, icon) {
  // 指针使用圆来显示
  currentStage = stage
  let layer = config.layerManager[config.layerIds.CUSTOM_CURSOR_LAYER]
  props = { ...props, x: -100, y: -100 }
  const circle = new Konva.Circle(props)
  layer.add(circle)
  layer.draw()
  stage.on('mousemove touchmove', () => {
    const poi = getPoiWithOffset(stage.getPointerPosition(), stage)
    circle.position(poi)
    circle.fill('red')
    circle.radius(config.eraser.lineWidth / 2)
    layer.draw()
  })

  let cursor = document.querySelector('.tool-cursor')
  if (!cursor) {
    cursor = document.createElement('div')
  }

  cursor.innerHTML = `<i class="iconfont  ${icon}"></i>`
  setStyle(cursor, {
    position: 'absolute',
    width: '20px',
    height: '',
    background: 'transparent',
    outline: 'none',
    border: 'none',
  })

  const konvaContent = stage.content
  // 增加到当前面板
  konvaContent.insertBefore(cursor, konvaContent.firstElementChild)

  //   const de = document.querySelector('.board-container-wrapper')
  //   de.addEventListener('mousemove touchmove', (evt) => {

//   })
}

export function cancelCustomCursor() {
  let layer = config.layerManager[config.layerIds.CUSTOM_CURSOR_LAYER]
  if (layer) {
    layer.destroyChildren()
    layer.batchDraw()
    currentStage.off('mousemove touchmove')
  }
}
