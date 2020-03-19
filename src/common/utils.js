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
export const generateUID = (prefix = '', suffix = '') => {
  let uid = Date.now().toString(36)
  Array.from({ length: 3 }).map(() => {
    uid += `_${Math.floor(Math.random() * 10000).toString(36)}`
  })
  return `${prefix}${uid}${suffix}`
}

// isFirefox
export const isFirefox = () => /Firefox/i.test(navigator.userAgent)

// 将pointerPoint 的值过滤掉stage的transform 影响
export const getPoiWithOffset = (poi, stage) => {
  if (!stage || !poi) { return null }
  const aPoi = stage.absolutePosition()
  let scale = isEmpty(config.scale) ? 1 : config.scale
  if (isEmpty(aPoi.x) || isEmpty(poi.x) || isEmpty(poi.y) || isEmpty(aPoi.y)) {
    console.log('坐标异常值，此时同步参数：')
    console.log(`scale:${config.scale},stage:${config.stageXy.x} ${config.stageXy.y},speakerSize:${config.speakerSize.width}`)
  }
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

export const isEmpty = (obj) => obj == null || obj === '' || Number.isNaN(obj)


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

// cache node
export function cache(node) {
  if (node.className === 'Arrow') {
    node.cache({ offset: 5 })
  } else node.cache()
}

export function getURLBase64(url) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest()
    xhr.open('get', url, true)
    xhr.responseType = 'blob'
    xhr.onload = function () {
      if (this.status === 200) {
        let blob = this.response
        let fileReader = new FileReader()
        fileReader.onloadend = function (e) {
          let { result } = e.target
          resolve(result)
        }
        fileReader.readAsDataURL(blob)
      }
    }
    xhr.onerror = function () {
      reject()
    }
    xhr.send()
  })
}
// 判断是否相同，以props 为标准
export function isSameObject(a, b, props = []) {
  for (let p of props) {
    if (a[p] !== b[p]) {
      return false
    }
  }
  return true
}

export function toRGB(color) {
  if (isEmpty(color) || (color.length !== 4 && color.length !== 7)) {
    return ''
  }

  let r; let g; let b
  let str = color.split('#')[1]
  if (str.length === 3) {
    r = parseInt(`${str.slice(0, 1)}${str.slice(0, 1)}`, 16)
    g = parseInt(`${str.slice(1, 2)}${str.slice(1, 2)}`, 16)
    b = parseInt(`${str.slice(2, 3)}${str.slice(2, 3)}`, 16)
  } else if (str.length === 6) {
    r = parseInt(`${str.slice(0, 2)}`, 16)
    g = parseInt(`${str.slice(2, 4)}`, 16)
    b = parseInt(`${str.slice(4, 6)}`, 16)
  }
  return `rgb(${r},${g},${b})`
}

// 文件下载
export function downloadFile({ url, name = '' }) {
  let link = document.createElement('a')
  link.setAttribute('download', name)
  link.href = url
  link.click()
  link = null
}
