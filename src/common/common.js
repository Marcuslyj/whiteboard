import { deepFreeze } from './utils'

let isProd = process.env.NODE_ENV === 'production'

export const baseUrl = 'http://dev-whiteboard.tvflnet.com/'
export const webService = 'https://dev-web-services.tvflnet.com/'
export const api = {
    upload: webService + '/upload/normal/file'
}
export const fbId = {
    upload: 'F1912100'
}

// 非响应式数据
export default deepFreeze({
    baseUrl,
    webService,
    api,
    fbId
})

