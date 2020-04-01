import Konva from 'konva'
import config from '@common/config'
import { getPoiWithOffset, setStyle } from '@common/utils'

let currentStage
let cursor
export function setCustomCursor(stage, props, icon = 'icon-eraser', key = 'eraser') {
  // 指针使用圆来显示
  currentStage = stage
  let layer = config.layerManager[config.layerIds.CUSTOM_CURSOR_LAYER]
  props = { ...props, x: -1000, y: -1000 }
  const circle = new Konva.Circle(props)
  layer.add(circle)
  layer.draw()
  stage.on('mousemove touchmove', () => {
    const poi = getPoiWithOffset(stage.getPointerPosition(), stage)
    circle.position(poi)
    circle.fill('red')
    circle.radius(config[key].lineWidth / 2)
    layer.draw()
    setStyle(cursor, {
      left: `${stage.getPointerPosition().x}px`,
      top: `${stage.getPointerPosition().y}px`,
    })
  })

  cursor = document.querySelector('.tool-cursor')
  if (!cursor) {
    cursor = document.createElement('div')
    cursor.className = 'tool-cursor'
  }

  cursor.innerHTML = `<i class="iconfont  ${icon}" style="font-size:24px"></i>`
  setStyle(cursor, {
    display: 'block',
    position: 'absolute',
    background: 'transparent',
    outline: 'none',
    border: 'none',
    transform: 'translateY(-100%)',
    'z-index': 99,
  })

  const konvaContent = stage.content
  // 增加到当前面板
  konvaContent.insertBefore(cursor, konvaContent.firstElementChild)

  const de = document.querySelector('.board-container-wrapper')
  de.style.cursor = 'none'
}

export function cancelCustomCursor() {
  let layer = config.layerManager[config.layerIds.CUSTOM_CURSOR_LAYER]
  if (layer) {
    layer.destroyChildren()
    layer.batchDraw()
    currentStage.off('mousemove touchmove')
  }
  const de = document.querySelector('.board-container-wrapper')
  de && (de.style.cursor = 'default')
  cursor.style.display = 'none'
}
