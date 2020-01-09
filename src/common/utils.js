import config from './config'
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

// 将pointerPoint 的值过滤掉stage的transform 影响
export const getPoiWithOffset = (poi, stage) => {
  if (!stage || !poi) { return null }
  const aPoi = stage.absolutePosition()
  let scale = isEmpty(config.scale) ? 1 : config.scale
  return {
    x: (poi.x - aPoi.x) / scale,
    y: (poi.y - aPoi.y) / scale,
  }
}

// 将变量植入字符串模板url 中,例如 /meeting-manager/meeting/{meetingId}/whiteboard' {meetingId:2}
export const formateUrl = (url, props) => {
  Object.keys(props).map((key) => {
    url = url.replace(`{${key}}`, props[key])
  })
  return url
}

export const isEmpty = (obj) => obj == null || obj === ''


/**
 * 使用对象的方式批量设置样式
 * @param {*} dom
 * @param {*} styleObj
 */
export function setStyle(dom, styleObj) {
  Object.keys(styleObj).map((prop) => {
    dom.style[prop] = styleObj[prop]
  })
}


export function formateComponent(obj) {
  const { meetingId, whiteboardId, documentId } = config
  Object.assign(obj, {
    meetingId,
    whiteboardId,
    documentId,
  })
  return obj
}

// 全屏
export function fullscreen() {
  let el = document.documentElement
  let rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen
  if (typeof rfs !== 'undefined' && rfs) {
    rfs.call(el)
  }
}

// 取消全屏
export function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen()
  } else if (document.webkitCancelFullScreen) {
    document.webkitCancelFullScreen()
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen()
  }
}
