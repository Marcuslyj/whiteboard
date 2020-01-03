import config from '@common/config'
import { generateUID, isFirefox } from '@common/utils'
import Konva from 'konva'
import { fileService } from '@common/common'
import pdfjsLib from 'pdfjsLib'
import bus from '@common/eventBus'
import { debounce } from 'throttle-debounce'

// 考虑文档页面大小尺寸一致

// 正在查阅的pdf
// pdf,
// stage,
// viewport,
// layer,
// convertCanvas,
let docOpened
let pageSigned
let rendering = false
let showCount = 1
// 防抖
let resizeDebounce = debounce(300, function () {
  onResize()
})

// 初始化文档
export function init(docID, { stage, layer, convertCanvas }) {
  // 初始化前清掉相关数据
  destroy()
  // 缓存数据
  docOpened = {
    docID, stage, layer, convertCanvas,
  }
  // 清屏
  clearBoard()

  // 载入文档
  open()

  // 画布大小改变
  bus.$on('resize', resizeDebounce)
}

// 清屏
export function clearBoard() {
  Object.values(config.layerIds).map((v) => {
    config.layerManager[v].removeChildren()
  })
  // 触发画板重绘
  if (docOpened.stage) docOpened.stage.draw()
}

// 销毁相关事件
export function destroy() {
  if (docOpened) {
    let { stage } = docOpened
    docOpened = pageSigned = null
    rendering = false
    showCount = 1

    stage.off('wheel dragmove')
    stage.setAttrs({
      y: 0,
    })
    bus.$off('resize', resizeDebounce)
  }
}

// 加载pdf
export async function loadPdf({ url, docID }) {
  let pdf

  if (url) {
    if (url.indexOf(fileService) !== 0) {
      url = `${fileService}${url}`
    }
    pdf = await pdfjsLib.getDocument(url).promise
  } else if (docID) {
    //
  }

  return pdf
}

// 文档cover添加到首页
export async function addCover(pdf, { stage, layer, convertCanvas }) {
  // 接口获取文档id
  const docID = generateUID()

  const page = await pdf.getPage(1)
  const viewport = getCoverViewport(page)
  const { width } = viewport
  const { height } = viewport
  // 设置转换画板尺寸
  convertCanvas.size({
    width,
    height,
  })
  const renderContext = {
    canvasContext: convertCanvas.layer.getContext(),
    viewport,
  }

  const widthSafe = Math.floor((stage.width() - viewport.width) * 0.8)
  const heightSafe = Math.floor((stage.height() - viewport.height) * 0.8)
  const x = Math.floor(Math.random() * widthSafe)
  const y = Math.floor(Math.random() * heightSafe)

  const render = async (_page, _renderContext) => {
    await _page.render(_renderContext).promise
    const imgUrl = convertCanvas.layer.canvas._canvas.toDataURL()

    // 上传图片

    let img = new Image()
    img.src = imgUrl
    img.onload = () => {
      const imgK = new Konva.Image({
        id: docID,
        x,
        y,
        image: img,
        width,
        height,
        // 白底,防止透明背景
        fill: '#fff',
        stroke: '#ccc',
        draggable: true,
      })
      imgK.cache()
      imgK.filters([Konva.Filters.Contrast])

      layer.add(imgK)
      layer.draw()

      // 事件
      imgK.on('mouseover', ({ target }) => {
        target.contrast(20)
        layer.draw()
      })
      imgK.on('mouseout', ({ target }) => {
        target.contrast(0)
        layer.draw()
      })
      imgK.on('click tap', () => {
        // 传文档id
        // open(docID, { stage, layer, convertCanvas })
        init(pdf, { stage, layer, convertCanvas })
      })

      _page = _renderContext = img = null
    }
  }
  // 渲染
  render(page, renderContext)
}

// 打开文档
export async function open() {
  let {
    docID, stage, convertCanvas,
  } = docOpened

  // 参数暂时是文档地址
  // 本机测试
  let pdf = await loadPdf({
    url: docID._transport._params.url.substring(docID._transport._params.url.indexOf('/file')),
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

// 文档可滚动
export function enableScroll(enable = true) {
  const { stage, pdf, viewport } = docOpened
  const firefox = isFirefox()

  if (enable) {
    const maxScrollY = 0
    // 考虑每一页的大小一致情况
    const minScrollY = -1 * (pdf.numPages * viewport.height - stage.height())
    stage.setAttrs({
      // select tool fired，stage set draggable true
      // draggable: this.toolConfig.currentTool === 'select',
      draggable: true,
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
      const { layer, convertCanvas } = docOpened
      renderPages(pdf, { viewport, layer, convertCanvas })
    })
  } else {
    stage.off('wheel')
  }
}

// 获取文档封面viewport
function getCoverViewport(page) {
  let viewport = page.getViewport({
    scale: 1,
  })
  const stage = config.board
  // 封面宽度，屏宽1600对应160,即画布宽度十分之一
  const width = Math.floor(stage.width() / 10)
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
  let { pdf, stage } = docOpened
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
    pdf, stage, viewport,
  } = docOpened

  const y = Math.abs(stage.getAttr('y'))
  const from = Math.floor(y / viewport.height) + 1
  const to = Math.min(Math.ceil(from + showCount), pdf.numPages)
  loopRender({ from, to })
}

// 加载所有页面
function loopRender({ from, to }) {
  let {
    viewport, convertCanvas,
  } = docOpened

  const context = convertCanvas.layer.getContext()
  let renderContext = {
    canvasContext: context,
    viewport,
  }

  renderPage({ renderContext, from, to })
  renderContext = viewport = null
}
// 加载一页
async function renderPage({
  renderContext, from, to,
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
      pdf, viewport, convertCanvas, layer,
    } = docOpened
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
      pageSigned[from] = true

      if (from === to) {
        layer.batchDraw()
      }

      from++
      renderPage({ renderContext, from, to })

      imgUrl = img = pdf = viewport = renderContext = null
    }
  }
}
// resize
function onResize() {
  let {
    docID, stage, layer, convertCanvas,
  } = docOpened
  init(docID, { stage, layer, convertCanvas })
}

export default {
  addCover,
  loadPdf,
  open,
}
