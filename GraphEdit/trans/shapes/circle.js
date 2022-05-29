'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Circle = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _shape = require('./shape');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Circle = exports.Circle = function (_Shape) {
    _inherits(Circle, _Shape);

    function Circle(params, canvas) {
        _classCallCheck(this, Circle);

        var _this = _possibleConstructorReturn(this, (Circle.__proto__ || Object.getPrototypeOf(Circle)).call(this, params, canvas));

        if (_this.width !== _this.height) {
            _this.height = _this.width;
        }
        return _this;
    }

    _createClass(Circle, [{
        key: 'drawBaseShape',
        value: function drawBaseShape(x, y) {
            var isFill = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

            var context = this.ctx;

            var startPoint = {};
            startPoint.x = this.x + x;
            startPoint.y = this.y + y;

            if (isFill) {
                context.beginPath();
                context.arc(startPoint.x, startPoint.y, this.height / 2, -Math.PI, Math.PI, false);
                context.fill();
            }

            context.beginPath();
            context.arc(startPoint.x, startPoint.y, this.height / 2, -Math.PI, Math.PI, false);
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
    }, {
        key: 'drawDashNode',


        //用于拖拽中绘制虚线轨迹
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
    }, {
        key: 'hitCheck',


        //判断坐标是否命中图形元素
        value: function hitCheck(x, y) {
            var r = this.height / 2;
            var distance = (x - this.x) * (x - this.x) + (y - this.y) * (y - this.y);
            if (distance <= r * r) {
                return true;
            } else {
                return false;
            }
        }
    }]);

    return Circle;
}(_shape.Shape);