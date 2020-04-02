import config from '@common/config'
import {
  isFirefox, formateComponent, getURLBase64, base64UrlToBlob, blobToFile,
} from '@common/utils'
import Konva from 'konva'
import {
  imageService, fileService, api, fbId, unObs, socketEvent, webService,
} from '@common/common'
import pdfjsLib from 'pdfjsLib'
import image from '@common/tool/image'
import Vue from 'vue'
import syncArea from '@common/syncArea'
import socketUtil, { getSocket } from '@/common/socketUtil'
import cManager from '../componentManager'

/**
 * 正在查阅的pdf
 * @key pdf
 * @key viewport
 */
let docOpened
// 标记那些页面已经渲染
let pageSigned
let wacherDrag
let toolCanDrag = 'pan'
let elWrapper

export const getDocument = () => docOpened
export const getStage = () => config.board
// 多个转换板切换用，防止同时操作一个
export const getConvertCanvas = (() => {
  let index = -1
  return async (width, height) => {
    index++
    if (index >= config.convertCanvas.length) index = 0
    // 设置尺寸
    let canvas = config.convertCanvas[index]
    // 都在使用中，添加新的
    if (canvas.rendering && config.whiteboard) {
      canvas = await config.whiteboard.addConvertCanvas(index)
    }

    if (canvas.$$width !== width || canvas.$$height !== height) {
      canvas.size({ width, height })
      canvas.$$width = width
      canvas.$$height = height
    }
    return canvas
  }
})()
const getLayer = () => config.layerManager[config.layerIds.BG_LAYER]
const getDocumentPath = () => config.documentPath
let timerBroadcast
let timerScroll
let timerPostil
let postilErrorCount = 0
let shouldSavePostil = false
let postilSaving = false

function getElWrapper() {
  return elWrapper || document.querySelector('#board-container>.konvajs-content')
}


/**
 * 初始化文档
 * @param {*} documentId
 * @param {*} param1
 */
export async function init(documentId, documentPath) {
  // stage y
  let stage = getStage()
  stage.setAttrs({ x: 0 })

  config.documentId = documentId
  config.documentPath = documentPath
  config.mode = 'document'

  // 初始化前清掉相关数据
  destroy()
  docOpened = {}
  // 清屏
  clearBoard()

  // 载入文档
  let pdf = await open()

  // 监听工具变化设置是否可拖动
  wacherDrag = Vue.eventBus.$watch(
    function () {
      return config.activeTool
    },
    function () {
      if (stage) {
        stage.setAttrs({
          // 可拖动：是主讲且工具是'pan'
          draggable: config.activeTool === toolCanDrag && config.speakerPermission,
        })
      }
    },
  )

  return pdf
}

/**
 * 清屏
 */
export function clearBoard() {
  Object.values(config.layerIds).map((v) => {
    config.layerManager[v].removeChildren()
  })
  // 触发画板重绘
  if (config.board) config.board.draw()
}

/**
 * 销毁相关事件
 */
export function destroy({ all = false } = {}) {
  if (docOpened) {
    let stage = getStage()
    docOpened = pageSigned = elWrapper = null
    stage.off('wheel dragmove')
    stage.setAttrs({
      y: 0,
    })
    if (wacherDrag) wacherDrag()
    watchPostil.clear()
    unObs.postilsToUpdate = new Set()
    getSocket().off(socketEvent.getDocumentPages)
    // 记录待更新页码
    Vue.eventBus.$off('updatePostil')
    Vue.eventBus.$off('savePostil')
    Vue.eventBus.$off('goPage')
    postilErrorCount = 0
    shouldSavePostil = false
    postilSaving = false
    elWrapper = null
    if (all) {
      let el = getElWrapper()
      if (el) el.classList.remove('invisible')
    }
  }
}

/**
 * 加载pdf
 * @param {*} param0
 */
export async function loadPdf({ url, documentId }) {
  let pdf

  if (url) {
    if (process.env.NODE_ENV === 'development' && url.indexOf(fileService) !== 0) {
      url = `${fileService}${url}`
    } else if (!/^((ht|f)tps?):\/\//.test(url)) {
      url = `${fileService}${url}`
    }
    pdf = await pdfjsLib.getDocument(url).promise
  } else if (documentId) {
    //
  }

  return pdf
}

