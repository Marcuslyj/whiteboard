import Konva from 'konva'
import config from '@common/config'
import { getPoiWithOffset, getImg } from '@common/utils'
import laserIcon from '@assets/laser_pen.png'
import socketUtil from '../socketUtil'

let currentStage
let timeout
// let cursor
async function create(params) {
  const { stage } = params
  // 激光笔使用一个图标
  currentStage = stage
  const img = await getImg(laserIcon)
  let layer = config.layerManager[config.layerIds.CUSTOM_CURSOR_LAYER]
  let props = {
    x: -1000,
    y: -1000,
    image: img,
    width: 20,
    height: 20,
  }
  const image = new Konva.Image(props)
  layer.destroyChildren()
  layer.add(image)
  let mouseCursor = true
  stage.on('mousemove.cursor touchmove.cursor wheel.cursor', ({ type, evt }) => {
    evt.preventDefault()
    const de = document.querySelector('#board-container')
    if (mouseCursor) {
      de.style.cursor = 'none'
      mouseCursor = false
    }
    const poi = getPoiWithOffset(stage.getPointerPosition(), stage)
    image.position(poi)
    image.visible(true)
    // 滚动文档时隐藏，避免副屏文档和激光笔动作不一致
    if (type === 'wheel') {
      image.visible(false)
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        image.visible(true)
        // 广播给其他用户
        const param = {
          meetingId: config.meetingId,
          msg: JSON.stringify({
            event: 'laserPen',
            component: { ...image.getAttrs() },
          }),
        }
        socketUtil.broadcast(param)
        layer.draw()
      }, 300)
    }
    layer.draw()
    // 广播给其他用户
    const param = {
      meetingId: config.meetingId,
      msg: JSON.stringify({
        event: 'laserPen',
        component: { ...image.getAttrs() },
      }),
    }
    socketUtil.broadcast(param)
  })

  // 滚动的时候同步到文档会发生时机不一致的问题，故滚动过程中隐藏

  stage.on('mouseleave.cursor', () => {
    if (image) {
      image.visible(false)
      layer.draw()
    }
  })
}


function destroy() {
  let layer = config.layerManager[config.layerIds.CUSTOM_CURSOR_LAYER]
  if (layer) {
    layer.destroyChildren()
    layer.batchDraw()
    currentStage.off('mousemove.cursor touchmove.cursor wheel.cursor mouseleave.cursor')
  }
  const de = document.querySelector('#board-container')
  de && (de.style.cursor = 'default')
  // 通知副屏清空
  const param = {
    meetingId: config.meetingId,
    msg: JSON.stringify({
      event: 'removeLaserPen',
    }),
  }
  socketUtil.broadcast(param)
  clearTimeout(timeout)
  timeout = null
}


export default {
  create,
  destroy,
}
