import config from '@common/config'
import { generateUID } from '@common/utils'
import Konva from 'konva'

export async function addCover(pdf, { stage, layer, convertCanvas }) {
    let pdfID = generateUID()
    // 添加转换图片canvas

    let page = await pdf.getPage(1)
    let viewport = getCoverViewport(page)
    let width = viewport.width
    let height = viewport.height
    // 设置转换画板尺寸
    convertCanvas.size({
        width,
        height
    })
    let renderContext = {
        canvasContext: convertCanvas.layer.getContext(),
        viewport
    }

    let width_safe = Math.floor((stage.width() - viewport.width) * .8)
    let height_safe = Math.floor((stage.height() - viewport.height) * .8)
    let x = Math.floor(Math.random() * width_safe)
    let y = Math.floor(Math.random() * height_safe)

    const render = async (page, renderContext) => {
        await page.render(renderContext).promise
        let imgUrl = convertCanvas.layer.canvas['_canvas'].toDataURL()

        // 上传图片

        let img = new Image()
        img.src = imgUrl
        img.onload = () => {
            let imgK = new Konva.Image({
                id: pdfID,
                x,
                y,
                image: img,
                width,
                height,
                // 白底,防止透明背景
                fill: '#fff',
                stroke: '#ccc',
                draggable: true
            })
            imgK.cache()
            imgK.filters([Konva.Filters.Contrast])

            layer.add(imgK)
            layer.draw()

            // 事件
            imgK.on('mouseover', ({ target }) => {
                target.contrast(20)
                layer.draw();
            })
            imgK.on('mouseout', ({ target }) => {
                target.contrast(0)
                layer.draw();
            })
            imgK.on('click tap', ({ target }) => {
                // this.openFile(pdfID);
            })

            page = renderContext = img = null;
        }
    }
    // 渲染
    render(page, renderContext)

    // width = stage.width()
}

// 获取文档封面viewport
function getCoverViewport(page) {
    let viewport = page.getViewport({
        scale: 1,
    })
    let stage = config.board
    // 封面宽度，屏宽1600对应160,即画布宽度十分之一
    let width = Math.floor(stage.width() / 10)
    if (viewport.width !== width) {
        viewport = page.getViewport({
            scale: width * 1 / viewport.width,
        })
    }
    return viewport
}

export default {
    addCover
}