export function formatCoverUrl(url) {
  if (!/^((ht|f)tps?):\/\//.test(url)) {
    url = `${imageService}${url}`
  }
  return url
}

/**
 * 获取转换图片
 * @param {*} pdf
 * @param {*} param1
 */
export async function getConvertImage({
  pdf, page, pageIndex = 1, type = 'file', viewport,
}) {
  page = page || await pdf.getPage(pageIndex)
  viewport = viewport || await getViewport({ pdf, page })
  const { width, height } = viewport

  // 获取转换画板，设置转换画板尺寸
  const convertCanvas = await getConvertCanvas(width, height)
  convertCanvas.rendering = true
  const renderContext = {
    canvasContext: convertCanvas.layer.getContext(),
    viewport,
  }
  // 渲染
  await page.render(renderContext).promise
  const imgUrl = convertCanvas.layer.canvas._canvas.toDataURL()
  // convertCanvas.destroyChildren()
  convertCanvas.clear()
  convertCanvas.rendering = false
  return type === 'file' ? blobToFile(base64UrlToBlob(imgUrl))
    : type === 'html'
      ? (new Promise((resolve) => {
        let img = new Image()
        img.src = imgUrl
        img.onload = () => {
          resolve(img)
        }
      })) : imgUrl
}

/**
 * 文档cover添加到首页
 * @param {*} pdf
 * @param {*} param1
 */
export async function addCover(pdf, {
  documentPath, documentId, componentId,
}) {
  let stage = getStage()
  const page = await pdf.getPage(1)
  const viewport = await getCoverViewport({ pdf, page })
  const img = await getConvertImage({ pdf, pageIndex: 1 })

  // 还原缩放和偏移的处理
  // 封面宽度是baseWidth/10
  const widthSafe = Math.floor(0.9 * config.baseWidth)
  const heightSafe = Math.floor((stage.height() / config.scale - (0.1 * config.baseWidth * viewport.height) / viewport.width))
  const x = Math.floor(Math.random() * widthSafe - stage.getAttr('x') / config.scale)
  const y = Math.floor(Math.random() * heightSafe - stage.getAttr('y') / config.scale)

  // 上传封面图片
  let result = await new Promise((resolve, reject) => {
    let param = new FormData()
    param.append('fbId', fbId.docCover)
    param.append('file', img)
    Vue.prototype.$api.post(
      api.upload,
      param,
      (res) => resolve(res),
      (err) => reject(err),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        baseURL: webService,
      },
    )
  })
  if (result && Number(result.ret.retCode) === 0) {
    let options = {
      id: componentId,
      documentId,
      documentPath,
      x,
      y,
      componentType: '1',
      type: 'cover',
      imgUrl: result.data.filePath,
    }
    await addCoverImage(options, true)
  }
}

export async function addCoverImage(options, broadcast = false) {
  let layer = getLayer()
  // 屏幕宽度十分之一
  options.width = Math.floor(config.baseWidth / 10)
  delete options.height
  // 是否可拖动
  options.draggable = !!config.speakerPermission
  let img = new Image()
  img.src = await getURLBase64(formatCoverUrl(options.imgUrl))
  await new Promise((resolve) => {
    img.onload = () => {
      options.height = (img.height * options.width) / img.width
      resolve()
    }
  })
  options.image = img

  let konvaImage = image.create(layer, options)
  if (config.speakerPermission) {
  // 事件
    // konvaImage.on('mouseover', ({ target }) => {
    //   target.contrast(20)
    //   layer.draw()
    // })
    // konvaImage.on('mouseout', ({ target }) => {
    //   target.contrast(0)
    //   layer.draw()
    // })
    konvaImage.on('click tap', () => {
      // 跳转文档模式
      openDocument({
        documentId: konvaImage.getAttr('documentId'),
        documentPath: konvaImage.getAttr('documentPath'),
      })
    })
    konvaImage.on('dragend', () => {
      let params = {
        componentType: '1',
        component: JSON.stringify(Object.assign(konvaImage.toObject(), { type: 'cover' })),
        componentId: konvaImage.getAttr('id'),
      }
      socketUtil.updateComponent(formateComponent(params))
    })
    // 同步操作
    if (broadcast) cManager.addComponent(JSON.parse(konvaImage.toJSON()), 1, 'cover')
  }

  return konvaImage
}

