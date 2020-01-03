// 通过设置offsetX 来知道移动了多大的距离
function create(params) {
  const { stage } = params
  stage.draggable(true)
  let pan = false
  let startPoi = null
  let endPoi = null
  stage.on('mousedown touchstart', () => {
    pan = true
    startPoi = stage.getPointerPosition()
  })
  stage.on('mousemove touchmove', () => {
    if (!pan) return
    endPoi = stage.getPointerPosition()
    const offsetX = stage.offsetX()
    const offsetY = stage.offsetY()
    stage.setAttrs({
      offsetX: offsetX + startPoi.x - endPoi.x,
      offsetY: offsetY + startPoi.y - endPoi.y,
    })
  })
  stage.on('mouseup touchend', () => {
    if (pan) {
      pan = false
    }
  })
}

function destroy(params) {
  const { stage } = params
  stage.off('mousedown touchstart mousemove touchmove mouseup touchend')
}

export default {
  create,
  destroy,
}
