import config from './config'

let positionIndex = -1

export function addGraphic(graphic) {
  // 有游标在中间，执行过还原操作，丢弃游标后面的数据
  if (positionIndex !== -1) {
    config.cacheGraphics.slice(0, positionIndex + 1)
    // 更新组建的删除标记，保存到后台
  }
  config.cacheGraphics.push(graphic)
}

export function clearCache() {
  config.cacheGraphics = []
  positionIndex = -1
}

export function goAhead() {
  // const positionIndex = config.cacheGraphics.length
}

export function back() {
  // const positionIndex = cacheGraphics.length - 1
  // const layer = config.layerManager[config.layerIds.REMARK_LAYER]
  // getGrphicById(cacheGraphics.id).visible(false)
}

export default {
  addGraphic,
  clearCache,
  goAhead,
  back,
}