/**
 * 跳转document
 * @param {} document
 */
export function openDocument({ documentId, documentPath }) {
  // 清空缓存操作队列
  cManager.clearCache()
  // 激活工具重新配置成钢笔
  config.activeTool = 'pan'
  // 同步动作
  // 1.设置全局信息
  let syncAction = {
    ...config.syncAction,
    documentId,
    documentPath,
  }
  socketUtil.syncAction({
    meetingId: config.meetingId,
    syncAction: JSON.stringify(syncAction),
  })
  // 2.主讲先跳转,添加必要特殊组件
  config.toggleRouter = !config.toggleRouter
}


/**
 * 打开文档
 */
export async function open() {
  let documentPath = getDocumentPath()
  let stage = getStage()

  // 参数暂时是文档地址
  let pdf = await loadPdf({
    url: documentPath,
  })
  docOpened.pdf = pdf
  let viewport = await getViewport()
  docOpened.viewport = viewport

  enableScroll()

  // 加载文档
  pageSigned = {}
  // 渲染页面
  renderPages()

  // 记录待更新页码
  cachePostils(stage, viewport, pdf)
  Vue.eventBus.$on('savePostil', () => {
    if (!docOpened.viewport) { return }
    if (postilSaving) {
      Vue.prototype.$Message.success('正在保存')
      shouldSavePostil = true
    } else if (!unObs.postilsToUpdate.size) {
      // alert
      Vue.prototype.$Message.success('保存成功')
    } else {
      Vue.prototype.$Message.success('正在保存')
      shouldSavePostil = true
      flushPostils(true)
    }
  })

  // 定时检查待更新批注页
  watchPostil.watch()
  // 事件监听
  Vue.eventBus.$on('goPage', (pageNum) => {
    if (docOpened && config.mode === 'document') {
      stage.setAttrs({
        y: -(pageNum - 1) * viewport.height,
      })
      stage.draw()
      renderPages()
      broadcastScroll()
    }
  })

  // 返回pdfjs对象
  return pdf
}

// 获取可视区中涉及页面
function getRangeToRender({
  stage, viewport, pdf, target,
}) {
  const y = Math.abs(stage.getAttr('y'))
  const from = Math.floor(y / viewport.height) + 1
  let to = from
  let stageHeight = stage.height()
  let leftPageHeight
  let leftHeight
  // 页高度大于stage高度
  if (stageHeight <= viewport.height) {
    // 展示页剩余的高度小于窗口高度
    leftPageHeight = y > 0 ? viewport.height - (y % viewport.height) : viewport.height
    if (leftPageHeight < stageHeight) {
      to = from + 1
      if (!target) target = leftPageHeight < stageHeight * 0.5 ? to : from
    }
  } else {
    leftPageHeight = y >= viewport.height ? viewport.height - (y % viewport.height) : viewport.height - y
    leftHeight = stageHeight - leftPageHeight
    let leftCount = Math.ceil(leftHeight / viewport.height)
    to = from + leftCount
    if (!target) target = leftPageHeight < viewport.height * 0.3 ? (from + 1) : from
  }
  target = target || from
  to = Math.min(to, pdf.numPages)
  target = Math.min(target, pdf.numPages)
  return { from, to, target }
}

// 缓存待更新批注页面
function cachePostils(stage, viewport, pdf) {
  unObs.postilsToUpdate = new Set()
  // 监听事件
  getSocket().on(socketEvent.getDocumentPages, (res) => {
    // 合并待更新
    if (res && res.length) unObs.postilsToUpdate = new Set(Array.from(unObs.postilsToUpdate).concat(res))
    // 检查是否需要同步
    flushPostils()
  })
  // 获取上次未同步的
  socketUtil.getDocumentPages()


  Vue.eventBus.$on('updatePostil', () => {
    let { from, to } = getRangeToRender({ stage, viewport, pdf })

    // 中等粒度记录当前可视区的页码
    for (let i = from; i <= to; i++) {
      unObs.postilsToUpdate.add(i)
    }

    // 后台记录待更新页码
    let params = {}
    params.updateStates = Array.from(unObs.postilsToUpdate)
    socketUtil.reportDocumentAction(params)

    // 带刷新页面超过5个刷一遍
    flushPostils()
  })
}

