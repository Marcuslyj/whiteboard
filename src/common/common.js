import { deepFreeze } from './utils'

export const baseUrl = process.env.VUE_APP_baseUrl
export const webService = process.env.VUE_APP_webService
export const fileService = process.env.VUE_APP_fileService

export const api = {
  upload: `${webService}/upload/normal/file`,
  createMeet: '/meeting-manager/meeting',
}

export const fbId = {
  upload: 'F1912100',
}

export const socketUrl = process.env.VUE_APP_socketUrl
export const socketEvent = {
  joinMeet: 'join-meeting',
  addComponent: 'add-component',
  updateComponent: 'update-component',
  deletecomponents: 'delete-components',
  updateComponentState: 'update-component-state',
}

// 非响应式数据
export default deepFreeze({
  socketUrl,
  baseUrl,
  webService,
  fileService,
  api,
  fbId,
  socketEvent,
})
