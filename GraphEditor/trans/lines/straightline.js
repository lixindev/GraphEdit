'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Straightline = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _line = require('./line');

var _arrow = require('./arrow');

var _arrow2 = _interopRequireDefault(_arrow);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var hitWidth = 5;

var Straightline = exports.Straightline = function (_Line) {
    _inherits(Straightline, _Line);

    function Straightline(params, canvas) {
        _classCallCheck(this, Straightline);

        return _possibleConstructorReturn(this, (Straightline.__proto__ || Object.getPrototypeOf(Straightline)).call(this, params, canvas));
    }

    _createClass(Straightline, [{
        key: 'createPath',
        value: function createPath() {
            this.inflexionPoint = [];
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
            context.lineTo(this.endPoint.x, this.endPoint.y);
            context.stroke();

            _arrow2.default.drawCommonArrow(context, this.endPoint.x - this.startPoint.x, this.endPoint.y - this.startPoint.y, this.endPoint);
            this.fillText(isDash, this.textPoint);
            context.restore();
        }

        //判断坐标是否命中线

    }, {
        key: 'hitCheck',
        value: function hitCheck(x, y) {
            var x1 = this.startPoint.x;
            var y1 = this.startPoint.y;
            var x2 = this.endPoint.x;
            var y2 = this.endPoint.y;
            //竖线、横线特殊处理
            if (y1 === y2 && y >= y1 - hitWidth && y <= y1 + hitWidth && x >= (x1 > x2 ? x2 : x1) && x <= (x1 < x2 ? x2 : x1)) {
                return true;
            } else if (x1 === x2 && x >= x1 - hitWidth && x <= x1 + hitWidth && y >= (y1 > y2 ? y2 : y1) && y <= (y1 < y2 ? y2 : y1)) {
                return true;
            }

            //直线方程y = ax + b
            var a = (y1 - y2) / (x1 - x2);
            var b = y1 - a * x1;

            //过(x,y)给y = ax + b做垂线y = cx + d
            var c = -1 / a;
            var d = y - c * x;
            var x3 = (d - b) / (a - c);
            var y3 = c * x3 + d;

            if (x3 >= (x1 > x2 ? x2 : x1) && x3 <= (x1 < x2 ? x2 : x1) && (x - x3) * (x - x3) + (y - y3) * (y - y3) <= hitWidth * hitWidth) {
                return true;
            } else {
                return false;
            }
        }
    }, {
        key: 'textPoint',
        get: function get() {
            return {
                x: (this.startPoint.x + this.endPoint.x) / 2,
                y: (this.startPoint.y + this.endPoint.y) / 2
            };
        }
    }]);

    return Straightline;
}(_line.Line);