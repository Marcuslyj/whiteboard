import config from '@common/config'
import { isFirefox, formateComponent, getURLBase64 } from '@common/utils'
import Konva from 'konva'
import {
  imageService, fileService, api, fbId,
} from '@common/common'
import pdfjsLib from 'pdfjsLib'
// import { debounce } from 'throttle-debounce'
import image from '@common/tool/image'
import Vue from 'vue'
import syncArea from '@common/syncArea'
import cManager from '../componentManager'
import socketUtil from '@/common/socketUtil'


/**
 * 正在查阅的pdf
 * @key pdf
 * @key stage
 * @key viewport
 * @key layer
 * @key convertCanvas
 */
let docOpened
let pageSigned
// let rendering = false
let wacherDrag
let toolCanDrag = 'pan'
let elWrapper
let postilsToUpdate = new Set()

const getStage = () => config.board
// 多个转换板切换用，防止同时操作一个
const getConvertCanvas = (() => {
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
// const getDocumentId = () => config.documentId
const getDocumentPath = () => config.documentPath
let timerBroadcast
let timerScroll
/**
 * 防抖
 */
// let resizeDebounce = function () {
//   // if (config.mode !== 'document') return
//   // getElWrapper().classList.add('invisible')
//   // _resizeDebounce()
// }
// let _resizeDebounce = debounce(500, () => {
//   onResize()
// })

function getElWrapper() {
  return elWrapper || document.querySelector('#board-container>.konvajs-content')
}


/**
 * 初始化文档
 * @param {*} documentId
 * @param {*} param1
 */
export function init(documentId, documentPath) {
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
  open()

  // 监听工具变化设置是否可拖动
  wacherDrag = Vue.eventBus.$watch(
    function () {
      return config.activeTool
    },
    function () {
      if (stage) {
        stage.setAttrs({
          // 可拖动：是主讲且工具是'pan'
          draggable: config.activeTool === toolCanDrag && config.isSpeaker,
        })
      }
    },
  )
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
    // rendering = false
    stage.off('wheel dragmove')
    stage.setAttrs({
      y: 0,
    })
    if (wacherDrag) wacherDrag()
    // 记录待更新页码
    Vue.eventBus.$off('updatePostil')
    if (all) {
      getElWrapper().classList.remove('invisible')
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


function convertBase64UrlToBlob(urlData) {
  let bytes = window.atob(urlData.split(',')[1]) // 去掉url的头，并转换为byte

  // 处理异常,将ascii码小于0的转换为大于0

  let ab = new ArrayBuffer(bytes.length)

  let ia = new Uint8Array(ab)

  for (let i = 0; i < bytes.length; i++) {
    ia[i] = bytes.charCodeAt(i)
  }

  return new Blob([ab], {

    type: 'image/png',

  })
}
/**
 * 文档cover添加到首页
 * @param {*} pdf
 * @param {*} param1
 */
export async function addCover(pdf, {
  documentPath, documentId,
}) {
  let stage = getStage()
  const page = await pdf.getPage(1)
  const viewport = getCoverViewport(page)
  const { width } = viewport
  const { height } = viewport
  // 获取转换画板，设置转换画板尺寸
  const convertCanvas = await getConvertCanvas(width, height)

  const renderContext = {
    canvasContext: convertCanvas.layer.getContext(),
    viewport,
  }

  // 还原缩放和偏移的处理
  // 封面宽度是baseWidth/10
  const widthSafe = Math.floor(0.9 * config.baseWidth - stage.getAttr('x') / config.scale)
  const heightSafe = Math.floor((stage.height() / config.scale - (0.1 * config.baseWidth * viewport.height) / viewport.width) - stage.getAttr('y') / config.scale)
  const x = Math.floor(Math.random() * widthSafe)
  const y = Math.floor(Math.random() * heightSafe)

  const render = async (_page, _renderContext) => {
    await _page.render(_renderContext).promise
    const imgUrl = convertCanvas.layer.canvas._canvas.toDataURL()
    // 上传封面图片
    let result = await new Promise((resolve, reject) => {
      let param = new FormData()
      param.append('fbId', fbId.docCover)
      param.append('file', convertBase64UrlToBlob(imgUrl))
      Vue.prototype.$api.post(
        api.upload,
        param,
        (res) => resolve(res),
        (err) => reject(err),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )
    })
    if (result && Number(result.ret.retCode) === 0) {
      let options = {
        documentId,
        documentPath,
        x,
        y,
        componentType: '1',
        type: 'cover',
        imgUrl: result.data.filePath,
      }
      addCoverImage(options, true)
    }
  }
  // 渲染
  render(page, renderContext)
}

export async function addCoverImage(options, broadcast = false) {
  let layer = getLayer()
  // 屏幕宽度十分之一
  options.width = Math.floor(config.baseWidth / 10)
  delete options.height
  // 是否可拖动
  options.draggable = !!config.isSpeaker
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
  if (config.isSpeaker) {
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
      // 获取白板批注

      // 清空缓存操作队列
      cManager.clearCache()

      // 同步动作
      // 1.设置全局信息
      let syncAction = config.syncAction || {}
      syncAction.documentId = konvaImage.getAttr('documentId')
      syncAction.documentPath = konvaImage.getAttr('documentPath')
      socketUtil.syncAction({
        meetingId: config.meetingId,
        syncAction: JSON.stringify(syncAction),
      })
      // 2.主讲先跳转,添加必要特殊组件
      config.toggleRouter = !config.toggleRouter
      // 不需要广播，主屏whiteboard重新初始化已经通知
      // // 3.广播
      // socketUtil.broadcast({ meetingId: config.meetingId, msg: JSON.stringify({ event: 'refresh' }) })
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
    if (broadcast) cManager.addComponent(konvaImage, 1, 'cover')
  }

  return konvaImage
}


/**
 * 打开文档
 */
export async function open() {
  let documentPath = getDocumentPath()
  let stage = getStage()

  // 参数暂时是文档地址
  let pdf = await loadPdf({
    // url: documentId._transport._params.url.substring(documentId._transport._params.url.indexOf('/file')),
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
}

// 获取可视区中涉及页面
function getRangeToRender(stage, viewport, pdf) {
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
    }
  } else {
    leftPageHeight = y >= viewport.height ? viewport.height - (y % viewport.height) : viewport.height - y
    leftHeight = stageHeight - leftPageHeight
    let leftCount = Math.ceil(leftHeight / viewport.height)
    to = from + leftCount
  }

  to = Math.min(to, pdf.numPages)
  return { from, to }
}

// 缓存待更新批注页面
function cachePostils(stage, viewport, pdf) {
  Vue.eventBus.$on('updatePostil', () => {
    let { from, to } = getRangeToRender(stage, viewport, pdf)

    // 中等粒度记录当前可视区的页码
    for (let i = from; i <= to; i++) {
      postilsToUpdate.add(i)
    }

    // 截图

    // if (postilsToUpdate.size > 0) {
    //   Array.from(postilsToUpdate).forEach(async (index) => {
    //     await renderPage({ from: index, to: index })
    //     // 截图
    //     let scrollTop = Math.abs(stage.getAttr('y'))
    //     let top = (index - 1) * viewport.height
    //     let y

    //     y = top - scrollTop

    //     setTimeout((function (_index, _y) {
    //       return async () => {
    //         await stage.toImage({
    //           callback(img) {
    //             console.log(_index, _y, viewport.height)
    //             console.log(img.src)
    //             let ii = new Image()
    //             ii.src = img.src
    //             document.querySelector('body').append(ii)
    //           },
    //           y: _y,
    //           height: viewport.height,
    //         })
    //       }
    //     }(index, y)), 1000 * index)
    //   })
    // }
  })
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
      draggable: toolCanDrag === config.activeTool && config.isSpeaker,
      dragBoundFunc(pos) {
        return {
          x: this.absolutePosition().x,
          y: pos.y > 0 ? 0 : (pos.y < minScrollY ? minScrollY : pos.y),
        }
      },
    })

    if (config.isSpeaker) {
    // 滚轮滚动
      stage.on('wheel dragmove', (ev) => {
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
function getCoverViewport(page) {
  let viewport = page.getViewport({
    scale: 1,
  })
  // const stage = getStage()
  // 封面宽度，屏宽1600对应160,即画布宽度十分之一
  // baseWidth的十分之一,最小宽度暂定300
  const width = Math.max(Math.floor(config.baseWidth / 10), 300)
  if (viewport.width !== width) {
    viewport = page.getViewport({
      // width * 1 / viewport.width
      scale: width / viewport.width,
    })
  }
  return viewport
}

// 获取与stage尺寸一致的viewport
async function getViewport() {
  let { pdf } = docOpened
  let stage = getStage()

  // 获取第一页
  const page1 = await pdf.getPage(1)
  let scale = 1
  let viewport = await page1.getViewport({ scale })
  // 修正viewport
  if (viewport.width !== stage.width()) {
    scale = stage.width() / viewport.width
    viewport = await page1.getViewport({
      scale,
    })
  }
  return viewport
}

// 按需添加页面
export function renderPages() {
  // if (rendering) return
  // rendering = true

  let {
    pdf, viewport,
  } = docOpened
  const stage = getStage()
  let { from, to } = getRangeToRender(stage, viewport, pdf)
  loopRender({ from, to })
}

// 加载所有页面
function loopRender({ from, to }) {
  renderPage({
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
    let {
      pdf, viewport,
    } = docOpened
    let convertCanvas = await getConvertCanvas(viewport.width, viewport.height)

    convertCanvas.rendering = true
    const context = convertCanvas.layer.getContext()
    let renderContext = {
      canvasContext: context,
      viewport,
    }
    let layer = getLayer()

    const y = (from - 1) * viewport.height
    let page = await pdf.getPage(from)
    await page.render(renderContext).promise
    page = null

    let imgUrl = convertCanvas.layer.canvas._canvas.toDataURL()
    let img = new Image()
    img.src = imgUrl
    img.onload = () => {
      // 防止渲染到首页
      if (config.mode === 'document') {
        // 渲染完成后，rendering标志为false
        convertCanvas.rendering = false
        // 清图片
        convertCanvas.destroyChildren()

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
        pageSigned[from] = true

        layer.draw()

        from++
        renderPage({ from, to })

        imgUrl = img = pdf = viewport = renderContext = null
      }
    }
  }
  // 显示
  if (first) getElWrapper().classList.remove('invisible')
}
/**
 * resize
 */
// function onResize() {
// init(config.documentId, config.documentPath)
// }

// 定时截图上传
function updatePostil() {

}

export default {
  addCover,
  loadPdf,
  init,
}
