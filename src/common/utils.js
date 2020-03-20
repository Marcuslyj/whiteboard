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
  link.setAttribute('target', '_blank')
  link.href = url
  link.click()
  link = null
}

/**
 * 文件链接转文件流下载--主要针对pdf 解决谷歌浏览器a标签下载pdf直接打开的问题
 * @param url  ：文件链接
 * @param fileName  ：文件名;
 * @param type  ：文件类型;
 */
export function fileLinkToStreamDownload(url, fileName, type) {
  // // let reg = /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+).)+([A-Za-z0-9-~\/])+$/
  // // if (!reg.test(url)) {
  // //   throw new Error('传入参数不合法,不是标准的文件链接')
  // // } else {
  // let xhr = new XMLHttpRequest()
  // xhr.open('get', url, true)
  // // xhr.setRequestHeader('Content-Type', `application/${type}`)
  // xhr.responseType = 'blob'
  // xhr.onload = function () {
  //   if (this.status === 200) {
  //     // 接受二进制文件流
  //     let blob = this.response
  //     downloadExportFile(blob, fileName, type)
  //   }
  // }
  // xhr.send()
  // // }

  fetch(url, {
    method: 'get',
    responseType: 'blob',
  }).then((res) => res.blob()).then((blob) => {
    downloadExportFile(blob, fileName, type)
    // let bl = new Blob([blob], { type: 'audio/m4a' })
    // let fileName = `${Date.parse(new Date())}.m4a`
    // let link = document.createElement('a')
    // link.href = window.URL.createObjectURL(blob)
    // link.download = fileName
    // link.click()
    // window.URL.revokeObjectURL(link.href)
  })
}

/**
 *下载导出文件
 * @param blob  ：返回数据的blob对象或链接
 * @param tagFileName  ：下载后文件名标记
 * @param fileType  ：文件类 word(docx) excel(xlsx) ppt等
 */
function downloadExportFile(blob, tagFileName, fileType) {
  let downloadElement = document.createElement('a')
  let href = blob
  if (typeof blob === 'string') {
    downloadElement.target = '_blank'
  } else {
    href = window.URL.createObjectURL(blob) // 创建下载的链接
  }
  downloadElement.href = href
  downloadElement.download = `${tagFileName}.${fileType}` // 下载后文件名
  document.body.appendChild(downloadElement)
  downloadElement.click() // 点击下载
  document.body.removeChild(downloadElement) // 下载完成移除元素
  if (typeof blob !== 'string') {
    window.URL.revokeObjectURL(href) // 释放掉blob对象
  }
}

export function base64UrlToBlob(urlData) {
  let bytes = window.atob(urlData.split(',')[1]) // 去掉url的头，并转换为byte
  // 处理异常,将ascii码小于0的转换为大于0
  let ab = new ArrayBuffer(bytes.length)
  let ia = new Uint8Array(ab)
  for (let i = 0; i < bytes.length; i++) {
    ia[i] = bytes.charCodeAt(i)
  }
  return new Blob([ab], {
    type: 'image/png',

  })
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
