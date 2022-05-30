import Settings from '../tools/settings'
//箭头角度
const theta1 = 25;
//箭头内角
const theta2 = 60;
//箭头外边长
const L1 = 10 * Settings.ratio;
const L2 = L1 * Math.sin(theta1 * Math.PI/180);
const L3 = L2 / Math.sin(theta2 * Math.PI/180);

export default {
    drawCommonArrow(context, dx, dy, point){
        context.beginPath();
        context.moveTo(point.x, point.y);
        let point1 = {};
        let point2 = {};
        let point3 = {};
        let theta;
        if (dx === 0 && dy >= 0) {
            theta = Math.PI/2;
        } else if (dx === 0 && dy < 0) {
            theta = -Math.PI/2;
        } else  if (dy === 0 && dx < 0) {
            theta = Math.atan(dy/dx) - Math.PI;
        } else  if (dy === 0 && dx > 0) {
            theta = Math.atan(dy/dx);
        } else if (dx < 0) {
            theta = Math.atan(dy/dx) - Math.PI;
        } else {
            theta = Math.atan(dy/dx);
        }

        point1.x = point.x - L1 * Math.cos(theta - (theta1 * Math.PI / 180));
        point1.y = point.y - L1 * Math.sin(theta - (theta1 * Math.PI / 180));

        point2.x = point1.x + L3 * Math.cos(theta - (theta2 * Math.PI / 180));
        point2.y = point1.y + L3 * Math.sin(theta - (theta2 * Math.PI / 180));

        point3.x = point.x - L1 * Math.cos(theta + (theta1 * Math.PI / 180));
        point3.y = point.y - L1 * Math.sin(theta + (theta1 * Math.PI / 180));

        context.lineTo(point1.x, point1.y);
        context.lineTo(point2.x, point2.y);
        context.lineTo(point3.x, point3.y);
        context.fill();
    }
}