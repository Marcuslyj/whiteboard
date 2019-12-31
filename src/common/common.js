import { deepFreeze } from './utils'

export const baseUrl = process.env.VUE_APP_baseUrl
export const webService = process.env.VUE_APP_webService
export const fileService = process.env.VUE_APP_fileService

export const api = {
    upload: webService + '/upload/normal/file',
    joinMeet: '/meeting/meet',
}
export const fbId = {
    upload: 'F1912100'
}

const socketUrl = process.env.VUE_APP_socketUrl

// 非响应式数据
export default deepFreeze({
    baseUrl,
    webService,
    fileService,
    api,
    fbId
})