// 同步批注
function flushPostils(immediate) {
  // 立刻或者待同步页面超过五个刷一遍
  if (unObs.postilsToUpdate && (immediate || unObs.postilsToUpdate.size > 5)) {
    postilSaving = true
    // flushing = true
    // 停止定时器
    watchPostil.clear()
    // flush
    const { viewport } = docOpened
    const stage = getStage()

    let que = Array.from(unObs.postilsToUpdate)
    unObs.postilsToUpdate = new Set()

    let results = []
    let count = 0

    que.forEach(async (index) => {
      await renderPage({ from: index, to: index })
      // 截图
      let scrollTop = Math.abs(stage.getAttr('y'))
      let top = (index - 1) * viewport.height
      let y

      y = top - scrollTop

      // 转图片
      try {
        await new Promise((resolve) => {
          stage.toImage({
            callback(_img) {
              results.push({ img: _img, index })
              count++
              resolve()
            },
            y,
            height: viewport.height,
          })
        })
      } catch (error) {
        count++
        // 重新添加到待更新队列
        unObs.postilsToUpdate.add(index)
      } finally {
        if (count === que.length) {
          uploadPostils(results)
        }
      }
    })

    // 重新开始定时器
    watchPostil.watch()
  } else if (immediate) {
    watchPostil.watch()
  }
}

// 上传批注页面
async function uploadPostils(datas) {
  if (!datas || datas.length === 0) {
    postilSaving = false
    // flushing = false
    return
  }
  let param = new FormData()
  param.append('fbId', fbId.postil)
  let imgs = datas.map((d) => blobToFile(base64UrlToBlob(d.img.src)))
  imgs.map((img) => {
    param.append('file', img)
  })

  // 上传图片
  let result
  try {
    result = await new Promise((resolve, reject) => {
      Vue.prototype.$api.post(
        api.batchUpload,
        param,
        (res) => resolve(res),
        (err) => reject(err),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          baseURL: webService,
        },
      )
    })
    result = result.data
    // 通知替换图片
    let paramsRpm = {}
    paramsRpm.urls = []
    if (result && result.length) {
      paramsRpm.urls = result.map((r, i) => ({
        pageNum: datas[i].index,
        url: r.filePath,
      }))
      paramsRpm.updateStates = Array.from(unObs.postilsToUpdate)
      // 通知替换
      // 更新待同步批注页码
      socketUtil.reportDocumentAction(paramsRpm)
      postilSaving = false
      if (shouldSavePostil) {
        if (unObs.postilsToUpdate.size) {
          flushPostils(true)
        } else {
          // 批注保存成功
          shouldSavePostil = false
          Vue.prototype.$Message.success('批注保存成功')
        }
      }
      postilSaving = false
    }

    // flushing = false
  } catch (error) {
    postilErrorCount++
    if (postilErrorCount > 5) {
      setTimeout(() => {
        postilErrorCount = 0
      }, 60000)
      return
    }
    // 重新处理
    datas.map((data) => {
      unObs.postilsToUpdate.add(data.index)
    })
    postilSaving = false
    flushPostils(true)
  }
}

// 定时检查postil que
let watchPostil = {
  clear() {
    clearTimeout(timerPostil)
  },
  watch() {
    // 2分钟同步一次
    clearTimeout(timerPostil)
    timerPostil = setTimeout(() => {
      flushPostils(true)
    }, 1000 * 60 * 1)
  },
}

/**
 * 文档可滚动
 * @param {boolean} enable
 */
