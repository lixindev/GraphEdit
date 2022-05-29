'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NodeAnchor = exports.NodeAnchor = function () {
    function NodeAnchor(shape, canvas) {
        _classCallCheck(this, NodeAnchor);

        this.shape = shape;
        this.ctx = canvas.getContext("2d");
    }

    _createClass(NodeAnchor, [{
        key: 'draw',
        value: function draw() {
            var _this = this;

            this.ctx.save();
            this.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
            this.ctx.strokeStyle = 'rgb(100, 150, 255, 1)';
            this.ctx.lineWidth = 0.8;
            this.pointCollection.map(function (point) {
                return drawPoint(point, _this.ctx);
            });
            this.ctx.restore();
        }
    }, {
        key: 'pointCollection',
        get: function get() {
            var collection = [];
            collection.push(this.firstPoint);
            collection.push(this.secondPoint);
            collection.push(this.thirdPoint);
            collection.push(this.forthPoint);
            return collection;
        }
    }, {
        key: 'firstPoint',
        get: function get() {
            return {
                order: 1,
                x: this.shape.center.x,
                y: this.shape.top
            };
        }
    }, {
        key: 'secondPoint',
        get: function get() {
            return {
                order: 2,
                x: this.shape.right,
                y: this.shape.center.y
            };
        }
    }, {
        key: 'thirdPoint',
        get: function get() {
            return {
                order: 3,
                x: this.shape.center.x,
                y: this.shape.bottom
            };
        }
    }, {
        key: 'forthPoint',
        get: function get() {
            return {
                order: 4,
                x: this.shape.left,
                y: this.shape.center.y
            };
        }
    }]);

    return NodeAnchor;
}();

function drawPoint(point, context) {
    context.fillRect(point.x - 3, point.y - 3, 6, 6);
    context.strokeRect(point.x - 3, point.y - 3, 6, 6);
}