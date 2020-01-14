import syncArea from '@common/syncArea'

let currentStage
function create(params) {
  const { stage } = params
  currentStage = stage
  stage.draggable(true)
  stage.on('dragend', () => {
    syncArea.updateStageXY(stage.absolutePosition())
  })
}

function destroy() {
  if (!currentStage) return
  currentStage.draggable(false)
  currentStage.off('dragend')
}

export default {
  create,
  destroy,
}
