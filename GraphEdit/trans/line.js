'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Line = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base = require('./shapes/base');

var _arrow = require('./arrow');

var _arrow2 = _interopRequireDefault(_arrow);

var _lineController = require('./lineController');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var margin = 25;
var minMargin = 10;

var Line = exports.Line = function (_Base) {
    _inherits(Line, _Base);

    function Line(params, canvas) {
        _classCallCheck(this, Line);

        var _this = _possibleConstructorReturn(this, (Line.__proto__ || Object.getPrototypeOf(Line)).call(this, params, canvas));

        _this.start = null;
        _this.end = null;
        _this.from = null;
        _this.to = null;
        _this.fromConOrder = null;
        _this.toConOrder = null;
        _this.isSelected = false;
        if (params.id) {
            _this.id = params.id;
        } else {
            _this.id = generateUUID();
        }

        if (params.index) {
            _this.index = params.index;
        } else {
            _this.index = null;
        }

        if (params.inflexionPoint) {
            _this.inflexionPoint = JSON.parse(JSON.stringify(params.inflexionPoint));
        } else {
            _this.inflexionPoint = null;
        }
        if (params.text) {
            _this.text = params.text;
        } else {
            _this.text = {
                content: null,
                fontSize: null
            };
        }

        if (params.from && params.fromConOrder) {
            _this.from = params.from;
            _this.fromConOrder = params.fromConOrder;
        } else {
            _this.start = {};
            _this.start.x = params.startPoint.x;
            _this.start.y = params.startPoint.y;
        };
        if (params.to && params.toConOrder) {
            _this.to = params.to;
            _this.toConOrder = params.toConOrder;
        } else {
            _this.end = {};
            _this.end.x = params.endPoint.x;
            _this.end.y = params.endPoint.y;
        };
        //存放自定义属性，使用引用类型
        if (params.customProperties) {
            _this.customProperties = params.customProperties;
        } else {
            _this.customProperties = {};
        }

        _this.controller = new _lineController.LineController(_this, canvas);
        return _this;
    }

    _createClass(Line, [{
        key: 'createPath',
        value: function createPath() {
            this.inflexionPoint = [];
            var hitResult = false;
            if (this.from && this.to) {
                hitResult = this.from.hitCheck(this.endPoint.x, this.endPoint.y) || this.to.hitCheck(this.startPoint.x, this.startPoint.y);
            }
            //两边都没有关联节点
            if (!this.startPoint.order && !this.endPoint.order) {
                if (this.startPoint.x !== this.endPoint.x && this.startPoint.y !== this.endPoint.y) {
                    var point = {};
                    point.x = this.startPoint.x;
                    point.y = this.endPoint.y;
                    this.inflexionPoint.push(point);
                } else {
                    this.inflexionPoint = null;
                }
            }
            //从连接点1开始规划路线
            else if (this.startPoint.order && this.startPoint.order === 1) {
                    createPathUnit.call(this, hitResult);
                } else if (this.startPoint.order && this.startPoint.order === 2) {
                    var _ref = [this.from.shape.y, this.canvas.width - this.from.shape.x];
                    //坐标系逆时针旋转90度，转换起始节点坐标

                    this.from.shape.x = _ref[0];
                    this.from.shape.y = _ref[1];
                    var _ref2 = [this.from.shape.height, this.from.shape.width];
                    this.from.shape.width = _ref2[0];
                    this.from.shape.height = _ref2[1];

                    this.fromConOrder = 1;
                    //没有连接到节点，只转化终点坐标
                    if (this.endPoint && !this.endPoint.order) {
                        var _ref3 = [this.endPoint.y, this.canvas.width - this.endPoint.x];
                        this.endPoint.x = _ref3[0];
                        this.endPoint.y = _ref3[1];
                    } else if (this.to !== this.from) {
                        var _ref4 = [this.to.shape.y, this.canvas.width - this.to.shape.x];
                        this.to.shape.x = _ref4[0];
                        this.to.shape.y = _ref4[1];
                        var _ref5 = [this.to.shape.height, this.to.shape.width];
                        this.to.shape.width = _ref5[0];
                        this.to.shape.height = _ref5[1];

                        this.toConOrder = --this.toConOrder;
                        if (this.toConOrder < 1) {
                            this.toConOrder = this.toConOrder + 4;
                        }
                    } else {
                        //自环
                        this.toConOrder = --this.toConOrder;
                        if (this.toConOrder < 1) {
                            this.toConOrder = this.toConOrder + 4;
                        }
                    }
                    createPathUnit.call(this, hitResult);
                    //坐标系顺时针旋转90度，转换起始节点坐标
                    var _ref6 = [this.canvas.width - this.from.shape.y, this.from.shape.x];
                    this.from.shape.x = _ref6[0];
                    this.from.shape.y = _ref6[1];
                    var _ref7 = [this.from.shape.height, this.from.shape.width];
                    this.from.shape.width = _ref7[0];
                    this.from.shape.height = _ref7[1];

                    this.fromConOrder = 2;
                    //没有连接到节点，只转化终点坐标
                    if (this.endPoint && !this.endPoint.order) {
                        var _ref8 = [this.canvas.width - this.endPoint.y, this.endPoint.x];
                        this.endPoint.x = _ref8[0];
                        this.endPoint.y = _ref8[1];
                    } else if (this.to !== this.from) {
                        var _ref9 = [this.canvas.width - this.to.shape.y, this.to.shape.x];
                        this.to.shape.x = _ref9[0];
                        this.to.shape.y = _ref9[1];
                        var _ref10 = [this.to.shape.height, this.to.shape.width];
                        this.to.shape.width = _ref10[0];
                        this.to.shape.height = _ref10[1];

                        this.toConOrder = ++this.toConOrder;
                        if (this.toConOrder > 4) {
                            this.toConOrder = this.toConOrder - 4;
                        }
                    } else {
                        //自环
                        this.toConOrder = ++this.toConOrder;
                        if (this.toConOrder > 4) {
                            this.toConOrder = this.toConOrder - 4;
                        }
                    }
                    //转换所有路径上的节点
                    if (this.inflexionPoint) {
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = this.inflexionPoint[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var _point = _step.value;
                                var _ref11 = [this.canvas.width - _point.y, _point.x];
                                _point.x = _ref11[0];
                                _point.y = _ref11[1];
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
                    }
                } else if (this.startPoint.order && this.startPoint.order === 3) {
                    var _ref12 = [this.canvas.width - this.from.shape.x, this.canvas.height - this.from.shape.y];
                    //坐标系逆时针旋转180度，转换起始节点坐标

                    this.from.shape.x = _ref12[0];
                    this.from.shape.y = _ref12[1];

                    this.fromConOrder = 1;
                    //没有连接到节点，只转化终点坐标
                    if (this.endPoint && !this.endPoint.order) {
                        var _ref13 = [this.canvas.width - this.endPoint.x, this.canvas.height - this.endPoint.y];
                        this.endPoint.x = _ref13[0];
                        this.endPoint.y = _ref13[1];
                    } else if (this.to !== this.from) {
                        var _ref14 = [this.canvas.width - this.to.shape.x, this.canvas.height - this.to.shape.y];
                        this.to.shape.x = _ref14[0];
                        this.to.shape.y = _ref14[1];

                        this.toConOrder = this.toConOrder - 2;
                        if (this.toConOrder < 1) {
                            this.toConOrder = this.toConOrder + 4;
                        }
                    } else {
                        this.toConOrder = this.toConOrder - 2;
                        if (this.toConOrder < 1) {
                            this.toConOrder = this.toConOrder + 4;
                        }
                    }
                    createPathUnit.call(this, hitResult);
                    //坐标系顺时针旋转180度，转换起始节点坐标
                    var _ref15 = [this.canvas.width - this.from.shape.x, this.canvas.height - this.from.shape.y];
                    this.from.shape.x = _ref15[0];
                    this.from.shape.y = _ref15[1];

                    this.fromConOrder = 3;
                    //没有连接到节点，只转化终点坐标
                    if (this.endPoint && !this.endPoint.order) {
                        var _ref16 = [this.canvas.width - this.endPoint.x, this.canvas.height - this.endPoint.y];
                        this.endPoint.x = _ref16[0];
                        this.endPoint.y = _ref16[1];
                    } else if (this.to !== this.from) {
                        var _ref17 = [this.canvas.width - this.to.shape.x, this.canvas.height - this.to.shape.y];
                        this.to.shape.x = _ref17[0];
                        this.to.shape.y = _ref17[1];

                        this.toConOrder = this.toConOrder + 2;
                        if (this.toConOrder > 4) {
                            this.toConOrder = this.toConOrder - 4;
                        }
                    } else {
                        this.toConOrder = this.toConOrder + 2;
                        if (this.toConOrder > 4) {
                            this.toConOrder = this.toConOrder - 4;
                        }
                    }
                    //转换所有路径上的节点
                    if (this.inflexionPoint) {
                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = this.inflexionPoint[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var _point2 = _step2.value;
                                var _ref18 = [this.canvas.width - _point2.x, this.canvas.height - _point2.y];
                                _point2.x = _ref18[0];
                                _point2.y = _ref18[1];
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
                } else if (this.startPoint.order && this.startPoint.order === 4) {
                    var _ref19 = [this.canvas.width - this.from.shape.y, this.from.shape.x];
                    //坐标系顺时针旋转90度，转换起始节点坐标

                    this.from.shape.x = _ref19[0];
                    this.from.shape.y = _ref19[1];
                    var _ref20 = [this.from.shape.height, this.from.shape.width];
                    this.from.shape.width = _ref20[0];
                    this.from.shape.height = _ref20[1];

                    this.fromConOrder = 1;
                    //没有连接到节点，只转化终点坐标
                    if (this.endPoint && !this.endPoint.order) {
                        var _ref21 = [this.canvas.width - this.endPoint.y, this.endPoint.x];
                        this.endPoint.x = _ref21[0];
                        this.endPoint.y = _ref21[1];
                    } else if (this.to !== this.from) {
                        var _ref22 = [this.canvas.width - this.to.shape.y, this.to.shape.x];
                        this.to.shape.x = _ref22[0];
                        this.to.shape.y = _ref22[1];
                        var _ref23 = [this.to.shape.height, this.to.shape.width];
                        this.to.shape.width = _ref23[0];
                        this.to.shape.height = _ref23[1];

                        this.toConOrder = ++this.toConOrder;
                        if (this.toConOrder > 4) {
                            this.toConOrder = this.toConOrder - 4;
                        }
                    } else {
                        this.toConOrder = ++this.toConOrder;
                        if (this.toConOrder > 4) {
                            this.toConOrder = this.toConOrder - 4;
                        }
                    }
                    createPathUnit.call(this, hitResult);
                    //坐标系逆时针旋转90度，转换起始节点坐标
                    var _ref24 = [this.from.shape.y, this.canvas.width - this.from.shape.x];
                    this.from.shape.x = _ref24[0];
                    this.from.shape.y = _ref24[1];
                    var _ref25 = [this.from.shape.height, this.from.shape.width];
                    this.from.shape.width = _ref25[0];
                    this.from.shape.height = _ref25[1];

                    this.fromConOrder = 4;
                    //没有连接到节点，只转化终点坐标
                    if (this.endPoint && !this.endPoint.order) {
                        var _ref26 = [this.endPoint.y, this.canvas.width - this.endPoint.x];
                        this.endPoint.x = _ref26[0];
                        this.endPoint.y = _ref26[1];
                    } else if (this.to !== this.from) {
                        var _ref27 = [this.to.shape.y, this.canvas.width - this.to.shape.x];
                        this.to.shape.x = _ref27[0];
                        this.to.shape.y = _ref27[1];
                        var _ref28 = [this.to.shape.height, this.to.shape.width];
                        this.to.shape.width = _ref28[0];
                        this.to.shape.height = _ref28[1];

                        this.toConOrder = --this.toConOrder;
                        if (this.toConOrder < 1) {
                            this.toConOrder = this.toConOrder + 4;
                        }
                    } else {
                        this.toConOrder = --this.toConOrder;
                        if (this.toConOrder < 1) {
                            this.toConOrder = this.toConOrder + 4;
                        }
                    }
                    //转换所有路径上的节点
                    if (this.inflexionPoint) {
                        var _iteratorNormalCompletion3 = true;
                        var _didIteratorError3 = false;
                        var _iteratorError3 = undefined;

                        try {
                            for (var _iterator3 = this.inflexionPoint[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                var _point3 = _step3.value;
                                var _ref29 = [_point3.y, this.canvas.width - _point3.x];
                                _point3.x = _ref29[0];
                                _point3.y = _ref29[1];
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
                } else if (!this.startPoint.order) {
                    if (this.endPoint && this.endPoint.order === 1) {
                        //逆转起始点和终点
                        this.endPoint = this.startPoint;
                        this.startPoint = null;
                        var _ref30 = [this.to, this.from];
                        this.from = _ref30[0];
                        this.to = _ref30[1];
                        var _ref31 = [this.toConOrder, this.fromConOrder];
                        this.fromConOrder = _ref31[0];
                        this.toConOrder = _ref31[1];

                        createPathUnit.call(this);
                        this.startPoint = this.endPoint;
                        this.endPoint = null;
                        var _ref32 = [this.to, this.from];
                        this.from = _ref32[0];
                        this.to = _ref32[1];
                        var _ref33 = [this.toConOrder, this.fromConOrder];
                        this.fromConOrder = _ref33[0];
                        this.toConOrder = _ref33[1];

                        this.inflexionPoint.reverse();
                    } else if (this.endPoint && this.endPoint.order === 2) {
                        //逆转起始点和终点
                        this.endPoint = this.startPoint;
                        this.startPoint = null;
                        var _ref34 = [this.to, this.from];
                        this.from = _ref34[0];
                        this.to = _ref34[1];

                        //坐标系逆时针旋转90度，转换起始节点坐标
                        var _ref35 = [this.toConOrder, this.fromConOrder];
                        this.fromConOrder = _ref35[0];
                        this.toConOrder = _ref35[1];
                        var _ref36 = [this.from.shape.y, this.canvas.width - this.from.shape.x];
                        this.from.shape.x = _ref36[0];
                        this.from.shape.y = _ref36[1];
                        var _ref37 = [this.from.shape.height, this.from.shape.width];
                        this.from.shape.width = _ref37[0];
                        this.from.shape.height = _ref37[1];

                        this.fromConOrder = 1;
                        //没有连接到节点，只转化终点坐标

                        //计算路径
                        var _ref38 = [this.endPoint.y, this.canvas.width - this.endPoint.x];
                        this.endPoint.x = _ref38[0];
                        this.endPoint.y = _ref38[1];
                        createPathUnit.call(this, hitResult);
                        //坐标系顺时针旋转90度，转换起始节点坐标
                        var _ref39 = [this.canvas.width - this.from.shape.y, this.from.shape.x];
                        this.from.shape.x = _ref39[0];
                        this.from.shape.y = _ref39[1];
                        var _ref40 = [this.from.shape.height, this.from.shape.width];
                        this.from.shape.width = _ref40[0];
                        this.from.shape.height = _ref40[1];

                        this.fromConOrder = 2;
                        //没有连接到节点，只转化终点坐标

                        //逆转起始点和终点
                        var _ref41 = [this.canvas.width - this.endPoint.y, this.endPoint.x];
                        this.endPoint.x = _ref41[0];
                        this.endPoint.y = _ref41[1];
                        this.startPoint = this.endPoint;
                        this.endPoint = null;
                        var _ref42 = [this.to, this.from];
                        this.from = _ref42[0];
                        this.to = _ref42[1];

                        //转换所有路径上的节点
                        var _ref43 = [this.toConOrder, this.fromConOrder];
                        this.fromConOrder = _ref43[0];
                        this.toConOrder = _ref43[1];
                        if (this.inflexionPoint) {
                            var _iteratorNormalCompletion4 = true;
                            var _didIteratorError4 = false;
                            var _iteratorError4 = undefined;

                            try {
                                for (var _iterator4 = this.inflexionPoint[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                    var _point4 = _step4.value;
                                    var _ref44 = [this.canvas.width - _point4.y, _point4.x];
                                    _point4.x = _ref44[0];
                                    _point4.y = _ref44[1];
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
                        }
                        this.inflexionPoint.reverse();
                    } else if (this.endPoint && this.endPoint.order === 3) {
                        //逆转起始点和终点
                        this.endPoint = this.startPoint;
                        this.startPoint = null;
                        var _ref45 = [this.to, this.from];
                        this.from = _ref45[0];
                        this.to = _ref45[1];

                        //坐标系逆时针旋转180度，转换起始节点坐标
                        var _ref46 = [this.toConOrder, this.fromConOrder];
                        this.fromConOrder = _ref46[0];
                        this.toConOrder = _ref46[1];
                        var _ref47 = [this.canvas.width - this.from.shape.x, this.canvas.height - this.from.shape.y];
                        this.from.shape.x = _ref47[0];
                        this.from.shape.y = _ref47[1];

                        this.fromConOrder = 1;
                        //没有连接到节点，只转化终点坐标

                        //计算路径
                        var _ref48 = [this.canvas.width - this.endPoint.x, this.canvas.height - this.endPoint.y];
                        this.endPoint.x = _ref48[0];
                        this.endPoint.y = _ref48[1];
                        createPathUnit.call(this, hitResult);
                        //坐标系顺时针旋转180度，转换起始节点坐标
                        var _ref49 = [this.canvas.width - this.from.shape.x, this.canvas.height - this.from.shape.y];
                        this.from.shape.x = _ref49[0];
                        this.from.shape.y = _ref49[1];

                        this.fromConOrder = 3;
                        //没有连接到节点，只转化终点坐标

                        //逆转起始点和终点
                        var _ref50 = [this.canvas.width - this.endPoint.x, this.canvas.height - this.endPoint.y];
                        this.endPoint.x = _ref50[0];
                        this.endPoint.y = _ref50[1];
                        this.startPoint = this.endPoint;
                        this.endPoint = null;
                        var _ref51 = [this.to, this.from];
                        this.from = _ref51[0];
                        this.to = _ref51[1];

                        //转换所有路径上的节点
                        var _ref52 = [this.toConOrder, this.fromConOrder];
                        this.fromConOrder = _ref52[0];
                        this.toConOrder = _ref52[1];
                        if (this.inflexionPoint) {
                            var _iteratorNormalCompletion5 = true;
                            var _didIteratorError5 = false;
                            var _iteratorError5 = undefined;

                            try {
                                for (var _iterator5 = this.inflexionPoint[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                    var _point5 = _step5.value;
                                    var _ref53 = [this.canvas.width - _point5.x, this.canvas.height - _point5.y];
                                    _point5.x = _ref53[0];
                                    _point5.y = _ref53[1];
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
                        }
                        this.inflexionPoint.reverse();
                    } else if (this.endPoint && this.endPoint.order === 4) {
                        //逆转起始点和终点
                        this.endPoint = this.startPoint;
                        this.startPoint = null;
                        var _ref54 = [this.to, this.from];
                        this.from = _ref54[0];
                        this.to = _ref54[1];

                        //坐标系顺时针旋转90度，转换起始节点坐标
                        var _ref55 = [this.toConOrder, this.fromConOrder];
                        this.fromConOrder = _ref55[0];
                        this.toConOrder = _ref55[1];
                        var _ref56 = [this.canvas.width - this.from.shape.y, this.from.shape.x];
                        this.from.shape.x = _ref56[0];
                        this.from.shape.y = _ref56[1];
                        var _ref57 = [this.from.shape.height, this.from.shape.width];
                        this.from.shape.width = _ref57[0];
                        this.from.shape.height = _ref57[1];

                        this.fromConOrder = 1;
                        //没有连接到节点，只转化终点坐标

                        //计算路径
                        var _ref58 = [this.canvas.width - this.endPoint.y, this.endPoint.x];
                        this.endPoint.x = _ref58[0];
                        this.endPoint.y = _ref58[1];
                        createPathUnit.call(this, hitResult);
                        //坐标系逆时针旋转90度，转换起始节点坐标
                        var _ref59 = [this.from.shape.y, this.canvas.width - this.from.shape.x];
                        this.from.shape.x = _ref59[0];
                        this.from.shape.y = _ref59[1];
                        var _ref60 = [this.from.shape.height, this.from.shape.width];
                        this.from.shape.width = _ref60[0];
                        this.from.shape.height = _ref60[1];

                        this.fromConOrder = 4;
                        //没有连接到节点，只转化终点坐标

                        //逆转起始点和终点
                        var _ref61 = [this.endPoint.y, this.canvas.width - this.endPoint.x];
                        this.endPoint.x = _ref61[0];
                        this.endPoint.y = _ref61[1];
                        this.startPoint = this.endPoint;
                        this.endPoint = null;
                        var _ref62 = [this.to, this.from];
                        this.from = _ref62[0];
                        this.to = _ref62[1];

                        //转换所有路径上的节点
                        var _ref63 = [this.toConOrder, this.fromConOrder];
                        this.fromConOrder = _ref63[0];
                        this.toConOrder = _ref63[1];
                        if (this.inflexionPoint) {
                            var _iteratorNormalCompletion6 = true;
                            var _didIteratorError6 = false;
                            var _iteratorError6 = undefined;

                            try {
                                for (var _iterator6 = this.inflexionPoint[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                                    var _point6 = _step6.value;
                                    var _ref64 = [_point6.y, this.canvas.width - _point6.x];
                                    _point6.x = _ref64[0];
                                    _point6.y = _ref64[1];
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
                        }
                        this.inflexionPoint.reverse();
                    }
                }
        }
    }, {
        key: 'drawLine',
        value: function drawLine(width, isDash) {
            var context = this.ctx;
            if (!context) return;
            context.save();
            context.lineWidth = width;
            context.strokeStyle = this.strokeStyle;
            context.fillStyle = 'rgba(100, 100, 100, 1)';

            if (isDash) {
                context.setLineDash([6, 3]);
                context.lineDashOffset = 0;
            }
            context.beginPath();
            context.moveTo(this.startPoint.x, this.startPoint.y);
            if (this.inflexionPoint) {
                this.inflexionPoint.map(function (point) {
                    context.lineTo(point.x, point.y);
                });
            }
            context.lineTo(this.endPoint.x, this.endPoint.y);

            context.stroke();

            var lastPoint = null;
            if (this.inflexionPoint && this.inflexionPoint.length > 0) {
                lastPoint = this.inflexionPoint.pop();
                this.inflexionPoint.push(lastPoint);
            } else {
                lastPoint = this.startPoint;
            }
            if (lastPoint.x === this.endPoint.x) {
                if (lastPoint.y > this.endPoint.y) {
                    _arrow2.default.drawArrow(context, 'up', this.endPoint);
                } else {
                    _arrow2.default.drawArrow(context, 'down', this.endPoint);
                }
            } else if (lastPoint.y === this.endPoint.y) {
                if (lastPoint.x > this.endPoint.x) {
                    _arrow2.default.drawArrow(context, 'left', this.endPoint);
                } else {
                    _arrow2.default.drawArrow(context, 'right', this.endPoint);
                }
            }
            if (!isDash && this.text && this.text.content) {
                context.lineWidth = 0.5;
                context.fillStyle = 'rgba(0, 0, 0, 1)';
                if (this.text.fontSize) {
                    context.font = this.text.fontSize + ' Microsoft Yahei';
                } else {
                    context.font = '12px Microsoft Yahei';
                    this.text.fontSize = '12px';
                }
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                var textPosition = this.textPoint;
                var content = this.text.content;
                var size = parseInt((this.text.fontSize || '12px').replace('px', ''));
                var length = context.measureText(content).width;
                context.clearRect(textPosition.x - length / 2 - 1, textPosition.y - size / 2 - 1, length + 2, size + 2);
                context.fillText(content, textPosition.x, textPosition.y);
            }
            context.restore();
        }
    }, {
        key: 'draw',
        value: function draw() {
            this.drawLine(0.7);
        }
    }, {
        key: 'drawDashLine',
        value: function drawDashLine(operation) {
            this.drawLine(0.7, true);
            this.ctx.save();
            if (this.to && operation === 'endPointChange') {
                this.ctx.strokeStyle = 'rgb(255, 50, 50, 1)';
                this.ctx.strokeRect(this.endPoint.x - 5, this.endPoint.y - 5, 10, 10);
            };
            if (this.from && operation === 'startPointChange') {
                this.ctx.strokeStyle = 'rgb(255, 50, 50, 1)';
                this.ctx.strokeRect(this.startPoint.x - 5, this.startPoint.y - 5, 10, 10);
            }
            this.ctx.restore();
        }
    }, {
        key: 'showController',
        value: function showController() {
            this.controller.draw();
        }

        //判断坐标是否命中线

    }, {
        key: 'hitCheck',
        value: function hitCheck(x, y) {
            var isHit = false;
            var point1 = this.startPoint;
            if (this.inflexionPoint) {
                this.inflexionPoint.push(this.endPoint);
            } else {
                this.inflexionPoint = [];
                this.inflexionPoint.push(this.endPoint);
            }
            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = this.inflexionPoint[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var point = _step7.value;

                    if (point1.x === point.x) {
                        if (x >= point1.x - 5 && x <= point1.x + 5 && y >= (point1.y > point.y ? point.y : point1.y) && y <= (point1.y < point.y ? point.y : point1.y)) {
                            isHit = true;
                            break;
                        }
                    } else if (point1.y === point.y) {
                        if (y >= point1.y - 5 && y <= point1.y + 5 && x >= (point1.x > point.x ? point.x : point1.x) && x <= (point1.x < point.x ? point.x : point1.x)) {
                            isHit = true;
                            break;
                        }
                    }
                    point1 = point;
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

            this.inflexionPoint.pop();
            if (this.inflexionPoint.length === 0) {
                this.inflexionPoint = null;
            }

            return isHit;
        }
    }, {
        key: 'startPoint',
        get: function get() {
            if (this.start) {
                return this.start;
            } else if (this.from && this.fromConOrder === 1) {
                return this.from.shape.connector.firstPoint;
            } else if (this.from && this.fromConOrder === 2) {
                return this.from.shape.connector.secondPoint;
            } else if (this.from && this.fromConOrder === 3) {
                return this.from.shape.connector.thirdPoint;
            } else if (this.from && this.fromConOrder === 4) {
                return this.from.shape.connector.forthPoint;
            }
        },
        set: function set(value) {
            this.start = value;
        }
    }, {
        key: 'endPoint',
        get: function get() {
            if (this.end) {
                return this.end;
            } else if (this.to && this.toConOrder === 1) {
                return this.to.shape.connector.firstPoint;
            } else if (this.to && this.toConOrder === 2) {
                return this.to.shape.connector.secondPoint;
            } else if (this.to && this.toConOrder === 3) {
                return this.to.shape.connector.thirdPoint;
            } else if (this.to && this.toConOrder === 4) {
                return this.to.shape.connector.forthPoint;
            }
        },
        set: function set(value) {
            this.end = value;
        }
    }, {
        key: 'textPoint',
        get: function get() {
            if (this.inflexionPoint && this.inflexionPoint.length > 0) {
                var total = 0;
                var length = 0;
                var collection = [];
                var part1 = {};
                var part2 = {};
                part1.first = this.startPoint;
                part1.second = this.inflexionPoint[0];
                part1.distance = part1.first.x === part1.second.x ? Math.abs(part1.first.y - part1.second.y) : Math.abs(part1.first.x - part1.second.x);
                collection.push(part1);
                total += part1.distance;
                if (this.inflexionPoint.length > 1) {
                    for (var index = 0; index < this.inflexionPoint.length - 1; index++) {
                        var part = {};
                        part.first = this.inflexionPoint[index];
                        part.second = this.inflexionPoint[index + 1];
                        part.distance = part.first.x === part.second.x ? Math.abs(part.first.y - part.second.y) : Math.abs(part.first.x - part.second.x);
                        collection.push(part);
                        total += part.distance;
                    }
                }
                part2.first = this.inflexionPoint[this.inflexionPoint.length - 1];
                part2.second = this.endPoint;
                part2.distance = part2.first.x === part2.second.x ? Math.abs(part2.first.y - part2.second.y) : Math.abs(part2.first.x - part2.second.x);
                collection.push(part2);
                total += part2.distance;

                var _iteratorNormalCompletion8 = true;
                var _didIteratorError8 = false;
                var _iteratorError8 = undefined;

                try {
                    for (var _iterator8 = collection[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                        var _part = _step8.value;

                        length += _part.distance;
                        if (length >= total / 2) {
                            if (_part.first.x === _part.second.x) {
                                return {
                                    x: _part.first.x,
                                    y: _part.second.y > _part.first.y ? _part.second.y - length + total / 2 : _part.second.y + length - total / 2
                                };
                            } else if (_part.first.y === _part.second.y) {
                                return {
                                    x: _part.second.x > _part.first.x ? _part.second.x - length + total / 2 : _part.second.x + length - total / 2,
                                    y: _part.second.y
                                };
                            }
                        }
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
            } else {
                if (this.startPoint.x === this.endPoint.x) {
                    return {
                        x: this.startPoint.x,
                        y: (this.startPoint.y + this.endPoint.y) / 2
                    };
                } else if (this.startPoint.y === this.endPoint.y) {
                    return {
                        x: (this.startPoint.x + this.endPoint.x) / 2,
                        y: this.startPoint.y
                    };
                }
            }
        }
    }, {
        key: 'label',
        get: function get() {
            return this.text.content ? this.text.content : null;
        },
        set: function set(value) {
            this.text.content = value;
        }
    }, {
        key: 'fontSize',
        get: function get() {
            return this.text.fontSize ? this.text.fontSize : '12px';
        },
        set: function set(value) {
            this.text.fontSize = value;
        }
    }, {
        key: 'source',
        get: function get() {
            return this.from ? this.from.id : null;
        }
    }, {
        key: 'target',
        get: function get() {
            return this.to ? this.to.id : null;
        }
    }]);

    return Line;
}(_base.Base);

function generateUUID() {
    var d = new Date().getTime();
    if (window.performance && typeof window.performance.now === "function") {
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : r & 0x3 | 0x8).toString(16);
    });
    return uuid;
};

function createPathUnit(hitResult) {
    if (this.endPoint && !this.endPoint.order) {
        var point1 = {};
        point1.x = this.startPoint.x;
        point1.y = this.startPoint.y - margin;
        if (this.endPoint.y < point1.y && this.endPoint.x !== point1.x) {
            point1.y = this.endPoint.y;
            this.inflexionPoint.push(point1);
        } else if (this.endPoint.y < point1.y && this.endPoint.x === point1.x) {
            this.inflexionPoint = null;
        } else if (this.endPoint.y > point1.y && this.endPoint.y <= this.from.shape.bottom) {
            this.inflexionPoint.push(point1);
            var point2 = {};
            point2.x = this.endPoint.x;
            point2.y = point1.y;
            this.inflexionPoint.push(point2);
        } else {
            this.inflexionPoint.push(point1);
            if (this.endPoint.y !== point1.y) {
                if (this.endPoint.x > this.from.shape.left - margin && this.endPoint.x < this.from.shape.center.x) {
                    var _point7 = {};
                    _point7.x = this.from.shape.left - margin;
                    _point7.y = point1.y;
                    this.inflexionPoint.push(_point7);
                    var point3 = {};
                    point3.x = _point7.x;
                    point3.y = this.endPoint.y;
                    this.inflexionPoint.push(point3);
                } else if (this.endPoint.x >= this.from.shape.center.x && this.endPoint.x < this.from.shape.right + margin) {
                    var _point8 = {};
                    _point8.x = this.from.shape.right + margin;
                    _point8.y = point1.y;
                    this.inflexionPoint.push(_point8);
                    var _point9 = {};
                    _point9.x = _point8.x;
                    _point9.y = this.endPoint.y;
                    this.inflexionPoint.push(_point9);
                } else {
                    var _point10 = {};
                    _point10.x = this.endPoint.x;
                    _point10.y = point1.y;
                    this.inflexionPoint.push(_point10);
                }
            }
        }
    } else if (this.endPoint && this.endPoint.order && this.endPoint.order === 1) {
        //节点一连节点一
        var _point11 = {};
        _point11.x = this.startPoint.x;
        _point11.y = this.startPoint.y - margin;
        if (hitResult && this.from !== this.to) {
            if (this.endPoint.x !== this.startPoint.x && this.endPoint.y !== this.startPoint.y) {
                var _point12 = {};
                _point12.x = this.startPoint.x;
                _point12.y = (this.endPoint.y + this.startPoint.y) / 2;
                this.inflexionPoint.push(_point12);
                var _point13 = {};
                _point13.x = this.endPoint.x;
                _point13.y = _point12.y;
                this.inflexionPoint.push(_point13);
            } else {
                this.inflexionPoint = null;
            }
        } else if (this.endPoint.y - margin < _point11.y && (_point11.x < this.to.shape.left - minMargin || _point11.x > this.to.shape.right + minMargin)) {
            _point11.y = this.endPoint.y - margin;
            this.inflexionPoint.push(_point11);
            var _point14 = {};
            _point14.x = this.endPoint.x;
            _point14.y = _point11.y;
            this.inflexionPoint.push(_point14);
        } else if (this.endPoint.y - margin < _point11.y) {
            if (this.from.shape.top - this.to.shape.bottom < margin + minMargin) {
                _point11.y = (this.from.shape.top + this.to.shape.bottom) / 2;
            }
            this.inflexionPoint.push(_point11);
            var _point15 = {};
            if (this.from.shape.center.x >= this.to.shape.center.x) {
                _point15.x = this.to.shape.right + minMargin;
            } else {
                _point15.x = this.to.shape.left - minMargin;
            }
            _point15.y = _point11.y;
            this.inflexionPoint.push(_point15);
            var _point16 = {};
            _point16.x = _point15.x;
            _point16.y = this.endPoint.y - margin;
            this.inflexionPoint.push(_point16);
            var point4 = {};
            point4.x = this.endPoint.x;
            point4.y = _point16.y;
            this.inflexionPoint.push(point4);
        } else {
            this.inflexionPoint.push(_point11);
            if (this.endPoint.x > this.from.shape.left - minMargin && this.endPoint.x < this.from.shape.center.x && this.from.shape.bottom < this.endPoint.y) {
                var _point17 = {};
                _point17.x = this.from.shape.left - minMargin;
                _point17.y = _point11.y;
                this.inflexionPoint.push(_point17);
                var _point18 = {};
                if (this.endPoint.y - this.from.shape.bottom <= margin) {
                    _point18.x = _point17.x;
                    _point18.y = (this.endPoint.y + this.from.shape.bottom) / 2;
                } else {
                    _point18.x = _point17.x;
                    _point18.y = this.endPoint.y - margin;
                }
                this.inflexionPoint.push(_point18);
                var _point19 = {};
                _point19.x = this.endPoint.x;
                _point19.y = _point18.y;
                this.inflexionPoint.push(_point19);
            } else if (this.endPoint.x >= this.from.shape.center.x && this.endPoint.x < this.from.shape.right + minMargin && this.from.shape.bottom < this.endPoint.y) {
                var _point20 = {};
                _point20.x = this.from.shape.right + minMargin;
                _point20.y = _point11.y;
                this.inflexionPoint.push(_point20);
                var _point21 = {};
                if (this.endPoint.y - this.from.shape.bottom <= margin) {
                    _point21.x = _point20.x;
                    _point21.y = (this.endPoint.y + this.from.shape.bottom) / 2;
                } else {
                    _point21.x = _point20.x;
                    _point21.y = this.endPoint.y - margin;
                }
                this.inflexionPoint.push(_point21);
                var _point22 = {};
                _point22.x = this.endPoint.x;
                _point22.y = _point21.y;
                this.inflexionPoint.push(_point22);
            } else {
                var _point23 = {};
                _point23.x = this.endPoint.x;
                _point23.y = _point11.y;
                this.inflexionPoint.push(_point23);
            }
        }
    } else if (this.endPoint && this.endPoint.order && this.endPoint.order === 2) {
        //节点一连节点二
        var _point24 = {};
        _point24.x = this.startPoint.x;
        _point24.y = this.startPoint.y - margin;
        if (hitResult && this.from !== this.to) {
            var _point25 = {};
            _point25.x = this.startPoint.x;
            _point25.y = this.endPoint.y;
            this.inflexionPoint.push(_point25);
        } else if (this.startPoint.y > this.endPoint.y && (this.endPoint.x + minMargin < this.startPoint.x || this.from.shape.top <= this.to.shape.bottom && this.endPoint.x < this.startPoint.x)) {
            _point24.y = this.endPoint.y;
            this.inflexionPoint.push(_point24);
        } else if (this.endPoint.x + minMargin >= this.startPoint.x && this.to.shape.bottom < this.startPoint.y - margin) {
            if (this.startPoint.y - this.to.shape.bottom < margin + minMargin) {
                _point24.y = (this.startPoint.y + this.to.shape.bottom) / 2;
            } else {
                _point24.y = this.to.shape.bottom + margin;
            }
            this.inflexionPoint.push(_point24);
            var _point26 = {};
            _point26.x = this.endPoint.x + margin;
            _point26.y = _point24.y;
            this.inflexionPoint.push(_point26);
            var _point27 = {};
            _point27.x = _point26.x;
            _point27.y = this.endPoint.y;
            this.inflexionPoint.push(_point27);
        } else if (this.endPoint.x + minMargin >= this.startPoint.x && this.to.shape.bottom >= this.startPoint.y - margin - minMargin && this.endPoint.y <= this.from.shape.bottom || this.endPoint.y > this.from.shape.bottom && this.endPoint.x >= this.from.shape.center.x) {
            var _point28 = {};
            var _point29 = {};
            if (this.startPoint.x < this.to.shape.right + minMargin && this.startPoint.x > this.to.shape.left - minMargin && this.to.shape.bottom < this.from.shape.top) {
                _point24.y = (this.from.shape.top + this.to.shape.bottom) / 2;
                this.inflexionPoint.push(_point24);
                _point28.x = this.to.shape.right + minMargin;
                _point28.y = _point24.y;
                this.inflexionPoint.push(_point28);
            } else {
                if (this.to.shape.top - margin > this.startPoint.y - minMargin) {
                    _point24.y = this.startPoint.y - margin;
                } else {
                    _point24.y = this.to.shape.top - margin;
                }
                this.inflexionPoint.push(_point24);
                _point28.x = (this.endPoint.x > this.from.shape.right ? this.endPoint.x : this.from.shape.right) + margin;
                _point28.y = _point24.y;
                this.inflexionPoint.push(_point28);
            }
            _point29.x = _point28.x;
            _point29.y = this.endPoint.y;
            this.inflexionPoint.push(_point29);
        } else if (this.startPoint.y - minMargin < this.endPoint.y && this.endPoint.y <= this.from.shape.bottom) {
            this.inflexionPoint.push(_point24);
            var _point30 = {};
            if (this.endPoint.x <= this.from.shape.left - margin - minMargin) {
                _point30.x = this.from.shape.left - margin;
            } else {
                _point30.x = (this.from.shape.left + this.endPoint.x) / 2;
            }
            _point30.y = _point24.y;
            this.inflexionPoint.push(_point30);
            var _point31 = {};
            _point31.x = _point30.x;
            _point31.y = this.endPoint.y;
            this.inflexionPoint.push(_point31);
        } else if (this.endPoint.x <= this.from.shape.left - minMargin) {
            this.inflexionPoint.push(_point24);
            var _point32 = {};
            if (this.from.shape.left - this.endPoint.x < margin + minMargin) {
                _point32.x = (this.from.shape.left + this.endPoint.x) / 2;
            } else {
                _point32.x = this.endPoint.x + margin;
            }
            _point32.y = _point24.y;
            this.inflexionPoint.push(_point32);
            var _point33 = {};
            _point33.x = _point32.x;
            _point33.y = this.endPoint.y;
            this.inflexionPoint.push(_point33);
        } else if (this.from.shape.bottom + minMargin <= this.to.shape.top) {
            this.inflexionPoint.push(_point24);
            var _point34 = {};
            _point34.x = this.from.shape.left - margin;
            _point34.y = _point24.y;
            this.inflexionPoint.push(_point34);
            var _point35 = {};
            _point35.x = _point34.x;
            if (this.to.shape.top - this.from.shape.bottom < margin + minMargin) {
                _point35.y = (this.from.shape.bottom + this.to.shape.top) / 2;
            } else {
                _point35.y = this.from.shape.bottom + margin;
            }
            this.inflexionPoint.push(_point35);
            var _point36 = {};
            _point36.x = this.endPoint.x + margin;
            _point36.y = _point35.y;
            this.inflexionPoint.push(_point36);
            var point5 = {};
            point5.x = _point36.x;
            point5.y = this.endPoint.y;
            this.inflexionPoint.push(point5);
        } else {
            this.inflexionPoint.push(_point24);
            var _point37 = {};
            _point37.x = this.from.shape.right + margin;
            _point37.y = _point24.y;
            this.inflexionPoint.push(_point37);
            var _point38 = {};
            _point38.x = _point37.x;
            _point38.y = this.endPoint.y;
            this.inflexionPoint.push(_point38);
        }
    } else if (this.endPoint && this.endPoint.order && this.endPoint.order === 3) {
        //节点一连节点三
        var _point39 = {};
        _point39.x = this.startPoint.x;
        _point39.y = this.startPoint.y - margin;
        if (hitResult && this.from !== this.to) {
            if (this.endPoint.x === this.startPoint.x) {
                this.inflexionPoint = null;
            } else {
                _point39.y = this.to.shape.bottom + margin;
                this.inflexionPoint.push(_point39);
                var _point40 = {};
                _point40.x = this.endPoint.x;
                _point40.y = _point39.y;
                this.inflexionPoint.push(_point40);
            }
        } else if (this.endPoint.y < this.startPoint.y - margin) {
            if (this.endPoint.x === this.startPoint.x) {
                this.inflexionPoint = null;
            } else {
                if (this.endPoint.y > this.startPoint.y - margin - minMargin) {
                    _point39.y = (this.endPoint.y + this.startPoint.y) / 2;
                    this.inflexionPoint.push(_point39);
                } else {
                    this.inflexionPoint.push(_point39);
                }
                var _point41 = {};
                _point41.x = this.endPoint.x;
                _point41.y = _point39.y;
                this.inflexionPoint.push(_point41);
            }
        } else if (this.to.shape.right < this.from.shape.left - margin) {
            this.inflexionPoint.push(_point39);
            var _point42 = {};
            var _point43 = {};
            var _point44 = {};
            if (this.to.shape.right > this.from.shape.left - margin - minMargin) {
                _point42.x = (this.to.shape.right + this.from.shape.left) / 2;
                _point42.y = _point39.y;
                this.inflexionPoint.push(_point42);
            } else {
                _point42.x = this.from.shape.left - margin;
                _point42.y = _point39.y;
                this.inflexionPoint.push(_point42);
            }
            _point43.x = _point42.x;
            _point43.y = this.to.shape.bottom + margin;
            this.inflexionPoint.push(_point43);
            _point44.x = this.endPoint.x;
            _point44.y = _point43.y;
            this.inflexionPoint.push(_point44);
        } else if (this.to.shape.left > this.from.shape.right + margin) {
            this.inflexionPoint.push(_point39);
            var _point45 = {};
            var _point46 = {};
            var _point47 = {};
            if (this.to.shape.left < this.from.shape.right + margin + minMargin) {
                _point45.x = (this.to.shape.left + this.from.shape.right) / 2;
                _point45.y = _point39.y;
                this.inflexionPoint.push(_point45);
            } else {
                _point45.x = this.from.shape.right + margin;
                _point45.y = _point39.y;
                this.inflexionPoint.push(_point45);
            }
            _point46.x = _point45.x;
            _point46.y = this.to.shape.bottom + margin;
            this.inflexionPoint.push(_point46);
            _point47.x = this.endPoint.x;
            _point47.y = _point46.y;
            this.inflexionPoint.push(_point47);
        } else if (this.to.shape.bottom > this.from.shape.top) {
            _point39.y = this.to.shape.top <= this.from.shape.top ? this.to.shape.top - margin : this.from.shape.top - margin;
            this.inflexionPoint.push(_point39);
            var _point48 = {};
            var _point49 = {};
            var _point50 = {};
            if (this.to.shape.center.x >= this.from.shape.center.x) {
                if (this.to.shape.right >= this.from.shape.right) {
                    _point48.x = this.to.shape.right + margin;
                    _point48.y = _point39.y;
                    this.inflexionPoint.push(_point48);
                } else {
                    _point48.x = this.from.shape.right + margin;
                    _point48.y = _point39.y;
                    this.inflexionPoint.push(_point48);
                }
            } else {
                if (this.to.shape.left <= this.from.shape.left) {
                    _point48.x = this.to.shape.left - margin;
                    _point48.y = _point39.y;
                    this.inflexionPoint.push(_point48);
                } else {
                    _point48.x = this.from.shape.left - margin;
                    _point48.y = _point39.y;
                    this.inflexionPoint.push(_point48);
                }
            }
            _point49.x = _point48.x;
            _point49.y = this.to.shape.bottom + margin;
            this.inflexionPoint.push(_point49);
            _point50.x = this.endPoint.x;
            _point50.y = _point49.y;
            this.inflexionPoint.push(_point50);
        } else {
            if (this.startPoint.x === this.endPoint.x) {
                this.inflexionPoint = null;
            } else {
                _point39.y = (this.from.shape.top + this.to.shape.bottom) / 2;
                this.inflexionPoint.push(_point39);
                var _point51 = {};
                _point51.x = this.endPoint.x;
                _point51.y = _point39.y;
                this.inflexionPoint.push(_point51);
            }
        }
    } else if (this.endPoint && this.endPoint.order && this.endPoint.order === 4) {
        //节点一连节点四
        var _point52 = {};
        _point52.x = this.startPoint.x;
        _point52.y = this.startPoint.y - margin;
        if (hitResult && this.from !== this.to) {
            if (this.startPoint.x === this.endPoint.x) {
                this.inflexionPoint = null;
            } else {
                _point52.y = this.endPoint.y;
                this.inflexionPoint.push(_point52);
            }
        } else if (this.startPoint.y - this.to.shape.bottom > margin && this.startPoint.x + minMargin > this.to.shape.left) {
            var _point53 = {};
            var _point54 = {};
            if (this.startPoint.y - this.to.shape.bottom < margin + minMargin) {
                _point52.y = (this.startPoint.y + this.to.shape.bottom) / 2;
            }
            this.inflexionPoint.push(_point52);
            _point53.x = this.endPoint.x - margin;
            _point53.y = _point52.y;
            this.inflexionPoint.push(_point53);
            _point54.x = _point53.x;
            _point54.y = this.endPoint.y;
            this.inflexionPoint.push(_point54);
        } else if (this.to.shape.bottom < this.from.shape.top && this.startPoint.x + minMargin < this.to.shape.right && this.startPoint.x + minMargin > this.to.shape.left) {
            var _point55 = {};
            var _point56 = {};
            _point52.y = (this.startPoint.y + this.to.shape.bottom) / 2;
            this.inflexionPoint.push(_point52);
            _point55.x = this.endPoint.x - margin;
            _point55.y = _point52.y;
            this.inflexionPoint.push(_point55);
            _point56.x = _point55.x;
            _point56.y = this.endPoint.y;
            this.inflexionPoint.push(_point56);
        } else if (this.from.shape.top - this.endPoint.y >= minMargin && this.to.shape.left >= this.startPoint.x + minMargin) {
            _point52.y = this.endPoint.y;
            this.inflexionPoint.push(_point52);
        } else if (this.to.shape.left > this.from.shape.right) {
            var _point57 = {};
            var _point58 = {};
            if (this.endPoint.y <= this.from.shape.bottom) {
                this.inflexionPoint.push(_point52);
                if (this.to.shape.left - this.from.shape.right < margin + minMargin) {
                    _point57.x = (this.to.shape.left + this.from.shape.right) / 2;
                } else {
                    _point57.x = this.from.shape.right + margin;
                }
            } else if (this.to.shape.left - this.from.shape.right < minMargin) {
                this.inflexionPoint.push(_point52);
                _point57.x = this.from.shape.left - margin;
            } else {
                this.inflexionPoint.push(_point52);
                if (this.to.shape.left - this.from.shape.right < margin + minMargin) {
                    _point57.x = (this.to.shape.left + this.from.shape.right) / 2;
                } else {
                    _point57.x = this.from.shape.right + margin;
                }
            }
            _point57.y = _point52.y;
            this.inflexionPoint.push(_point57);
            _point58.x = _point57.x;
            _point58.y = this.endPoint.y;
            this.inflexionPoint.push(_point58);
        } else if (this.to.shape.left > this.startPoint.x && this.endPoint.y < this.from.shape.top) {
            _point52.y = this.endPoint.y;
            this.inflexionPoint.push(_point52);
        } else {
            var _point59 = {};
            var _point60 = {};
            _point52.y = this.from.shape.top < this.to.shape.top ? this.from.shape.top - margin : this.to.shape.top - margin;
            this.inflexionPoint.push(_point52);
            _point59.x = this.from.shape.left < this.to.shape.left ? this.from.shape.left - margin : this.to.shape.left - margin;
            _point59.y = _point52.y;
            this.inflexionPoint.push(_point59);
            _point60.x = _point59.x;
            _point60.y = this.endPoint.y;
            this.inflexionPoint.push(_point60);
        }
    }
}