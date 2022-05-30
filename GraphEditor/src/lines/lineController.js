import Settings from '../tools/settings'

export class LineController{
    constructor(line, canvas){
        this.line = line;
        this.ctx = canvas.getContext("2d");
    }

    draw(){
        this.ctx.save();
        if(this.line.to){
            this.ctx.fillStyle = 'rgba(255, 100, 100, 1)';
            this.ctx.strokeStyle = 'rgb(255, 0, 0, 1)';
        } else {
            this.ctx.fillStyle = 'rgba(200, 200, 255, 1)';
            this.ctx.strokeStyle = 'rgb(100, 150, 255, 1)';
        }
        this.ctx.lineWidth = 0.8;
        this.ctx.fillRect(this.line.endPoint.x - 3, this.line.endPoint.y - 3, 6, 6);
        this.ctx.strokeRect(this.line.endPoint.x - 3, this.line.endPoint.y - 3, 6, 6);
        if (this.line.from){
            this.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
            this.ctx.strokeStyle = 'rgb(255, 0, 0, 1)';
        } else {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
            this.ctx.strokeStyle = 'rgb(100, 150, 255, 1)';
        }
        this.ctx.fillRect(this.line.startPoint.x - 3, this.line.startPoint.y - 3, 6, 6);
        this.ctx.strokeRect(this.line.startPoint.x - 3, this.line.startPoint.y - 3, 6, 6);
        this.ctx.restore();
      
        if (this.line.inflexionPoint && this.line.inflexionPoint.length > 1){
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(200, 200, 255, 1)';
            this.ctx.strokeStyle = 'rgb(100, 150, 255, 1)';
            this.ctx.lineWidth = 0.8;
            for (let index = 0; index < this.line.inflexionPoint.length - 1; index++) {
                const p1 = this.line.inflexionPoint[index];
                const p2 = this.line.inflexionPoint[index + 1];
                const p3 = {
                    x: (p1.x + p2.x)/2,
                    y: (p1.y + p2.y)/2
                };
                if (p3.x && p3.y){
                    this.ctx.fillRect(p3.x - 2.5, p3.y - 2.5, 5, 5);
                    this.ctx.strokeRect(p3.x - 2.5, p3.y - 2.5, 5, 5);
                }
            }
            this.ctx.restore();
        }   
    }

    hitCheck(x, y){
        if (x >= this.line.startPoint.x - 4 && x <= this.line.startPoint.x + 4 
            && y >= this.line.startPoint.y - 4 && y <= this.line.startPoint.y + 4){
                return {
                    operation: Settings.lineOperations.startPointChange,
                    position: this.line.startPoint
                }
            }
        if (x >= this.line.endPoint.x - 4 && x <= this.line.endPoint.x + 4 
            && y >= this.line.endPoint.y - 4 && y <= this.line.endPoint.y + 4){
                return {
                    operation: Settings.lineOperations.endPointChange,
                    position: this.line.endPoint
                }
            }
        
        if (this.line.inflexionPoint && this.line.inflexionPoint.length > 1){
            for (let index = 0; index < this.line.inflexionPoint.length - 1; index++) {
                const p1 = this.line.inflexionPoint[index];
                const p2 = this.line.inflexionPoint[index + 1];
                let p3 = {};
                if (p1.x === p2.x){
                    p3.x = p1.x;
                    p3.y = (p1.y + p2.y)/2;
                } else if (p1.y === p2.y){
                    p3.y = p1.y;
                    p3.x = (p1.x + p2.x)/2;
                }
                if (p3.x && p3.y){
                    if (x >= p3.x - 4 && x <= p3.x + 4 && y >= p3.y - 4 && y <= p3.y + 4){
                        let p0 = null;
                        let p4 = null;
                        if (index - 1 < 0){
                            p0 = this.secondPoint;
                        } else {
                            p0 = this.line.inflexionPoint[index - 1];
                        };
                        if (index + 2 >= this.line.inflexionPoint.length){
                            p4 = this.endPoint;
                        } else {
                            p4 = this.line.inflexionPoint[index + 2];
                        };
                        const collection = [];
                        collection.push(p0);
                        collection.push(p1);
                        collection.push(p3);
                        collection.push(p2);
                        collection.push(p4);
                        return {
                            operation: Settings.lineOperations.middlePathChange,
                            points: collection
                        }
                    }
                }
            }
        }
        return false;
    }
}