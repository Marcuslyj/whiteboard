import config from '@common/config'
import { isFirefox } from '@common/utils'
import Konva from 'konva'
import {
  imageService, fileService, api, fbId,
} from '@common/common'
import pdfjsLib from 'pdfjsLib'
import bus from '@common/eventBus'
import { debounce } from 'throttle-debounce'
import image from '@common/tool/image'
import Vue from 'vue'
import cManager from '../componentManager'

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
let rendering = false
let showCount = 1
let wacherDrag
let toolCanDrag = 'pan'
let elWrapper
const getStage = () => config.board
const getConvertCanvas = () => config.convertCanvas
const getLayer = () => config.layerManager[config.layerIds.BG_LAYER]
const getDocumentId = () => config.documentId
const getDocumentPath = () => config.documentPath
/**
 * 防抖
 */
let resizeDebounce = function () {
  if (config.mode !== 'document') return
  getElWrapper().classList.add('invisible')
  _resizeDebounce()
}
let _resizeDebounce = debounce(300, () => {
  onResize()
})

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
  stage.setAttrs({ y: 0 })

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

  // 画布大小改变
  bus.$on('resize', resizeDebounce)
  // 监听工具变化设置是否可拖动
  wacherDrag = bus.$watch(
    function () {
      return config.activeTool
    },
    function () {
      let stage = getStage()
      if (stage) {
        stage.setAttrs({
          draggable: config.activeTool === toolCanDrag,
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
    rendering = false
    showCount = 1

    stage.off('wheel dragmove')
    stage.setAttrs({
      y: 0,
    })
    bus.$off('resize', resizeDebounce)
    if (wacherDrag) wacherDrag()
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
  const convertCanvas = getConvertCanvas()


  // 设置转换画板尺寸
  convertCanvas.size({
    width,
    height,
  })
  const renderContext = {
    canvasContext: convertCanvas.layer.getContext(),
    viewport,
  }

  // 还原缩放和偏移的处理
  const widthSafe = Math.floor((config.baseWidth - viewport.width) - stage.getAttr('x') / config.scale)
  const heightSafe = Math.floor((stage.height() / config.scale - viewport.height) - stage.getAttr('y') / config.scale)
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
  // debugger
  let layer = getLayer()
  // 屏幕宽度十分之一
  options.width = Math.floor(config.baseWidth / 10)
  delete options.height
  // 是否可拖动
  options.draggable = !!config.isSpeaker
  let img = new Image()
  img.src = formatCoverUrl(options.imgUrl)

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
    konvaImage.on('mouseover', ({ target }) => {
      target.contrast(20)
      layer.draw()
    })
    konvaImage.on('mouseout', ({ target }) => {
      target.contrast(0)
      layer.draw()
    })
    konvaImage.on('click tap', () => {
    // 传文档id
    // open(documentId, { stage, layer, convertCanvas })
      init(options.documentId, options.documentPath)
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
  let convertCanvas = getConvertCanvas()

  // 参数暂时是文档地址
  let pdf = await loadPdf({
    // url: documentId._transport._params.url.substring(documentId._transport._params.url.indexOf('/file')),
    url: documentPath,
  })
  docOpened.pdf = pdf
  let viewport = await getViewport()
  docOpened.viewport = viewport

  enableScroll()

  // 按图片大小设置
  convertCanvas.size({
    width: viewport.width,
    height: viewport.height,
  })

  // 加载文档
  pageSigned = {}
  // 可视区能展示几页
  showCount = Math.ceil(stage.height() / viewport.height)
  // 渲染页面
  renderPages()
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
      draggable: toolCanDrag === config.activeTool,
      dragBoundFunc(pos) {
        return {
          x: this.absolutePosition().x,
          y: pos.y > 0 ? 0 : (pos.y < minScrollY ? minScrollY : pos.y),
        }
      },
    })

    // 滚轮滚动
    stage.on('wheel dragmove', (ev) => {
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
      // 加载页面
      renderPages()
    })
  } else {
    stage.off('wheel dragmove')
  }
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
  // baseWidth的十分之一,最小宽度暂定200
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
function renderPages() {
  if (rendering) return
  rendering = true

  let {
    pdf, viewport,
  } = docOpened
  const stage = getStage()

  const y = Math.abs(stage.getAttr('y'))
  const from = Math.floor(y / viewport.height) + 1
  const to = Math.min(Math.ceil(from + showCount), pdf.numPages)
  loopRender({ from, to })
}

// 加载所有页面
function loopRender({ from, to }) {
  let {
    viewport,
  } = docOpened
  let convertCanvas = getConvertCanvas()

  const context = convertCanvas.layer.getContext()
  let renderContext = {
    canvasContext: context,
    viewport,
  }

  renderPage({
    renderContext, from, to, first: true,
  })
  renderContext = viewport = null
}
// 加载一页
async function renderPage({
  renderContext, from, to, first,
}) {
  if (from > to) {
    rendering = false
    return
  }
  if (pageSigned[from]) {
    from++
    renderPage({
      renderContext, from, to,
    })
  } else {
    let {
      pdf, viewport,
    } = docOpened
    let convertCanvas = getConvertCanvas()
    let layer = getLayer()

    const y = (from - 1) * viewport.height
    let page = await pdf.getPage(from)
    await page.render(renderContext).promise
    page = null

    let imgUrl = convertCanvas.layer.canvas._canvas.toDataURL()
    let img = new Image()
    img.src = imgUrl
    img.onload = () => {
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
      renderPage({ renderContext, from, to })

      imgUrl = img = pdf = viewport = renderContext = null
    }
  }
  // 显示
  if (first) getElWrapper().classList.remove('invisible')
}
/**
 * resize
 */
function onResize() {
  init(config.documentId, config.documentPath)
}

export default {
  addCover,
  loadPdf,
  init,
}