export function enableScroll(enable = true) {
  const { pdf, viewport } = docOpened
  const stage = getStage()
  if (!stage || !pdf || !viewport) return

  const firefox = isFirefox()

  if (enable) {
    const maxScrollY = 0
    // 考虑每一页的大小一致情况
    const minScrollY = -1 * (pdf.numPages * viewport.height - stage.height())
    stage.setAttrs({
      // select tool fired，stage set draggable true
      // draggable: this.toolConfig.currentTool === 'select',
      draggable: toolCanDrag === config.activeTool && config.speakerPermission,
      dragBoundFunc(pos) {
        return {
          x: this.absolutePosition().x,
          y: pos.y > 0 ? 0 : (pos.y < minScrollY ? minScrollY : pos.y),
        }
      },
    })

    if (config.speakerPermission) {
    // 滚轮滚动
      stage.on('wheel dragmove', (ev) => {
        let { from, to, target } = getRangeToRender({
          stage, viewport, pdf,
        })
        // 通知document-navigator组件
        Vue.eventBus.$emit('pageScroll', { from, to, target })

        clearTimeout(timerScroll)
        let { type } = ev
        if (type === 'wheel') {
          let { deltaY } = ev.evt
          // 火狐浏览器兼容
          deltaY *= firefox ? -30 : -1

          let y = stage.getAttr('y') + deltaY
          if (y > maxScrollY) {
            y = maxScrollY
          } else if (y < minScrollY) {
            y = minScrollY
          }
          stage.setAttrs({ y })
          // 绘制
          stage.draw()
        }

        timerScroll = setTimeout(() => {
          // 加载页面
          renderPages()
          // 触发副屏滚动
          broadcastScroll()
        }, 300)
      })
    }
  } else {
    stage.off('wheel dragmove')
  }
}

function broadcastScroll() {
  clearTimeout(timerBroadcast)
  timerBroadcast = setTimeout(() => {
    let stage = getStage()
    let stageXY = {
      x: stage.getAttr('x') / config.scale,
      y: stage.getAttr('y') / config.scale,
    }
    syncArea.updateStageXY(stageXY)
  }, 300)
}

/**
 * 获取文档封面viewport
 * @param {*} page
 */
async function getCoverViewport({ pdf, page }) {
  // 封面宽度，屏宽1600对应160,即画布宽度十分之一
  // baseWidth的十分之一,最小宽度暂定300
  const width = Math.max(Math.floor(config.baseWidth / 10), 300)
  return getViewport({ pdf, width, page })
}

// 获取与stage尺寸一致的viewport
export async function getViewport({ pdf, width, page } = {}) {
  // let { pdf } = docOpened
  pdf = pdf || docOpened.pdf
  width = width || getStage().width()

  // 获取第一页
  const page1 = page || await pdf.getPage(1)
  let scale = 1
  let viewport = await page1.getViewport({ scale })
  // 修正viewport
  if (viewport.width !== width) {
    scale = width / viewport.width
    viewport = await page1.getViewport({
      scale,
    })
  }
  return viewport
}

// 按需添加页面
export async function renderPages({ ...args }) {
  let {
    pdf, viewport,
  } = docOpened
  const stage = getStage()
  let { from, to } = getRangeToRender({
    ...args, stage, viewport, pdf,
  })
  // // 通知document-navigator组件
  // Vue.eventBus.$emit('pageScroll', { from, to, target })
  await loopRender({ from, to })
}

// 加载所有页面
async function loopRender({ from, to }) {
  await renderPage({
    from, to, first: true,
  })
}
// 加载一页
async function renderPage({
  from, to, first,
}) {
  if (from > to) {
    return
  }
  if (pageSigned[from]) {
    from++
    renderPage({
      from, to,
    })
  } else {
    pageSigned[from] = true
    let {
      pdf, viewport,
    } = docOpened
    let layer = getLayer()

    const y = (from - 1) * viewport.height
    let img
    try {
      img = await getConvertImage({ pdf, pageIndex: from, type: 'html' })
      if (config.mode === 'document') {
        const imgK = new Konva.Image({
          x: 0,
          y,
          image: img,
          width: viewport.width,
          height: viewport.height,
          // 白底,防止透明背景
          fill: '#fff',
          stroke: '#ccc',
        })
        layer.add(imgK)
        // 防止已经destroy
        if (!pageSigned) return
        layer.draw()
      }
    } catch (error) {
      pageSigned[from] = false
    }
    from++
    renderPage({ from, to })
  }
  // 显示
  if (first) getElWrapper().classList.remove('invisible')
}

export default {
  addCover,
  loadPdf,
  init,
}
