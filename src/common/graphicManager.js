import config from './config'

export function addGraphic(graphic) {
  config.cacheGraphics.push(graphic)
}

export function clearCache() {
  config.cacheGraphics = []
}
