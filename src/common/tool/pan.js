import syncArea from '@common/syncArea'
import config from '../config'


let currentStage
function create(params) {
  const { stage } = params
  currentStage = stage
  stage.draggable(true)
  stage.on('dragend', () => {
    const { x, y } = stage.absolutePosition()
    syncArea.updateStageXY({ x: x / config.scale, y: y / config.scale })
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
