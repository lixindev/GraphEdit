'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Shape = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _connector = require('./connector');

var _nodeAnchor = require('./nodeAnchor');

var _base = require('./base');

var _nodeController = require('./nodeController');

var _settings = require('../tools/settings');

var _settings2 = _interopRequireDefault(_settings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Shape = exports.Shape = function (_Base) {
    _inherits(Shape, _Base);

    function Shape(params, canvas) {
        _classCallCheck(this, Shape);

        var _this = _possibleConstructorReturn(this, (Shape.__proto__ || Object.getPrototypeOf(Shape)).call(this, params, canvas));

        _this.type = params.shape;
        _this.width = params.width;
        _this.height = params.height;
        _this.x = params.x;
        _this.y = params.y;
        if (params.text) {
            _this.text = params.text;
        }
        _this.connector = new _connector.Connector(_this, canvas);
        _this.anchor = new _nodeAnchor.NodeAnchor(_this, canvas);
        _this.controller = new _nodeController.NodeController(_this, canvas);
        return _this;
    }

    _createClass(Shape, [{
        key: 'fillText',


        //处理文字信息
        value: function fillText() {
            var context = this.ctx;
            if (!context) return;
            if (this.text && this.text.content) {
                context.lineWidth = 1;
                context.fillStyle = 'rgba(0, 0, 0, 1)';
                if (this.text.fontSize) {
                    context.font = this.text.fontSize + ' ' + _settings2.default.defaultFont.fontFamily;
                } else {
                    context.font = _settings2.default.defaultFont.nodeFontSize + ' ' + _settings2.default.defaultFont.fontFamily;
                    this.text.fontSize = _settings2.default.defaultFont.nodeFontSize;
                }

                var content = this.text.content;
                var size = parseInt((this.text.fontSize || _settings2.default.defaultFont.nodeFontSize).replace('px', ''));
                var chars = content.split("");
                var temp = "";
                var rows = [];
                for (var i = 0; i < chars.length; i++) {
                    if (context.measureText(temp).width < this.width && context.measureText(temp + chars[i]).width <= this.width) {
                        temp += chars[i];;
                    } else {
                        rows.push(temp);
                        temp = chars[i];
                    }
                }
                rows.push(temp);

                context.textAlign = this.text.textAlign ? this.text.textAlign : 'center';
                context.textBaseline = this.text.textBaseline ? this.text.textBaseline : 'middle';

                var start_x = void 0,
                    start_y = void 0;
                switch (context.textAlign) {
                    case 'center':
                        start_x = this.center.x;
                        break;
                    case 'left':
                        start_x = this.left + 1;
                        break;
                    case 'right':
                        start_x = this.right - 1;
                        break;
                }

                switch (context.textBaseline) {
                    case 'middle':
                        start_y = this.center.y - (rows.length - 1) / 2 * (size + 1);
                        break;
                    case 'top':
                        start_y = this.top + 1;
                        break;
                    case 'bottom':
                        start_y = this.bottom - (rows.length - 1) * (size + 1);
                        break;
                }
                for (var index = 0; index < rows.length; index++) {
                    var row = rows[index];
                    context.fillText(row, start_x, start_y + (size + 1) * index);
                }
            }
        }

        //选择元素渲染

    }, {
        key: 'selectShape',
        value: function selectShape() {
            this.controller.draw();
        }

        //移出区域取消悬停效果

    }, {
        key: 'hitCheck_Over',
        value: function hitCheck_Over(x, y) {
            if (x >= this.left - 20 && x <= this.right + 20 && y >= this.top - 20 && y <= this.bottom + 20) {
                return true;
            } else {
                return false;
            }
        }
    }, {
        key: 'nodeResizing',
        value: function nodeResizing(nodeResizeCache, length) {
            //Virtual Function
            return length;
        }
    }, {
        key: 'top',
        get: function get() {
            return this.y - this.height / 2;
        }
    }, {
        key: 'bottom',
        get: function get() {
            return this.y + this.height / 2;
        }
    }, {
        key: 'left',
        get: function get() {
            return this.x - this.width / 2;
        }
    }, {
        key: 'right',
        get: function get() {
            return this.x + this.width / 2;
        }
    }, {
        key: 'center',
        get: function get() {
            return { x: this.x, y: this.y };
        }
    }]);

    return Shape;
}(_base.Base);