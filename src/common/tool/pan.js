function create(params) {
  const { stage } = params
  stage.draggable(true)
}

function destroy(params) {
  const { stage } = params
  stage.draggable(false)
}

export default {
  create,
  destroy,
}
