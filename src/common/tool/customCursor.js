import Konva from 'konva'
import config from '@common/config'
import { getPoiWithOffset } from '@common/utils'

let currentStage
// let cursor
export function setCustomCursor(stage, key = 'eraser') {
  // 指针使用圆来显示
  currentStage = stage
  let layer = config.layerManager[config.layerIds.CUSTOM_CURSOR_LAYER]
  let props = {
    x: -1000,
    y: -1000,
    stroke: '#000',
    radius: 2,
    strokeWidth: 1,
  }
  const circle = new Konva.Circle(props)
  layer.destroyChildren()
  layer.add(circle)
  let mouseCursor = true
  stage.on('mousemove.cursor touchmove.cursor wheel.cursor', () => {
    const de = document.querySelector('#board-container')
    if (mouseCursor) {
      de.style.cursor = 'none'
      mouseCursor = false
    }
    const poi = getPoiWithOffset(stage.getPointerPosition(), stage)
    circle.position(poi)
    circle.visible(true)
    const keys = ['pen', 'markPencil', 'arrow']
    let newkey = keys.includes(key) ? 'pencil' : key
    if (key === 'eraser') {
      circle.fill('#fff')
    } else {
      circle.fill(config[newkey].color)
      circle.stroke(config[newkey].color)
      // 马克笔增加透明度
      if (key === 'markPencil') {
        circle.opacity(0.5)
      }
    }
    circle.radius(config[newkey].lineWidth / 2)
    layer.draw()

    // setStyle(cursor, {
    //   left: `${stage.getPointerPosition().x}px`,
    //   top: `${stage.getPointerPosition().y}px`,
    // })
  })

  //   cursor = document.querySelector('.tool-cursor')
  //   if (!cursor) {
  //     cursor = document.createElement('div')
  //     cursor.className = 'tool-cursor'
  //   }

  //   cursor.innerHTML = `<i class="iconfont  ${icon}" style="font-size:24px"></i>`
  //   setStyle(cursor, {
  //     display: 'block',
  //     position: 'absolute',
  //     background: 'transparent',
  //     outline: 'none',
  //     border: 'none',
  //     transform: 'translateY(-100%)',
  //     'z-index': 99,
  //   })

  //   const konvaContent = stage.content
  //   // 增加到当前面板
  //   konvaContent.insertBefore(cursor, konvaContent.firstElementChild)

  stage.on('mouseleave.cursor', () => {
    if (circle) {
      circle.visible(false)
      layer.draw()
    }
  })
}

export function cancelCustomCursor() {
  let layer = config.layerManager[config.layerIds.CUSTOM_CURSOR_LAYER]
  if (layer) {
    layer.destroyChildren()
    layer.batchDraw()
    currentStage.off('mousemove.cursor touchmove.cursor wheel.cursor mouseleave.cursor')
  }
  const de = document.querySelector('#board-container')
  de && (de.style.cursor = 'default')
//   cursor.style.display = 'none'
}
