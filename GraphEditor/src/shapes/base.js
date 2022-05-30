export class Base{
    constructor(params = {}, canvas){
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        if(params.strokeStyle){
            this.strokeStyle = params.strokeStyle;
        } else {
            this.strokeStyle = 'rgb(0, 0, 0)';
        }

        if(params.fillStyle){
            this.fillStyle = params.fillStyle;
        } else {
            this.fillStyle = 'rgba(0, 0, 0, 1)';
        }
    };
}