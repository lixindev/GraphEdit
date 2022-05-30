export class NodeController{
    constructor(shape, canvas){
        this.shape = shape;
        this.ctx = canvas.getContext("2d");
    }

    get pointCollection(){
        const collection = [];
        collection.push(this.northPoint);
        collection.push(this.eastPoint);
        collection.push(this.southPoint);
        collection.push(this.westPoint);
        collection.push(this.nePoint);
        collection.push(this.sePoint);
        collection.push(this.swPoint);
        collection.push(this.nwPoint);
        return collection;
    }

    get northPoint(){
        return {
            order: 'n',
            x: this.shape.center.x,
            y: this.shape.top
        }
    }

    get eastPoint(){
        return {
            order: 'e',
            x: this.shape.right,
            y: this.shape.center.y
        }
    }

    get southPoint(){
        return {
            order: 's',
            x: this.shape.center.x,
            y: this.shape.bottom
        }
    }

    get westPoint(){
        return {
            order: 'w',
            x: this.shape.left,
            y: this.shape.center.y
        }
    }

    get nePoint(){
        return {
            order: 'ne',
            x: this.shape.right,
            y: this.shape.top
        }
    }

    get sePoint(){
        return {
            order: 'se',
            x: this.shape.right,
            y: this.shape.bottom
        }
    }

    get swPoint(){
        return {
            order: 'sw',
            x: this.shape.left,
            y: this.shape.bottom
        }
    }

    get nwPoint(){
        return {
            order: 'nw',
            x: this.shape.left,
            y: this.shape.top
        }
    }

    draw(){
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        this.ctx.strokeStyle = 'rgb(100, 150, 255, 1)';
        this.ctx.lineWidth = 0.8;
        this.ctx.setLineDash([6, 3]);
        this.ctx.lineDashOffset = 0;
        this.ctx.strokeRect(this.nwPoint.x, this.nwPoint.y, this.shape.width, this.shape.height);
        this.ctx.restore();

        this.ctx.save();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        this.ctx.strokeStyle = 'rgb(100, 150, 255, 1)';
        this.ctx.lineWidth = 0.8;
        this.pointCollection.map(point => drawPoint(point, this.ctx));
        this.ctx.restore();
    }

    hitCheck(x, y){
        for (const point of this.pointCollection) {
            if (x >= point.x - 4 && x <= point.x + 4 && y >= point.y - 4 && y <= point.y + 4){
                return point;
            }
        }
    }
}

function drawPoint(point, context){
    context.fillRect(point.x - 3, point.y - 3, 6, 6);
    context.strokeRect(point.x - 3, point.y - 3, 6, 6);
}