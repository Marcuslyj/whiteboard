// 深冻结
export function deepFreeze(obj) {
  obj = isObject(obj) ? obj : {}

  const toFreeze = [obj]
  for (let i = 0; i < toFreeze.length; i++) {
    Object.freeze(toFreeze[i])
    Object.keys(toFreeze[i]).map((key) => {
      if (isObject(toFreeze[i][key])) toFreeze.push(toFreeze[i][key])
    })
  }
  return obj
}
// 简单判断是否对象
export function isObject(obj) {
  return typeof obj === 'object' && obj !== null
}
// uid
export const generateUID = function (prefix, suffix) {
  let uid = Date.now().toString(36)
  Array.from({ length: 3 }).map(() => {
    uid += `_${Math.floor(Math.random() * 10000).toString(36)}`
  })
  if (prefix) uid = prefix + uid
  if (suffix) uid += suffix
  return uid
}

// isFirefox
export const isFirefox = () => /Firefox/i.test(navigator.userAgent)

// 将pointerPoint 转成带offset的数据
export const getPoiWithOffset = (poi, stage) => {
  if (!stage || !poi) { return null }
  const aPoi = stage.absolutePosition()
  return {
    x: poi.x - aPoi.x,
    y: poi.y - aPoi.y,
  }
}
