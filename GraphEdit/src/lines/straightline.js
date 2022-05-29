import { Line } from './line'
import Arrow from './arrow'

const hitWidth = 5;
export class Straightline extends Line{
    constructor(params, canvas){
        super(params, canvas);
    }

    get textPoint(){
        return {
            x: (this.startPoint.x + this.endPoint.x) / 2,
            y: (this.startPoint.y + this.endPoint.y) / 2
        };
    }

    createPath(){
        this.inflexionPoint = [];
    }

    drawLine(width, isDash){
        const context = this.ctx; 
        if (!context) return;
        context.save();
        context.lineWidth = width;
        context.strokeStyle = this.strokeStyle;
        context.fillStyle = 'rgba(100, 100, 100, 1)';

        if(isDash){
            context.setLineDash([6, 3]);
            context.lineDashOffset = 0;
        }

        context.beginPath();
        context.moveTo(this.startPoint.x, this.startPoint.y);
        context.lineTo(this.endPoint.x, this.endPoint.y);
        context.stroke();

        Arrow.drawCommonArrow(context, this.endPoint.x - this.startPoint.x, this.endPoint.y - this.startPoint.y, this.endPoint);
        this.fillText(isDash, this.textPoint);
        context.restore();
    }

    //判断坐标是否命中线
    hitCheck(x, y){
        const x1 = this.startPoint.x;
        const y1 = this.startPoint.y;
        const x2 = this.endPoint.x;
        const y2 = this.endPoint.y;
        //竖线、横线特殊处理
        if(y1 === y2 && y >= y1 - hitWidth && y <= y1 + hitWidth
            && x >= (x1 > x2 ? x2 : x1) 
            && x <= (x1 < x2 ? x2 : x1)){
                return true;
        } else if (x1 === x2 && x >= x1 - hitWidth && x <= x1 + hitWidth 
            && y >= (y1 > y2 ? y2 : y1) 
            && y <= (y1 < y2 ? y2 : y1)) {
                return true;
        }

        //直线方程y = ax + b
        const a = (y1-y2)/(x1-x2);
        const b = y1-a*x1;

        //过(x,y)给y = ax + b做垂线y = cx + d
        const c = -1 / a;
        const d = y - c * x;
        const x3 = (d - b) / (a -c);
        const y3 = c * x3 + d;

        if (x3 >= (x1 > x2 ? x2 : x1) && x3 <= (x1 < x2 ? x2 : x1) 
        && (x - x3) * (x - x3) + (y - y3) * (y - y3) <= hitWidth * hitWidth) {
            return true;
        } else {
            return false;
        }
    } 
}