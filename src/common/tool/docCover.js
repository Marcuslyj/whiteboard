import config from '@common/config'
import { generateUID } from '@common/utils'

export async function addCover(pdf, vm) {
    let pdfID = generateUID()
    // 添加转换图片canvas
    vm.shouldConvert = true
    let page = await pdf.getPage(1)
    let viewport = getCoverViewport(page)
    let width = viewport.width
    let height = viewport.height

    console.log(pdf)
    let stage = config.board


    // width = stage.width
}

// 获取文档封面viewport
function getCoverViewport(page) {
    let viewport = page.getViewport({
        scale: 1,
    })
    // 宽度设为200
    if (viewport.width !== 160) {
        viewport = page.getViewport({
            scale: 160 * 1 / viewport.width,
        })
    }
    return viewport
}

export default {
    addCover
}