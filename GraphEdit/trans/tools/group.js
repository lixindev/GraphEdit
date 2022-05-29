"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Group = exports.Group = function () {
    function Group(canvas) {
        _classCallCheck(this, Group);

        this.nodes = [];
        this.relations = [];
        this.initialArea();
        this.ctx = canvas.getContext("2d");
    }

    _createClass(Group, [{
        key: "initialArea",
        value: function initialArea() {
            this.area = {
                top: Infinity,
                left: Infinity,
                bottom: 0,
                right: 0,
                isInitial: false
            };
        }
    }, {
        key: "draw",
        value: function draw() {
            this.initialArea();
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var node = _step.value;

                    if (node.shape.top < this.area.top) {
                        this.area.top = node.shape.top;
                    }
                    if (node.shape.left < this.area.left) {
                        this.area.left = node.shape.left;
                    }
                    if (node.shape.bottom > this.area.bottom) {
                        this.area.bottom = node.shape.bottom;
                    }
                    if (node.shape.right > this.area.right) {
                        this.area.right = node.shape.right;
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

            this.ctx.save();
            this.ctx.lineWidth = 0.6;
            this.ctx.strokeStyle = 'rgb(255, 0, 255)';
            this.ctx.strokeRect(this.area.left - 10, this.area.top - 10, this.area.right - this.area.left + 20, this.area.bottom - this.area.top + 20);
            this.ctx.restore();
        }
    }, {
        key: "drawDashGroup",
        value: function drawDashGroup(x, y) {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.nodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var node = _step2.value;

                    node.drawDashNode(x, y);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }
    }]);

    return Group;
}();