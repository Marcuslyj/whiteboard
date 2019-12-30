import konva from "konva";

function create(params) {
	const {stage, layer, toolConfig}=params
	let line
	stage.on("mousedown", function() {
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

		stage.on("mousemove", function() {
			const poi=stage.getPointerPosition()
			line.points(line.points().concat(poi.x, poi.y))
			layer.draw()
		})

		//清除事件
		stage.on("mouseup", function() {
			stage.off("mousemove")
			stage.off("mouseup")
		});
	});
}

function destroy(stage){
	stage.off('mousedown')
}

export default {
  create,
  destroy
};
