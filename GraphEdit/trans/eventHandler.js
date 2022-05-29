'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _node3 = require('./node');

var _relation = require('./relation');

var _group = require('./tools/group');

var _editorFunction = require('./editorFunction');

var _editorFunction2 = _interopRequireDefault(_editorFunction);

var _event5 = require('./event');

var _event6 = _interopRequireDefault(_event5);

var _settings = require('./tools/settings');

var _settings2 = _interopRequireDefault(_settings);

var _commonFunctions = require('./tools/commonFunctions');

var _commonFunctions2 = _interopRequireDefault(_commonFunctions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var minHeight = 20;
var minWidth = 20;
var minMovement = 5;

exports.default = {
    //mousedown调用
    mouseDownEventHandler: function mouseDownEventHandler(event) {
        var isHitLineController = false;
        var isHitNodeController = false;
        //是否命中连接点
        var isHitConnector = false;
        var hitItem = [];

        this.clickPoint.x = event.offsetX * _settings2.default.ratio;
        this.clickPoint.y = event.offsetY * _settings2.default.ratio;

        //清空图片缓存
        this.moveCache = null;
        //是否命中控制点
        if (this.selectedElement) {
            if (this.selectedElement instanceof _relation.Relation) {
                isHitLineController = this.selectedElement.line.controller.hitCheck(this.clickPoint.x, this.clickPoint.y);
                if (isHitLineController) {
                    this.lineCache = {};
                    this.currentLine = this.selectedElement;
                    this.lineCache.operation = isHitLineController.operation;
                    if (isHitLineController.operation === _settings2.default.lineOperations.startPointChange || isHitLineController.operation === _settings2.default.lineOperations.endPointChange) {
                        this.lineCache.from = this.currentLine.from;
                        this.lineCache.fromConOrder = this.currentLine.fromConOrder;
                        this.lineCache.to = this.currentLine.to;
                        this.lineCache.toConOrder = this.currentLine.toConOrder;
                        this.removeEventListener('mousemove', this.mouseOverSelect);
                        this.addEventListener('mousemove', this.changeStartOrEndOfLine);
                    } else {
                        this.lineCache.points = isHitLineController.points;
                        this.removeEventListener('mousemove', this.mouseOverSelect);
                        this.addEventListener('mousemove', this.drawCurrentDashLine);
                    }
                    this.addEventListener('mouseup', this.drawLine);
                    this.addEventListener('mouseleave', this.mouseLeaveHandler);
                    //触发点击事件
                    var _event = _event6.default.click;
                    _event.element = _editorFunction2.default.outPutUnit(this.selectedElement);
                    this.canvas.dispatchEvent(_event);
                    _event.element = null;
                    return;
                }
            } else if (this.selectedElement instanceof _node3.Node) {
                //命中节点控制点
                isHitNodeController = this.selectedElement.shape.controller.hitCheck(this.clickPoint.x, this.clickPoint.y);
                if (isHitNodeController) {
                    this.nodeResizeCache = {};
                    this.nodeResizeCache.direction = isHitNodeController.order;
                    this.nodeResizeCache.x = this.selectedElement.shape.center.x;
                    this.nodeResizeCache.y = this.selectedElement.shape.center.y;
                    this.nodeResizeCache.width = this.selectedElement.shape.width;
                    this.nodeResizeCache.height = this.selectedElement.shape.height;

                    //触发点击事件
                    var _event2 = _event6.default.click;
                    _event2.element = _editorFunction2.default.outPutUnit(this.selectedElement);
                    this.canvas.dispatchEvent(_event2);
                    _event2.element = null;

                    this.removeEventListener('mousemove', this.mouseOverSelect);
                    this.addEventListener('mousemove', this.nodeResizing);
                    this.addEventListener('mouseup', this.nodeResized);
                    this.addEventListener('mouseleave', this.mouseLeaveHandler);
                    return;
                }
            }
        }

        if (this.mouseOverNode && !isHitLineController) {
            isHitConnector = this.mouseOverNode.connectorHitCheck(this.clickPoint.x, this.clickPoint.y);
        }

        if (isHitConnector) {
            this.startPoint = {};
            this.startPoint.from = this.mouseOverNode;
            this.startPoint.order = isHitConnector;

            //触发点击事件
            var _event3 = _event6.default.click;
            _event3.element = _editorFunction2.default.outPutUnit(this.selectedElement);
            this.canvas.dispatchEvent(_event3);
            _event3.element = null;

            this.removeEventListener('mousemove', this.mouseOverSelect);
            this.addEventListener('mousemove', this.drawNewDashLine);
            this.addEventListener('mouseup', this.drawLine);
            this.addEventListener('mouseleave', this.mouseLeaveHandler);
        } else {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.elements[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var element = _step.value;

                    if (element.hitCheck(this.clickPoint.x, this.clickPoint.y)) {
                        hitItem.push(element);
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            ;
            hitItem.sort(function (a, b) {
                return a.index - b.index;
            });
            //啥也没点到
            if (hitItem.length === 0) {
                this.selectedElement = null;
                if (event.ctrlKey) {
                    this.canvas.style.cursor = 'crosshair';
                    this.composeModel = true;
                } else {
                    this.canvas.style.cursor = '-webkit-grabbing';
                }
                this.removeEventListener('mousemove', this.mouseOverSelect);
                this.addEventListener('mousemove', this.moveCanvasOrCompose);
                this.addEventListener('mouseup', this.moveCanvasComplete);
                this.addEventListener('mouseleave', this.canvasMoveLeave);
                //触发点击事件
                var clickEvent = _event6.default.click;
                clickEvent.element = _editorFunction2.default.outPutUnit(this.selectedElement);
                this.canvas.dispatchEvent(clickEvent);
                clickEvent.element = null;
            } else {
                var topItem = hitItem.pop();
                if (!this.selectedElement || !(this.selectedElement instanceof _group.Group) || this.selectedElement.nodes.indexOf(topItem) === -1 && this.selectedElement.relations.indexOf(topItem) === -1) {
                    this.selectedElement = topItem;
                }

                if (this.selectedElement instanceof _node3.Node || this.selectedElement instanceof _group.Group) {
                    this.removeEventListener('mousemove', this.mouseOverSelect);
                    this.addEventListener('mousemove', this.drawDashShape);
                    this.addEventListener('mouseup', this.moveSelectedElement);
                    this.addEventListener('mouseleave', this.mouseLeaveHandler);
                };
                //触发选中元素事件
                var selectedElementEvent = _event6.default.selectedElement;
                selectedElementEvent.element = _editorFunction2.default.outPutUnit(this.selectedElement);
                this.canvas.dispatchEvent(selectedElementEvent);
                selectedElementEvent.element = null;

                //触发点击事件
                var _clickEvent = _event6.default.click;
                _clickEvent.element = _editorFunction2.default.outPutUnit(this.selectedElement);
                this.canvas.dispatchEvent(_clickEvent);
                _clickEvent.element = null;
            };
            _editorFunction2.default.reload.call(this);
            if (this.mouseOverNode) this.mouseOverNode.drawConnector();
        }
    },
    //mousemove事件调用，拖动线条端点
    changeStartOrEndOfLine: function changeStartOrEndOfLine(event) {
        var point = {};
        var collection = [];
        point.x = event.offsetX * _settings2.default.ratio;
        point.y = event.offsetY * _settings2.default.ratio;
        if (this.mouseOverNode) {
            this.mouseOverNode.isOver = false;
            this.mouseOverNode = null;
            _editorFunction2.default.reload.call(this);
        }
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = this.nodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var node = _step2.value;

                node.shape.anchor.draw();
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }

        ;

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = this.nodes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var _node = _step3.value;

                var result = _node.shape.connector.connectCheck(event.offsetX * _settings2.default.ratio, event.offsetY * _settings2.default.ratio);
                if (result) {
                    var connectNode = {};
                    connectNode.node = _node;
                    connectNode.distance = result.distance;
                    connectNode.order = result.order;
                    collection.push(connectNode);
                }
            }
        } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                    _iterator3.return();
                }
            } finally {
                if (_didIteratorError3) {
                    throw _iteratorError3;
                }
            }
        }

        if (this.lineCache.operation === _settings2.default.lineOperations.startPointChange) {
            if (collection.length > 0) {
                collection.sort(sortCon);
                var conNode = collection.pop();
                this.currentLine.from = conNode.node;
                this.currentLine.fromConOrder = conNode.order;
                this.currentLine.startPoint = null;
            } else {
                this.currentLine.startPoint = point;
                this.currentLine.from = null;
            }
        } else if (this.lineCache.operation === _settings2.default.lineOperations.endPointChange) {
            if (collection.length > 0) {
                collection.sort(sortCon);
                var _conNode = collection.pop();
                this.currentLine.to = _conNode.node;
                this.currentLine.toConOrder = _conNode.order;
                this.currentLine.endPoint = null;
            } else {
                this.currentLine.endPoint = point;
                this.currentLine.to = null;
            }
        }
        this.currentLine.createPath();

        _editorFunction2.default.rollbackForMoving.call(this);
        _editorFunction2.default.saveAll.call(this);
        this.currentLine.drawDashLine(this.lineCache.operation);
    },
    //mousemove事件调用，拖动线条中段控制点
    drawCurrentDashLine: function drawCurrentDashLine(event) {
        if (this.lineCache.points[1].x === this.lineCache.points[3].x) {
            this.lineCache.points[1].x = event.offsetX * _settings2.default.ratio;
            this.lineCache.points[3].x = event.offsetX * _settings2.default.ratio;
        } else if (this.lineCache.points[1].y === this.lineCache.points[3].y) {
            this.lineCache.points[1].y = event.offsetY * _settings2.default.ratio;
            this.lineCache.points[3].y = event.offsetY * _settings2.default.ratio;
        }

        _editorFunction2.default.rollbackForMoving.call(this);
        _editorFunction2.default.saveAll.call(this);
        this.currentLine.drawDashLine(this.lineCache.operation);
    },
    //mousemove事件调用，拖动线条，从连接点开始的新线条
    drawNewDashLine: function drawNewDashLine(event) {
        var endPoint = {};
        var collection = [];
        endPoint.x = event.offsetX * _settings2.default.ratio;
        endPoint.y = event.offsetY * _settings2.default.ratio;

        if (this.mouseOverNode) {
            this.mouseOverNode.isOver = false;
            this.mouseOverNode = null;
            _editorFunction2.default.reload.call(this, false);
        }
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
            for (var _iterator4 = this.nodes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var node = _step4.value;

                node.shape.anchor.draw();
            }
        } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                    _iterator4.return();
                }
            } finally {
                if (_didIteratorError4) {
                    throw _iteratorError4;
                }
            }
        }

        ;
        if (!this.currentLine) {
            var params = {};
            if (this.startPoint && this.startPoint.from) {
                params.from = this.startPoint.from;
                params.fromConOrder = this.startPoint.order;
                params.endPoint = endPoint;
            }
            this.currentLine = _editorFunction2.default.createRelation.call(this, params);
        } else {
            this.currentLine.endPoint = endPoint;
            this.currentLine.to = null;
        }
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
            for (var _iterator5 = this.nodes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                var _node2 = _step5.value;

                var result = _node2.shape.connector.connectCheck(event.offsetX * _settings2.default.ratio, event.offsetY * _settings2.default.ratio);
                if (result) {
                    var connectNode = {};
                    connectNode.node = _node2;
                    connectNode.distance = result.distance;
                    connectNode.order = result.order;
                    collection.push(connectNode);
                }
            }
        } catch (err) {
            _didIteratorError5 = true;
            _iteratorError5 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion5 && _iterator5.return) {
                    _iterator5.return();
                }
            } finally {
                if (_didIteratorError5) {
                    throw _iteratorError5;
                }
            }
        }

        if (collection.length > 0) {
            collection.sort(sortCon);
            var conNode = collection.pop();
            this.currentLine.to = conNode.node;
            this.currentLine.toConOrder = conNode.order;
            this.currentLine.endPoint = null;
        }
        this.currentLine.createPath();

        _editorFunction2.default.rollbackForMoving.call(this);
        _editorFunction2.default.saveAll.call(this);
        this.currentLine.drawDashLine(_settings2.default.lineOperations.endPointChange);
    },
    //mousemove事件调用，节点拖拽, 绘制标志线
    drawDashShape: function drawDashShape(event) {
        this.start_x = null;
        this.end_x = null;
        this.start_y = null;
        this.end_y = null;
        var x = event.offsetX * _settings2.default.ratio - this.clickPoint.x;
        var y = event.offsetY * _settings2.default.ratio - this.clickPoint.y;
        //步骤一：还原区域图形
        _editorFunction2.default.rollbackForMoving.call(this);
        if (Math.abs(x) < minMovement && Math.abs(y) < minMovement) return;
        if (this.selectedElement instanceof _node3.Node) {
            //步骤二：获取上下左右节点
            var center = { x: this.selectedElement.shape.center.x + x, y: this.selectedElement.shape.center.y + y };
            var right = getCompareNode_Right(this.nodes, center, this.selectedElement);
            var left = getCompareNode_Left(this.nodes, center, this.selectedElement);
            var top = getCompareNode_Top(this.nodes, center, this.selectedElement);
            var bottom = getCompareNode_Bottom(this.nodes, center, this.selectedElement);
            var isHitRight = false;
            var isHitLeft = false;
            var isHitTop = false;
            var isHitBottom = false;
            var offset_right = 0;
            var offset_left = 0;
            var offset_top = 0;
            var offset_bottom = 0;
            //步骤三：判断是否进入标志线范围，并计算偏移量
            if (right && center.y >= right.shape.center.y - 10 && center.y <= right.shape.center.y + 10) {
                isHitRight = true;
                offset_right = right.shape.center.y - center.y;
            }
            if (left && center.y >= left.shape.center.y - 10 && center.y <= left.shape.center.y + 10) {
                isHitLeft = true;
                offset_left = left.shape.center.y - center.y;
            }
            if (top && center.x >= top.shape.center.x - 10 && center.x <= top.shape.center.x + 10) {
                isHitTop = true;
                offset_top = top.shape.center.x - center.x;
            }
            if (bottom && center.x >= bottom.shape.center.x - 10 && center.x <= bottom.shape.center.x + 10) {
                isHitBottom = true;
                offset_bottom = bottom.shape.center.x - center.x;
            }

            //步骤四：依据标记判断如何绘制标志线（计算起始点位置），并保存绘制区域图形
            if (isHitTop) {
                if (isHitBottom) {
                    if (top.shape.center.x === bottom.shape.center.x) {
                        //上下图形中心点有相同的X坐标
                        this.offset_X = offset_top;
                        center.x = top.shape.center.x;
                        this.start_y = { x: center.x, y: top.shape.center.y - top.shape.height / 2 - 15 };
                        this.end_y = { x: center.x, y: bottom.shape.center.y + top.shape.height / 2 + 15 };
                        //EditorFunction.saveStateForLine_Y.call(this);
                    } else {
                        //上下图形中心点都进入了偏移范围
                        //上边优先，谁近向谁靠拢
                        if (Math.abs(offset_bottom) < Math.abs(offset_top)) {
                            this.offset_X = offset_bottom;
                            _editorFunction2.default.saveStateForLine_Bottom.call(this, center, bottom);
                        } else {
                            this.offset_X = offset_top;
                            _editorFunction2.default.saveStateForLine_Top.call(this, center, top);
                        }
                    }
                } else {
                    //只有上边图形中心点都进入了偏移范围
                    this.offset_X = offset_top;
                    _editorFunction2.default.saveStateForLine_Top.call(this, center, top);
                }
            } else if (isHitBottom) {
                //只有下边图形中心点都进入了偏移范围
                this.offset_X = offset_bottom;
                _editorFunction2.default.saveStateForLine_Bottom.call(this, center, bottom);
            }

            if (isHitRight) {
                if (isHitLeft) {
                    if (right.shape.center.y === left.shape.center.y) {
                        //左右图形中心点有相同的Y坐标
                        this.offset_Y = offset_right;
                        center.y = right.shape.center.y;
                        this.start_x = { x: left.shape.center.x - left.shape.width / 2 - 15, y: center.y };
                        this.end_x = { x: right.shape.center.x + right.shape.width / 2 + 15, y: center.y };
                        //EditorFunction.saveStateForLine_X.call(this);
                    } else {
                        //左右图形中心点都进入了偏移范围
                        //左边优先，谁近向谁靠拢
                        if (Math.abs(offset_right) < Math.abs(offset_left)) {
                            this.offset_Y = offset_right;
                            _editorFunction2.default.saveStateForLine_Right.call(this, center, right);
                        } else {
                            this.offset_Y = offset_left;
                            _editorFunction2.default.saveStateForLine_Left.call(this, center, left);
                        }
                    }
                } else {
                    //只有右边图形中心点都进入了偏移范围
                    this.offset_Y = offset_right;
                    _editorFunction2.default.saveStateForLine_Right.call(this, center, right);
                }
            } else if (isHitLeft) {
                //只有左边图形中心点都进入了偏移范围
                this.offset_Y = offset_left;
                _editorFunction2.default.saveStateForLine_Left.call(this, center, left);
            }

            //步骤五：保存区域图形
            _editorFunction2.default.saveAll.call(this);
            //步骤六：开始绘制标志线和拖拽图形
            if (this.start_x && this.end_x) {
                drawMarkLine(this.start_x, this.end_x, this.ctx);
            }
            if (this.start_y && this.end_y) {
                drawMarkLine(this.start_y, this.end_y, this.ctx);
            }
            this.selectedElement.drawDashNode(x + this.offset_X, y + this.offset_Y);
        } else if (this.selectedElement instanceof _group.Group) {
            _editorFunction2.default.saveAll.call(this);
            this.selectedElement.drawDashGroup(x, y);
        }
    },
    //mouseup事件调用,移动节点
    moveSelectedElement: function moveSelectedElement(event) {
        this.resetEventListener();
        var x = event.offsetX * _settings2.default.ratio - this.clickPoint.x;
        var y = event.offsetY * _settings2.default.ratio - this.clickPoint.y;
        _editorFunction2.default.rollbackForMoving.call(this);
        this.moveCache = null;
        if (Math.abs(x) > minMovement || Math.abs(y) > minMovement) {
            if (this.selectedElement instanceof _node3.Node) {
                _editorFunction2.default.moveShape.call(this, x + this.offset_X, y + this.offset_Y);
            } else if (this.selectedElement instanceof _group.Group) {
                _editorFunction2.default.moveGroup.call(this, x, y);
            }

            _editorFunction2.default.saveStepCache.call(this);
        }
    },
    //mouseup事件调用,绘制线条
    drawLine: function drawLine(event) {
        var _this = this;

        this.resetEventListener();
        var point = {};
        point.x = event.offsetX * _settings2.default.ratio;
        point.y = event.offsetY * _settings2.default.ratio;
        //新的线条
        if (this.currentLine && !this.lineCache) {
            if (!this.currentLine.to) {
                this.currentLine.endPoint = point;
            } else {
                this.currentLine.endPoint = null;
                pushHashSet(this.currentLine.to.relations, this.currentLine);
            }
            this.currentLine.createPath();
            this.selectedElement = this.currentLine;
            this.currentLine = null;
            _editorFunction2.default.reload.call(this);

            //触发选中元素事件
            var _event4 = _event6.default.selectedElement;
            _event4.element = _editorFunction2.default.outPutUnit(this.selectedElement);
            this.canvas.dispatchEvent(_event4);
            _event4.element = null;
            //当前数据记入缓存 
            _editorFunction2.default.saveStepCache.call(this);
            //变更线条路径
        } else if (this.currentLine && this.lineCache) {
            //上调线的图层
            this.selectedElement.index = this.indexMark;
            this.indexMark++;
            if (this.lineCache.operation !== _settings2.default.lineOperations.middlePathChange) {
                //没变化
                if (this.currentLine.from && this.lineCache.from === this.currentLine.from && this.lineCache.fromConOrder === this.currentLine.fromConOrder && this.currentLine.to && this.lineCache.to === this.currentLine.to && this.lineCache.toConOrder === this.currentLine.toConOrder) {
                    this.lineCache = null;
                    _editorFunction2.default.reload.call(this);
                    return;
                }
                if (this.lineCache.from) {
                    this.lineCache.from.relations.splice(this.lineCache.from.relations.findIndex(function (relation) {
                        return relation === _this.currentLine;
                    }), 1);
                };
                if (this.lineCache.to) {
                    this.lineCache.to.relations.splice(this.lineCache.to.relations.findIndex(function (relation) {
                        return relation === _this.currentLine;
                    }), 1);
                };
                if (this.currentLine.from) {
                    this.currentLine.startPoint = null;
                    pushHashSet(this.currentLine.from.relations, this.currentLine);
                } else if (this.currentLine.operation === _settings2.default.lineOperations.startPointChange) {
                    this.currentLine.startPoint = point;
                };
                if (this.currentLine.to) {
                    this.currentLine.endPoint = null;
                    pushHashSet(this.currentLine.to.relations, this.currentLine);
                } else if (this.currentLine.operation === _settings2.default.lineOperations.endPointChange) {
                    this.currentLine.endPoint = point;
                };
                this.currentLine.createPath();
            } else {
                if (this.clickPoint.x === point.x && this.clickPoint.y === point.y) {
                    this.lineCache = null;
                    _editorFunction2.default.reload.call(this);
                    return;
                }
            }

            _editorFunction2.default.reload.call(this);
            //当前数据记入缓存 
            _editorFunction2.default.saveStepCache.call(this);
        }

        this.currentLine = null;
        this.lineCache = null;
        this.selectedConnector = null;
        this.moveCache = null;
    },
    //mousemove事件调用
    mouseOverSelect: function mouseOverSelect(event) {
        if (this.selectedElement) {
            //是否命中线的控制点
            if (this.selectedElement instanceof _relation.Relation) {
                var isHitLineController = false;
                isHitLineController = this.selectedElement.line.controller.hitCheck(event.offsetX * _settings2.default.ratio, event.offsetY * _settings2.default.ratio);
                if (isHitLineController) {
                    if (isHitLineController.operation === _settings2.default.lineOperations.startPointChange || isHitLineController.operation === _settings2.default.lineOperations.endPointChange) {
                        this.canvas.style.cursor = 'crosshair';
                    } else if (isHitLineController.points[1].x === isHitLineController.points[3].x) {
                        this.canvas.style.cursor = 'e-resize';
                    } else if (isHitLineController.points[1].y === isHitLineController.points[3].y) {
                        this.canvas.style.cursor = 'n-resize';
                    }
                    return;
                }
            }
            //是否命中节点的控制点
            if (this.selectedElement instanceof _node3.Node) {
                var isHitNodeController = false;
                isHitNodeController = this.selectedElement.shape.controller.hitCheck(event.offsetX * _settings2.default.ratio, event.offsetY * _settings2.default.ratio);
                if (isHitNodeController) {
                    if (isHitNodeController.order === 'n' || isHitNodeController.order === 's') {
                        this.canvas.style.cursor = 'n-resize';
                    } else if (isHitNodeController.order === 'e' || isHitNodeController.order === 'w') {
                        this.canvas.style.cursor = 'e-resize';
                    } else if (isHitNodeController.order === 'ne' || isHitNodeController.order === 'sw') {
                        this.canvas.style.cursor = 'ne-resize';
                    } else if (isHitNodeController.order === 'nw' || isHitNodeController.order === 'se') {
                        this.canvas.style.cursor = 'nw-resize';
                    }
                    return;
                }
            }
        }

        //先判断是否命中连接点
        var isHitConnector = false;
        if (this.mouseOverNode) {
            isHitConnector = this.mouseOverNode.connectorHitCheck(event.offsetX * _settings2.default.ratio, event.offsetY * _settings2.default.ratio);
            if (isHitConnector && !this.selectedConnector) {
                _editorFunction2.default.saveStateForConnector.call(this, this.mouseOverNode);
                this.mouseOverNode.selectConnector(isHitConnector);
                this.selectedConnector = {};
                this.selectedConnector.node = this.mouseOverNode;
                this.selectedConnector.order = isHitConnector;
                this.canvas.style.cursor = 'default';
            } else if (this.selectedConnector && !isHitConnector) {
                _editorFunction2.default.rollbackConnector.call(this);
                this.selectedConnector = null;
            }
        }

        //未命中连接点
        if (!isHitConnector) {
            var hitItem = [];
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = this.elements[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var element = _step6.value;

                    if (element.hitCheck(event.offsetX * _settings2.default.ratio, event.offsetY * _settings2.default.ratio)) {
                        hitItem.push(element);
                    }
                }
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
                        _iterator6.return();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
                    }
                }
            }

            ;
            if (hitItem.length === 0) {
                this.canvas.style.cursor = '-webkit-grab';
            } else {
                hitItem.sort(function (a, b) {
                    return a.index - b.index;
                });
                var top = hitItem.pop();
                if (top instanceof _node3.Node) {
                    this.canvas.style.cursor = 'move';
                } else if (top instanceof _relation.Relation) {
                    this.canvas.style.cursor = 'default';
                }
            };
            hitItem = [];
            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = this.nodes[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var node = _step7.value;

                    if (node.hitCheck_Over(event.offsetX * _settings2.default.ratio, event.offsetY * _settings2.default.ratio)) {
                        hitItem.push(node);
                    } else {
                        if (node.isOver === true) {
                            node.isOver = false;
                            _editorFunction2.default.reload.call(this);
                        };
                    };
                }
            } catch (err) {
                _didIteratorError7 = true;
                _iteratorError7 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion7 && _iterator7.return) {
                        _iterator7.return();
                    }
                } finally {
                    if (_didIteratorError7) {
                        throw _iteratorError7;
                    }
                }
            }

            ;
            hitItem.sort(function (a, b) {
                return a.index - b.index;
            });
            if (hitItem.length === 0) {
                this.mouseOverNode = null;
            } else {
                var topItem = hitItem.pop();
                var _iteratorNormalCompletion8 = true;
                var _didIteratorError8 = false;
                var _iteratorError8 = undefined;

                try {
                    for (var _iterator8 = hitItem[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                        var item = _step8.value;

                        if (item.isOver === true && item.index < topItem.index) {
                            item.isOver = false;
                            _editorFunction2.default.reload.call(this);
                            break;
                        };
                    }
                } catch (err) {
                    _didIteratorError8 = true;
                    _iteratorError8 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion8 && _iterator8.return) {
                            _iterator8.return();
                        }
                    } finally {
                        if (_didIteratorError8) {
                            throw _iteratorError8;
                        }
                    }
                }

                if (!this.mouseOverNode || this.mouseOverNode && topItem !== this.mouseOverNode) {
                    this.mouseOverNode = topItem;
                    topItem.isOver = true;
                    this.mouseOverNode.drawConnector();
                };
            };
        }
    },
    //节点形状调整
    nodeResizing: function nodeResizing(event) {
        var _this2 = this;

        //偏移量
        var x = event.offsetX * _settings2.default.ratio - this.clickPoint.x;
        var y = event.offsetY * _settings2.default.ratio - this.clickPoint.y;
        if (this.selectedElement.index + 1 !== this.indexMark) {
            this.selectedElement.index = this.indexMark;
            this.indexMark++;
        }
        var bottom = this.nodeResizeCache.y + this.nodeResizeCache.height / 2,
            top = this.nodeResizeCache.y - this.nodeResizeCache.height / 2,
            left = this.nodeResizeCache.x - this.nodeResizeCache.width / 2,
            right = this.nodeResizeCache.x + this.nodeResizeCache.width / 2;
        var height = void 0,
            width = void 0,
            newMinWidth = void 0,
            newMinHeight = void 0;
        switch (this.nodeResizeCache.direction) {
            case 'n':
                height = this.nodeResizeCache.height - y < minHeight ? minHeight : this.nodeResizeCache.height - y;
                height = this.selectedElement.shape.nodeResizing(this.nodeResizeCache, height);
                this.selectedElement.shape.y = bottom - height / 2;
                this.selectedElement.shape.height = height;
                break;
            case 's':
                height = this.nodeResizeCache.height + y < minHeight ? minHeight : this.nodeResizeCache.height + y;
                height = this.selectedElement.shape.nodeResizing(this.nodeResizeCache, height);
                this.selectedElement.shape.y = top + height / 2;
                this.selectedElement.shape.height = height;
                break;
            case 'e':
                width = this.nodeResizeCache.width + x < minWidth ? minWidth : this.nodeResizeCache.width + x;
                width = this.selectedElement.shape.nodeResizing(this.nodeResizeCache, width);
                this.selectedElement.shape.x = left + width / 2;
                this.selectedElement.shape.width = width;
                break;
            case 'w':
                width = this.nodeResizeCache.width - x < minWidth ? minWidth : this.nodeResizeCache.width - x;
                width = this.selectedElement.shape.nodeResizing(this.nodeResizeCache, width);
                this.selectedElement.shape.x = right - width / 2;
                this.selectedElement.shape.width = width;
                break;
            case 'ne':
                newMinWidth = minWidth;
                newMinHeight = minHeight;
                if (this.nodeResizeCache.width > this.nodeResizeCache.height) {
                    newMinWidth = minHeight * this.nodeResizeCache.width / this.nodeResizeCache.height;
                } else {
                    newMinHeight = minWidth * this.nodeResizeCache.height / this.nodeResizeCache.width;
                }
                height = this.nodeResizeCache.height - y < newMinHeight ? newMinHeight : this.nodeResizeCache.height - y;
                width = this.nodeResizeCache.width + x < newMinWidth ? newMinWidth : this.nodeResizeCache.width + x;
                if (height / width > this.nodeResizeCache.height / this.nodeResizeCache.width) {
                    width = height * this.nodeResizeCache.width / this.nodeResizeCache.height;
                } else {
                    height = width * this.nodeResizeCache.height / this.nodeResizeCache.width;
                }
                this.selectedElement.shape.x = left + width / 2;
                this.selectedElement.shape.y = bottom - height / 2;
                this.selectedElement.shape.height = height;
                this.selectedElement.shape.width = width;
                break;
            case 'se':
                newMinWidth = minWidth;
                newMinHeight = minHeight;
                if (this.nodeResizeCache.width > this.nodeResizeCache.height) {
                    newMinWidth = minHeight * this.nodeResizeCache.width / this.nodeResizeCache.height;
                } else {
                    newMinHeight = minWidth * this.nodeResizeCache.height / this.nodeResizeCache.width;
                }
                height = this.nodeResizeCache.height + y < newMinHeight ? newMinHeight : this.nodeResizeCache.height + y;
                width = this.nodeResizeCache.width + x < newMinWidth ? newMinWidth : this.nodeResizeCache.width + x;
                if (height / width > this.nodeResizeCache.height / this.nodeResizeCache.width) {
                    width = height * this.nodeResizeCache.width / this.nodeResizeCache.height;
                } else {
                    height = width * this.nodeResizeCache.height / this.nodeResizeCache.width;
                }
                this.selectedElement.shape.x = left + width / 2;
                this.selectedElement.shape.y = top + height / 2;
                this.selectedElement.shape.height = height;
                this.selectedElement.shape.width = width;
                break;
            case 'sw':
                newMinWidth = minWidth;
                newMinHeight = minHeight;
                if (this.nodeResizeCache.width > this.nodeResizeCache.height) {
                    newMinWidth = minHeight * this.nodeResizeCache.width / this.nodeResizeCache.height;
                } else {
                    newMinHeight = minWidth * this.nodeResizeCache.height / this.nodeResizeCache.width;
                }
                height = this.nodeResizeCache.height + y < newMinHeight ? newMinHeight : this.nodeResizeCache.height + y;
                width = this.nodeResizeCache.width - x < newMinWidth ? newMinWidth : this.nodeResizeCache.width - x;
                if (height / width > this.nodeResizeCache.height / this.nodeResizeCache.width) {
                    width = height * this.nodeResizeCache.width / this.nodeResizeCache.height;
                } else {
                    height = width * this.nodeResizeCache.height / this.nodeResizeCache.width;
                }
                this.selectedElement.shape.x = right - width / 2;
                this.selectedElement.shape.y = top + height / 2;
                this.selectedElement.shape.height = height;
                this.selectedElement.shape.width = width;
                break;
            case 'nw':
                newMinWidth = minWidth;
                newMinHeight = minHeight;
                if (this.nodeResizeCache.width > this.nodeResizeCache.height) {
                    newMinWidth = minHeight * this.nodeResizeCache.width / this.nodeResizeCache.height;
                } else {
                    newMinHeight = minWidth * this.nodeResizeCache.height / this.nodeResizeCache.width;
                }
                height = this.nodeResizeCache.height - y < newMinHeight ? newMinHeight : this.nodeResizeCache.height - y;
                width = this.nodeResizeCache.width - x < newMinWidth ? newMinWidth : this.nodeResizeCache.width - x;
                if (height / width > this.nodeResizeCache.height / this.nodeResizeCache.width) {
                    width = height * this.nodeResizeCache.width / this.nodeResizeCache.height;
                } else {
                    height = width * this.nodeResizeCache.height / this.nodeResizeCache.width;
                }
                this.selectedElement.shape.x = right - width / 2;
                this.selectedElement.shape.y = bottom - height / 2;
                this.selectedElement.shape.height = height;
                this.selectedElement.shape.width = width;
                break;
            default:
                break;
        }
        this.selectedElement.relations.map(function (relation) {
            relation.createPath();
            relation.index = _this2.indexMark;
            _this2.indexMark++;
        });
        _editorFunction2.default.reload.call(this);
    },
    //节点形状调整结束
    nodeResized: function nodeResized(event) {
        this.resetEventListener();
        _editorFunction2.default.saveStepCache.call(this);
    },
    //键盘事件
    keyDown: function keyDown(event) {
        var left = { x: -1, y: 0 };
        var up = { x: 0, y: -1 };
        var right = { x: 1, y: 0 };
        var down = { x: 0, y: 1 };

        //删除元素
        if (event.keyCode === 46 && this.selectedElement) {
            event.preventDefault();
            _editorFunction2.default.deleteEle.call(this);
        }
        //撤销
        else if (event.keyCode === 90 && event.ctrlKey) {
                event.preventDefault();
                _editorFunction2.default.undo.call(this);
            }
            //重做
            else if (event.keyCode === 89 && event.ctrlKey) {
                    event.preventDefault();
                    _editorFunction2.default.redo.call(this);
                }
                //保存
                else if (event.keyCode === 83 && event.ctrlKey) {
                        //触发保存事件
                        event.preventDefault();
                        _editorFunction2.default.save.call(this);
                    }
                    //移动节点或组
                    else if (event.keyCode === 37) {
                            event.preventDefault();
                            _editorFunction2.default.moveShapeOrGroup.call(this, left);
                        } else if (event.keyCode === 38) {
                            event.preventDefault();
                            _editorFunction2.default.moveShapeOrGroup.call(this, up);
                        } else if (event.keyCode === 39) {
                            event.preventDefault();
                            _editorFunction2.default.moveShapeOrGroup.call(this, right);
                        } else if (event.keyCode === 40) {
                            event.preventDefault();
                            _editorFunction2.default.moveShapeOrGroup.call(this, down);
                        }
    },
    //画布大小调节
    resize: function resize(event) {
        if (this.widthFunc || this.heightFunc) {
            if (this.widthFunc) {
                var width = this.widthFunc();
                this.canvas.style.width = width + "px";
                this.canvas.width = width * _settings2.default.ratio;
            }
            if (this.heightFunc) {
                var height = this.heightFunc();
                this.canvas.style.height = height + "px";
                this.canvas.height = height * _settings2.default.ratio;
            }
            _editorFunction2.default.reload.call(this);
        }
    },
    //操作过程中鼠标离开画布
    mouseLeaveHandler: function mouseLeaveHandler(event) {
        this.resetEventListener();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.load(this.stepCache[this.stepMark], true);
        this.currentLine = null;
        this.lineCache = null;
        this.selectedConnector = null;
        this.moveCache = null;
        this.selectedElement = null;
    },
    //拖动画布超出范围
    canvasMoveLeave: function canvasMoveLeave(event) {
        this.resetEventListener();
        this.canvasMoveCache = null;
    },
    //拖动画布或创建组
    moveCanvasOrCompose: function moveCanvasOrCompose(event) {
        var x = event.offsetX * _settings2.default.ratio - this.clickPoint.x;
        var y = event.offsetY * _settings2.default.ratio - this.clickPoint.y;

        if (this.composeModel && event.ctrlKey) {
            _editorFunction2.default.rollbackForMoving.call(this);
            _editorFunction2.default.saveAll.call(this);
            var lt = { x: this.clickPoint.x, y: this.clickPoint.y },
                width = 0,
                height = 0;
            if (x > 0 && y > 0) {
                width = x;
                height = y;
            } else if (x > 0 && y < 0) {
                lt.y = event.offsetY * _settings2.default.ratio;
                width = x;
                height = y * -1;
            } else if (x < 0 && y > 0) {
                lt.x = event.offsetX * _settings2.default.ratio;
                width = x * -1;
                height = y;
            } else if (x < 0 && y < 0) {
                lt.x = event.offsetX * _settings2.default.ratio;
                lt.y = event.offsetY * _settings2.default.ratio;
                width = x * -1;
                height = y * -1;
            }

            this.ctx.save();
            this.ctx.lineWidth = 0.7;
            this.ctx.setLineDash([6, 3]);
            this.ctx.lineDashOffset = 0;
            this.ctx.strokeRect(lt.x, lt.y, width, height);
            this.ctx.restore();
        } else if (this.composeModel && !event.ctrlKey) {
            this.composeModel = false;
        } else {
            //拖拽画布
            //缓存拖拽前的位置信息
            if (!this.canvasMoveCache) {
                this.canvasMoveCache = [];
                var _iteratorNormalCompletion9 = true;
                var _didIteratorError9 = false;
                var _iteratorError9 = undefined;

                try {
                    for (var _iterator9 = this.elements[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                        var element = _step9.value;

                        var ele = {};
                        if (element instanceof _node3.Node) {
                            ele.id = element.id;
                            ele.x = element.shape.x;
                            ele.y = element.shape.y;
                            this.canvasMoveCache.push(ele);
                        } else if (element instanceof _relation.Relation) {
                            ele.id = element.id;
                            if (!element.from) {
                                ele.startPoint = {};
                                ele.startPoint.x = element.startPoint.x;
                                ele.startPoint.y = element.startPoint.y;
                            }
                            if (!element.to) {
                                ele.endPoint = {};
                                ele.endPoint.x = element.endPoint.x;
                                ele.endPoint.y = element.endPoint.y;
                            }
                            if (element.line.inflexionPoint) {
                                ele.inflexionPoint = _commonFunctions2.default.deepClone(element.line.inflexionPoint);
                            }
                            this.canvasMoveCache.push(ele);
                        }
                    }
                } catch (err) {
                    _didIteratorError9 = true;
                    _iteratorError9 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion9 && _iterator9.return) {
                            _iterator9.return();
                        }
                    } finally {
                        if (_didIteratorError9) {
                            throw _iteratorError9;
                        }
                    }
                }
            }

            var _iteratorNormalCompletion10 = true;
            var _didIteratorError10 = false;
            var _iteratorError10 = undefined;

            try {
                for (var _iterator10 = this.canvasMoveCache[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                    var _ele = _step10.value;

                    var _element = void 0;
                    if (Object.hasOwnProperty.call(this.elementDict, _ele.id)) {
                        _element = this.elementDict[_ele.id];
                        if (_element instanceof _node3.Node) {
                            _element.shape.x = _ele.x + x;
                            _element.shape.y = _ele.y + y;
                        } else if (_element instanceof _relation.Relation) {
                            if (!_element.from) {
                                _element.startPoint.x = _ele.startPoint.x + x;
                                _element.startPoint.y = _ele.startPoint.y + y;
                            }
                            if (!_element.to) {
                                _element.endPoint.x = _ele.endPoint.x + x;
                                _element.endPoint.y = _ele.endPoint.y + y;
                            }
                            if (_element.line.inflexionPoint) {
                                _element.line.inflexionPoint = [];
                                var _iteratorNormalCompletion11 = true;
                                var _didIteratorError11 = false;
                                var _iteratorError11 = undefined;

                                try {
                                    for (var _iterator11 = _ele.inflexionPoint[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                                        var point = _step11.value;

                                        var newpoint = {};
                                        newpoint.x = point.x + x;
                                        newpoint.y = point.y + y;
                                        _element.line.inflexionPoint.push(newpoint);
                                    }
                                } catch (err) {
                                    _didIteratorError11 = true;
                                    _iteratorError11 = err;
                                } finally {
                                    try {
                                        if (!_iteratorNormalCompletion11 && _iterator11.return) {
                                            _iterator11.return();
                                        }
                                    } finally {
                                        if (_didIteratorError11) {
                                            throw _iteratorError11;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                _didIteratorError10 = true;
                _iteratorError10 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion10 && _iterator10.return) {
                        _iterator10.return();
                    }
                } finally {
                    if (_didIteratorError10) {
                        throw _iteratorError10;
                    }
                }
            }

            _editorFunction2.default.reload.call(this);
        }
    },
    //拖动画布或创建组结束
    moveCanvasComplete: function moveCanvasComplete(event) {
        this.resetEventListener();
        this.canvasMoveCache = null;
        //组合
        if (this.composeModel) {
            this.composeModel = false;
            _editorFunction2.default.rollbackForMoving.call(this);
            var left = this.clickPoint.x < event.offsetX * _settings2.default.ratio ? this.clickPoint.x : event.offsetX * _settings2.default.ratio;
            var top = this.clickPoint.y < event.offsetY * _settings2.default.ratio ? this.clickPoint.y : event.offsetY * _settings2.default.ratio;
            var right = this.clickPoint.x > event.offsetX * _settings2.default.ratio ? this.clickPoint.x : event.offsetX * _settings2.default.ratio;
            var bottom = this.clickPoint.y > event.offsetY * _settings2.default.ratio ? this.clickPoint.y : event.offsetY * _settings2.default.ratio;
            var composeNodes = this.nodes.filter(function (node) {
                return top <= node.shape.top && left <= node.shape.left && right >= node.shape.right && bottom >= node.shape.bottom;
            });
            if (composeNodes.length === 1) {
                this.selectedElement = composeNodes[0];
                _editorFunction2.default.reload.call(this);
            } else if (composeNodes.length > 1) {
                this.selectedElement = new _group.Group(this.canvas);
                this.selectedElement.nodes = composeNodes;
                this.selectedElement.relations = this.relations.filter(function (relation) {
                    return composeNodes.indexOf(relation.from) !== -1 && composeNodes.indexOf(relation.to) !== -1;
                });
                _editorFunction2.default.reload.call(this);
            }
            //触发选中元素事件
            var selectedElementEvent = _event6.default.selectedElement;
            selectedElementEvent.element = _editorFunction2.default.outPutUnit(this.selectedElement);
            this.canvas.dispatchEvent(selectedElementEvent);
            selectedElementEvent.element = null;
        }
    },
    //拖动新节点进入画布
    mouseEnterEventHandler: function mouseEnterEventHandler(event) {
        this.removeEventListener('mouseenter', this.mouseEnterEventHandler);
        this.removeEventListener('mousemove', this.mouseOverSelect);
        this.clickPoint.x = event.offsetX * _settings2.default.ratio;
        this.clickPoint.y = event.offsetY * _settings2.default.ratio;
        this.dragedNode.x = event.offsetX * _settings2.default.ratio;
        this.dragedNode.y = event.offsetY * _settings2.default.ratio;
        this.selectedElement = _editorFunction2.default.createNode.call(this, this.dragedNode, true);

        this.addEventListener('mouseup', this.addNewNode);
        this.addEventListener('mousemove', this.drawDashShape);
        this.addEventListener('mouseleave', this.mouseLeaveHandler);
    },
    //绘制新节点
    addNewNode: function addNewNode(event) {
        this.resetEventListener();
        var x = event.offsetX * _settings2.default.ratio - this.clickPoint.x;
        var y = event.offsetY * _settings2.default.ratio - this.clickPoint.y;
        _editorFunction2.default.rollbackForMoving.call(this);
        this.moveCache = null;

        //把图形放在画布上，再把对象添加进集合
        this.nodes.push(this.selectedElement);
        this.elements.push(this.selectedElement);
        this.elementDict[this.selectedElement.id] = this.selectedElement;
        _editorFunction2.default.moveShape.call(this, x + this.offset_X, y + this.offset_Y);

        //触发选中元素事件
        var selectedElementEvent = _event6.default.selectedElement;
        selectedElementEvent.element = _editorFunction2.default.outPutUnit(this.selectedElement);
        this.canvas.dispatchEvent(selectedElementEvent);
        selectedElementEvent.element = null;

        _editorFunction2.default.saveStepCache.call(this);
    }
};


function drawMarkLine(start, end, context) {
    if (!context) return;
    context.save();
    context.beginPath();
    context.lineWidth = 0.6;
    context.strokeStyle = "rgb(150, 50, 50, 1)";
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
    context.restore();
};

function sortNode_Right(a, b) {
    return a.shape.center.x - b.shape.center.x;
}

function sortNode_Left(a, b) {
    return b.shape.center.x - a.shape.center.x;
}

function sortNode_Top(a, b) {
    return b.shape.center.y - a.shape.center.y;
}

function sortNode_Bottom(a, b) {
    return a.shape.center.y - b.shape.center.y;
}

function sortCon(a, b) {
    return b.distance - a.distance;
}

function getCompareNode_Right(nodes, center, currentNode) {
    var rightNodes = [];
    //找到所有右边的节点
    nodes.map(function (node) {
        if (node.shape.center.x > center.x && currentNode !== node) {
            rightNodes.push(node);
        }
    });
    rightNodes.sort(sortNode_Right);
    var _iteratorNormalCompletion12 = true;
    var _didIteratorError12 = false;
    var _iteratorError12 = undefined;

    try {
        for (var _iterator12 = rightNodes[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
            var item = _step12.value;

            if (item.shape.top <= center.y && item.shape.bottom >= center.y) {
                return item;
            }
        }
    } catch (err) {
        _didIteratorError12 = true;
        _iteratorError12 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion12 && _iterator12.return) {
                _iterator12.return();
            }
        } finally {
            if (_didIteratorError12) {
                throw _iteratorError12;
            }
        }
    }

    return null;
}

function getCompareNode_Left(nodes, center, currentNode) {
    var leftNodes = [];
    //找到所有左边的节点
    nodes.map(function (node) {
        if (node.shape.center.x < center.x && currentNode !== node) {
            leftNodes.push(node);
        }
    });
    leftNodes.sort(sortNode_Left);
    var _iteratorNormalCompletion13 = true;
    var _didIteratorError13 = false;
    var _iteratorError13 = undefined;

    try {
        for (var _iterator13 = leftNodes[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
            var item = _step13.value;

            if (item.shape.top <= center.y && item.shape.bottom >= center.y) {
                return item;
            }
        }
    } catch (err) {
        _didIteratorError13 = true;
        _iteratorError13 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion13 && _iterator13.return) {
                _iterator13.return();
            }
        } finally {
            if (_didIteratorError13) {
                throw _iteratorError13;
            }
        }
    }

    return null;
}

function getCompareNode_Top(nodes, center, currentNode) {
    var topNodes = [];
    //找到所有上边的节点
    nodes.map(function (node) {
        if (node.shape.center.y < center.y && currentNode !== node) {
            topNodes.push(node);
        }
    });
    topNodes.sort(sortNode_Top);
    var _iteratorNormalCompletion14 = true;
    var _didIteratorError14 = false;
    var _iteratorError14 = undefined;

    try {
        for (var _iterator14 = topNodes[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
            var item = _step14.value;

            if (item.shape.left <= center.x && item.shape.right >= center.x) {
                return item;
            }
        }
    } catch (err) {
        _didIteratorError14 = true;
        _iteratorError14 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion14 && _iterator14.return) {
                _iterator14.return();
            }
        } finally {
            if (_didIteratorError14) {
                throw _iteratorError14;
            }
        }
    }

    return null;
}

function getCompareNode_Bottom(nodes, center, currentNode) {
    var bottomNodes = [];
    //找到所有下边的节点
    nodes.map(function (node) {
        if (node.shape.center.y > center.y && currentNode !== node) {
            bottomNodes.push(node);
        }
    });
    bottomNodes.sort(sortNode_Bottom);
    var _iteratorNormalCompletion15 = true;
    var _didIteratorError15 = false;
    var _iteratorError15 = undefined;

    try {
        for (var _iterator15 = bottomNodes[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
            var item = _step15.value;

            if (item.shape.left <= center.x && item.shape.right >= center.x) {
                return item;
            }
        }
    } catch (err) {
        _didIteratorError15 = true;
        _iteratorError15 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion15 && _iterator15.return) {
                _iterator15.return();
            }
        } finally {
            if (_didIteratorError15) {
                throw _iteratorError15;
            }
        }
    }

    return null;
}

function pushHashSet(hashSet, item) {
    var _iteratorNormalCompletion16 = true;
    var _didIteratorError16 = false;
    var _iteratorError16 = undefined;

    try {
        for (var _iterator16 = hashSet[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
            var key = _step16.value;

            if (item === key) {
                return false;
            }
        }
    } catch (err) {
        _didIteratorError16 = true;
        _iteratorError16 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion16 && _iterator16.return) {
                _iterator16.return();
            }
        } finally {
            if (_didIteratorError16) {
                throw _iteratorError16;
            }
        }
    }

    hashSet.push(item);
    return true;
}