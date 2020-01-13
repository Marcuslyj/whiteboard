import Konva from 'konva'
import { generateUID } from '@common/utils'

function create(layer, {
  id, x, y, image, width, height, fill = '#fff', stroke = '#ccc', draggable = false, ...rest
} = {}) {
  const konvaImage = new Konva.Image({
    //   必须参数
    id: id || generateUID(),
    x,
    y,
    image,
    width,
    height,
    // 默认白色
    fill,
    stroke,
    draggable,
    // 自定义参数
    ...rest,
  })
  // 跨域导致不能使用
  if (rest.type === 'cover') {
    konvaImage.cache()
    konvaImage.filters([Konva.Filters.Contrast])
  }
  layer.add(konvaImage)
  layer.draw()
  return konvaImage
}

export default {
  create,
}
