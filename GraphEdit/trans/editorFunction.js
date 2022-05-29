'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _node3 = require('./node');

var _relation2 = require('./relation');

var _event = require('./event');

var _event2 = _interopRequireDefault(_event);

var _group = require('./tools/group');

var _settings = require('./tools/settings');

var _settings2 = _interopRequireDefault(_settings);

var _commonFunctions = require('./tools/commonFunctions');

var _commonFunctions2 = _interopRequireDefault(_commonFunctions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var editorFunction = {
    saveAll: function saveAll() {
        this.moveCache = {};
        this.moveCache.x = 0;
        this.moveCache.y = 0;
        this.moveCache.imgData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    },
    saveStateForConnector: function saveStateForConnector(node) {
        this.connectorCache = node.shape.connector.saveState();
    },
    saveStateForLine_Right: function saveStateForLine_Right(center, right) {
        center.y = right.shape.center.y;
        this.start_x = { x: center.x - this.selectedElement.shape.width / 2 - 15 + this.offset_X, y: center.y };
        this.end_x = { x: right.shape.center.x + right.shape.width / 2 + 15, y: center.y };
    },
    saveStateForLine_Left: function saveStateForLine_Left(center, left) {
        center.y = left.shape.center.y;
        this.start_x = { x: left.shape.center.x - left.shape.width / 2 - 15, y: center.y };
        this.end_x = { x: center.x + this.selectedElement.shape.width / 2 + 15 + this.offset_X, y: center.y };
    },
    saveStateForLine_Top: function saveStateForLine_Top(center, top) {
        center.x = top.shape.center.x;
        this.start_y = { x: center.x, y: top.shape.center.y - top.shape.height / 2 - 15 };
        this.end_y = { x: center.x, y: center.y + this.selectedElement.shape.height / 2 + 15 + this.offset_Y };
    },
    saveStateForLine_Bottom: function saveStateForLine_Bottom(center, bottom) {
        center.x = bottom.shape.center.x;
        this.start_y = { x: center.x, y: center.y - this.selectedElement.shape.height / 2 - 15 + this.offset_Y };
        this.end_y = { x: center.x, y: bottom.shape.center.y + bottom.shape.height / 2 + 15 };
    },
    rollbackForMoving: function rollbackForMoving() {
        var context = this.ctx;
        if (this.moveCache) {
            context.putImageData(this.moveCache.imgData, this.moveCache.x, this.moveCache.y);
        }
    },
    rollbackConnector: function rollbackConnector() {
        if (this.connectorCache) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.connectorCache[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var cache = _step.value;

                    this.ctx.putImageData(cache.imgData, cache.x, cache.y);
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

            this.connectorCache = null;
        }
    },
    createNode: function createNode(params) {
        var isVirtual = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        var node = new _node3.Node(params, this.canvas);
        node.index = this.indexMark;
        this.indexMark++;
        if (!isVirtual) {
            node.draw();
            this.nodes.push(node);
            this.elements.push(node);
            this.elementDict[node.id] = node;
        };
        return node;
    },
    createRelation: function createRelation(params) {
        var relation = new _relation2.Relation(params, this.canvas);
        relation.index = this.indexMark;
        this.indexMark++;
        if (!relation.line.inflexionPoint) {
            relation.createPath();
        }

        if (relation.from) {
            relation.from.relations.push(relation);
        };
        if (relation.to) {
            relation.to.relations.push(relation);
        }
        this.relations.push(relation);
        this.elements.push(relation);
        this.elementDict[relation.id] = relation;

        return relation;
    },
    moveShape: function moveShape(x, y) {
        if (!(this.selectedElement instanceof _node3.Node)) return;
        //清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.selectedElement.shape.x = this.selectedElement.shape.x + x;
        this.selectedElement.shape.y = this.selectedElement.shape.y + y;
        this.selectedElement.index = this.indexMark;
        this.indexMark++;

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = this.selectedElement.relations[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var relation = _step2.value;

                relation.createPath();
                relation.index = this.indexMark;
                this.indexMark++;
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

        this.elements = this.elements.sort(function (a, b) {
            return a.index - b.index;
        });
        this.elements.map(function (element) {
            element.draw();
        });
        //绘制连接点
        this.selectedElement.drawConnector();
        this.selectedElement.showController();
    },
    moveGroup: function moveGroup(x, y) {
        if (!(this.selectedElement instanceof _group.Group)) return;
        //清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        //先处理节点
        this.selectedElement.nodes = this.selectedElement.nodes.sort(function (a, b) {
            return a.index - b.index;
        });
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = this.selectedElement.nodes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var node = _step3.value;

                node.shape.x = node.shape.x + x;
                node.shape.y = node.shape.y + y;
                node.index = this.indexMark;
                this.indexMark++;
            }
            //再处理线
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

        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
            for (var _iterator4 = this.selectedElement.nodes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var _node = _step4.value;
                var _iteratorNormalCompletion7 = true;
                var _didIteratorError7 = false;
                var _iteratorError7 = undefined;

                try {
                    for (var _iterator7 = _node.relations[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                        var relation = _step7.value;

                        if (this.selectedElement.relations.indexOf(relation) == -1) {
                            relation.createPath();
                            relation.index = this.indexMark;
                            this.indexMark++;
                        }
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

        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
            for (var _iterator5 = this.selectedElement.relations[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                var _relation = _step5.value;

                if (_relation.line.inflexionPoint) {
                    var _iteratorNormalCompletion8 = true;
                    var _didIteratorError8 = false;
                    var _iteratorError8 = undefined;

                    try {
                        for (var _iterator8 = _relation.line.inflexionPoint[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                            var point = _step8.value;

                            point.x = point.x + x;
                            point.y = point.y + y;
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
                }
                _relation.index = this.indexMark;
                this.indexMark++;
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

        this.elements = this.elements.sort(function (a, b) {
            return a.index - b.index;
        });
        this.elements.map(function (element) {
            element.draw();
        });

        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
            for (var _iterator6 = this.selectedElement.nodes[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                var _node2 = _step6.value;

                _node2.showController();
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

        this.selectedElement.draw();
    },

    //重新加载图形
    reload: function reload() {
        var isShowController = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

        //清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.elements = this.elements.sort(function (a, b) {
            return a.index - b.index;
        });
        this.elements.map(function (element) {
            element.draw();
        });
        if (this.selectedElement && isShowController) {
            if (this.selectedElement instanceof _group.Group) {
                var _iteratorNormalCompletion9 = true;
                var _didIteratorError9 = false;
                var _iteratorError9 = undefined;

                try {
                    for (var _iterator9 = this.selectedElement.nodes[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                        var node = _step9.value;

                        node.showController();
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

                this.selectedElement.draw();
            } else {
                this.selectedElement.showController();
            }
        }
    },
    undo: function undo() {
        var loadCache = null;
        if (this.stepMark > 0) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            loadCache = this.stepCache[--this.stepMark];

            //触发undo事件
            var undoEvent = _event2.default.undo;
            this.canvas.dispatchEvent(undoEvent);

            this.load(loadCache, true);
        }
    },
    redo: function redo() {
        var loadCache = null;
        if (this.stepMark < this.stepCache.length - 1) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            loadCache = this.stepCache[++this.stepMark];

            //触发redo事件
            var redoEvent = _event2.default.redo;
            this.canvas.dispatchEvent(redoEvent);

            this.load(loadCache, true);
        }
    },
    deleteEle: function deleteEle() {
        var _this = this;

        if (this.selectedElement instanceof _node3.Node) {
            if (this.nodes.indexOf(this.selectedElement) == -1) return;
            this.nodes.splice(this.nodes.indexOf(this.selectedElement), 1);
            this.elements.splice(this.elements.indexOf(this.selectedElement), 1);
            var _iteratorNormalCompletion10 = true;
            var _didIteratorError10 = false;
            var _iteratorError10 = undefined;

            try {
                for (var _iterator10 = this.selectedElement.relations[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                    var relation = _step10.value;

                    if (relation.from === this.selectedElement) {
                        relation.startPoint = {
                            x: relation.startPoint.x,
                            y: relation.startPoint.y
                        };
                        relation.from = null;
                    }
                    if (relation.to === this.selectedElement) {
                        relation.endPoint = {
                            x: relation.endPoint.x,
                            y: relation.endPoint.y
                        };
                        relation.to = null;
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
        } else if (this.selectedElement instanceof _relation2.Relation) {
            if (this.relations.indexOf(this.selectedElement) == -1) return;
            this.relations.splice(this.relations.findIndex(function (relation) {
                return relation === _this.selectedElement;
            }), 1);
            this.elements.splice(this.elements.findIndex(function (relation) {
                return relation === _this.selectedElement;
            }), 1);
            if (this.selectedElement.from) {
                this.selectedElement.from.relations.splice(this.selectedElement.from.relations.findIndex(function (relation) {
                    return relation === _this.selectedElement;
                }), 1);
            }
            if (this.selectedElement.to && this.selectedElement.to !== this.selectedElement.from) {
                this.selectedElement.to.relations.splice(this.selectedElement.to.relations.findIndex(function (relation) {
                    return relation === _this.selectedElement;
                }), 1);
            }
        } else {
            return;
        }
        Reflect.deleteProperty(this.elementDict, this.selectedElement.id);
        this.selectedElement = null;
        editorFunction.reload.call(this);
        editorFunction.saveStepCache.call(this);
    },

    //上下左右键平移图形
    moveShapeOrGroup: function moveShapeOrGroup(vector) {
        if (this.selectedElement && this.selectedElement instanceof _node3.Node) {
            editorFunction.moveShape.call(this, vector.x, vector.y);
        } else if (this.selectedElement && this.selectedElement instanceof _group.Group) {
            editorFunction.moveGroup.call(this, vector.x, vector.y);
        }
    },
    saveStepCache: function saveStepCache() {
        //当前数据记入缓存 
        if (this.stepMark < this.stepCache.length - 1) {
            this.stepCache.splice(this.stepMark + 1, this.stepCache.length - this.stepMark - 1);
        }
        this.stepCache.push(_outPut(this.elements));
        while (this.stepCache.length > 100) {
            this.stepCache.pop();
        }
        this.stepMark = this.stepCache.length - 1;
    },
    save: function save() {
        //触发保存事件
        var saveEvent = _event2.default.save;
        saveEvent.data = {};
        saveEvent.data.dict = this.elementDict;
        saveEvent.data.elements = _outPut(this.elements);
        this.canvas.dispatchEvent(saveEvent);
        saveEvent.data = null;
    },
    changeTextAlign: function changeTextAlign(textAlign) {
        if (this.selectedElement instanceof _node3.Node) {
            this.selectedElement.shape.text.textAlign = textAlign;
            editorFunction.reload.call(this);
            editorFunction.saveStepCache.call(this);
        }
    },
    changeBaseline: function changeBaseline(textBaseline) {
        if (this.selectedElement instanceof _node3.Node) {
            this.selectedElement.shape.text.textBaseline = textBaseline;
            editorFunction.reload.call(this);
            editorFunction.saveStepCache.call(this);
        }
    },

    outPut: function outPut(elements) {
        return _outPut(elements);
    },
    outPutUnit: function outPutUnit(element) {
        return _outPutUnit(element);
    }
};

exports.default = editorFunction;


function _outPut(elements) {
    var data = {};
    var nodecollction = [];
    var relationcollction = [];
    var _iteratorNormalCompletion11 = true;
    var _didIteratorError11 = false;
    var _iteratorError11 = undefined;

    try {
        for (var _iterator11 = elements[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
            var element = _step11.value;

            var outPut = _outPutUnit(element);
            if (outPut && outPut.isNode) {
                nodecollction.push(outPut);
            } else if (outPut && outPut.isLine) {
                relationcollction.push(outPut);
            }
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

    data.nodes = nodecollction;
    data.relations = relationcollction;

    return data;
}

function _outPutUnit(element) {
    if (element instanceof _node3.Node) {
        var node = {
            id: element.id,
            type: _settings2.default.elementTypes.node,
            shape: element.shape.type,
            index: element.index,
            x: element.shape.x,
            y: element.shape.y,
            size: element.shape.width.toString() + '*' + element.shape.height.toString(),
            label: element.label,
            fontSize: element.fontSize,
            textAlign: element.textAlign,
            textBaseline: element.textBaseline,
            color: element.shape.fillStyle,
            edgeColor: element.shape.strokeStyle,
            customProperties: _commonFunctions2.default.deepClone(element.customProperties),
            isNode: true,
            isLine: false
        };
        return node;
    } else if (element instanceof _relation2.Relation) {
        var relation = {
            id: element.id,
            type: _settings2.default.elementTypes.relation,
            index: element.index,
            source: element.source,
            fromConOrder: element.fromConOrder,
            target: element.target,
            toConOrder: element.toConOrder,
            inflexionPoint: _commonFunctions2.default.deepClone(element.line.inflexionPoint),
            label: element.label,
            fontSize: element.fontSize,
            color: element.line.strokeStyle,
            startPoint: _commonFunctions2.default.deepClone(element.line.start),
            endPoint: _commonFunctions2.default.deepClone(element.line.end),
            lineModel: element.lineModel,
            customProperties: _commonFunctions2.default.deepClone(element.customProperties),
            isNode: false,
            isLine: true
        };
        return relation;
    } else if (element instanceof _group.Group) {
        return _outPut(element.nodes.concat(element.relations));
    } else {
        return null;
    }
}