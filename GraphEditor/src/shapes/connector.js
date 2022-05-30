import Settings from '../tools/settings'

//连接点箭头角的度数
const theta = 45;
const headlen = 10 * Settings.ratio;
const sind = headlen * Math.sin(theta * Math.PI/180);
const cosd = headlen * Math.cos(theta * Math.PI/180);

export class Connector{
    constructor(shape, canvas){
        this.shape = shape;
        this.ctx = canvas.getContext("2d");
    }
    get pointCollection(){
        let collection = [];
        collection.push(this.firstPoint);
        collection.push(this.secondPoint);
        collection.push(this.thirdPoint);
        collection.push(this.forthPoint);
        return collection;
    }

    get firstPoint(){
        return {
            order: 1,
            x: this.shape.center.x,
            y: this.shape.top
        }
    }

    get secondPoint(){
        return {
            order: 2,
            x: this.shape.right,
            y: this.shape.center.y
        }
    }

    get thirdPoint(){
        return {
            order: 3,
            x: this.shape.center.x,
            y: this.shape.bottom
        }
    }

    get forthPoint(){
        return {
            order: 4,
            x: this.shape.left,
            y: this.shape.center.y
        }
    }

    draw(){
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 220, 255, 0.6)';
        this.pointCollection.map(point => drawPoint(point, this.ctx));
        this.ctx.restore();
    }

    //判断坐标是否命中图形元素
    hitCheck(x, y){
        for (const point of this.pointCollection) {
            const result = hitCheck(x, y, point);
            if (result){
                return result;
            }
        }
        return false;
    }

    selectPoint(order){
        this.ctx.fillStyle = 'rgba(0, 180, 255, 1)';
        this.pointCollection.map(point => {
            if (point.order === order){
                drawPoint(point, this.ctx);
            }
        });
    }

    saveState(){
        let cache = [];
        let cache1 = {};
        cache1.x = this.firstPoint.x - sind - 1;
        cache1.y = this.firstPoint.y - 21;
        cache1.imgData = this.ctx.getImageData(cache1.x, cache1.y, 2 * sind + 2, cosd + 2);

        let cache2 = {};
        cache2.x = this.secondPoint.x + 20 - cosd - 1;
        cache2.y = this.secondPoint.y - sind - 1;
        cache2.imgData = this.ctx.getImageData(cache2.x, cache2.y, cosd + 2, 2 * sind + 2);

        let cache3 = {};
        cache3.x = this.thirdPoint.x - sind - 1;
        cache3.y = this.thirdPoint.y + 20 - cosd - 1;
        cache3.imgData = this.ctx.getImageData(cache3.x, cache3.y, 2 * sind + 2, cosd + 2);

        let cache4 = {};
        cache4.x = this.forthPoint.x - 21;
        cache4.y = this.forthPoint.y - sind - 1;
        cache4.imgData = this.ctx.getImageData(cache4.x, cache4.y, cosd + 2, 2 * sind + 2);
        cache.push(cache1);
        cache.push(cache2);
        cache.push(cache3);
        cache.push(cache4);
        return cache;
    }

    connectCheck(x, y){
        for (const point of this.pointCollection) {
            if ((x - point.x) * (x - point.x) + (y - point.y) * (y - point.y) < 100){
                return {
                    order: point.order,
                    distance: (x - point.x) * (x - point.x) + (y - point.y) * (y - point.y)
                };
            }
        }
        return false;
    }
}

function drawPoint(point, context){
    context.beginPath();
    let point1 = {};
    let point2 = {};
    if (point.order === 1){
        context.moveTo(point.x, point.y - 20);
        point1.x = point.x - sind;
        point1.y = point.y - 20 + cosd;
        point2.x = point.x + sind;
        point2.y = point1.y;
    } else if(point.order === 2) {
        context.moveTo(point.x + 20, point.y);
        point1.x = point.x + 20 - cosd;
        point1.y = point.y - sind;
        point2.x = point1.x;
        point2.y = point.y + sind;
    } else if(point.order === 3){
        context.moveTo(point.x, point.y + 20);
        point1.x = point.x - sind;
        point1.y = point.y + 20 - cosd;
        point2.x = point.x + sind;
        point2.y = point1.y;
    } else if (point.order === 4){
        context.moveTo(point.x - 20, point.y);
        point1.x = point.x - 20 + cosd;
        point1.y = point.y - sind;
        point2.x = point1.x;
        point2.y = point.y + sind;
    }
    context.lineTo(point1.x, point1.y);
    context.lineTo(point2.x, point2.y);
    context.fill();
}

function hitCheck (x, y, point){
    if (point.order === 1){
        if (x >= point.x - sind - 1 && x <= point.x + sind + 1 && y >= point.y - 21 && y <= point.y - 19 + cosd){
            return point.order;
        } else {
            return false;
        }
    } else if (point.order === 2){
        if (x >= point.x + 19 - cosd && x <= point.x + 21 && y >= point.y - sind - 1 && y <= point.y + sind + 1){
            return point.order;
        } else {
            return false;
        }
    } else if (point.order === 3){
        if (x >= point.x - sind - 1 && x <= point.x + sind + 1 && y >= point.y + 19 - cosd && y <= point.y + 21){
            return point.order;
        } else {
            return false;
        }
    } else if (point.order === 4){
        if (x >= point.x - 21 && x <= point.x - 19 + cosd && y >= point.y - sind - 1 && y <= point.y + sind + 1){
            return point.order;
        } else {
            return false;
        }
    }
}