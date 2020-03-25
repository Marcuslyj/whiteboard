// 组件删除
import Konva from 'konva'
import cManager from '../componentManager'

let tr
let label
let isRunning = false
let currentLayer
let currentStage
function create(params) {
  const { stage, layer } = params
  currentLayer = layer
  currentStage = stage
  // 移动端遇到问题：不能使用click 触发
  stage.on('click tap', (evt) => {
    if (isRunning || evt.target === stage) { return }
    isRunning = true
    stage.find('Transformer').destroy()
    tr = new Konva.Transformer({
      node: evt.target,
      centeredScaling: true,
      resizeEnabled: false,
      rotateEnabled: false,
      padding: 20,
      borderStrokeWidth: 2,
    })

    const selfRect = evt.target.getSelfRect()
    console.log(selfRect.width)
    const props = {
      x: tr.getX() + tr.getWidth() + 40,
      y: tr.getY() - 20,
      rotation: tr.getRotation(),
    }
    console.log(props)
    label = new Konva.Label(props)

    // 增加一个删除按钮
    label.add(new Konva.Tag({
      fill: '#fff',
      stroke: '#78c8f8',
      shadowColor: 'black',
      shadowBlur: 10,
      shadowOffset: [10, 10],
      shadowOpacity: 0.2,
      lineJoin: 'round',
      pointerDirection: 'none',
      pointerWidth: 30,
      pointerHeight: 30,
      cornerRadius: 3,
    }))

    const text = new Konva.Text({
      fontSize: 25,
      text: 'x',
      fill: '#333',
    })
    label.add(text)
    layer.add(tr)
    layer.add(label)
    layer.draw()

    label.on('mouseover touchstart', () => {
      label.getTag().fill('red')
      label.getText().fill('#fff')
      layer.draw()
    })
    label.on('mouseout touchend', () => {
      label.getTag().fill('#fff')
      label.getText().fill('#000')
      layer.draw()
    })
    label.on('click tap', (event) => {
      event.cancelBubble = true
      cManager.updateComponentState(evt.target.getAttr('id'), 0, 0)
      label.destroy()
      tr.destroy()
      layer.draw()
      isRunning = false
    })
  })
}

function destroy() {
  const stage = currentStage
  const layer = currentLayer
  stage.off('click tap')
  stage.find('Transformer').destroy()
  // 执行一半的销毁
  if (isRunning) {
    label && label.destroy()
    layer.draw()
    isRunning = false
  }
}

export default {
  create,
  destroy,
}
