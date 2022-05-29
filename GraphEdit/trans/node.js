'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Node = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _rect = require('./shapes/rect');

var _capsule = require('./shapes/capsule');

var _rhomb = require('./shapes/rhomb');

var _circle = require('./shapes/circle');

var _commonFunctions = require('./tools/commonFunctions');

var _commonFunctions2 = _interopRequireDefault(_commonFunctions);

var _settings = require('./tools/settings');

var _settings2 = _interopRequireDefault(_settings);

var _parameterError = require('./errors/parameterError');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var shapeConstructor = {
    rect: _rect.Rect,
    capsule: _capsule.Capsule,
    rhomb: _rhomb.Rhomb,
    circle: _circle.Circle
};

var Node = exports.Node = function () {
    function Node(params, canvas) {
        _classCallCheck(this, Node);

        if (params.id) {
            this.id = params.id;
        } else {
            this.id = _commonFunctions2.default.generateUUID();
        }

        if (Object.hasOwnProperty.call(shapeConstructor, params.shape)) {
            this.shape = new shapeConstructor[params.shape](params, canvas);
        } else {
            throw new _parameterError.ParameterError('无法找到shape指定的图形！');
        }

        this.type = params.type;

        this.isOver = false;
        if (params.index) {
            this.index = params.index;
        } else {
            this.index = null;
        }
        //关联线条
        this.relations = [];
        //存放自定义属性，使用引用类型
        if (params.customProperties) {
            this.customProperties = params.customProperties;
        } else {
            this.customProperties = {};
        }
    }

    _createClass(Node, [{
        key: 'draw',


        //绘图
        value: function draw() {
            this.shape.draw();
        }
    }, {
        key: 'drawDashNode',


        //用于拖拽中绘制虚线轨迹
        value: function drawDashNode(x, y) {
            this.shape.drawDashNode(x, y);
        }
    }, {
        key: 'selectShape',


        //选择元素渲染
        value: function selectShape() {
            this.shape.selectShape();
        }
    }, {
        key: 'showController',


        //显示控制点
        value: function showController() {
            this.shape.selectShape();
        }

        //判断坐标是否命中图形元素

    }, {
        key: 'hitCheck',
        value: function hitCheck(x, y) {
            return this.shape.hitCheck(x, y);
        }
    }, {
        key: 'hitCheck_Over',
        value: function hitCheck_Over(x, y) {
            if (this.isOver) {
                return this.shape.hitCheck_Over(x, y);
            } else {
                return this.shape.hitCheck(x, y);
            }
        }
    }, {
        key: 'hitNode',


        //判断坐标是否命中节点
        value: function hitNode(x, y) {
            if (x >= this.shape.left && x <= this.shape.right && y >= this.shape.top && y <= this.shape.bottom) {
                return true;
            } else {
                return false;
            }
        }

        //绘制连接点

    }, {
        key: 'drawConnector',
        value: function drawConnector() {
            this.shape.connector.draw();
        }
    }, {
        key: 'connectorHitCheck',


        //判断坐标是否命中连接点
        value: function connectorHitCheck(x, y) {
            return this.shape.connector.hitCheck(x, y);
        }
    }, {
        key: 'selectConnector',
        value: function selectConnector(order) {
            this.shape.connector.selectPoint(order);
        }
    }, {
        key: 'label',
        get: function get() {
            return this.shape.text.content ? this.shape.text.content : null;
        },
        set: function set(value) {
            this.shape.text.content = value;
        }
    }, {
        key: 'fontSize',
        get: function get() {
            return this.shape.text.fontSize ? this.shape.text.fontSize : _settings2.default.defaultFont.nodeFontSize;
        },
        set: function set(value) {
            this.shape.text.fontSize = value;
        }
    }, {
        key: 'textAlign',
        get: function get() {
            return this.shape.text.textAlign ? this.shape.text.textAlign : 'center';
        },
        set: function set(value) {
            this.shape.text.textAlign = value;
        }
    }, {
        key: 'textBaseline',
        get: function get() {
            return this.shape.text.textBaseline ? this.shape.text.textBaseline : 'middle';
        },
        set: function set(value) {
            this.shape.text.textBaseline = value;
        }
    }, {
        key: 'size',
        get: function get() {
            return this.shape.width.toString() + '*' + this.shape.height.toString();
        }
    }, {
        key: 'x',
        get: function get() {
            return this.shape.x;
        }
    }, {
        key: 'y',
        get: function get() {
            return this.shape.y;
        }
    }, {
        key: 'color',
        get: function get() {
            return this.shape.fillStyle;
        }
    }, {
        key: 'edgeColor',
        get: function get() {
            return this.shape.strokeStyle;
        }
    }]);

    return Node;
}();