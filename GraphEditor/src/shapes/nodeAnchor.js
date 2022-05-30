export class NodeAnchor{
    constructor(shape, canvas){
        this.shape = shape;
        this.ctx = canvas.getContext("2d");
    }
    get pointCollection(){
        var collection = [];
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
        this.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        this.ctx.strokeStyle = 'rgb(100, 150, 255, 1)';
        this.ctx.lineWidth = 0.8;
        this.pointCollection.map(point => drawPoint(point, this.ctx));
        this.ctx.restore();
    }
}

function drawPoint(point, context){
    context.fillRect(point.x - 3, point.y - 3, 6, 6);
    context.strokeRect(point.x - 3, point.y - 3, 6, 6);
}