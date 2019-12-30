import { deepFreeze } from './utils'

export const baseUrl = process.env.baseUrl
export const webService = process.env.webService

export const api = {
    upload: webService + '/upload/normal/file',
    joinMeet: '/meeting/meet',
}
export const fbId = {
    upload: 'F1912100'
}

const socketUrl = process.env.socketUrl

// 非响应式数据
export default deepFreeze({
    baseUrl,
    webService,
    api,
    fbId
})

