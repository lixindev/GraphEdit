import { Shape } from './shape'

export class Rhomb extends Shape{
    constructor(params, canvas){
        super(params, canvas);
    };

    get firstPoint(){
        return{
            x: this.x,
            y: this.top
        }
    }

    get secondPoint(){
        return{
            x: this.right,
            y: this.y
        }
    }

    get thirdPoint(){
        return{
            x: this.x,
            y: this.bottom
        }
    }

    get fourthPoint(){
        return{
            x: this.left,
            y: this.y
        }
    }

    drawBaseShape(x, y, isFill = true){
        let context = this.ctx; 

        if(isFill){
            context.beginPath();
            context.moveTo(this.firstPoint.x + x, this.firstPoint.y + y);
            context.lineTo(this.secondPoint.x + x, this.secondPoint.y + y);
            context.lineTo(this.thirdPoint.x + x, this.thirdPoint.y + y);
            context.lineTo(this.fourthPoint.x + x, this.fourthPoint.y + y);
            context.closePath();
            context.fill();
        }

        context.beginPath();
        context.moveTo(this.firstPoint.x + x, this.firstPoint.y + y);
        context.lineTo(this.secondPoint.x + x, this.secondPoint.y + y);
        context.lineTo(this.thirdPoint.x + x, this.thirdPoint.y + y);
        context.lineTo(this.fourthPoint.x + x, this.fourthPoint.y + y);
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
    };

    //用于拖拽中绘制虚线轨迹
    drawDashNode(x, y){
        let context = this.ctx; 
        if (!context) return;
        context.save();
        context.strokeStyle = this.strokeStyle;
        context.lineWidth = 1;
        context.setLineDash([6, 3]);
        context.lineDashOffset = 0;

        this.drawBaseShape(x, y, false);
        
        context.restore();  
    };

    //判断坐标是否命中图形元素
    hitCheck(x, y){
        const lamb1 = (this.firstPoint.x - this.fourthPoint.x) / (this.firstPoint.y - this.fourthPoint.y);
        const lamb2 = (this.firstPoint.x - this.secondPoint.x) / (this.firstPoint.y - this.secondPoint.y);
        if (x - lamb1 * y < this.firstPoint.x - lamb1 *  this.firstPoint.y 
            || x - lamb1 * y > this.secondPoint.x - lamb1 *  this.secondPoint.y){
            return false;
        }
        if (x - lamb2 * y > this.firstPoint.x - lamb2 *  this.firstPoint.y 
            || x - lamb2 * y < this.fourthPoint.x - lamb2 *  this.fourthPoint.y){
            return false;
        }
        return true;
    }
}