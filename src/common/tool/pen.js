import konva from "konva";

//后面可能用全新的方案，所以单独一个文件
function create(params) {
	const {stage, layer, toolConfig}=params
	let line
	let isPainting
	stage.on("mousedown touchstart", function() {
		isPainting=true
		const poi=stage.getPointerPosition()
		const lineConfig = {
		stroke: toolConfig.color,
		strokeWidth: toolConfig.lineWidth,
		lineJoin: "round",
		lineCap: "round",
		globalCompositeOperation: "source-over",
		points: [poi.x, poi.y],
		bezier:true
		};
		line = new konva.Line(lineConfig)
		layer.add(line);
	});

	stage.on("mousemove touchmove", function() {
		if(!isPainting){
			return
		}
		const poi=stage.getPointerPosition()
		line.points(line.points().concat(poi.x, poi.y))
		layer.draw()
	})

	//清除事件
	stage.on("mouseup touchend", function() {
		isPainting=false
	});
}

function destroy(stage){
	stage.off('mousedown touchstart')
}

export default {
  create,
  destroy
};
