import { Line } from './line'
import Arrow from './arrow'

const margin = 25;
const minMargin = 10;
const hitWidth = 5;

export class PolyLine extends Line{
    constructor(params, canvas){
        super(params, canvas);
        
        if (params.inflexionPoint){
            this.inflexionPoint = JSON.parse(JSON.stringify(params.inflexionPoint));
        } else {
            this.inflexionPoint = null;
        }
    }

    get textPoint(){
        if (this.inflexionPoint && this.inflexionPoint.length > 0){
            let total = 0;
            let length = 0;
            let collection = [];
            let part1 = {};
            let part2 = {};
            part1.first = this.startPoint;
            part1.second = this.inflexionPoint[0];
            part1.distance = part1.first.x === part1.second.x ? Math.abs(part1.first.y - part1.second.y) : Math.abs(part1.first.x - part1.second.x);
            collection.push(part1);
            total += part1.distance;
            if (this.inflexionPoint.length > 1){
                for (let index = 0; index < this.inflexionPoint.length - 1; index++) {
                    let part = {};
                    part.first = this.inflexionPoint[index];
                    part.second = this.inflexionPoint[index + 1];
                    part.distance = part.first.x === part.second.x ? Math.abs(part.first.y - part.second.y) : Math.abs(part.first.x - part.second.x);
                    collection.push(part);
                    total += part.distance;
                }
            }
            part2.first = this.inflexionPoint[this.inflexionPoint.length - 1];
            part2.second = this.endPoint;
            part2.distance = part2.first.x === part2.second.x ? Math.abs(part2.first.y - part2.second.y) : Math.abs(part2.first.x - part2.second.x);
            collection.push(part2);
            total += part2.distance;

            for (const part of collection) {
                length += part.distance;
                if (length >= total/2){
                    if(part.first.x === part.second.x){
                        return {
                            x: part.first.x,
                            y: part.second.y > part.first.y ? part.second.y - length + total/2 : part.second.y + length - total/2
                        }
                    } else if (part.first.y === part.second.y){
                        return {
                            x: part.second.x > part.first.x ? part.second.x - length + total/2 : part.second.x + length - total/2,
                            y: part.second.y
                        }
                    }
                }
            }
        } else {
            if (this.startPoint.x === this.endPoint.x){
                return {
                    x: this.startPoint.x,
                    y: (this.startPoint.y + this.endPoint.y)/2
                }
            } else if (this.startPoint.y === this.endPoint.y) {
                return{
                    x: (this.startPoint.x + this.endPoint.x)/2,
                    y: this.startPoint.y
                }
            }
        }
    }

