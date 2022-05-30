'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PolyLine = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _line = require('./line');

var _arrow = require('./arrow');

var _arrow2 = _interopRequireDefault(_arrow);

var _commonFunctions = require('../tools/commonFunctions');

var _commonFunctions2 = _interopRequireDefault(_commonFunctions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var margin = 25;
var offset = 10;
var hitWidth = 5;

var orientation = {
    north: 1,
    northEast: 2,
    east: 3,
    southEast: 4,
    south: 5,
    southWest: 6,
    west: 7,
    northWest: 8
};

var PolyLine = exports.PolyLine = function (_Line) {
    _inherits(PolyLine, _Line);

    function PolyLine(params, canvas) {
        _classCallCheck(this, PolyLine);

        var _this = _possibleConstructorReturn(this, (PolyLine.__proto__ || Object.getPrototypeOf(PolyLine)).call(this, params, canvas));

        if (params.inflexionPoint) {
            _this.inflexionPoint = _commonFunctions2.default.deepClone(params.inflexionPoint);
        } else {
            _this.inflexionPoint = null;
        }
        return _this;
    }

    _createClass(PolyLine, [{
        key: 'createPath',


        //路线规划
        value: function createPath() {
            this.inflexionPoint = [];
            //两边都没有关联节点
            if (!this.from && !this.to) {
                if (this.startPoint.x !== this.endPoint.x && this.startPoint.y !== this.endPoint.y) {
                    var point = {};
                    var _ref = [this.startPoint.x, this.endPoint.y];
                    point.x = _ref[0];
                    point.y = _ref[1];

                    this.inflexionPoint.push(point);
                }
            } else {
                var hitResult = false;
                if (this.from) {
                    hitResult = this.from.hitNode(this.endPoint.x, this.endPoint.y);
                }
                if (this.to) {
                    hitResult = hitResult || this.to.hitNode(this.startPoint.x, this.startPoint.y);
                }
                //锚点命中图形
                if (hitResult && this.from !== this.to) {
                    if (this.from) {
                        var curDirection = this.startPoint.order % 2 === 1 ? 'y' : 'x';
                        if (!this.to || this.to && (this.startPoint.order + this.endPoint.order) % 2 === 1) {
                            //直角连接
                            connectToEnd(curDirection, this.startPoint, this.endPoint, this.inflexionPoint);
                        } else {
                            polylineConnect(curDirection, this.startPoint, this.endPoint, this.inflexionPoint);
                        }
                    } else {
                        //起点不在节点锚点上
                        var _curDirection = this.endPoint.order % 2 === 1 ? 'y' : 'x';
                        //逆向规划路线
                        connectToEnd(_curDirection, this.endPoint, this.startPoint, this.inflexionPoint);
                    }
                } else if (!this.to) {
                    //线的终点不在图形锚点上
                    anchorToPoint(this.from, this.startPoint, this.endPoint, this.inflexionPoint);
                } else if (!this.from) {
                    //线的起点不在图形锚点上
                    //逆向规划路线
                    anchorToPoint(this.to, this.endPoint, this.startPoint, this.inflexionPoint);
                    if (this.inflexionPoint && this.inflexionPoint.length > 1) {
                        this.inflexionPoint.reverse();
                    }
                } else if (this.from === this.to) {
                    //自环
                    twoStep.call(this, 4, { x: 0, y: 0 });
                } else {
                    var startToSource = getPositionForAnchor(this.startPoint.order);
                    var startToTarget = getPosition(this.startPoint, this.to);
                    var endToSource = getPosition(this.endPoint, this.from);
                    var endToTarget = getPositionForAnchor(this.endPoint.order);

                    var distanceSource = getDistance(startToSource.orientation, endToSource.orientation);
                    var distanceTarget = getDistance(startToTarget.orientation, endToTarget.orientation);
                    var flag = Math.abs(this.startPoint.order - this.endPoint.order);
                    var gap = getGap(this.from, this.to);
                    var _curDirection2 = this.startPoint.order % 2 === 1 ? 'y' : 'x';
                    switch (flag) {
                        case 0:
                            //连接点同向
                            if (distanceSource === 4) {
                                twoStep.call(this, 2, gap);
                            } else if (distanceTarget === 4) {
                                nodeAboveStart.call(this, _curDirection2, gap);
                            } else {
                                if (_curDirection2 === 'y') {
                                    if ((Math.abs(this.endPoint.x - this.from.shape.left) < offset || Math.abs(this.endPoint.x - this.from.shape.right) < offset) && gap.y > offset && distanceSource === 3) {
                                        twoStep.call(this, 2, gap);
                                    } else {
                                        twoStep.call(this, 4, gap);
                                    }
                                } else {
                                    if ((Math.abs(this.endPoint.y - this.from.shape.top) < offset || Math.abs(this.endPoint.y - this.from.shape.bottom) < offset) && gap.x > offset && distanceSource === 3) {
                                        twoStep.call(this, 2, gap);
                                    } else {
                                        twoStep.call(this, 4, gap);
                                    }
                                }
                            }
                            break;
                        case 1:
                        case 3:
                            if (distanceSource < 2 && distanceTarget < 2) {
                                var _point = {};
                                if (_curDirection2 === 'y') {
                                    var _ref2 = [this.startPoint.x, this.endPoint.y];
                                    _point.x = _ref2[0];
                                    _point.y = _ref2[1];
                                } else {
                                    var _ref3 = [this.endPoint.x, this.startPoint.y];
                                    _point.x = _ref3[0];
                                    _point.y = _ref3[1];
                                }
                                this.inflexionPoint.push(_point);
                            } else if (distanceSource < 2 && distanceTarget === 2) {
                                nodeAboveStart.call(this, _curDirection2, gap);
                            } else if (distanceSource < 2 && distanceTarget === 3) {
                                if (_curDirection2 === 'y' && gap.y < offset || _curDirection2 === 'x' && gap.x < offset) {
                                    twoStep.call(this, 4, gap);
                                } else {
                                    nodeAboveStart.call(this, _curDirection2, gap);
                                }
                            } else if (distanceSource < 2 && distanceTarget === 4) {
                                twoStep.call(this, 4, gap);
                            } else if (distanceSource === 2 && distanceTarget >= 2) {
                                twoStep.call(this, 3, gap);
                            } else if (distanceSource === 2 && distanceTarget < 2) {
                                twoStep.call(this, 1, gap);
                            } else if (distanceSource === 3 && distanceTarget >= 2) {
                                twoStep.call(this, 3, gap);
                            } else if (distanceSource === 3 && distanceTarget < 2) {
                                if (_curDirection2 === 'y' && gap.x > offset || _curDirection2 === 'x' && gap.y > offset) {
                                    twoStep.call(this, 1, gap);
                                } else {
                                    if (_curDirection2 === 'y' && gap.y > offset || _curDirection2 === 'x' && gap.x > offset) {
                                        twoStep.call(this, 2, gap);
                                    } else {
                                        twoStep.call(this, 5, gap);
                                    }
                                }
                            } else if (distanceSource === 4) {
                                if ((this.endPoint.order === 1 && this.endPoint.y > this.startPoint.y || this.endPoint.order === 3 && this.endPoint.y < this.startPoint.y) && gap.x > offset || (this.endPoint.order === 2 && this.endPoint.x < this.startPoint.x || this.endPoint.order === 4 && this.endPoint.x > this.startPoint.x) && gap.y > offset) {
                                    twoStep.call(this, 2, gap);
                                } else {
                                    twoStep.call(this, 5, gap);
                                }
                            }
                            break;
                        case 2:
                            //连接点对向
                            if (distanceSource < 2 && distanceTarget < 2) {
                                nodeAboveStart.call(this, _curDirection2, gap);
                            } else if (distanceSource < 4) {
                                if (_curDirection2 === 'y' && gap.x > offset || _curDirection2 === 'x' && gap.y > offset) {
                                    twoStep.call(this, 1, gap);
                                } else if (_curDirection2 === 'y' && gap.y > offset || _curDirection2 === 'x' && gap.x > offset) {
                                    var _point2 = getMiddlePoint(this.startPoint, this.endPoint, this.from, this.to, gap, 2);
                                    if (_curDirection2 === 'y' && !(this.startPoint.x < this.endPoint.x ^ _point2.x < this.endPoint.x)) {
                                        _curDirection2 = anchorToPoint(this.from, this.startPoint, _point2, this.inflexionPoint);
                                        this.inflexionPoint.push(_point2);
                                        _curDirection2 = _curDirection2 === 'y' ? 'x' : 'y';
                                        pointToAnchor(this.to, _point2, this.endPoint, _curDirection2, this.inflexionPoint);
                                    } else {
                                        twoStep.call(this, 3, gap);
                                    }
                                } else {
                                    twoStep.call(this, 3, gap);
                                }
                            } else {
                                twoStep.call(this, 3, gap);
                            }
                            break;
                    }
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
            _arrow2.default.drawCommonArrow(context, this.endPoint.x - lastPoint.x, this.endPoint.y - lastPoint.y, this.endPoint);
            this.fillText(isDash, this.textPoint);
            context.restore();
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
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.inflexionPoint[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var point = _step.value;

                    if (point1.x === point.x) {
                        if (x >= point1.x - hitWidth && x <= point1.x + hitWidth && y >= (point1.y > point.y ? point.y : point1.y) && y <= (point1.y < point.y ? point.y : point1.y)) {
                            isHit = true;
                            break;
                        }
                    } else if (point1.y === point.y) {
                        if (y >= point1.y - hitWidth && y <= point1.y + hitWidth && x >= (point1.x > point.x ? point.x : point1.x) && x <= (point1.x < point.x ? point.x : point1.x)) {
                            isHit = true;
                            break;
                        }
                    }
                    point1 = point;
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

            this.inflexionPoint.pop();
            if (this.inflexionPoint.length === 0) {
                this.inflexionPoint = null;
            }

            return isHit;
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

                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = collection[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var _part = _step2.value;

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
    }]);

    return PolyLine;
}(_line.Line);

//节点位于起点上方


function nodeAboveStart(curDirection, gap) {
    var point = {};
    if (curDirection === 'x' && gap.x < margin * 2) {
        var _ref4 = [this.startPoint.order === 2 ? this.startPoint.x + gap.x / 2 : this.startPoint.x - gap.x / 2, this.startPoint.y];
        point.x = _ref4[0];
        point.y = _ref4[1];

        this.inflexionPoint.push(point);
    } else if (curDirection === 'y' && gap.y < margin * 2) {
        var _ref5 = [this.startPoint.x, this.startPoint.order === 1 ? this.startPoint.y - gap.y / 2 : this.startPoint.y + gap.y / 2];
        point.x = _ref5[0];
        point.y = _ref5[1];

        this.inflexionPoint.push(point);
    } else {
        point = firstStep(this.startPoint, this.inflexionPoint);
    }
    curDirection = curDirection === 'y' ? 'x' : 'y';
    pointToAnchor(this.to, point, this.endPoint, curDirection, this.inflexionPoint);
}

//先由起点绕起始节点至中点，然后由中点绕目标节点至终点
function twoStep(scene, gap) {
    var point = getMiddlePoint(this.startPoint, this.endPoint, this.from, this.to, gap, scene);
    var curDirection = anchorToPoint(this.from, this.startPoint, point, this.inflexionPoint);
    this.inflexionPoint.push(point);
    curDirection = curDirection === 'y' ? 'x' : 'y';
    pointToAnchor(this.to, point, this.endPoint, curDirection, this.inflexionPoint);
}

//从节点锚点开始绕过节点至指定点
function anchorToPoint(node, startPoint, endPoint, inflexionPoint) {
    var endToNode = getPosition(endPoint, node);
    var startToNode = getPositionForAnchor(startPoint.order);
    var curDirection = startPoint.order % 2 === 1 ? 'y' : 'x';

    //第一步
    var isCompleted = false;
    var curPoint = startPoint;
    var distance = getDistance(startToNode.orientation, endToNode.orientation);
    if (distance < 2) {
        curDirection = connectToEnd(curDirection, curPoint, endPoint, inflexionPoint);
        isCompleted = true;
    } else {
        curPoint = firstStep(startPoint, inflexionPoint);
        curDirection = curDirection === 'y' ? 'x' : 'y';
    }
    while (!isCompleted) {
        var curToNode = getPosition(curPoint, node);
        var _distance = getDistance(curToNode.orientation, endToNode.orientation);
        if (curToNode.orientation % 2 === 1) {
            if (_distance > 1 && _distance < 4) {
                curDirection = connectToEnd(curDirection, curPoint, endPoint, inflexionPoint);
                isCompleted = true;
            } else if (_distance === 4) {
                curPoint = aroundNode(curDirection, curPoint, endPoint, node, inflexionPoint);
                curDirection = curDirection === 'y' ? 'x' : 'y';
            }
        } else if (curToNode.orientation % 2 === 0) {
            curDirection = connectToEnd(curDirection, curPoint, endPoint, inflexionPoint);
            isCompleted = true;
        }
    }

    return curDirection;
}

function firstStep(startPoint, inflexionPoint) {
    var point = {};
    switch (startPoint.order) {
        case 1:
            var _ref6 = [startPoint.x, startPoint.y - margin];
            point.x = _ref6[0];
            point.y = _ref6[1];

            break;
        case 2:
            var _ref7 = [startPoint.x + margin, startPoint.y];
            point.x = _ref7[0];
            point.y = _ref7[1];

            break;
        case 3:
            var _ref8 = [startPoint.x, startPoint.y + margin];
            point.x = _ref8[0];
            point.y = _ref8[1];

            break;
        case 4:
            var _ref9 = [startPoint.x - margin, startPoint.y];
            point.x = _ref9[0];
            point.y = _ref9[1];

            break;
    }

    inflexionPoint.push(point);
    return point;
}

function getMiddlePoint(startPoint, endPoint, source, target, gap, scene) {
    var point = {};
    var s = 0;
    var right = source.shape.right > target.shape.right ? source.shape.right : target.shape.right;
    var left = source.shape.left < target.shape.left ? source.shape.left : target.shape.left;
    var top = source.shape.top < target.shape.top ? source.shape.top : target.shape.top;
    var bottom = source.shape.bottom > target.shape.bottom ? source.shape.bottom : target.shape.bottom;
    switch (scene) {
        case 1:
            //对于起始节点，起始点与终点的方位差为2，且节点之间存在空隙，定位到空隙中间
            switch (startPoint.order) {
                case 1:
                    s = gap.x > 2 * margin ? margin : gap.x / 2;
                    var _ref10 = [endPoint.x > startPoint.x ? source.shape.right + s : source.shape.left - s, startPoint.y - margin];
                    point.x = _ref10[0];
                    point.y = _ref10[1];

                    break;
                case 2:
                    s = gap.y > 2 * margin ? margin : gap.y / 2;
                    var _ref11 = [startPoint.x + margin, endPoint.y > startPoint.y ? source.shape.bottom + s : source.shape.top - s];
                    point.x = _ref11[0];
                    point.y = _ref11[1];

                    break;
                case 3:
                    s = gap.x > 2 * margin ? margin : gap.x / 2;
                    var _ref12 = [endPoint.x > startPoint.x ? source.shape.right + s : source.shape.left - s, startPoint.y + margin];
                    point.x = _ref12[0];
                    point.y = _ref12[1];

                    break;
                case 4:
                    s = gap.y > 2 * margin ? margin : gap.y / 2;
                    var _ref13 = [startPoint.x - margin, endPoint.y > startPoint.y ? source.shape.bottom + s : source.shape.top - s];
                    point.x = _ref13[0];
                    point.y = _ref13[1];

                    break;
            }
            break;
        case 2:
            //对于起始节点，起始点与终点的方位差为3或4，且节点之间存在空隙，定位到空隙中间
            switch (startPoint.order) {
                case 1:
                    s = gap.y > 2 * margin ? margin : gap.y / 2;
                    var _ref14 = [endPoint.x > startPoint.x ? source.shape.right + margin : source.shape.left - margin, source.shape.bottom + s];
                    point.x = _ref14[0];
                    point.y = _ref14[1];

                    break;
                case 2:
                    s = gap.x > 2 * margin ? margin : gap.x / 2;
                    var _ref15 = [source.shape.left - s, endPoint.y > startPoint.y ? source.shape.bottom + margin : source.shape.top - margin];
                    point.x = _ref15[0];
                    point.y = _ref15[1];

                    break;
                case 3:
                    s = gap.y > 2 * margin ? margin : gap.y / 2;
                    var _ref16 = [endPoint.x > startPoint.x ? source.shape.right + margin : source.shape.left - margin, source.shape.top - s];
                    point.x = _ref16[0];
                    point.y = _ref16[1];

                    break;
                case 4:
                    s = gap.x > 2 * margin ? margin : gap.x / 2;
                    var _ref17 = [source.shape.right + s, endPoint.y > startPoint.y ? source.shape.bottom + margin : source.shape.top - margin];
                    point.x = _ref17[0];
                    point.y = _ref17[1];

                    break;
            }
            break;
        case 3:
            //节点之间不存在空隙，视两节点为整体，定位到整体的一角
            switch (startPoint.order) {
                case 1:
                    var _ref18 = [endPoint.x > startPoint.x ? right + margin : left - margin, top - margin];
                    point.x = _ref18[0];
                    point.y = _ref18[1];

                    break;
                case 2:
                    var _ref19 = [right + margin, endPoint.y > startPoint.y ? bottom + margin : top - margin];
                    point.x = _ref19[0];
                    point.y = _ref19[1];

                    break;
                case 3:
                    var _ref20 = [endPoint.x > startPoint.x ? right + margin : left - margin, bottom + margin];
                    point.x = _ref20[0];
                    point.y = _ref20[1];

                    break;
                case 4:
                    var _ref21 = [left - margin, endPoint.y > startPoint.y ? bottom + margin : top - margin];
                    point.x = _ref21[0];
                    point.y = _ref21[1];

                    break;
            }
            break;
        case 4:
            //节点之间不存在空隙，视两节点为整体,从起点按起始方向前进margin距离
            switch (startPoint.order) {
                case 1:
                    var _ref22 = [startPoint.x, top - margin];
                    point.x = _ref22[0];
                    point.y = _ref22[1];

                    break;
                case 2:
                    var _ref23 = [right + margin, startPoint.y];
                    point.x = _ref23[0];
                    point.y = _ref23[1];

                    break;
                case 3:
                    var _ref24 = [startPoint.x, bottom + margin];
                    point.x = _ref24[0];
                    point.y = _ref24[1];

                    break;
                case 4:
                    var _ref25 = [left - margin, startPoint.y];
                    point.x = _ref25[0];
                    point.y = _ref25[1];

                    break;
            }
            break;
        case 5:
            //节点之间不存在空隙，反向绕开
            if (startPoint.order === 1 && endPoint.order === 4 || startPoint.order === 4 && endPoint.order === 1) {
                var _ref26 = [source.shape.left - margin, source.shape.top - margin];
                point.x = _ref26[0];
                point.y = _ref26[1];
            } else if (startPoint.order === 1 && endPoint.order === 2 || startPoint.order === 2 && endPoint.order === 1) {
                var _ref27 = [source.shape.right + margin, source.shape.top - margin];
                point.x = _ref27[0];
                point.y = _ref27[1];
            } else if (startPoint.order === 3 && endPoint.order === 4 || startPoint.order === 4 && endPoint.order === 3) {
                var _ref28 = [source.shape.left - margin, source.shape.bottom + margin];
                point.x = _ref28[0];
                point.y = _ref28[1];
            } else if (startPoint.order === 3 && endPoint.order === 2 || startPoint.order === 2 && endPoint.order === 3) {
                var _ref29 = [source.shape.right + margin, source.shape.bottom + margin];
                point.x = _ref29[0];
                point.y = _ref29[1];
            }
            break;
    }

    return point;
}

//从指定点出发绕过节点至节点锚点
function pointToAnchor(node, startPoint, endPoint, curDirection, inflexionPoint) {
    var endToNode = getPositionForAnchor(endPoint.order);
    var isCompleted = false;
    var curPoint = startPoint;

    while (!isCompleted) {
        var curToNode = getPosition(curPoint, node);
        var distance = getDistance(curToNode.orientation, endToNode.orientation);
        if (curToNode.orientation % 2 === 1) {
            if (distance === 0) {
                connectToEnd(curDirection, curPoint, endPoint, inflexionPoint);
                isCompleted = true;
            } else if (distance === 4) {
                curPoint = aroundNode(curDirection, curPoint, endPoint, node, inflexionPoint, false);
                curDirection = curDirection === 'y' ? 'x' : 'y';
            } else {
                curPoint = aroundNode(curDirection, curPoint, endPoint, node, inflexionPoint);
                curDirection = curDirection === 'y' ? 'x' : 'y';
            }
        } else if (curToNode.orientation % 2 === 0) {
            if (distance < 3) {
                connectToEnd(curDirection, curPoint, endPoint, inflexionPoint);
                isCompleted = true;
            } else {
                curPoint = aroundNode(curDirection, curPoint, endPoint, node, inflexionPoint);
                curDirection = curDirection === 'y' ? 'x' : 'y';
            }
        }
    }
}

//从指定点直接连接至终点
function connectToEnd(curDirection, curPoint, endPoint, inflexionPoint) {
    var point = {};
    if (curDirection === 'x' && curPoint.y !== endPoint.y) {
        var _ref30 = [endPoint.x, curPoint.y];
        point.x = _ref30[0];
        point.y = _ref30[1];

        inflexionPoint.push(point);
        curDirection = curDirection === 'y' ? 'x' : 'y';
    } else if (curDirection === 'y' && curPoint.x !== endPoint.x) {
        var _ref31 = [curPoint.x, endPoint.y];
        point.x = _ref31[0];
        point.y = _ref31[1];

        inflexionPoint.push(point);
        curDirection = curDirection === 'y' ? 'x' : 'y';
    }

    return curDirection;
}

//环绕节点寻路
function aroundNode(curDirection, curPoint, endPoint, node, inflexionPoint) {
    var flag = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : true;

    var point = {};
    if (curDirection === 'x') {
        if (!(endPoint.x < curPoint.x ^ flag)) {
            var _ref32 = [node.shape.left - margin, curPoint.y];
            point.x = _ref32[0];
            point.y = _ref32[1];
        } else {
            var _ref33 = [node.shape.right + margin, curPoint.y];
            point.x = _ref33[0];
            point.y = _ref33[1];
        }
    } else {
        if (!(endPoint.y < curPoint.y ^ flag)) {
            var _ref34 = [curPoint.x, node.shape.top - margin];
            point.x = _ref34[0];
            point.y = _ref34[1];
        } else {
            var _ref35 = [curPoint.x, node.shape.bottom + margin];
            point.x = _ref35[0];
            point.y = _ref35[1];
        }
    }
    inflexionPoint.push(point);
    return point;
}

//折线连接
function polylineConnect(curDirection, startPoint, endPoint, inflexionPoint) {
    var point1 = {};
    var point2 = {};
    if (curDirection === 'y' && startPoint.x !== endPoint.x) {
        var _ref36 = [startPoint.x, (endPoint.y + startPoint.y) / 2];
        point1.x = _ref36[0];
        point1.y = _ref36[1];

        inflexionPoint.push(point1);
        var _ref37 = [endPoint.x, point1.y];
        point2.x = _ref37[0];
        point2.y = _ref37[1];

        inflexionPoint.push(point2);
    } else if (curDirection === 'x' && startPoint.y !== endPoint.y) {
        var _ref38 = [(startPoint.x + startPoint.x) / 2, endPoint.y];
        point1.x = _ref38[0];
        point1.y = _ref38[1];

        inflexionPoint.push(point1);
        var _ref39 = [point1.x, endPoint.y];
        point2.x = _ref39[0];
        point2.y = _ref39[1];

        inflexionPoint.push(point2);
    }
}

//获得两个节点之间的空隙
function getGap(node1, node2) {
    var gap = {};
    if (node1.shape.center.x < node2.shape.center.x) {
        gap.x = node2.shape.left - node1.shape.right;
    } else {
        gap.x = node1.shape.left - node2.shape.right;
    }

    if (node1.shape.center.y < node2.shape.center.y) {
        gap.y = node2.shape.top - node1.shape.bottom;
    } else {
        gap.y = node1.shape.top - node2.shape.bottom;
    }
    return gap;
}

//根据锚点信息获取其与节点位置信息
function getPositionForAnchor(order) {
    var position = {};
    position.distanceX = 0;
    position.distanceY = 0;
    switch (order) {
        case 1:
            position.orientation = orientation.north;
            break;
        case 2:
            position.orientation = orientation.east;
            break;
        case 3:
            position.orientation = orientation.south;
            break;
        case 4:
            position.orientation = orientation.west;
            break;
    }

    return position;
}

//获得点相对于节点的位置信息
function getPosition(point, node) {
    var position = {};
    var flag1 = node.shape.top > point.y;
    var flag2 = node.shape.bottom < point.y;
    var flag3 = node.shape.left > point.x;
    var flag4 = node.shape.right < point.x;
    if (flag1 && flag3) {
        position.orientation = orientation.northWest;
    } else if (flag1 && flag4) {
        position.orientation = orientation.northEast;
    } else if (flag1 && !flag3 && !flag4) {
        position.orientation = orientation.north;
    } else if (flag2 && flag3) {
        position.orientation = orientation.southWest;
    } else if (flag2 && flag4) {
        position.orientation = orientation.southEast;
    } else if (flag2 && !flag3 && !flag4) {
        position.orientation = orientation.south;
    } else if (!flag1 && !flag2 && flag3) {
        position.orientation = orientation.west;
    } else if (!flag1 && !flag2 && flag4) {
        position.orientation = orientation.east;
    } else {
        position.orientation = null;
    }

    return position;
}

//方位之间的距离
function getDistance(orientation1, orientation2) {
    var distance = Math.abs(orientation2 - orientation1);
    //最大距离为4
    if (distance > 4) {
        distance = 8 - distance;
    }
    return distance;
}