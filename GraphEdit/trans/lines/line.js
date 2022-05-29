'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Line = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base = require('../shapes/base');

var _lineController = require('./lineController');

var _parameterError = require('../errors/parameterError');

var _settings = require('../tools/settings');

var _settings2 = _interopRequireDefault(_settings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
        } else if (params.startPoint) {
            _this.start = {};
            _this.start.x = params.startPoint.x;
            _this.start.y = params.startPoint.y;
        } else {
            throw new _parameterError.ParameterError('连线缺少起点信息！');
        }
        if (params.to && params.toConOrder) {
            _this.to = params.to;
            _this.toConOrder = params.toConOrder;
        } else if (params.endPoint) {
            _this.end = {};
            _this.end.x = params.endPoint.x;
            _this.end.y = params.endPoint.y;
        } else {
            throw new _parameterError.ParameterError('连线缺少终点信息！');
        }

        _this.controller = new _lineController.LineController(_this, canvas);
        return _this;
    }

    _createClass(Line, [{
        key: 'fillText',
        value: function fillText(isDash, textPoint) {
            if (!isDash && this.text && this.text.content) {
                this.ctx.lineWidth = 0.5;
                this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
                if (this.text.fontSize) {
                    this.ctx.font = this.text.fontSize + ' ' + _settings2.default.defaultFont.fontFamily;
                } else {
                    this.ctx.font = _settings2.default.defaultFont.relationFontSize + ' ' + _settings2.default.defaultFont.fontFamily;
                    this.text.fontSize = _settings2.default.defaultFont.relationFontSize;
                }
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                var size = parseInt((this.text.fontSize || _settings2.default.defaultFont.relationFontSize).replace('px', ''));
                var length = this.ctx.measureText(this.text.content).width;
                this.ctx.clearRect(textPoint.x - length / 2 - 1, textPoint.y - size / 2 - 1, length + 2, size + 2);
                this.ctx.fillText(this.text.content, textPoint.x, textPoint.y);
            }
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
    }]);

    return Line;
}(_base.Base);