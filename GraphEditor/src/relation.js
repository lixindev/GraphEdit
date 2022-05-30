import { PolyLine } from './lines/polyline';
import{ Straightline } from './lines/straightline';
import CommonFunctions from './tools/commonFunctions';
import Settings from './tools/settings';

const lineConstructor = {
    polyline: PolyLine,
    straightline: Straightline
}
export class Relation {
    constructor(params, canvas){
        this.line = null;
        if (Object.hasOwnProperty.call(lineConstructor, params.lineModel)){
            this.line = new lineConstructor[params.lineModel](params, canvas);
            this.lineModelText = params.lineModel;
        } else {
            this.line = new lineConstructor.polyline(params, canvas);
            this.lineModelText = 'polyline';
        }
        
        if (params.id){
            this.id = params.id;
        } else {
            this.id = CommonFunctions.generateUUID();
        }
        
        if (params.index){
            this.index = params.index;
        } else {
            this.index = null;
        }

        //存放自定义属性，使用引用类型
        if (params.customProperties){
            this.customProperties = params.customProperties;
        } else {
            this.customProperties = {};
        }
    }

    get startPoint(){
        return this.line.startPoint;
    }

    set startPoint(value){
        this.line.startPoint = value;
    }

    get endPoint(){
        return this.line.endPoint;
    }

    set endPoint(value){
        this.line.endPoint = value;
    }

    get textPoint(){
        return this.line.textPoint;
    }

    get label(){
        return this.line.text.content ? this.line.text.content : null;
    }

    set label(value){
        this.line.text.content = value;
    }

    get fontSize(){
        return this.line.text.fontSize ? this.line.text.fontSize : Settings.defaultFont.relationFontSize;
    }

    set fontSize(value){
        this.line.text.fontSize = value;
    }

    get source(){
        return this.line.from ? this.line.from.id : null;
    }

    get target(){
        return this.line.to ? this.line.to.id : null;
    }

    get from(){
        return this.line.from;
    }

    set from(value){
        this.line.from = value;
    }

    get to(){
        return this.line.to;
    }

    set to(value){
        this.line.to = value;
    }

    get fromConOrder(){
        return this.line.fromConOrder;
    }

    set fromConOrder(value){
        this.line.fromConOrder = value;
    }

    get toConOrder(){
        return this.line.toConOrder;
    }

    set toConOrder(value){
        this.line.toConOrder = value;
    }

    get lineModel(){
        return this.lineModelText;
    }

    set lineModel(value){
        this.lineModelText = value;
        let lineParam = {
            strokeStyle: this.line.strokeStyle,
            text: {
                content: this.label,
                fontSize: this.fontSize
            },
            fromConOrder: this.fromConOrder,
            toConOrder: this.toConOrder,
            startPoint: this.startPoint,
            endPoint: this.endPoint,
            from: this.from,
            to: this.to
        }

        if (Object.hasOwnProperty.call(lineConstructor, this.lineModelText)){
            this.line = new lineConstructor[this.lineModelText](lineParam, this.line.canvas);
        } else {
            this.line = new lineConstructor.polyline(params, this.line.canvas);
            this.lineModelText = 'polyline';
        }
        this.line.createPath();
    }

    createPath(){
        this.line.createPath();
    }

    draw(){
        this.line.drawLine(0.7);
    }

    drawDashLine(operation){
        this.line.drawLine(0.7, true);
        this.line.ctx.save();
        if(this.line.to && operation === Settings.lineOperations.endPointChange){
            this.line.ctx.strokeStyle = 'rgb(255, 50, 50, 1)';
            this.line.ctx.strokeRect(this.endPoint.x - 5, this.endPoint.y - 5, 10, 10);
        };
        if(this.line.from && operation === Settings.lineOperations.startPointChange){
            this.line.ctx.strokeStyle = 'rgb(255, 50, 50, 1)';
            this.line.ctx.strokeRect(this.startPoint.x - 5, this.startPoint.y - 5, 10, 10);
        }
        this.line.ctx.restore();
    }

    showController(){
        this.line.controller.draw();
    }

    //判断坐标是否命中线
    hitCheck(x, y){
        return this.line.hitCheck(x, y);
    }
}