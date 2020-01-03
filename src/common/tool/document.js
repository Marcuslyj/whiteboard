import config from '@common/config'
import { generateUID, isFirefox } from '@common/utils'
import Konva from 'konva'
import { fileService } from '@common/common'
import pdfjsLib from 'pdfjsLib'

// 正在查阅的pdf
let docOpened
let stageDoc
let pageSigned = {}
let rendering = false
let showCount = 1

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
  console.log(layer = config.layerManager.REMARK_LAYER)

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
      console.log(1)
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
        open(pdf, { stage, layer, convertCanvas })
      })

      _page = _renderContext = img = null
    }
  }
  // 渲染
  render(page, renderContext)
}

// 打开文档
export async function open(docID, { stage, layer, convertCanvas }) {
  // 参数暂时是文档地址

  // 清屏
  // stage.clear()
  Object.values(config.layerIds).map((v) => config.layerManager[v].removeChildren())
  stage.draw()
  // 记录文档stage
  stageDoc = stage

  // 本机测试
  let pdf = await loadPdf({
    url: docID._transport._params.url.substring(docID._transport._params.url.indexOf('/file')),
  })
  let viewport = await getViewport(pdf, { stage })

  docOpened = {
    pdf,
    viewport,
    layer,
    convertCanvas,
  }
  enableScroll()

  // 按图片大小设置
  convertCanvas.size({
    width: viewport.width,
    height: viewport.height,
  })

  // 加载文档
  pageSigned = {}
  showCount = (stageDoc.height() / viewport.height) + 1
  // stage.setAttrs({ y: -2000 })
  renderPages(pdf, { viewport, layer, convertCanvas })
  // 火狐内存泄露问题严重
  pdf = viewport = null
}

// 文档可滚动
export function enableScroll(enable = true) {
  const { pdf, viewport } = docOpened
  const stage = stageDoc
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
    stage.on('wheel', (ev) => {
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
async function getViewport(pdf, { stage }) {
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
function renderPages(pdf, { viewport, layer, convertCanvas }) {
  if (rendering) return
  rendering = true
  const stage = stageDoc
  const y = Math.abs(stage.getAttr('y'))
  const from = Math.floor(y / viewport.height) + 1
  const to = Math.min(Math.ceil(from + showCount), pdf.numPages)
  loopRender(pdf, {
    viewport, layer, convertCanvas, from, to,
  })
}

// 加载所有页面
function loopRender(pdf, {
  viewport, layer, convertCanvas, from, to,
}) {
  const context = convertCanvas.layer.getContext()
  let renderContext = {
    canvasContext: context,
    viewport,
  }

  renderPage(pdf, {
    viewport, layer, renderContext, convertCanvas, from, to,
  })
  pdf = renderContext = viewport = null
}
// 加载一页
async function renderPage(pdf, {
  viewport, layer, renderContext, convertCanvas, from, to,
}) {
  if (from > to) {
    rendering = false
    return
  }
  if (pageSigned[from]) {
    from++
    renderPage(pdf, {
      viewport, layer, renderContext, convertCanvas, from, to,
    })
  } else {
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
      renderPage(pdf, {
        viewport, layer, renderContext, convertCanvas, from, to,
      })

      imgUrl = img = pdf = viewport = renderContext = null
    }
  }
}


export default {
  addCover,
  loadPdf,
  open,
}
