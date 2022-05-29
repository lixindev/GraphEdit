export class Group{
    constructor(canvas){
        this.nodes = [];
        this.relations = [];
        this.initialArea();
        this.ctx = canvas.getContext("2d");
    }

    initialArea(){
        this.area = {
            top: Infinity,
            left: Infinity,
            bottom: 0,
            right: 0,
            isInitial: false
        };
    }

    draw(){
        this.initialArea();
        for (const node of this.nodes) {
            if(node.shape.top < this.area.top) {
                this.area.top = node.shape.top;
            }
            if(node.shape.left < this.area.left) {
                this.area.left = node.shape.left;
            }
            if(node.shape.bottom > this.area.bottom){
                this.area.bottom = node.shape.bottom;
            } 
            if(node.shape.right > this.area.right){
                this.area.right = node.shape.right;
            } 
        }
        this.ctx.save();
        this.ctx.lineWidth = 0.6;
        this.ctx.strokeStyle = 'rgb(255, 0, 255)';
        this.ctx.strokeRect (this.area.left - 10, this.area.top - 10, this.area.right - this.area.left + 20, this.area.bottom - this.area.top + 20); 
        this.ctx.restore();  
    }

    drawDashGroup(x, y){
        for (const node of this.nodes) {
            node.drawDashNode(x, y);
        }
    }
}