    createPath(){
        this.inflexionPoint = [];
        let hitResult = false;
        if(this.from && this.to){
            hitResult = this.from.hitNode(this.endPoint.x, this.endPoint.y) || this.to.hitNode(this.startPoint.x, this.startPoint.y)
        }
        //两边都没有关联节点
        if (!this.startPoint.order && !this.endPoint.order){
            if (this.startPoint.x !== this.endPoint.x && this.startPoint.y !== this.endPoint.y){
                let point = {};
                [point.x, point.y] = [this.startPoint.x, this.endPoint.y];
                this.inflexionPoint.push(point);
            } else {
                this.inflexionPoint = null;
            }
        }
        //从连接点1开始规划路线
        else if(this.startPoint.order && this.startPoint.order === 1){
            createPathUnit.call(this, hitResult);
        } else if (this.startPoint.order && this.startPoint.order === 2){
            //坐标系逆时针旋转90度，转换起始节点坐标
            [this.from.shape.x, this.from.shape.y] = [this.from.shape.y, this.canvas.width - this.from.shape.x];
            [this.from.shape.width, this.from.shape.height] = [this.from.shape.height, this.from.shape.width];
            this.fromConOrder = 1;
            //没有连接到节点，只转化终点坐标
            if (this.endPoint && !this.endPoint.order){
                [this.endPoint.x, this.endPoint.y] = [this.endPoint.y, this.canvas.width - this.endPoint.x];
            } else if (this.to !== this.from) {
                [this.to.shape.x, this.to.shape.y] = [this.to.shape.y, this.canvas.width - this.to.shape.x];
                [this.to.shape.width, this.to.shape.height] = [this.to.shape.height, this.to.shape.width];
                this.toConOrder = --this.toConOrder;
                if (this.toConOrder < 1){
                    this.toConOrder = this.toConOrder + 4;
                }
            } else {
                //自环
                this.toConOrder = --this.toConOrder;
                if (this.toConOrder < 1){
                    this.toConOrder = this.toConOrder + 4;
                }
            }
            createPathUnit.call(this, hitResult);
            //坐标系顺时针旋转90度，转换起始节点坐标
            [this.from.shape.x, this.from.shape.y] = [this.canvas.width - this.from.shape.y, this.from.shape.x];
            [this.from.shape.width, this.from.shape.height] = [this.from.shape.height, this.from.shape.width];
            this.fromConOrder = 2;
            //没有连接到节点，只转化终点坐标
            if (this.endPoint && !this.endPoint.order){
                [this.endPoint.x, this.endPoint.y] = [this.canvas.width - this.endPoint.y, this.endPoint.x];
            } else if (this.to !== this.from) {
                [this.to.shape.x, this.to.shape.y] = [this.canvas.width - this.to.shape.y, this.to.shape.x];
                [this.to.shape.width, this.to.shape.height] = [this.to.shape.height, this.to.shape.width];
                this.toConOrder = ++this.toConOrder;
                if (this.toConOrder > 4){
                    this.toConOrder = this.toConOrder - 4;
                }
            } else {
                //自环
                this.toConOrder = ++this.toConOrder;
                if (this.toConOrder > 4){
                    this.toConOrder = this.toConOrder - 4;
                }
            }
            //转换所有路径上的节点
            if(this.inflexionPoint){
                for (const point of this.inflexionPoint) {
                    [point.x, point.y] = [this.canvas.width - point.y, point.x];
                }
            }
        } else if (this.startPoint.order && this.startPoint.order === 3){
            //坐标系逆时针旋转180度，转换起始节点坐标
            [this.from.shape.x, this.from.shape.y] = [this.canvas.width - this.from.shape.x, this.canvas.height - this.from.shape.y];
            this.fromConOrder = 1;
            //没有连接到节点，只转化终点坐标
            if (this.endPoint && !this.endPoint.order){
                [this.endPoint.x, this.endPoint.y] = [this.canvas.width - this.endPoint.x, this.canvas.height - this.endPoint.y];
            } else if (this.to !== this.from) {
                [this.to.shape.x, this.to.shape.y] = [this.canvas.width - this.to.shape.x, this.canvas.height - this.to.shape.y];
                this.toConOrder = this.toConOrder - 2;
                if (this.toConOrder < 1){
                    this.toConOrder = this.toConOrder + 4;
                }
            } else {
                this.toConOrder = this.toConOrder - 2;
                if (this.toConOrder < 1){
                    this.toConOrder = this.toConOrder + 4;
                }
            }
            createPathUnit.call(this, hitResult);
            //坐标系顺时针旋转180度，转换起始节点坐标
            [this.from.shape.x, this.from.shape.y] = [this.canvas.width - this.from.shape.x, this.canvas.height - this.from.shape.y];
            this.fromConOrder = 3;
            //没有连接到节点，只转化终点坐标
            if (this.endPoint && !this.endPoint.order){
                [this.endPoint.x, this.endPoint.y] = [this.canvas.width - this.endPoint.x, this.canvas.height - this.endPoint.y];
            } else if (this.to !== this.from) {
                [this.to.shape.x, this.to.shape.y] = [this.canvas.width - this.to.shape.x, this.canvas.height - this.to.shape.y];
                this.toConOrder = this.toConOrder + 2;
                if (this.toConOrder > 4){
                    this.toConOrder = this.toConOrder - 4;
                }
            } else {
                this.toConOrder = this.toConOrder + 2;
                if (this.toConOrder > 4){
                    this.toConOrder = this.toConOrder - 4;
                }
            }
            //转换所有路径上的节点
            if(this.inflexionPoint){
                for (const point of this.inflexionPoint) {
                    [point.x, point.y] = [this.canvas.width - point.x, this.canvas.height - point.y];
                }
            }
        } else if (this.startPoint.order && this.startPoint.order === 4){
            //坐标系顺时针旋转90度，转换起始节点坐标
            [this.from.shape.x, this.from.shape.y] = [this.canvas.width - this.from.shape.y, this.from.shape.x];
            [this.from.shape.width, this.from.shape.height] = [this.from.shape.height, this.from.shape.width];
            this.fromConOrder = 1;
            //没有连接到节点，只转化终点坐标
            if (this.endPoint && !this.endPoint.order){
                [this.endPoint.x, this.endPoint.y] = [this.canvas.width - this.endPoint.y, this.endPoint.x];
            } else if (this.to !== this.from) {
                [this.to.shape.x, this.to.shape.y] = [this.canvas.width - this.to.shape.y, this.to.shape.x];
                [this.to.shape.width, this.to.shape.height] = [this.to.shape.height, this.to.shape.width];
                this.toConOrder = ++this.toConOrder;
                if (this.toConOrder > 4){
                    this.toConOrder = this.toConOrder - 4;
                }
            } else {
                this.toConOrder = ++this.toConOrder;
                if (this.toConOrder > 4){
                    this.toConOrder = this.toConOrder - 4;
                }
            }
            createPathUnit.call(this, hitResult);
            //坐标系逆时针旋转90度，转换起始节点坐标
            [this.from.shape.x, this.from.shape.y] = [this.from.shape.y, this.canvas.width - this.from.shape.x];
            [this.from.shape.width, this.from.shape.height] = [this.from.shape.height, this.from.shape.width];
            this.fromConOrder = 4;
            //没有连接到节点，只转化终点坐标
            if (this.endPoint && !this.endPoint.order){
                [this.endPoint.x, this.endPoint.y] = [this.endPoint.y, this.canvas.width - this.endPoint.x];
            } else if (this.to !== this.from) {
                [this.to.shape.x, this.to.shape.y] = [this.to.shape.y, this.canvas.width - this.to.shape.x];
                [this.to.shape.width, this.to.shape.height] = [this.to.shape.height, this.to.shape.width];
                this.toConOrder = --this.toConOrder;
                if (this.toConOrder < 1){
                    this.toConOrder = this.toConOrder + 4;
                }
            } else {
                this.toConOrder = --this.toConOrder;
                if (this.toConOrder < 1){
                    this.toConOrder = this.toConOrder + 4;
                }
            }
            //转换所有路径上的节点
            if(this.inflexionPoint){
                for (const point of this.inflexionPoint) {
                    [point.x, point.y] = [point.y, this.canvas.width - point.x];
                }
            }
        } else if (!this.startPoint.order){
            if (this.endPoint && this.endPoint.order === 1){
                //逆转起始点和终点
                this.endPoint = this.startPoint;
                this.startPoint = null;
                [this.from, this.to] = [this.to, this.from];
                [this.fromConOrder, this.toConOrder] = [this.toConOrder, this.fromConOrder];
                createPathUnit.call(this);
                this.startPoint = this.endPoint;
                this.endPoint = null;
                [this.from, this.to] = [this.to, this.from];
                [this.fromConOrder, this.toConOrder] = [this.toConOrder, this.fromConOrder];
                if (this.inflexionPoint) {
                    this.inflexionPoint.reverse();
                }
            } else if (this.endPoint && this.endPoint.order === 2){
                //逆转起始点和终点
                this.endPoint = this.startPoint;
                this.startPoint = null;
                [this.from, this.to] = [this.to, this.from];
                [this.fromConOrder, this.toConOrder] = [this.toConOrder, this.fromConOrder];
                //坐标系逆时针旋转90度，转换起始节点坐标
                [this.from.shape.x, this.from.shape.y] = [this.from.shape.y, this.canvas.width - this.from.shape.x];
                [this.from.shape.width, this.from.shape.height] = [this.from.shape.height, this.from.shape.width];
                this.fromConOrder = 1;
                //没有连接到节点，只转化终点坐标
                [this.endPoint.x, this.endPoint.y] = [this.endPoint.y, this.canvas.width - this.endPoint.x];
                //计算路径
                createPathUnit.call(this, hitResult);
                //坐标系顺时针旋转90度，转换起始节点坐标
                [this.from.shape.x, this.from.shape.y] = [this.canvas.width - this.from.shape.y, this.from.shape.x];
                [this.from.shape.width, this.from.shape.height] = [this.from.shape.height, this.from.shape.width];
                this.fromConOrder = 2;
                //没有连接到节点，只转化终点坐标
                [this.endPoint.x, this.endPoint.y] = [this.canvas.width - this.endPoint.y, this.endPoint.x];
                //逆转起始点和终点
                this.startPoint = this.endPoint;
                this.endPoint = null;
                [this.from, this.to] = [this.to, this.from];
                [this.fromConOrder, this.toConOrder] = [this.toConOrder, this.fromConOrder];
                //转换所有路径上的节点
                if(this.inflexionPoint){
                    for (const point of this.inflexionPoint) {
                        [point.x, point.y] = [this.canvas.width - point.y, point.x];
                    }
                    this.inflexionPoint.reverse();
                }
            } else if (this.endPoint && this.endPoint.order === 3){
                //逆转起始点和终点
                this.endPoint = this.startPoint;
                this.startPoint = null;
                [this.from, this.to] = [this.to, this.from];
                [this.fromConOrder, this.toConOrder] = [this.toConOrder, this.fromConOrder];
                //坐标系逆时针旋转180度，转换起始节点坐标
                [this.from.shape.x, this.from.shape.y] = [this.canvas.width - this.from.shape.x, this.canvas.height - this.from.shape.y];
                this.fromConOrder = 1;
                //没有连接到节点，只转化终点坐标
                [this.endPoint.x, this.endPoint.y] = [this.canvas.width - this.endPoint.x, this.canvas.height - this.endPoint.y];
                //计算路径
                createPathUnit.call(this, hitResult);
                //坐标系顺时针旋转180度，转换起始节点坐标
                [this.from.shape.x, this.from.shape.y] = [this.canvas.width - this.from.shape.x, this.canvas.height - this.from.shape.y];
                this.fromConOrder = 3;
                //没有连接到节点，只转化终点坐标
                [this.endPoint.x, this.endPoint.y] = [this.canvas.width - this.endPoint.x, this.canvas.height - this.endPoint.y];
                //逆转起始点和终点
                this.startPoint = this.endPoint;
                this.endPoint = null;
                [this.from, this.to] = [this.to, this.from];
                [this.fromConOrder, this.toConOrder] = [this.toConOrder, this.fromConOrder];
                //转换所有路径上的节点
                if(this.inflexionPoint){
                    for (const point of this.inflexionPoint) {
                        [point.x, point.y] = [this.canvas.width - point.x, this.canvas.height - point.y];
                    }
                    this.inflexionPoint.reverse();
                }
            } else if (this.endPoint && this.endPoint.order === 4){
                //逆转起始点和终点
                this.endPoint = this.startPoint;
                this.startPoint = null;
                [this.from, this.to] = [this.to, this.from];
                [this.fromConOrder, this.toConOrder] = [this.toConOrder, this.fromConOrder];
                //坐标系顺时针旋转90度，转换起始节点坐标
                [this.from.shape.x, this.from.shape.y] = [this.canvas.width - this.from.shape.y, this.from.shape.x];
                [this.from.shape.width, this.from.shape.height] = [this.from.shape.height, this.from.shape.width];
                this.fromConOrder = 1;
                //没有连接到节点，只转化终点坐标
                [this.endPoint.x, this.endPoint.y] = [this.canvas.width - this.endPoint.y, this.endPoint.x];
                //计算路径
                createPathUnit.call(this, hitResult);
                //坐标系逆时针旋转90度，转换起始节点坐标
                [this.from.shape.x, this.from.shape.y] = [this.from.shape.y, this.canvas.width - this.from.shape.x];
                [this.from.shape.width, this.from.shape.height] = [this.from.shape.height, this.from.shape.width];
                this.fromConOrder = 4;
                //没有连接到节点，只转化终点坐标
                [this.endPoint.x, this.endPoint.y] = [this.endPoint.y, this.canvas.width - this.endPoint.x];
                //逆转起始点和终点
                this.startPoint = this.endPoint;
                this.endPoint = null;
                [this.from, this.to] = [this.to, this.from];
                [this.fromConOrder, this.toConOrder] = [this.toConOrder, this.fromConOrder];
                //转换所有路径上的节点
                if(this.inflexionPoint){
                    for (const point of this.inflexionPoint) {
                        [point.x, point.y] = [point.y, this.canvas.width - point.x];
                    }
                    this.inflexionPoint.reverse();
                }
            }
        }
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
        if (this.inflexionPoint){
            this.inflexionPoint.map(point => {
                context.lineTo(point.x, point.y);
            });
        }
        context.lineTo(this.endPoint.x, this.endPoint.y);
        
        context.stroke();

        let lastPoint = null;
        if (this.inflexionPoint && this.inflexionPoint.length > 0){
            lastPoint = this.inflexionPoint.pop();
            this.inflexionPoint.push(lastPoint);
        } else {
            lastPoint = this.startPoint;
        }
        Arrow.drawCommonArrow(context, this.endPoint.x - lastPoint.x, this.endPoint.y - lastPoint.y, this.endPoint);
        this.fillText(isDash, this.textPoint);
        context.restore();
    }

