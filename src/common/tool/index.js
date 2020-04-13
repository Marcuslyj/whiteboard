
import Vue from 'vue'
import markPencil from './markPencil'
import arrow from './arrow'
import pen from './pen'
import eraser from './eraser'
import clearBoard from './clearBoard'
import deleteGraphic from './deleteGraphic'
import pan from './pan'
import select from './select'
import text from './text'
import laserPen from './laserPen'

const toolCollection = {
  markPencil,
  arrow,
  pen,
  eraser,
  clearBoard,
  deleteGraphic,
  pan,
  select,
  text,
  laserPen,
}

export const initTool = () => {
  Vue.eventBus.$on('active-tool', ({ toolName, ...params }) => {
    toolCollection[toolName].create(params)
    console.log(`initTool:${toolName}`)
  })

  Vue.eventBus.$on('deactive-tool', ({ toolName }) => {
    toolCollection[toolName].destroy && toolCollection[toolName].destroy()
    console.log(`destroyTool:${toolName}`)
  })
}

export const destroyTool = () => {
  Vue.eventBus.$off('active-tool')
  Vue.eventBus.$off('deactive-tool')
}
