import { Shape } from './shape'

export class Circle extends Shape {
    constructor(params, canvas){
        super(params, canvas);
        if (this.width !== this.height){
            this.height = this.width;
        }
    };
    
    drawBaseShape(x, y, isFill = true){
        let context = this.ctx; 

        let startPoint = {};
        startPoint.x = this.x + x;
        startPoint.y = this.y + y;

        if(isFill){
            context.beginPath();
            context.arc(startPoint.x, startPoint.y, this.height/2, -Math.PI, Math.PI, false);
            context.fill();
        }

        context.beginPath();
        context.arc(startPoint.x, startPoint.y, this.height/2, -Math.PI, Math.PI, false);
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
        context.setLineDash([6, 3]);
        context.lineDashOffset = 0;
        context.lineWidth = 1;
        this.drawBaseShape(x, y, false);
        context.restore();
    };

    //判断坐标是否命中图形元素
    hitCheck(x, y){
        const r = this.height/2;
        const distance = (x - this.x) * (x - this.x) + (y - this.y) * (y - this.y);
        if (distance <= r * r){
            return true;
        } else {
            return false;
        }
    }
}