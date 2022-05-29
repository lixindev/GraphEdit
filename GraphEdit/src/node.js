import { Rect } from './shapes/rect'
import { Capsule } from './shapes/capsule'
import { Rhomb } from './shapes/rhomb'
import { Circle } from './shapes/circle'
import CommonFunctions from './tools/commonFunctions'
import Settings from './tools/settings'
import { ParameterError } from './errors/parameterError'

const shapeConstructor = {
    rect: Rect,
    capsule: Capsule,
    rhomb: Rhomb,
    circle: Circle
};
export class Node{
    constructor(params, canvas){
        if (params.id){
            this.id = params.id;
        } else {
            this.id = CommonFunctions.generateUUID();
        }

        if (Object.hasOwnProperty.call(shapeConstructor, params.shape)){
            this.shape = new shapeConstructor[params.shape](params, canvas);
        } else {
            throw new ParameterError('无法找到shape指定的图形！');
        }

        this.type = params.type;

        this.isOver = false;
        if (params.index){
            this.index = params.index;
        } else {
            this.index = null;
        }
        //关联线条
        this.relations = [];
        //存放自定义属性，使用引用类型
        if (params.customProperties){
            this.customProperties = params.customProperties;
        } else {
            this.customProperties = {};
        }
    };

    get label(){
        return this.shape.text.content ? this.shape.text.content : null;
    }

    set label(value){
        this.shape.text.content = value;
    }

    get fontSize(){
        return this.shape.text.fontSize ? this.shape.text.fontSize : Settings.defaultFont.nodeFontSize;
    }

    set fontSize(value){
        this.shape.text.fontSize = value;
    }

    get textAlign(){
        return this.shape.text.textAlign ? this.shape.text.textAlign : 'center';
    }

    set textAlign(value){
        this.shape.text.textAlign = value;
    }

    get textBaseline(){
        return this.shape.text.textBaseline ? this.shape.text.textBaseline : 'middle';
    }

    set textBaseline(value){
        this.shape.text.textBaseline = value;
    }

    get size(){
        return this.shape.width.toString() + '*' + this.shape.height.toString();
    }

    get x(){
        return this.shape.x;
    }

    get y(){
        return this.shape.y;
    }

    get color(){
        return this.shape.fillStyle;
    }

    get edgeColor(){
        return this.shape.strokeStyle;
    }

    //绘图
    draw(){
        this.shape.draw();
    };

    //用于拖拽中绘制虚线轨迹
    drawDashNode(x, y){
        this.shape.drawDashNode(x, y);
    };

    //选择元素渲染
    selectShape(){
        this.shape.selectShape();
    };

    //显示控制点
    showController(){
        this.shape.selectShape();
    }

    //判断坐标是否命中图形元素
    hitCheck(x, y){
        return this.shape.hitCheck(x, y);
    };

    hitCheck_Over(x, y){
        if (this.isOver){
            return this.shape.hitCheck_Over(x, y);
        } else {
            return this.shape.hitCheck(x, y);
        }
        
    };

    //判断坐标是否命中节点
    hitNode(x, y){
        if (x >= this.shape.left && x <= this.shape.right && y >= this.shape.top && y <= this.shape.bottom){
            return true;
        } else {
            return false;
        }
    }

    //绘制连接点
    drawConnector(){
        this.shape.connector.draw();
    };

    //判断坐标是否命中连接点
    connectorHitCheck(x, y){
        return this.shape.connector.hitCheck(x, y);
    };

    selectConnector(order){
        this.shape.connector.selectPoint(order);
    };
}