import Konva from "Konva";
import Vue from 'vue';
import { generateUID } from '@common/utils';

function create(params) {
	const { stage, layer } = params;
	let line;
	// 标记正在画线
	let isDrawing = false
	stage.on("mousedown touchstart", function () {
		isDrawing = true;
		const poi = stage.getPointerPosition();
		const toolConfig = Vue.prototype.$globalConf.pencil;
		const lineConfig = {
			id: generateUID(),
			stroke: toolConfig.color,
			strokeWidth: toolConfig.lineWidth,
			lineJoin: "round",
			lineCap: "round",
			globalCompositeOperation: "source-over",
			points: [poi.x, poi.y],
			bezier: true
		};
		line = new Konva.Line(lineConfig);
		layer.add(line);
		layer.batchDraw();
	});
	stage.on("mousemove touchmove", function () {
		if (!isDrawing) {
			return
		}
		const poi = stage.getPointerPosition();
		line.points(line.points().concat(poi.x, poi.y));
		layer.batchDraw();
	});
	//清除事件
	stage.on("mouseup touchend", function () {
		if (isDrawing) {
			isDrawing = false;
			// 性能优化
			line.cache();
			line = null;
		}
		// stage.off("mousemove touchmove")
	});
}

function destroy(params) {
	const { stage } = params;
	stage.off('mousedown touchstart');
}

export default {
	create,
	destroy
};
