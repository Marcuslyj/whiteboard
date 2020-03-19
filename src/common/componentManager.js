import syncArea from '@common/syncArea'
import { Message } from 'view-design'
import Vue from 'vue'
import config from './config'
import socketUtil from './socketUtil'
import { formateComponent } from './utils'


/**
 * 组件的加载移除等操作 (撤销，还原（需要一个队列管理。（新增，删除，组件缩放平移，组件复制，颜色更新））)
 */
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
 * @param {*} componentType   0 表示清屏需要删除（画笔数据） 1 清屏不需要删除（封面） 2 特殊组件
 */
function addComponent(graphic, componentType = 0, type = 'remark') {
  let params
  if (!config.hasValidComponent) {
    syncArea.updateBaseWidth(config.board.getAttr('width'))
  }
  params = {
    componentType,
    component: JSON.stringify(Object.assign(graphic, { type })),
    componentId: graphic.attrs.id,
  }
  pushCache({ graphic, opeType: 'addComponent', type })
  socketUtil.addComponent(formateComponent(params))
}

/**
 *
 * @param {*} componentId
 * @param {*} componentType
 * @param {*} state  0 删除   1 恢复/新增
 * @param {*} isCache 正常操作要缓存，撤销还原过程中，操作记录不需要缓存
 */
function updateComponentState(componentId, componentType = 0, state, isCache = true) {
  const params = {
    componentType,
    componentId,
    state,
  }
  isCache && pushCache({ graphic: { attrs: { id: componentId } }, state, opeType: 'updateComponentState' })
  socketUtil.updateComponentState(formateComponent(params))
}

/**
 *
 * @param {*} graphic
 * @param {*} componentType
 * @param {*} type
 * @param {*} isCache 正常操作要缓存，撤销还原过程中，操作记录不需要缓存
 * @param {*} oldGraphic 正常操作需要携带，撤销还原过程，不需要
 */
function updateComponent(graphic, componentType = 0, type = 'remark', isCache = true, oldGraphic) {
  let params = {
    componentType,
    component: JSON.stringify(Object.assign(graphic, { type })),
    componentId: graphic.attrs.id,
  }
  isCache && pushCache({
    oldGraphic, graphic, opeType: 'updateComponent', type,
  })
  socketUtil.updateComponent(formateComponent(params))
}

function clearCache() {
  config.cacheGraphics = []
  config.cPIndex = -1
}

// 撤销
function back() {
  if (config.cacheGraphics.length === 0 || config.cPIndex === -1) {
    Message.info('没有可撤销的')
    return
  }
  config.cPIndex === config.cacheGraphics.length && (config.cPIndex = config.cacheGraphics.length - 1)
  console.log(`config.cPIndex:${config.cPIndex}`)
  const cache = config.cacheGraphics[config.cPIndex]
  switch (cache.opeType) {
  case 'addComponent':
    // updateVisible(cache.graphic.attrs.id, false)
    updateComponentState(cache.graphic.attrs.id, 0, 0, false)
    break
  case 'updateComponent':
    renderUpdateComponent(cache.oldGraphic, cache.type)
    updateComponent(cache.oldGraphic, 0, cache.type, false)
    break
  case 'updateComponentState':
    // updateVisible(cache.graphic.attrs.id, cache.state === 0)
    updateComponentState(cache.graphic.attrs.id, 0, cache.state === 0 ? 1 : 0, false)
    break
  default:
    break
  }
  config.cPIndex--
}

// 还原，还原一个新增组件时如果另外一个端找不到就不还原了，新增会导致堆叠顺序不对
function goAhead() {
  if (config.cacheGraphics.length === 0 || config.cPIndex >= config.cacheGraphics.length) {
    Message.info('已经是最新的操作了')
    return
  }
  config.cPIndex === -1 && (config.cPIndex = 0)
  const cache = config.cacheGraphics[config.cPIndex++]
  console.log(`config.cPIndex:${config.cPIndex}`)
  switch (cache.opeType) {
  case 'addComponent':
    // updateVisible(cache.graphic.attrs.id, true)
    updateComponentState(cache.graphic.attrs.id, 0, 1, false)
    break
  case 'updateComponent':
    renderUpdateComponent(cache.graphic, cache.type)
    updateComponent(cache.graphic, 0, cache.type, false)
    break
  case 'updateComponentState':
    // updateVisible(cache.graphic.attrs.id, cache.state===1)
    updateComponentState(cache.graphic.attrs.id, 0, cache.state, false)
    break
  default:
    break
  }
}

// 普通画笔进行界面更新
function renderUpdateComponent(graphic, type) {
  const layer = type === 'remark' ? config.layerManager[config.layerIds.REMARK_LAYER] : config.layerManager[config.layerIds.TEXT_LAYER]
  const node = layer.findOne(`#${graphic.attrs.id}`)
  if (node) {
    // 批量设置，新状态缺失的transformed属性没有覆盖到node 旧状态。
    const states = [{ name: 'x', value: 0 }, { name: 'y', value: 0 }, { name: 'rotation', value: 0 }, { name: 'scaleX', value: 1 }, { name: 'scaleY', value: 1 }]
    let nAttrs = node.getAttrs()
    nAttrs = Object.assign(nAttrs, graphic.attrs)
    states.forEach((e) => {
      if (nAttrs[e.name] && !graphic.attrs[e.name]) {
        nAttrs[e.name] = e.value
      }
    })
    node.setAttrs(nAttrs)
    node.clearCache()
    layer.draw()
    node.className === 'Arrow' ? node.cache({ offset: 5 }) : node.cache()
  }
}

function clearLayer(...layers) {
  layers.forEach((layer) => {
    layer.destroyChildren()
    layer.draw()
  })
}

// 更新删除,回复状态，这里只更新界面
function updateVisible(componentId, visible) {
  const target = config.board.findOne(`#${componentId}`)
  if (target) {
    target.visible(visible)
    config.board.draw()
  }
}

// 推入缓存时，要做长度截断
function pushCache(obj) {
  // 有游标在中间，执行过还原操作，丢弃游标后面的数据
  if (config.cPIndex < config.cacheGraphics.length - 1) {
    config.cacheGraphics = config.cacheGraphics.slice(0, config.cPIndex + 1)
  }
  config.cacheGraphics.push(obj)
  config.cPIndex = config.cacheGraphics.length - 1
  console.log(config.cPIndex)
}

export default {
  addComponent,
  updateComponentState,
  updateComponent,
  clearCache,
  back,
  goAhead,
  clearLayer,
  updateVisible,
  renderUpdateComponent,
}
