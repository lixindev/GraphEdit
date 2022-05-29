'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Capsule = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _shape = require('./shape');

var _parameterError = require('../errors/parameterError');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var minCapsuleLine = 10;

var Capsule = exports.Capsule = function (_Shape) {
    _inherits(Capsule, _Shape);

    function Capsule(params, canvas) {
        _classCallCheck(this, Capsule);

        var _this = _possibleConstructorReturn(this, (Capsule.__proto__ || Object.getPrototypeOf(Capsule)).call(this, params, canvas));

        if (_this.width < _this.height) {
            throw new _parameterError.ParameterError("Capsule's width must be bigger then height!");
        }
        return _this;
    }

    _createClass(Capsule, [{
        key: 'drawBaseShape',
        value: function drawBaseShape(x, y) {
            var isFill = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

            var context = this.ctx;

            var startPoint = {};
            startPoint.x = this.x + (this.width - this.height) / 2 + x;
            startPoint.y = this.y + y;
            var secondPoint = {};
            secondPoint.x = this.x - (this.width - this.height) / 2 + x;
            secondPoint.y = this.y + y;

            if (isFill) {
                context.beginPath();
                context.arc(startPoint.x, startPoint.y, this.height / 2, -Math.PI / 2, Math.PI / 2, false);
                context.lineTo(secondPoint.x, secondPoint.y + this.height / 2);
                context.arc(secondPoint.x, secondPoint.y, this.height / 2, Math.PI / 2, -Math.PI / 2, false);
                context.closePath();
                context.fill();
            }

            context.beginPath();
            context.arc(startPoint.x, startPoint.y, this.height / 2, -Math.PI / 2, Math.PI / 2, false);
            context.lineTo(secondPoint.x, secondPoint.y + this.height / 2);
            context.arc(secondPoint.x, secondPoint.y, this.height / 2, Math.PI / 2, -Math.PI / 2, false);
            context.closePath();
            context.stroke();
        }

        //绘图

    }, {
        key: 'draw',
        value: function draw() {
            var context = this.ctx;
            if (!context) return;
            context.save();
            context.lineWidth = 1.2;
            context.strokeStyle = this.strokeStyle;
            context.fillStyle = this.fillStyle;
            this.drawBaseShape(0, 0);
            this.fillText();
            context.restore();
        }

        //用于拖拽中绘制虚线轨迹

    }, {
        key: 'drawDashNode',
        value: function drawDashNode(x, y) {
            var context = this.ctx;
            if (!context) return;
            context.save();
            context.strokeStyle = this.strokeStyle;
            context.setLineDash([6, 3]);
            context.lineDashOffset = 0;
            context.lineWidth = 1;
            this.drawBaseShape(x, y, false);
            context.restore();
        }

        //判断坐标是否命中图形元素

    }, {
        key: 'hitCheck',
        value: function hitCheck(x, y) {
            var r = this.height / 2;
            //左半圆原点
            var point1 = { x: this.left + r, y: this.y };
            //右半圆原点
            var point2 = { x: this.right - r, y: this.y };
            var distance1 = (x - point1.x) * (x - point1.x) + (y - point1.y) * (y - point1.y);
            var distance2 = (x - point2.x) * (x - point2.x) + (y - point2.y) * (y - point2.y);
            if (x >= this.left + r && x <= this.right - r && y >= this.top && y <= this.bottom) {
                return true;
            } else if (distance1 <= r * r) {
                return true;
            } else if (distance2 <= r * r) {
                return true;
            } else {
                return false;
            }
        }
    }, {
        key: 'nodeResizing',
        value: function nodeResizing(nodeResizeCache, length) {
            switch (nodeResizeCache.direction) {
                case 'n':
                case 's':
                    length = length > nodeResizeCache.width - minCapsuleLine ? nodeResizeCache.width - minCapsuleLine : length;
                    break;
                case 'e':
                case 'w':
                    length = nodeResizeCache.height > length - minCapsuleLine ? nodeResizeCache.height + minCapsuleLine : length;
                    break;
            }

            return length;
        }
    }]);

    return Capsule;
}(_shape.Shape);