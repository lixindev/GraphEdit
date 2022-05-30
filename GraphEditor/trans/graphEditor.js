'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.GraphEditor = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventHandler = require('./eventHandler');

var _eventHandler2 = _interopRequireDefault(_eventHandler);

var _editorFunction = require('./editorFunction');

var _editorFunction2 = _interopRequireDefault(_editorFunction);

var _settings = require('./tools/settings');

var _settings2 = _interopRequireDefault(_settings);

var _noSuchCommandError = require('./errors/noSuchCommandError');

var _noSuchEventError = require('./errors/noSuchEventError');

var _event = require('./event');

var _event2 = _interopRequireDefault(_event);

var _babelPolyfill = require('babel-polyfill');

var _babelPolyfill2 = _interopRequireDefault(_babelPolyfill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GraphEditor = exports.GraphEditor = function () {
    function GraphEditor(width, height) {
        var _this = this;

        _classCallCheck(this, GraphEditor);

        this.initial();
        //步骤缓存
        this.stepCache = [];
        this.stepCache.push([]);
        this.stepMark = 0;
        //事件哈希表
        this.eventDict = {};
        //宽度设置函数
        this.widthFunc;
        //高度设置函数
        this.heightFunc;
        //宽度
        this.canvasWidth;
        //高度
        this.canvasHeight;
        var type = Object.prototype.toString.call(width);
        if (type === '[object Function]') {
            this.widthFunc = width;
            this.canvasWidth = width();
        } else if (type === '[object Number]') {
            this.canvasWidth = width;
        }
        type = Object.prototype.toString.call(height);
        if (type === '[object Function]') {
            this.heightFunc = height;
            this.canvasHeight = height();
        } else if (type === '[object Number]') {
            this.canvasHeight = height;
        }

        this.canvas = createCanvas(this.canvasWidth, this.canvasHeight);
        this.ctx = this.canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';

        //拖动线条，从连接点开始的新线条
        this.drawNewDashLine = function (e) {
            return _eventHandler2.default.drawNewDashLine.call(_this, e);
        };
        //节点拖拽, 绘制标志线
        this.drawDashShape = function (e) {
            return _eventHandler2.default.drawDashShape.call(_this, e);
        };
        //移动节点
        this.moveSelectedElement = function (e) {
            return _eventHandler2.default.moveSelectedElement.call(_this, e);
        };
        //鼠标悬停选中和鼠标样式变化等
        this.mouseOverSelect = function (e) {
            return _eventHandler2.default.mouseOverSelect.call(_this, e);
        };
        //绘制线条
        this.drawLine = function (e) {
            return _eventHandler2.default.drawLine.call(_this, e);
        };
        //拖动线条端点
        this.changeStartOrEndOfLine = function (e) {
            return _eventHandler2.default.changeStartOrEndOfLine.call(_this, e);
        };
        //拖动线条中段控制点
        this.drawCurrentDashLine = function (e) {
            return _eventHandler2.default.drawCurrentDashLine.call(_this, e);
        };
        //拖拽元素超出画布
        this.mouseLeaveHandler = function (e) {
            return _eventHandler2.default.mouseLeaveHandler.call(_this, e);
        };
        //拖拽画布或组合
        this.moveCanvasOrCompose = function (e) {
            return _eventHandler2.default.moveCanvasOrCompose.call(_this, e);
        };
        //拖拽画布或组合结束
        this.moveCanvasComplete = function (e) {
            return _eventHandler2.default.moveCanvasComplete.call(_this, e);
        };
        //拖拽画布超出画布
        this.canvasMoveLeave = function (e) {
            return _eventHandler2.default.canvasMoveLeave.call(_this, e);
        };
        //拖拽节点控制点
        this.nodeResizing = function (e) {
            return _eventHandler2.default.nodeResizing.call(_this, e);
        };
        //拖拽节点控制点结束
        this.nodeResized = function (e) {
            return _eventHandler2.default.nodeResized.call(_this, e);
        };

        //拖动新节点进入画布
        this.mouseEnterEventHandler = function (e) {
            return _eventHandler2.default.mouseEnterEventHandler.call(_this, e);
        };
        //canvas的mouseup监听，绘制新节点
        this.addNewNode = function (e) {
            return _eventHandler2.default.addNewNode.call(_this, e);
        };
        //窗口的mouseup监听
        this.mouseUpEventHandler = function (e) {
            return mouseUpEventHandler.call(_this, e);
        };

        this.addEventListener('mousedown', function (e) {
            //先触发失去焦点事件
            document.activeElement.blur();
            _eventHandler2.default.mouseDownEventHandler.call(_this, e);
        });
        this.addEventListener('mousemove', this.mouseOverSelect);
        window.addEventListener('keydown', function (e) {
            return _eventHandler2.default.keyDown.call(_this, e);
        });
        window.addEventListener('resize', function (e) {
            return _eventHandler2.default.resize.call(_this, e);
        });
    }

    _createClass(GraphEditor, [{
        key: 'initial',
        value: function initial() {
            //图中所有节点
            this.nodes = [];
            //图中所有线
            this.relations = [];
            //所有元素集合
            this.elements = [];
            //元素哈希表
            this.elementDict = {};
            //被选中节点
            this.selectedElement = null;
            //鼠标悬停节点
            this.mouseOverNode = null;
            //保存移动前图形
            this.moveCache = null;
            //最大图层
            this.indexMark = 0;
            //鼠标点击坐标
            this.clickPoint = {};

            //Y轴偏移量
            this.offset_Y = 0;
            //横向标记线起始和结束点
            this.start_x = null;
            this.end_x = null;
            //X轴偏移量
            this.offset_X = 0;
            //纵向标记线起始和结束点
            this.start_y = null;
            this.end_y = null;

            //连接点区域缓存
            this.connectorCache = null;
            //选中连接点及连接点序号
            this.selectedConnector = null;
            //存储连线的起始点信息
            this.startPoint = null;
            //当前正在操作的线条
            this.currentLine = null;
            this.lineCache = null;
            //拖动控制点缓存
            this.nodeResizeCache = null;

            //元素栏
            this.itemPannelEle = null;
            //新拖入节点信息
            this.dragedNode = null;
            //详细信息
            this.detailPannelEle = null;
            this.canvasMoveCache = null;
            this.toolbarEle = null;
            this.composeModel = false;
        }
    }, {
        key: 'load',
        value: function load(data) {
            var isLoadCache = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            this.initial();
            //加载缓存时不清除缓存
            if (!isLoadCache) {
                //步骤缓存
                this.stepCache = [];
                this.stepCache.push([]);
                this.stepMark = 0;
            }
            if (!data.nodes) data.nodes = [];
            if (!data.relations) data.relations = [];
            var elements = data.nodes.concat(data.relations);

            elements.sort(function (a, b) {
                return a.index - b.index;
            });
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = elements[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var item = _step.value;

                    if (item.type === _settings2.default.elementTypes.node) {
                        var size = item.size.split('*');
                        var nodeParam = {
                            id: item.id,
                            strokeStyle: item.edgeColor,
                            fillStyle: item.color,
                            type: item.type,
                            shape: item.shape,
                            text: {
                                content: item.label,
                                fontSize: item.fontSize,
                                textAlign: item.textAlign,
                                textBaseline: item.textBaseline
                            },
                            index: item.index,
                            width: parseInt(size[0]),
                            height: parseInt(size[1]),
                            x: item.x,
                            y: item.y,
                            customProperties: item.customProperties
                        };
                        _editorFunction2.default.createNode.call(this, nodeParam);
                    } else if (item.type === _settings2.default.elementTypes.relation) {
                        var lineParam = {
                            id: item.id,
                            strokeStyle: item.color,
                            type: item.type,
                            text: {
                                content: item.label,
                                fontSize: item.fontSize
                            },
                            index: item.index,
                            fromConOrder: item.fromConOrder,
                            toConOrder: item.toConOrder,
                            inflexionPoint: item.inflexionPoint,
                            startPoint: item.startPoint,
                            endPoint: item.endPoint,
                            lineModel: item.lineModel,
                            customProperties: item.customProperties
                        };

                        if (item.source && Object.hasOwnProperty.call(this.elementDict, item.source)) {
                            lineParam.from = this.elementDict[item.source];
                        }
                        if (item.target && Object.hasOwnProperty.call(this.elementDict, item.target)) {
                            lineParam.to = this.elementDict[item.target];
                        }
                        var relation = _editorFunction2.default.createRelation.call(this, lineParam);
                        relation.draw();
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

            if (!isLoadCache) {
                //当前数据记入缓存 
                this.stepCache.push(_editorFunction2.default.outPut(this.elements));
                this.stepMark = this.stepCache.length - 1;
            }
        }
    }, {
        key: 'addEventListener',
        value: function addEventListener(operation, func) {
            var isExists = true;
            if (Object.hasOwnProperty.call(this.eventDict, operation)) {
                var any = this.eventDict[operation].filter(function (value) {
                    return value === func;
                });
                if (!any || any.length === 0) {
                    isExists = false;
                }
            } else {
                this.eventDict[operation] = [];
                isExists = false;
            }

            if (!isExists) {
                this.eventDict[operation].push(func);
                this.canvas.addEventListener(operation, func);
            }
        }
    }, {
        key: 'removeEventListener',
        value: function removeEventListener(operation, func) {
            var isExists = true;
            if (Object.hasOwnProperty.call(this.eventDict, operation)) {
                var any = this.eventDict[operation].filter(function (value) {
                    return value === func;
                });
                if (!any || any.length === 0) {
                    isExists = false;
                }
            } else {
                this.eventDict[operation] = [];
                isExists = false;
            }

            if (isExists) {
                this.eventDict[operation].splice(this.eventDict[operation].indexOf(func), 1);
                this.canvas.removeEventListener(operation, func);
            }
        }
    }, {
        key: 'resetEventListener',
        value: function resetEventListener() {
            var _this2 = this;

            for (var key in this.eventDict) {
                if (Object.hasOwnProperty.call(this.eventDict, key)) {
                    var funcArray = this.eventDict[key];
                    for (var index = 0; index < funcArray.length; index++) {
                        var func = funcArray[index];
                        this.canvas.removeEventListener(key, func);
                    }
                }
            }
            this.eventDict = {};
            this.addEventListener('mousedown', function (e) {
                //先触发失去焦点事件
                document.activeElement.blur();
                _eventHandler2.default.mouseDownEventHandler.call(_this2, e);
            });
            this.addEventListener('mousemove', this.mouseOverSelect);
        }
    }, {
        key: 'on',
        value: function on(eventName, eventHandler) {
            if (!_event2.default[eventName]) {
                throw new _noSuchEventError.NoSuchEventError("编辑器不支持此事件。");
            }
            if (eventName === 'click') {
                eventName = 'canvasClick';
            };
            this.canvas.addEventListener(eventName, eventHandler);
        }
    }, {
        key: 'update',
        value: function update(elementId, property) {
            if (Object.hasOwnProperty.call(this.elementDict, elementId)) {
                if (_settings2.default.properties.indexOf(property.name) !== -1) {
                    this.elementDict[elementId][property.name] = property.value;
                    _editorFunction2.default.saveStepCache.call(this);
                    _editorFunction2.default.reload.call(this);
                } else {
                    this.elementDict[elementId].customProperties[property.name] = property.value;
                }
            }
        }
    }, {
        key: 'data',
        get: function get() {
            return _editorFunction2.default.outPut(this.elements);
        }
    }, {
        key: 'itemPannel',
        set: function set(value) {
            var _this3 = this;

            document.body.onselectstart = function () {
                return false;
            };
            this.itemPannelEle = document.getElementById(value);
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.itemPannelEle.children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var div = _step2.value;

                    div.addEventListener('mousedown', function (e) {
                        return nodeDrag.call(_this3, e);
                    });
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
        }
    }, {
        key: 'detailPannel',
        set: function set(value) {
            this.detailPannelEle = document.getElementById(value);
        }
    }, {
        key: 'toolbar',
        set: function set(value) {
            var _this4 = this;

            this.toolbarEle = document.getElementById(value);
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this.toolbarEle.childNodes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var btn = _step3.value;

                    if (btn.getAttribute && btn.getAttribute('data-command')) {
                        switch (btn.getAttribute('data-command')) {
                            case 'undo':
                                btn.addEventListener('click', function (e) {
                                    return _editorFunction2.default.undo.call(_this4);
                                });
                                break;
                            case 'redo':
                                btn.addEventListener('click', function (e) {
                                    return _editorFunction2.default.redo.call(_this4);
                                });
                                break;
                            case 'delete':
                                btn.addEventListener('click', function (e) {
                                    return _editorFunction2.default.deleteEle.call(_this4);
                                });
                                break;
                            case 'save':
                                btn.addEventListener('click', function (e) {
                                    return _editorFunction2.default.save.call(_this4);
                                });
                                break;
                            case 'alignLeft':
                                btn.addEventListener('click', function (e) {
                                    return _editorFunction2.default.changeTextAlign.call(_this4, 'left');
                                });
                                break;
                            case 'alignCenter':
                                btn.addEventListener('click', function (e) {
                                    return _editorFunction2.default.changeTextAlign.call(_this4, 'center');
                                });
                                break;
                            case 'alignRight':
                                btn.addEventListener('click', function (e) {
                                    return _editorFunction2.default.changeTextAlign.call(_this4, 'right');
                                });
                                break;
                            case 'baselineTop':
                                btn.addEventListener('click', function (e) {
                                    return _editorFunction2.default.changeBaseline.call(_this4, 'top');
                                });
                                break;
                            case 'baselineMiddle':
                                btn.addEventListener('click', function (e) {
                                    return _editorFunction2.default.changeBaseline.call(_this4, 'middle');
                                });
                                break;
                            case 'baselineBottom':
                                btn.addEventListener('click', function (e) {
                                    return _editorFunction2.default.changeBaseline.call(_this4, 'bottom');
                                });
                                break;
                            default:
                                throw new _noSuchCommandError.NoSuchCommandError("编辑器不支持此命令。");
                        }
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
        }
    }, {
        key: 'width',
        set: function set(value) {
            var type = Object.prototype.toString.call(value);
            if (type === '[object Function]') {
                this.widthFunc = value;
                var width = this.widthFunc();
                this.canvas.style.width = width + "px";
                this.canvas.width = width * _settings2.default.ratio;
            } else if (type === '[object Number]') {
                this.canvas.style.width = value + "px";
                this.canvas.width = value * _settings2.default.ratio;
            }
        }
    }, {
        key: 'height',
        set: function set(value) {
            var type = Object.prototype.toString.call(value);
            if (type === '[object Function]') {
                this.heightFunc = value;
                var height = this.heightFunc();
                this.canvas.style.height = height + "px";
                this.canvas.height = height * _settings2.default.ratio;
            } else if (type === '[object Number]') {
                this.canvas.style.height = value + "px";
                this.canvas.height = value * _settings2.default.ratio;
            }
        }
    }]);

    return GraphEditor;
}();

window.GraphEditor = GraphEditor;

//创建画布
function createCanvas(width, height) {
    var canvasDiv = document.getElementById('canvas');
    var canvas = document.createElement('canvas');

    var cwidth = width ? width : canvasDiv.width;
    var cheight = height ? height : canvasDiv.height;
    canvas.style.width = cwidth + "px";
    canvas.style.height = cheight + "px";

    canvas.width = cwidth * _settings2.default.ratio;
    canvas.height = cheight * _settings2.default.ratio;
    canvasDiv.appendChild(canvas);

    return canvas;
}

function nodeDrag(event) {
    this.dragedNode = {};
    var target = null;
    if (event.target.localName === 'div') {
        target = event.target;
    } else {
        target = event.target.parentNode;
    };
    var size = target.getAttribute('data-size').split('*');
    this.dragedNode.type = 'node';
    this.dragedNode.shape = target.getAttribute('data-shape');
    this.dragedNode.width = parseInt(size[0]) * _settings2.default.ratio;
    this.dragedNode.height = parseInt(size[1]) * _settings2.default.ratio;
    this.dragedNode.text = {};
    this.dragedNode.text.content = target.getAttribute('data-label');
    this.dragedNode.fillStyle = target.getAttribute('data-color');
    this.dragedNode.strokeStyle = target.getAttribute('data-edgecolor');

    this.addEventListener('mouseenter', this.mouseEnterEventHandler);
    window.addEventListener('mouseup', this.mouseUpEventHandler);
}

function mouseUpEventHandler(event) {
    this.resetEventListener();
    window.removeEventListener('mouseup', this.mouseUpEventHandler);
}

// function getPixelRatio(context) {
//     var backingStore = context.backingStorePixelRatio 
//     || context.webkitBackingStorePixelRatio 
//     || context.mozBackingStorePixelRatio 
//     || context.msBackingStorePixelRatio 
//     || context.oBackingStorePixelRatio 
//     || context.backingStorePixelRatio || 1;
//     return (window.devicePixelRatio || 1) / backingStore;
// }