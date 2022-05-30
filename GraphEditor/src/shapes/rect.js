import { Shape } from './shape'

export class Rect extends Shape {
    constructor(params, canvas){
        super(params, canvas);
    };
    
    //绘图
    draw(){
        let context = this.ctx; 
        if (!context) return;
        context.save();
        context.lineWidth = 1.2;
        context.strokeStyle = this.strokeStyle;
        context.fillStyle = this.fillStyle;
        context.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);  
        context.strokeRect (this.x - this.width/2, this.y - this.height/2, this.width, this.height);
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
        context.strokeRect (this.x + x - this.width/2, this.y + y - this.height/2, this.width, this.height); 
        context.restore();  
    };

    //判断坐标是否命中图形元素
    hitCheck(x, y){
        if (x >= this.left && x <= this.right && y >= this.top && y <= this.bottom){
            return true;
        } else {
            return false;
        }
    }
}