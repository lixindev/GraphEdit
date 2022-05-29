'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Connector = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _settings = require('../tools/settings');

var _settings2 = _interopRequireDefault(_settings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//连接点箭头角的度数
var theta = 45;
var headlen = 10 * _settings2.default.ratio;
var sind = headlen * Math.sin(theta * Math.PI / 180);
var cosd = headlen * Math.cos(theta * Math.PI / 180);

var Connector = exports.Connector = function () {
    function Connector(shape, canvas) {
        _classCallCheck(this, Connector);

        this.shape = shape;
        this.ctx = canvas.getContext("2d");
    }

    _createClass(Connector, [{
        key: 'draw',
        value: function draw() {
            var _this = this;

            this.ctx.save();
            this.ctx.fillStyle = 'rgba(0, 220, 255, 0.6)';
            this.pointCollection.map(function (point) {
                return drawPoint(point, _this.ctx);
            });
            this.ctx.restore();
        }

        //判断坐标是否命中图形元素

    }, {
        key: 'hitCheck',
        value: function hitCheck(x, y) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.pointCollection[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var point = _step.value;

                    var result = _hitCheck(x, y, point);
                    if (result) {
                        return result;
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

            return false;
        }
    }, {
        key: 'selectPoint',
        value: function selectPoint(order) {
            var _this2 = this;

            this.ctx.fillStyle = 'rgba(0, 180, 255, 1)';
            this.pointCollection.map(function (point) {
                if (point.order === order) {
                    drawPoint(point, _this2.ctx);
                }
            });
        }
    }, {
        key: 'saveState',
        value: function saveState() {
            var cache = [];
            var cache1 = {};
            cache1.x = this.firstPoint.x - sind - 1;
            cache1.y = this.firstPoint.y - 21;
            cache1.imgData = this.ctx.getImageData(cache1.x, cache1.y, 2 * sind + 2, cosd + 2);

            var cache2 = {};
            cache2.x = this.secondPoint.x + 20 - cosd - 1;
            cache2.y = this.secondPoint.y - sind - 1;
            cache2.imgData = this.ctx.getImageData(cache2.x, cache2.y, cosd + 2, 2 * sind + 2);

            var cache3 = {};
            cache3.x = this.thirdPoint.x - sind - 1;
            cache3.y = this.thirdPoint.y + 20 - cosd - 1;
            cache3.imgData = this.ctx.getImageData(cache3.x, cache3.y, 2 * sind + 2, cosd + 2);

            var cache4 = {};
            cache4.x = this.forthPoint.x - 21;
            cache4.y = this.forthPoint.y - sind - 1;
            cache4.imgData = this.ctx.getImageData(cache4.x, cache4.y, cosd + 2, 2 * sind + 2);
            cache.push(cache1);
            cache.push(cache2);
            cache.push(cache3);
            cache.push(cache4);
            return cache;
        }
    }, {
        key: 'connectCheck',
        value: function connectCheck(x, y) {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.pointCollection[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var point = _step2.value;

                    if ((x - point.x) * (x - point.x) + (y - point.y) * (y - point.y) < 100) {
                        return {
                            order: point.order,
                            distance: (x - point.x) * (x - point.x) + (y - point.y) * (y - point.y)
                        };
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

            return false;
        }
    }, {
        key: 'pointCollection',
        get: function get() {
            var collection = [];
            collection.push(this.firstPoint);
            collection.push(this.secondPoint);
            collection.push(this.thirdPoint);
            collection.push(this.forthPoint);
            return collection;
        }
    }, {
        key: 'firstPoint',
        get: function get() {
            return {
                order: 1,
                x: this.shape.center.x,
                y: this.shape.top
            };
        }
    }, {
        key: 'secondPoint',
        get: function get() {
            return {
                order: 2,
                x: this.shape.right,
                y: this.shape.center.y
            };
        }
    }, {
        key: 'thirdPoint',
        get: function get() {
            return {
                order: 3,
                x: this.shape.center.x,
                y: this.shape.bottom
            };
        }
    }, {
        key: 'forthPoint',
        get: function get() {
            return {
                order: 4,
                x: this.shape.left,
                y: this.shape.center.y
            };
        }
    }]);

    return Connector;
}();

function drawPoint(point, context) {
    context.beginPath();
    var point1 = {};
    var point2 = {};
    if (point.order === 1) {
        context.moveTo(point.x, point.y - 20);
        point1.x = point.x - sind;
        point1.y = point.y - 20 + cosd;
        point2.x = point.x + sind;
        point2.y = point1.y;
    } else if (point.order === 2) {
        context.moveTo(point.x + 20, point.y);
        point1.x = point.x + 20 - cosd;
        point1.y = point.y - sind;
        point2.x = point1.x;
        point2.y = point.y + sind;
    } else if (point.order === 3) {
        context.moveTo(point.x, point.y + 20);
        point1.x = point.x - sind;
        point1.y = point.y + 20 - cosd;
        point2.x = point.x + sind;
        point2.y = point1.y;
    } else if (point.order === 4) {
        context.moveTo(point.x - 20, point.y);
        point1.x = point.x - 20 + cosd;
        point1.y = point.y - sind;
        point2.x = point1.x;
        point2.y = point.y + sind;
    }
    context.lineTo(point1.x, point1.y);
    context.lineTo(point2.x, point2.y);
    context.fill();
}

function _hitCheck(x, y, point) {
    if (point.order === 1) {
        if (x >= point.x - sind - 1 && x <= point.x + sind + 1 && y >= point.y - 21 && y <= point.y - 19 + cosd) {
            return point.order;
        } else {
            return false;
        }
    } else if (point.order === 2) {
        if (x >= point.x + 19 - cosd && x <= point.x + 21 && y >= point.y - sind - 1 && y <= point.y + sind + 1) {
            return point.order;
        } else {
            return false;
        }
    } else if (point.order === 3) {
        if (x >= point.x - sind - 1 && x <= point.x + sind + 1 && y >= point.y + 19 - cosd && y <= point.y + 21) {
            return point.order;
        } else {
            return false;
        }
    } else if (point.order === 4) {
        if (x >= point.x - 21 && x <= point.x - 19 + cosd && y >= point.y - sind - 1 && y <= point.y + sind + 1) {
            return point.order;
        } else {
            return false;
        }
    }
}