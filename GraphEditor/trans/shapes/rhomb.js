'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Rhomb = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _shape = require('./shape');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Rhomb = exports.Rhomb = function (_Shape) {
    _inherits(Rhomb, _Shape);

    function Rhomb(params, canvas) {
        _classCallCheck(this, Rhomb);

        return _possibleConstructorReturn(this, (Rhomb.__proto__ || Object.getPrototypeOf(Rhomb)).call(this, params, canvas));
    }

    _createClass(Rhomb, [{
        key: 'drawBaseShape',
        value: function drawBaseShape(x, y) {
            var isFill = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

            var context = this.ctx;

            if (isFill) {
                context.beginPath();
                context.moveTo(this.firstPoint.x + x, this.firstPoint.y + y);
                context.lineTo(this.secondPoint.x + x, this.secondPoint.y + y);
                context.lineTo(this.thirdPoint.x + x, this.thirdPoint.y + y);
                context.lineTo(this.fourthPoint.x + x, this.fourthPoint.y + y);
                context.closePath();
                context.fill();
            }

            context.beginPath();
            context.moveTo(this.firstPoint.x + x, this.firstPoint.y + y);
            context.lineTo(this.secondPoint.x + x, this.secondPoint.y + y);
            context.lineTo(this.thirdPoint.x + x, this.thirdPoint.y + y);
            context.lineTo(this.fourthPoint.x + x, this.fourthPoint.y + y);
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

            this.drawBaseShape(x, y, false);

            context.restore();
        }
    }, {
        key: 'hitCheck',


        //判断坐标是否命中图形元素
        value: function hitCheck(x, y) {
            var lamb1 = (this.firstPoint.x - this.fourthPoint.x) / (this.firstPoint.y - this.fourthPoint.y);
            var lamb2 = (this.firstPoint.x - this.secondPoint.x) / (this.firstPoint.y - this.secondPoint.y);
            if (x - lamb1 * y < this.firstPoint.x - lamb1 * this.firstPoint.y || x - lamb1 * y > this.secondPoint.x - lamb1 * this.secondPoint.y) {
                return false;
            }
            if (x - lamb2 * y > this.firstPoint.x - lamb2 * this.firstPoint.y || x - lamb2 * y < this.fourthPoint.x - lamb2 * this.fourthPoint.y) {
                return false;
            }
            return true;
        }
    }, {
        key: 'firstPoint',
        get: function get() {
            return {
                x: this.x,
                y: this.top
            };
        }
    }, {
        key: 'secondPoint',
        get: function get() {
            return {
                x: this.right,
                y: this.y
            };
        }
    }, {
        key: 'thirdPoint',
        get: function get() {
            return {
                x: this.x,
                y: this.bottom
            };
        }
    }, {
        key: 'fourthPoint',
        get: function get() {
            return {
                x: this.left,
                y: this.y
            };
        }
    }]);

    return Rhomb;
}(_shape.Shape);