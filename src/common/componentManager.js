import config from './config'
import socketUtil from './socketUtil'

let positionIndex = -1
/**
 * 组件传递到后台的格式是
 *  {
 *    componentType,
 *    component:{attrs,className,type},
 *    componentId，
 *    meetingId，
 *    whiteboardId，
 *    documentId
 *  }
 * @param {*} graphic
 * @param {*} componentType   0 表示清屏需要删除（画笔数据）    1 清屏不需要删除（封面）
 */
function addComponent(graphic, componentType = 0, type = 'remark') {
  const params = {
    componentType,
    component: JSON.stringify(Object.assign(graphic.toObject(), { type })),
    componentId: graphic.getAttr('id'),
  }
  socketUtil.addComponent(formateComponent(params))
  // 有游标在中间，执行过还原操作，丢弃游标后面的数据
  if (positionIndex !== -1) {
    config.cacheGraphics.slice(0, positionIndex + 1)
    // 更新组建的删除标记，保存到后台
  }
  config.cacheGraphics.push(graphic)
}

function clearCache() {
  config.cacheGraphics = []
  positionIndex = -1
}

function goAhead() {
  // const positionIndex = config.cacheGraphics.length
}

function back() {
  // const positionIndex = cacheGraphics.length - 1
  // const layer = config.layerManager[config.layerIds.REMARK_LAYER]
  // getGrphicById(cacheGraphics.id).visible(false)
}

function formateComponent(obj) {
  const { meetingId, whiteboardId, documentId } = config
  Object.assign(obj, {
    meetingId,
    whiteboardId,
    documentId,
  })
  return obj
}

function clearLayer(...layers) {
  layers.forEach((layer) => {
    layer.destroyChildren()
    layer.draw()
  })
}

export default {
  addComponent,
  clearCache,
  goAhead,
  back,
  clearLayer,
}
