'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Rect = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _shape = require('./shape');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Rect = exports.Rect = function (_Shape) {
    _inherits(Rect, _Shape);

    function Rect(params, canvas) {
        _classCallCheck(this, Rect);

        return _possibleConstructorReturn(this, (Rect.__proto__ || Object.getPrototypeOf(Rect)).call(this, params, canvas));
    }

    _createClass(Rect, [{
        key: 'draw',


        //绘图
        value: function draw() {
            var context = this.ctx;
            if (!context) return;
            context.save();
            context.lineWidth = 1.2;
            context.strokeStyle = this.strokeStyle;
            context.fillStyle = this.fillStyle;
            context.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
            context.strokeRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
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
            context.lineWidth = 1;
            context.setLineDash([6, 3]);
            context.lineDashOffset = 0;
            context.strokeRect(this.x + x - this.width / 2, this.y + y - this.height / 2, this.width, this.height);
            context.restore();
        }
    }, {
        key: 'hitCheck',


        //判断坐标是否命中图形元素
        value: function hitCheck(x, y) {
            if (x >= this.left && x <= this.right && y >= this.top && y <= this.bottom) {
                return true;
            } else {
                return false;
            }
        }
    }]);

    return Rect;
}(_shape.Shape);