import { Shape } from './shape';
import { ParameterError } from '../errors/parameterError';

const minCapsuleLine = 10;
export class Capsule extends Shape{
    constructor(params, canvas){
        super(params, canvas);
        if (this.width < this.height){
            throw new ParameterError("Capsule's width must be bigger then height!");
        }
    }

    drawBaseShape(x, y, isFill = true){
        let context = this.ctx; 

        let startPoint = {};
        startPoint.x = this.x + (this.width - this.height)/2 + x;
        startPoint.y = this.y + y;
        let secondPoint = {};
        secondPoint.x = this.x - (this.width - this.height)/2 + x;
        secondPoint.y = this.y + y;

        if(isFill){
            context.beginPath();
            context.arc(startPoint.x, startPoint.y, this.height/2, -Math.PI/2, Math.PI/2, false);
            context.lineTo(secondPoint.x, secondPoint.y + this.height/2);
            context.arc(secondPoint.x, secondPoint.y, this.height/2, Math.PI/2, -Math.PI/2, false);
            context.closePath();
            context.fill();
        }

        context.beginPath();
        context.arc(startPoint.x, startPoint.y, this.height/2, -Math.PI/2, Math.PI/2, false);
        context.lineTo(secondPoint.x, secondPoint.y + this.height/2);
        context.arc(secondPoint.x, secondPoint.y, this.height/2, Math.PI/2, -Math.PI/2, false);
        context.closePath();
        context.stroke();
    }

    //绘图
    draw(){
        let context = this.ctx; 
        if (!context) return;
        context.save();
        context.lineWidth = 1.2;
        context.strokeStyle = this.strokeStyle;
        context.fillStyle = this.fillStyle;
        this.drawBaseShape(0, 0);
        this.fillText();
        context.restore();  
    }

    //用于拖拽中绘制虚线轨迹
    drawDashNode(x, y){
        let context = this.ctx; 
        if (!context) return;
        context.save();
        context.strokeStyle = this.strokeStyle;
        context.setLineDash([6, 3]);
        context.lineDashOffset = 0;
        context.lineWidth = 1;
        this.drawBaseShape(x, y, false);
        context.restore();
    }

    //判断坐标是否命中图形元素
    hitCheck(x, y){
        const r = this.height/2;
        //左半圆原点
        const point1 = { x: this.left + r, y: this.y };
        //右半圆原点
        const point2 = { x: this.right - r, y: this.y };
        const distance1 = (x - point1.x) * (x - point1.x) + (y - point1.y) * (y - point1.y);
        const distance2 = (x - point2.x) * (x - point2.x) + (y - point2.y) * (y - point2.y);
        if (x >= this.left + r && x <= this.right - r && y >= this.top && y <= this.bottom){
            return true;
        } else if (distance1 <= r * r) {
            return true;
        } else if (distance2 <= r * r) {
            return true;
        } else {
            return false;
        }
    }

    nodeResizing(nodeResizeCache, length){
        switch (nodeResizeCache.direction) {
            case 'n':
            case 's':
                length = length > nodeResizeCache.width - minCapsuleLine ? nodeResizeCache.width - minCapsuleLine : length;
                break;
            case 'e':
            case 'w':
                length = nodeResizeCache.height > length - minCapsuleLine ? nodeResizeCache.height + minCapsuleLine : length;
                break;
        }

        return length;
    }
}