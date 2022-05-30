'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Base = exports.Base = function Base() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var canvas = arguments[1];

    _classCallCheck(this, Base);

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    if (params.strokeStyle) {
        this.strokeStyle = params.strokeStyle;
    } else {
        this.strokeStyle = 'rgb(0, 0, 0)';
    }

    if (params.fillStyle) {
        this.fillStyle = params.fillStyle;
    } else {
        this.fillStyle = 'rgba(0, 0, 0, 1)';
    }
};