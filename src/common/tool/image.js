import Konva from 'konva'
import { generateUID } from '@common/utils'

function create(layer, {
  id, x, y, image, width, height, fill = '#fff', stroke = '#ccc', draggable = true, ...rest
} = {}) {
  const imgK = new Konva.Image({
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
  layer.add(imgK)
  layer.draw()
  return imgK
}

export default {
  create,
}
