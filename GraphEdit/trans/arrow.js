'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
//箭头角度
var theta1 = 25;
//箭头内角
var theta2 = 60;
//箭头外边长
var headlen = 9;
var sind = headlen * Math.sin(theta1 * Math.PI / 180);
var cosd = headlen * Math.cos(theta1 * Math.PI / 180);
var tand = sind / Math.tan(theta2 * Math.PI / 180);

exports.default = {
    drawArrow: function drawArrow(context, direction, point) {
        context.beginPath();
        context.moveTo(point.x, point.y);
        var point1 = {};
        var point2 = {};
        var point3 = {};
        if (direction === 'up') {
            point1.x = point.x - sind;
            point1.y = point.y + cosd;
            point2.x = point.x;
            point2.y = point1.y - tand;
            point3.x = point.x + sind;
            point3.y = point1.y;
        } else if (direction === 'down') {
            point1.x = point.x - sind;
            point1.y = point.y - cosd;
            point2.x = point.x;
            point2.y = point1.y + tand;
            point3.x = point.x + sind;
            point3.y = point1.y;
        } else if (direction === 'left') {
            point1.x = point.x + cosd;
            point1.y = point.y - sind;
            point2.x = point1.x - tand;
            point2.y = point.y;
            point3.x = point1.x;
            point3.y = point.y + sind;
        } else if (direction === 'right') {
            point1.x = point.x - cosd;
            point1.y = point.y - sind;
            point2.x = point1.x + tand;
            point2.y = point.y;
            point3.x = point1.x;
            point3.y = point.y + sind;
        }
        context.lineTo(point1.x, point1.y);
        context.lineTo(point2.x, point2.y);
        context.lineTo(point3.x, point3.y);
        context.fill();
    }
};