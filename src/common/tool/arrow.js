import Konva from 'Konva';
import Vue from 'vue';
import { generateUID } from '@common/utils';

function create(params) {
  const { stage, layer } = params;
  let arrow;
  let isDrawing = false;
  let firstPoi;
  stage.on('mousedown touchstart', () => {
    isDrawing = true;
    firstPoi = stage.getPointerPosition();
  });
  stage.on('mousemove touchmove', () => {
    if (!isDrawing) return;
    const poi = stage.getPointerPosition();
    if (!arrow) {
      const toolConfig = Vue.prototype.$globalConf.pencil;
      const arrowConfig = {
        id: generateUID(),
        pointerLength: 12,
        pointerWidth: 12,
        strokeWidth: toolConfig.lineWidth,
        fill: toolConfig.color,
        stroke: toolConfig.color,
        points: [firstPoi.x, firstPoi.y, poi.x, poi.y],
      };
      arrow = new Konva.Arrow(arrowConfig);
      layer.add(arrow);
    } else {
      arrow.points([firstPoi.x, firstPoi.y, poi.x, poi.y]);
    }
    layer.batchDraw();
  });
  stage.on('mouseup touchend', () => {
    if (isDrawing) {
      isDrawing = false;
      // arrow.cache()
      arrow = null;
    }
  });
}

function destroy(params) {
  const { stage } = params;
  stage.off('mousedown touchstart mousemove touchmove mouseup touchend');
}

export default {
  create,
  destroy,
};
