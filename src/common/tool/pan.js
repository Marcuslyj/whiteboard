let currentStage
function create(params) {
  const { stage } = params
  currentStage = stage
  stage.draggable(true)
}

function destroy() {
  currentStage.draggable(false)
}

export default {
  create,
  destroy,
}
