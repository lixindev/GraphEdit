'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LineController = exports.LineController = function () {
    function LineController(line, canvas) {
        _classCallCheck(this, LineController);

        this.line = line;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
    }

    _createClass(LineController, [{
        key: 'draw',
        value: function draw() {
            this.ctx.save();
            if (this.line.to) {
                this.ctx.fillStyle = 'rgba(255, 100, 100, 1)';
                this.ctx.strokeStyle = 'rgb(255, 0, 0, 1)';
            } else {
                this.ctx.fillStyle = 'rgba(200, 200, 255, 1)';
                this.ctx.strokeStyle = 'rgb(100, 150, 255, 1)';
            }
            this.ctx.lineWidth = 0.8;
            this.ctx.fillRect(this.line.endPoint.x - 3, this.line.endPoint.y - 3, 6, 6);
            this.ctx.strokeRect(this.line.endPoint.x - 3, this.line.endPoint.y - 3, 6, 6);
            if (this.line.from) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
                this.ctx.strokeStyle = 'rgb(255, 0, 0, 1)';
            } else {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
                this.ctx.strokeStyle = 'rgb(100, 150, 255, 1)';
            }
            this.ctx.fillRect(this.line.startPoint.x - 3, this.line.startPoint.y - 3, 6, 6);
            this.ctx.strokeRect(this.line.startPoint.x - 3, this.line.startPoint.y - 3, 6, 6);
            this.ctx.restore();

            if (this.line.inflexionPoint && this.line.inflexionPoint.length > 1) {
                this.ctx.save();
                this.ctx.fillStyle = 'rgba(200, 200, 255, 1)';
                this.ctx.strokeStyle = 'rgb(100, 150, 255, 1)';
                this.ctx.lineWidth = 0.8;
                for (var index = 0; index < this.line.inflexionPoint.length - 1; index++) {
                    var p1 = this.line.inflexionPoint[index];
                    var p2 = this.line.inflexionPoint[index + 1];
                    var p3 = {};
                    if (p1.x === p2.x) {
                        p3.x = p1.x;
                        p3.y = (p1.y + p2.y) / 2;
                    } else if (p1.y === p2.y) {
                        p3.y = p1.y;
                        p3.x = (p1.x + p2.x) / 2;
                    }
                    if (p3.x && p3.y) {
                        this.ctx.fillRect(p3.x - 2.5, p3.y - 2.5, 5, 5);
                        this.ctx.strokeRect(p3.x - 2.5, p3.y - 2.5, 5, 5);
                    }
                }
                this.ctx.restore();
            }
        }
    }, {
        key: 'hitCheck',
        value: function hitCheck(x, y) {
            if (x >= this.line.startPoint.x - 4 && x <= this.line.startPoint.x + 4 && y >= this.line.startPoint.y - 4 && y <= this.line.startPoint.y + 4) {
                return {
                    operation: 'startPointChange',
                    position: this.line.startPoint
                };
            }
            if (x >= this.line.endPoint.x - 4 && x <= this.line.endPoint.x + 4 && y >= this.line.endPoint.y - 4 && y <= this.line.endPoint.y + 4) {
                return {
                    operation: 'endPointChange',
                    position: this.line.endPoint
                };
            }

            if (this.line.inflexionPoint && this.line.inflexionPoint.length > 1) {
                for (var index = 0; index < this.line.inflexionPoint.length - 1; index++) {
                    var p1 = this.line.inflexionPoint[index];
                    var p2 = this.line.inflexionPoint[index + 1];
                    var p3 = {};
                    if (p1.x === p2.x) {
                        p3.x = p1.x;
                        p3.y = (p1.y + p2.y) / 2;
                    } else if (p1.y === p2.y) {
                        p3.y = p1.y;
                        p3.x = (p1.x + p2.x) / 2;
                    }
                    if (p3.x && p3.y) {
                        if (x >= p3.x - 4 && x <= p3.x + 4 && y >= p3.y - 4 && y <= p3.y + 4) {
                            var p0 = null;
                            var p4 = null;
                            if (index - 1 < 0) {
                                p0 = this.secondPoint;
                            } else {
                                p0 = this.line.inflexionPoint[index - 1];
                            };
                            if (index + 2 >= this.line.inflexionPoint.length) {
                                p4 = this.endPoint;
                            } else {
                                p4 = this.line.inflexionPoint[index + 2];
                            };
                            var collection = [];
                            collection.push(p0);
                            collection.push(p1);
                            collection.push(p3);
                            collection.push(p2);
                            collection.push(p4);
                            return {
                                operation: 'middlePathChange',
                                points: collection
                            };
                        }
                    }
                }
            }
            return false;
        }
    }]);

    return LineController;
}();