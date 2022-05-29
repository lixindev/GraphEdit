'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Relation = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _polyline = require('./lines/polyline');

var _straightline = require('./lines/straightline');

var _commonFunctions = require('./tools/commonFunctions');

var _commonFunctions2 = _interopRequireDefault(_commonFunctions);

var _settings = require('./tools/settings');

var _settings2 = _interopRequireDefault(_settings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var lineConstructor = {
    polyline: _polyline.PolyLine,
    straightline: _straightline.Straightline
};

var Relation = exports.Relation = function () {
    function Relation(params, canvas) {
        _classCallCheck(this, Relation);

        this.line = null;
        if (Object.hasOwnProperty.call(lineConstructor, params.lineModel)) {
            this.line = new lineConstructor[params.lineModel](params, canvas);
            this.lineModelText = params.lineModel;
        } else {
            this.line = new lineConstructor.polyline(params, canvas);
            this.lineModelText = 'polyline';
        }

        if (params.id) {
            this.id = params.id;
        } else {
            this.id = _commonFunctions2.default.generateUUID();
        }

        if (params.index) {
            this.index = params.index;
        } else {
            this.index = null;
        }

        //存放自定义属性，使用引用类型
        if (params.customProperties) {
            this.customProperties = params.customProperties;
        } else {
            this.customProperties = {};
        }
    }

    _createClass(Relation, [{
        key: 'createPath',
        value: function createPath() {
            this.line.createPath();
        }
    }, {
        key: 'draw',
        value: function draw() {
            this.line.drawLine(0.7);
        }
    }, {
        key: 'drawDashLine',
        value: function drawDashLine(operation) {
            this.line.drawLine(0.7, true);
            this.line.ctx.save();
            if (this.line.to && operation === _settings2.default.lineOperations.endPointChange) {
                this.line.ctx.strokeStyle = 'rgb(255, 50, 50, 1)';
                this.line.ctx.strokeRect(this.endPoint.x - 5, this.endPoint.y - 5, 10, 10);
            };
            if (this.line.from && operation === _settings2.default.lineOperations.startPointChange) {
                this.line.ctx.strokeStyle = 'rgb(255, 50, 50, 1)';
                this.line.ctx.strokeRect(this.startPoint.x - 5, this.startPoint.y - 5, 10, 10);
            }
            this.line.ctx.restore();
        }
    }, {
        key: 'showController',
        value: function showController() {
            this.line.controller.draw();
        }

        //判断坐标是否命中线

    }, {
        key: 'hitCheck',
        value: function hitCheck(x, y) {
            return this.line.hitCheck(x, y);
        }
    }, {
        key: 'startPoint',
        get: function get() {
            return this.line.startPoint;
        },
        set: function set(value) {
            this.line.startPoint = value;
        }
    }, {
        key: 'endPoint',
        get: function get() {
            return this.line.endPoint;
        },
        set: function set(value) {
            this.line.endPoint = value;
        }
    }, {
        key: 'textPoint',
        get: function get() {
            return this.line.textPoint;
        }
    }, {
        key: 'label',
        get: function get() {
            return this.line.text.content ? this.line.text.content : null;
        },
        set: function set(value) {
            this.line.text.content = value;
        }
    }, {
        key: 'fontSize',
        get: function get() {
            return this.line.text.fontSize ? this.line.text.fontSize : _settings2.default.defaultFont.relationFontSize;
        },
        set: function set(value) {
            this.line.text.fontSize = value;
        }
    }, {
        key: 'source',
        get: function get() {
            return this.line.from ? this.line.from.id : null;
        }
    }, {
        key: 'target',
        get: function get() {
            return this.line.to ? this.line.to.id : null;
        }
    }, {
        key: 'from',
        get: function get() {
            return this.line.from;
        },
        set: function set(value) {
            this.line.from = value;
        }
    }, {
        key: 'to',
        get: function get() {
            return this.line.to;
        },
        set: function set(value) {
            this.line.to = value;
        }
    }, {
        key: 'fromConOrder',
        get: function get() {
            return this.line.fromConOrder;
        },
        set: function set(value) {
            this.line.fromConOrder = value;
        }
    }, {
        key: 'toConOrder',
        get: function get() {
            return this.line.toConOrder;
        },
        set: function set(value) {
            this.line.toConOrder = value;
        }
    }, {
        key: 'lineModel',
        get: function get() {
            return this.lineModelText;
        },
        set: function set(value) {
            this.lineModelText = value;
            var lineParam = {
                strokeStyle: this.line.strokeStyle,
                text: {
                    content: this.label,
                    fontSize: this.fontSize
                },
                fromConOrder: this.fromConOrder,
                toConOrder: this.toConOrder,
                startPoint: this.startPoint,
                endPoint: this.endPoint,
                from: this.from,
                to: this.to
            };

            if (Object.hasOwnProperty.call(lineConstructor, this.lineModelText)) {
                this.line = new lineConstructor[this.lineModelText](lineParam, this.line.canvas);
            } else {
                this.line = new lineConstructor.polyline(params, this.line.canvas);
                this.lineModelText = 'polyline';
            }
            this.line.createPath();
        }
    }]);

    return Relation;
}();