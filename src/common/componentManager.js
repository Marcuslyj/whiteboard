import config from './config'
import socketUtil from './socketUtil'

let positionIndex = -1
/**
 * 组件传递到后台的格式是  {"attrs":{"id":"1","x":98.5,"y":79,"fill":"green","width":100,"height":100},"className":"Rect",componentType:0,type:}  type:'pic' 'remark' 'text' 以及几种特殊组件
 * @param {*} graphic
 * @param {*} componentType
 */
function addComponent(graphic, componentType = 0) {
  const params = graphic.toObject()
  params.componentId = params.attrs.id
  params.componentType = componentType
  socketUtil.addComponent(JSON.stringify(params))
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

export default {
  addComponent,
  clearCache,
  goAhead,
  back,
}
