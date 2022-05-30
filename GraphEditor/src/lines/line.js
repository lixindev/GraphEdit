import { Base } from '../shapes/base'
import { LineController } from './lineController'
import { ParameterError } from '../errors/parameterError'
import Settings from '../tools/settings'

export class Line extends Base{
    constructor(params, canvas){
        super(params, canvas);
        this.start = null;
        this.end = null;
        this.from = null;
        this.to = null;
        this.fromConOrder = null;
        this.toConOrder = null;

        if (params.text) {
            this.text = params.text;
        } else {
            this.text = {
                content: null,
                fontSize: null
            }
        }
        
        if (params.from && params.fromConOrder){
            this.from = params.from;
            this.fromConOrder = params.fromConOrder;
        } else if (params.startPoint) {
            this.start = {};
            this.start.x = params.startPoint.x;
            this.start.y = params.startPoint.y;
        } else {
            throw new ParameterError('连线缺少起点信息！');
        }
        if (params.to && params.toConOrder){
            this.to = params.to;
            this.toConOrder = params.toConOrder;
        } else if(params.endPoint) {
            this.end = {};
            this.end.x = params.endPoint.x;
            this.end.y = params.endPoint.y;
        } else {
            throw new ParameterError('连线缺少终点信息！');
        }

        this.controller = new LineController(this, canvas);
    }

    get startPoint(){
        if(this.start){
            return this.start;
        } else if (this.from && this.fromConOrder === 1){
            return this.from.shape.connector.firstPoint;
        } else if (this.from && this.fromConOrder === 2){
            return this.from.shape.connector.secondPoint;
        } else if (this.from && this.fromConOrder === 3){
            return this.from.shape.connector.thirdPoint;
        } else if (this.from && this.fromConOrder === 4){
            return this.from.shape.connector.forthPoint;
        }
    }

    set startPoint(value){
        this.start = value;
    }

    get endPoint(){
        if(this.end){
            return this.end;
        } else if (this.to && this.toConOrder === 1){
            return this.to.shape.connector.firstPoint;
        } else if (this.to && this.toConOrder === 2){
            return this.to.shape.connector.secondPoint;
        } else if (this.to && this.toConOrder === 3){
            return this.to.shape.connector.thirdPoint;
        } else if (this.to && this.toConOrder === 4){
            return this.to.shape.connector.forthPoint;
        }
    }

    set endPoint(value){
        this.end = value;
    }

    fillText(isDash, textPoint){
        if(!isDash && this.text && this.text.content){
            this.ctx.lineWidth = 0.5;
            this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
            if (this.text.fontSize){
                this.ctx.font = this.text.fontSize + ' ' + Settings.defaultFont.fontFamily;
            } else {
                this.ctx.font = Settings.defaultFont.relationFontSize + ' ' + Settings.defaultFont.fontFamily;
                this.text.fontSize = Settings.defaultFont.relationFontSize;
            }
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            const size = parseInt((this.text.fontSize || Settings.defaultFont.relationFontSize).replace('px', ''));
            const length = this.ctx.measureText(this.text.content).width;
            this.ctx.clearRect(textPoint.x - length/2 - 1, textPoint.y - size/2 - 1, length + 2, size + 2);
            this.ctx.fillText(this.text.content, textPoint.x, textPoint.y);
        }
    }
}