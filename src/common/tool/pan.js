import syncArea from '@common/syncArea'

let currentStage
function create(params) {
  const { stage } = params
  currentStage = stage
  stage.draggable(true)
  stage.on('dragend', () => {
    const { x, y } = stage.absolutePosition()
    syncArea.updateStageXY(x, y)
  })
}

function destroy() {
  currentStage.draggable(false)
  currentStage.off('dragend')
}

export default {
  create,
  destroy,
}