    //判断坐标是否命中线
    hitCheck(x, y){
        let isHit = false;
        let point1 = this.startPoint;
        if (this.inflexionPoint){
            this.inflexionPoint.push(this.endPoint);
        } else {
            this.inflexionPoint = [];
            this.inflexionPoint.push(this.endPoint);
        }
        for (const point of this.inflexionPoint) {
            if (point1.x === point.x){
                if (x >= point1.x - hitWidth && x <= point1.x + hitWidth 
                    && y >= (point1.y > point.y ? point.y : point1.y) 
                    && y <= (point1.y < point.y ? point.y : point1.y) ){
                    isHit = true;
                    break;
                }
            } else if (point1.y === point.y) {
                if (y >= point1.y - hitWidth && y <= point1.y + hitWidth 
                    && x >= (point1.x > point.x ? point.x : point1.x) 
                    && x <= (point1.x < point.x ? point.x : point1.x) ){
                    isHit = true;
                    break;
                }
            }
            point1 = point;
        }
        this.inflexionPoint.pop();
        if (this.inflexionPoint.length === 0){
            this.inflexionPoint = null;
        }

        return isHit;
    }
}

function createPathUnit(hitResult){
    //线的终点不在图形锚点上
    if(this.endPoint && !this.endPoint.order){
        let point1 = {};
        point1.x = this.startPoint.x;
        point1.y = this.startPoint.y - margin;
        if (this.endPoint.y < point1.y && this.endPoint.x !== point1.x){
            point1.y = this.endPoint.y;
            this.inflexionPoint.push(point1);
        } else if (this.endPoint.y < point1.y && this.endPoint.x === point1.x){
            this.inflexionPoint = null;
        } else if (this.endPoint.y > point1.y && this.endPoint.y <= this.from.shape.bottom){
            this.inflexionPoint.push(point1);
            let point2 = {};
            point2.x = this.endPoint.x;
            point2.y = point1.y;
            this.inflexionPoint.push(point2);
        } else {
            this.inflexionPoint.push(point1);
            if(this.endPoint.y !== point1.y){
                if(this.endPoint.x > this.from.shape.left - margin && this.endPoint.x < this.from.shape.center.x){
                    let point2 = {};
                    point2.x = this.from.shape.left - margin;
                    point2.y = point1.y;
                    this.inflexionPoint.push(point2);
                    let point3 = {};
                    point3.x = point2.x;
                    point3.y = this.endPoint.y;
                    this.inflexionPoint.push(point3);
                } else if (this.endPoint.x >= this.from.shape.center.x && this.endPoint.x < this.from.shape.right + margin){
                    let point2 = {};
                    point2.x = this.from.shape.right + margin;
                    point2.y = point1.y;
                    this.inflexionPoint.push(point2);
                    let point3 = {};
                    point3.x = point2.x;
                    point3.y = this.endPoint.y;
                    this.inflexionPoint.push(point3);
                } else {
                    let point2 = {};
                    point2.x = this.endPoint.x;
                    point2.y = point1.y;
                    this.inflexionPoint.push(point2);
                }
            }
        }
    } else if (this.endPoint && this.endPoint.order && this.endPoint.order === 1){//节点一连节点一
        let point1 = {};
        point1.x = this.startPoint.x;
        point1.y = this.startPoint.y - margin;
        if(hitResult && this.from !== this.to){
            if(this.endPoint.x !== this.startPoint.x && this.endPoint.y !== this.startPoint.y){
                let point2 = {};
                point2.x = this.startPoint.x;
                point2.y = (this.endPoint.y + this.startPoint.y)/2;
                this.inflexionPoint.push(point2);
                let point3 = {};
                point3.x = this.endPoint.x;
                point3.y = point2.y;
                this.inflexionPoint.push(point3);
            } else {
                this.inflexionPoint = null;
            }
        } else if (this.endPoint.y - margin < point1.y && (point1.x < this.to.shape.left - minMargin 
            || point1.x > this.to.shape.right + minMargin)){
            point1.y = this.endPoint.y - margin;
            this.inflexionPoint.push(point1);
            let point2 = {};
            point2.x = this.endPoint.x;
            point2.y = point1.y;
            this.inflexionPoint.push(point2);
        } else if (this.endPoint.y - margin < point1.y) {
            if (this.from.shape.top - this.to.shape.bottom < margin + minMargin){
                point1.y = (this.from.shape.top + this.to.shape.bottom)/2;
            }
            this.inflexionPoint.push(point1);
            let point2 = {};
            if (this.from.shape.center.x >= this.to.shape.center.x){
                point2.x = this.to.shape.right + minMargin;
            } else {
                point2.x = this.to.shape.left - minMargin;
            }
            point2.y = point1.y;
            this.inflexionPoint.push(point2);
            let point3 = {};
            point3.x = point2.x;
            point3.y = this.endPoint.y - margin;
            this.inflexionPoint.push(point3);
            let point4 = {};
            point4.x = this.endPoint.x;
            point4.y =  point3.y;
            this.inflexionPoint.push(point4);
        } else {
            this.inflexionPoint.push(point1);
            if(this.endPoint.x > this.from.shape.left - minMargin && this.endPoint.x < this.from.shape.center.x && this.from.shape.bottom < this.endPoint.y){
                let point2 = {};
                point2.x = this.from.shape.left - minMargin;
                point2.y = point1.y;
                this.inflexionPoint.push(point2);
                let point3 = {};
                if (this.endPoint.y - this.from.shape.bottom <= margin){
                    point3.x = point2.x;
                    point3.y = (this.endPoint.y + this.from.shape.bottom)/2;
                } else {
                    point3.x = point2.x;
                    point3.y = this.endPoint.y - margin;
                }
                this.inflexionPoint.push(point3);
                let point4 = {};
                point4.x = this.endPoint.x;
                point4.y = point3.y;
                this.inflexionPoint.push(point4);
            } else if (this.endPoint.x >= this.from.shape.center.x && this.endPoint.x < this.from.shape.right + minMargin && this.from.shape.bottom < this.endPoint.y){
                let point2 = {};
                point2.x = this.from.shape.right + minMargin;
                point2.y = point1.y;
                this.inflexionPoint.push(point2);
                let point3 = {};
                if (this.endPoint.y - this.from.shape.bottom <= margin){
                    point3.x = point2.x;
                    point3.y = (this.endPoint.y + this.from.shape.bottom)/2;
                } else {
                    point3.x = point2.x;
                    point3.y = this.endPoint.y - margin;
                }
                this.inflexionPoint.push(point3);
                let point4 = {};
                point4.x = this.endPoint.x;
                point4.y = point3.y;
                this.inflexionPoint.push(point4);
            } else {
                let point2 = {};
                point2.x = this.endPoint.x;
                point2.y = point1.y;
                this.inflexionPoint.push(point2);
            }
        }
    } else if (this.endPoint && this.endPoint.order && this.endPoint.order === 2){//节点一连节点二
        let point1 = {};
        point1.x = this.startPoint.x;
        point1.y = this.startPoint.y - margin;
        if(hitResult && this.from !== this.to){
            let point2 = {};
            point2.x = this.startPoint.x;
            point2.y = this.endPoint.y;
            this.inflexionPoint.push(point2);
        } else if (this.startPoint.y > this.endPoint.y && (this.endPoint.x + minMargin < this.startPoint.x || (this.from.shape.top <= this.to.shape.bottom && this.endPoint.x < this.startPoint.x))){
            point1.y = this.endPoint.y;
            this.inflexionPoint.push(point1);
        } else if (this.endPoint.x + minMargin >= this.startPoint.x && this.to.shape.bottom < this.startPoint.y - margin){
            if (this.startPoint.y - this.to.shape.bottom < margin + minMargin){
                point1.y = (this.startPoint.y + this.to.shape.bottom)/2;
            } else {
                point1.y = this.to.shape.bottom + margin;
            }
            this.inflexionPoint.push(point1);
            let point2 = {};
            point2.x = this.endPoint.x + margin;
            point2.y = point1.y;
            this.inflexionPoint.push(point2);
            let point3 = {};
            point3.x = point2.x;
            point3.y = this.endPoint.y;
            this.inflexionPoint.push(point3);
        } else if ((this.endPoint.x + minMargin >= this.startPoint.x 
            && this.to.shape.bottom >= this.startPoint.y - margin - minMargin
            && this.endPoint.y <= this.from.shape.bottom)
            ||(this.endPoint.y > this.from.shape.bottom && this.endPoint.x >= this.from.shape.center.x)){
            let point2 = {};
            let point3 = {};
            if (this.startPoint.x < this.to.shape.right + minMargin 
                && this.startPoint.x > this.to.shape.left - minMargin
                && this.to.shape.bottom < this.from.shape.top){
                point1.y = (this.from.shape.top + this.to.shape.bottom)/2;
                this.inflexionPoint.push(point1);
                point2.x = this.to.shape.right + minMargin;
                point2.y = point1.y;
                this.inflexionPoint.push(point2);
            } else {
                if (this.to.shape.top - margin > this.startPoint.y - minMargin){
                    point1.y = this.startPoint.y - margin;
                } else {
                    point1.y = this.to.shape.top - margin;
                }
                this.inflexionPoint.push(point1);
                point2.x = (this.endPoint.x > this.from.shape.right ? this.endPoint.x : this.from.shape.right) + margin;
                point2.y = point1.y;
                this.inflexionPoint.push(point2);
            }
            point3.x = point2.x;
            point3.y = this.endPoint.y;
            this.inflexionPoint.push(point3);
        } else if (this.startPoint.y - minMargin < this.endPoint.y && this.endPoint.y <= this.from.shape.bottom){
            this.inflexionPoint.push(point1);
            let point2 = {};
            if (this.endPoint.x <= this.from.shape.left - margin - minMargin){
                point2.x = this.from.shape.left - margin;
            } else {
                point2.x = (this.from.shape.left + this.endPoint.x)/2;
            }
            point2.y = point1.y;
            this.inflexionPoint.push(point2);
            let point3 = {};
            point3.x = point2.x;
            point3.y = this.endPoint.y;
            this.inflexionPoint.push(point3);
        } else if (this.endPoint.x <= this.from.shape.left - minMargin){
            this.inflexionPoint.push(point1);
            let point2 = {};
            if (this.from.shape.left - this.endPoint.x < margin + minMargin){
                point2.x = (this.from.shape.left + this.endPoint.x)/2;
            } else {
                point2.x = this.endPoint.x + margin;
            }
            point2.y = point1.y;
            this.inflexionPoint.push(point2);
            let point3 = {};
            point3.x = point2.x;
            point3.y = this.endPoint.y;
            this.inflexionPoint.push(point3);
        } else if (this.from.shape.bottom + minMargin <= this.to.shape.top){
            this.inflexionPoint.push(point1);
            let point2 = {};
            point2.x = this.from.shape.left - margin;
            point2.y = point1.y;
            this.inflexionPoint.push(point2);
            let point3 = {};
            point3.x = point2.x;
            if (this.to.shape.top - this.from.shape.bottom < margin + minMargin){
                point3.y = (this.from.shape.bottom + this.to.shape.top)/2;
            } else {
                point3.y = this.from.shape.bottom + margin;
            }
            this.inflexionPoint.push(point3);
            let point4 = {};
            point4.x = this.endPoint.x + margin;
            point4.y = point3.y;
            this.inflexionPoint.push(point4);
            let point5 = {};
            point5.x = point4.x;
            point5.y = this.endPoint.y;
            this.inflexionPoint.push(point5);
        } else {
            this.inflexionPoint.push(point1);
            let point2 = {};
            point2.x = this.from.shape.right + margin;
            point2.y = point1.y;
            this.inflexionPoint.push(point2);
            let point3 = {};
            point3.x = point2.x;
            point3.y = this.endPoint.y;
            this.inflexionPoint.push(point3);
        }
    } else if (this.endPoint && this.endPoint.order && this.endPoint.order === 3){//节点一连节点三
        let point1 = {};
        point1.x = this.startPoint.x;
        point1.y = this.startPoint.y - margin;
        if(hitResult && this.from !== this.to){
            if (this.endPoint.x === this.startPoint.x){
                this.inflexionPoint = null;
            } else {
                point1.y = this.to.shape.bottom + margin;
                this.inflexionPoint.push(point1);
                let point2 = {};
                point2.x = this.endPoint.x;
                point2.y = point1.y;
                this.inflexionPoint.push(point2);
            }
        } else if (this.endPoint.y < this.startPoint.y - margin){
            if (this.endPoint.x === this.startPoint.x){
                this.inflexionPoint = null;
            } else {
                if (this.endPoint.y > this.startPoint.y - margin - minMargin){
                    point1.y = (this.endPoint.y + this.startPoint.y)/2;
                    this.inflexionPoint.push(point1);
                } else {
                    this.inflexionPoint.push(point1);
                }
                let point2 = {};
                point2.x = this.endPoint.x;
                point2.y = point1.y;
                this.inflexionPoint.push(point2);
            }
        } else if (this.to.shape.right < this.from.shape.left - margin) {
            this.inflexionPoint.push(point1);
            let point2 = {};
            let point3 = {};
            let point4 = {};
            if (this.to.shape.right > this.from.shape.left - margin - minMargin){
                point2.x = (this.to.shape.right + this.from.shape.left)/2;
                point2.y = point1.y;
                this.inflexionPoint.push(point2);
                
            } else {
                point2.x = this.from.shape.left - margin;
                point2.y = point1.y;
                this.inflexionPoint.push(point2);
            }
            point3.x = point2.x;
            point3.y = this.to.shape.bottom + margin;
            this.inflexionPoint.push(point3);
            point4.x = this.endPoint.x;
            point4.y = point3.y;
            this.inflexionPoint.push(point4);
        } else if (this.to.shape.left > this.from.shape.right + margin){
            this.inflexionPoint.push(point1);
            let point2 = {};
            let point3 = {};
            let point4 = {};
            if (this.to.shape.left < this.from.shape.right + margin + minMargin){
                point2.x = (this.to.shape.left + this.from.shape.right)/2;
                point2.y = point1.y;
                this.inflexionPoint.push(point2);
            } else {
                point2.x = this.from.shape.right + margin;
                point2.y = point1.y;
                this.inflexionPoint.push(point2);
            }
            point3.x = point2.x;
            point3.y = this.to.shape.bottom + margin;
            this.inflexionPoint.push(point3);
            point4.x = this.endPoint.x;
            point4.y = point3.y;
            this.inflexionPoint.push(point4);
        } else if (this.to.shape.bottom > this.from.shape.top) {
            point1.y = this.to.shape.top <= this.from.shape.top ? this.to.shape.top - margin : this.from.shape.top - margin;
            this.inflexionPoint.push(point1);
            let point2 = {};
            let point3 = {};
            let point4 = {};
            if(this.to.shape.center.x >= this.from.shape.center.x){
                if (this.to.shape.right >= this.from.shape.right){
                    point2.x = this.to.shape.right + margin;
                    point2.y = point1.y;
                    this.inflexionPoint.push(point2);
                } else {
                    point2.x = this.from.shape.right + margin;
                    point2.y = point1.y;
                    this.inflexionPoint.push(point2);
                }
            } else {
                if (this.to.shape.left <= this.from.shape.left){
                    point2.x = this.to.shape.left - margin;
                    point2.y = point1.y;
                    this.inflexionPoint.push(point2);
                } else {
                    point2.x = this.from.shape.left - margin;
                    point2.y = point1.y;
                    this.inflexionPoint.push(point2);
                }
            }
            point3.x = point2.x;
            point3.y = this.to.shape.bottom + margin;
            this.inflexionPoint.push(point3);
            point4.x = this.endPoint.x;
            point4.y = point3.y;
            this.inflexionPoint.push(point4);
        } else {
            if (this.startPoint.x === this.endPoint.x){
                this.inflexionPoint = null;
            } else {
                point1.y = (this.from.shape.top + this.to.shape.bottom)/2;
                this.inflexionPoint.push(point1);
                let point2 = {};
                point2.x = this.endPoint.x;
                point2.y = point1.y;
                this.inflexionPoint.push(point2);
            }
        }
    } else if (this.endPoint && this.endPoint.order && this.endPoint.order === 4){//节点一连节点四
        let point1 = {};
        point1.x = this.startPoint.x;
        point1.y = this.startPoint.y - margin;
        if(hitResult && this.from !== this.to){
            if (this.startPoint.x === this.endPoint.x){
                this.inflexionPoint = null;
            } else {
                point1.y = this.endPoint.y;
                this.inflexionPoint.push(point1);
            }
        } else if (this.startPoint.y - this.to.shape.bottom > margin && this.startPoint.x + minMargin > this.to.shape.left){
            let point2 = {};
            let point3 = {};
            if(this.startPoint.y - this.to.shape.bottom < margin + minMargin){
                point1.y = (this.startPoint.y + this.to.shape.bottom)/2;
            }
            this.inflexionPoint.push(point1);
            point2.x = this.endPoint.x - margin;
            point2.y = point1.y;
            this.inflexionPoint.push(point2);
            point3.x = point2.x;
            point3.y = this.endPoint.y;
            this.inflexionPoint.push(point3);
        } else if (this.to.shape.bottom < this.from.shape.top && this.startPoint.x + minMargin < this.to.shape.right
            && this.startPoint.x + minMargin > this.to.shape.left){
            let point2 = {};
            let point3 = {};
            point1.y = (this.startPoint.y + this.to.shape.bottom)/2;
            this.inflexionPoint.push(point1);
            point2.x = this.endPoint.x - margin;
            point2.y = point1.y;
            this.inflexionPoint.push(point2);
            point3.x = point2.x;
            point3.y = this.endPoint.y;
            this.inflexionPoint.push(point3);
        } else if (this.from.shape.top - this.endPoint.y >= minMargin && this.to.shape.left >= this.startPoint.x + minMargin){
            point1.y = this.endPoint.y;
            this.inflexionPoint.push(point1);
        } else if (this.to.shape.left > this.from.shape.right){
            let point2 = {};
            let point3 = {};
            if (this.endPoint.y <= this.from.shape.bottom){
                this.inflexionPoint.push(point1);
                if (this.to.shape.left - this.from.shape.right < margin + minMargin){
                    point2.x = (this.to.shape.left + this.from.shape.right)/2; 
                } else {
                    point2.x = this.from.shape.right + margin; 
                }
                
            } else if (this.to.shape.left - this.from.shape.right < minMargin){
                this.inflexionPoint.push(point1);
                point2.x = this.from.shape.left - margin; 
            } else {
                this.inflexionPoint.push(point1);
                if (this.to.shape.left - this.from.shape.right < margin + minMargin){
                    point2.x = (this.to.shape.left + this.from.shape.right)/2; 
                } else {
                    point2.x = this.from.shape.right + margin; 
                }
            }
            point2.y = point1.y;
            this.inflexionPoint.push(point2);
            point3.x = point2.x;
            point3.y = this.endPoint.y;
            this.inflexionPoint.push(point3);
        } else if (this.to.shape.left > this.startPoint.x && this.endPoint.y < this.from.shape.top){
            point1.y = this.endPoint.y;
            this.inflexionPoint.push(point1);
        } else {
            let point2 = {};
            let point3 = {};
            point1.y = this.from.shape.top < this.to.shape.top ?  this.from.shape.top - margin : this.to.shape.top - margin; 
            this.inflexionPoint.push(point1);
            point2.x = this.from.shape.left < this.to.shape.left ?  this.from.shape.left - margin : this.to.shape.left - margin; 
            point2.y = point1.y;
            this.inflexionPoint.push(point2);
            point3.x = point2.x;
            point3.y = this.endPoint.y;
            this.inflexionPoint.push(point3);
        }
    }
}