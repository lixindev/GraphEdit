'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NodeController = exports.NodeController = function () {
    function NodeController(shape, canvas) {
        _classCallCheck(this, NodeController);

        this.shape = shape;
        this.ctx = canvas.getContext("2d");
    }

    _createClass(NodeController, [{
        key: 'draw',
        value: function draw() {
            var _this = this;

            this.ctx.save();
            this.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
            this.ctx.strokeStyle = 'rgb(100, 150, 255, 1)';
            this.ctx.lineWidth = 0.8;
            this.ctx.setLineDash([6, 3]);
            this.ctx.lineDashOffset = 0;
            this.ctx.strokeRect(this.nwPoint.x, this.nwPoint.y, this.shape.width, this.shape.height);
            this.ctx.restore();

            this.ctx.save();
            this.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
            this.ctx.strokeStyle = 'rgb(100, 150, 255, 1)';
            this.ctx.lineWidth = 0.8;
            this.pointCollection.map(function (point) {
                return drawPoint(point, _this.ctx);
            });
            this.ctx.restore();
        }
    }, {
        key: 'hitCheck',
        value: function hitCheck(x, y) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.pointCollection[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var point = _step.value;

                    if (x >= point.x - 4 && x <= point.x + 4 && y >= point.y - 4 && y <= point.y + 4) {
                        return point;
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
        }
    }, {
        key: 'pointCollection',
        get: function get() {
            var collection = [];
            collection.push(this.northPoint);
            collection.push(this.eastPoint);
            collection.push(this.southPoint);
            collection.push(this.westPoint);
            collection.push(this.nePoint);
            collection.push(this.sePoint);
            collection.push(this.swPoint);
            collection.push(this.nwPoint);
            return collection;
        }
    }, {
        key: 'northPoint',
        get: function get() {
            return {
                order: 'n',
                x: this.shape.center.x,
                y: this.shape.top
            };
        }
    }, {
        key: 'eastPoint',
        get: function get() {
            return {
                order: 'e',
                x: this.shape.right,
                y: this.shape.center.y
            };
        }
    }, {
        key: 'southPoint',
        get: function get() {
            return {
                order: 's',
                x: this.shape.center.x,
                y: this.shape.bottom
            };
        }
    }, {
        key: 'westPoint',
        get: function get() {
            return {
                order: 'w',
                x: this.shape.left,
                y: this.shape.center.y
            };
        }
    }, {
        key: 'nePoint',
        get: function get() {
            return {
                order: 'ne',
                x: this.shape.right,
                y: this.shape.top
            };
        }
    }, {
        key: 'sePoint',
        get: function get() {
            return {
                order: 'se',
                x: this.shape.right,
                y: this.shape.bottom
            };
        }
    }, {
        key: 'swPoint',
        get: function get() {
            return {
                order: 'sw',
                x: this.shape.left,
                y: this.shape.bottom
            };
        }
    }, {
        key: 'nwPoint',
        get: function get() {
            return {
                order: 'nw',
                x: this.shape.left,
                y: this.shape.top
            };
        }
    }]);

    return NodeController;
}();

function drawPoint(point, context) {
    context.fillRect(point.x - 3, point.y - 3, 6, 6);
    context.strokeRect(point.x - 3, point.y - 3, 6, 6);
}