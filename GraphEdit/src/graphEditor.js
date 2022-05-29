import EventHandler from './eventHandler';
import EditorFunction from './editorFunction';
import Settings from './tools/settings';
import { NoSuchCommandError } from './errors/noSuchCommandError';
import { NoSuchEventError } from './errors/noSuchEventError';
import Event from './event';
import babelPolyfill from 'babel-polyfill';

export class GraphEditor{
    constructor(width, height){
        this.initial();
        //步骤缓存
        this.stepCache = [];
        this.stepCache.push([]);
        this.stepMark = 0;
        //事件哈希表
        this.eventDict = {};
        //宽度设置函数
        this.widthFunc;
        //高度设置函数
        this.heightFunc;
        //宽度
        this.canvasWidth;
        //高度
        this.canvasHeight;
        let type = Object.prototype.toString.call(width);
        if (type === '[object Function]') {
            this.widthFunc = width;
            this.canvasWidth = width();
        } else if (type === '[object Number]') {
            this.canvasWidth = width;
        }
        type = Object.prototype.toString.call(height);
        if (type === '[object Function]') {
            this.heightFunc = height;
            this.canvasHeight = height();
        } else if (type === '[object Number]') {
            this.canvasHeight = height;
        }

        this.canvas = createCanvas(this.canvasWidth, this.canvasHeight);
        this.ctx = this.canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';

        //拖动线条，从连接点开始的新线条
        this.drawNewDashLine = e => EventHandler.drawNewDashLine.call(this, e);
        //节点拖拽, 绘制标志线
        this.drawDashShape = e => EventHandler.drawDashShape.call(this, e);
        //移动节点
        this.moveSelectedElement = e => EventHandler.moveSelectedElement.call(this, e);
        //鼠标悬停选中和鼠标样式变化等
        this.mouseOverSelect = e => EventHandler.mouseOverSelect.call(this, e);
        //绘制线条
        this.drawLine = e => EventHandler.drawLine.call(this, e);
        //拖动线条端点
        this.changeStartOrEndOfLine = e => EventHandler.changeStartOrEndOfLine.call(this, e);
        //拖动线条中段控制点
        this.drawCurrentDashLine = e => EventHandler.drawCurrentDashLine.call(this, e);
        //拖拽元素超出画布
        this.mouseLeaveHandler = e => EventHandler.mouseLeaveHandler.call(this, e);
        //拖拽画布或组合
        this.moveCanvasOrCompose = e => EventHandler.moveCanvasOrCompose.call(this, e);
        //拖拽画布或组合结束
        this.moveCanvasComplete = e => EventHandler.moveCanvasComplete.call(this, e);
        //拖拽画布超出画布
        this.canvasMoveLeave = e => EventHandler.canvasMoveLeave.call(this, e);
        //拖拽节点控制点
        this.nodeResizing = e => EventHandler.nodeResizing.call(this, e);
        //拖拽节点控制点结束
        this.nodeResized = e => EventHandler.nodeResized.call(this, e);
        
        //拖动新节点进入画布
        this.mouseEnterEventHandler = e => EventHandler.mouseEnterEventHandler.call(this, e);
        //canvas的mouseup监听，绘制新节点
        this.addNewNode = e => EventHandler.addNewNode.call(this, e);
        //窗口的mouseup监听
        this.mouseUpEventHandler = e => mouseUpEventHandler.call(this, e);

        this.addEventListener('mousedown', e => {
            //先触发失去焦点事件
            document.activeElement.blur();
            EventHandler.mouseDownEventHandler.call(this, e);
        });
        this.addEventListener('mousemove', this.mouseOverSelect);
        window.addEventListener('keydown', e => EventHandler.keyDown.call(this, e));
        window.addEventListener('resize', e => EventHandler.resize.call(this, e));
    };

    initial(){
        //图中所有节点
        this.nodes = [];
        //图中所有线
        this.relations = [];
        //所有元素集合
        this.elements = [];
        //元素哈希表
        this.elementDict = {};
        //被选中节点
        this.selectedElement = null;
        //鼠标悬停节点
        this.mouseOverNode = null;
        //保存移动前图形
        this.moveCache = null;
        //最大图层
        this.indexMark = 0;
        //鼠标点击坐标
        this.clickPoint = {};

        //Y轴偏移量
        this.offset_Y = 0;
        //横向标记线起始和结束点
        this.start_x = null;
        this.end_x = null;
        //X轴偏移量
        this.offset_X = 0;
        //纵向标记线起始和结束点
        this.start_y = null;
        this.end_y = null;

        //连接点区域缓存
        this.connectorCache = null;
        //选中连接点及连接点序号
        this.selectedConnector = null;
        //存储连线的起始点信息
        this.startPoint = null;
        //当前正在操作的线条
        this.currentLine = null;
        this.lineCache = null;
        //拖动控制点缓存
        this.nodeResizeCache = null;
        
        //元素栏
        this.itemPannelEle = null;
        //新拖入节点信息
        this.dragedNode = null;
        //详细信息
        this.detailPannelEle = null;
        this.canvasMoveCache = null;
        this.toolbarEle = null;
        this.composeModel = false;
    }

    load(data, isLoadCache = false){
        this.initial();
        //加载缓存时不清除缓存
        if(!isLoadCache){
            //步骤缓存
            this.stepCache = [];
            this.stepCache.push([]);
            this.stepMark = 0;
        }
        if (!data.nodes) data.nodes = [];
        if (!data.relations) data.relations = [];
        let elements = data.nodes.concat(data.relations);

        elements.sort(function(a, b){return a.index - b.index;});
        for (const item of elements) {
            if (item.type === Settings.elementTypes.node){
                const size = item.size.split('*');
                let nodeParam = {
                    id: item.id,
                    strokeStyle: item.edgeColor,
                    fillStyle: item.color,
                    type: item.type,
                    shape: item.shape,
                    text: {
                        content: item.label,
                        fontSize: item.fontSize,
                        textAlign: item.textAlign,
                        textBaseline: item.textBaseline
                    },
                    index: item.index,
                    width: parseInt(size[0]),
                    height: parseInt(size[1]),
                    x: item.x,
                    y: item.y,
                    customProperties: item.customProperties
                }
                EditorFunction.createNode.call(this, nodeParam);
            } else if (item.type === Settings.elementTypes.relation){
                let lineParam = {
                    id: item.id,
                    strokeStyle: item.color,
                    type: item.type,
                    text: {
                        content: item.label,
                        fontSize: item.fontSize
                    },
                    index: item.index,
                    fromConOrder: item.fromConOrder,
                    toConOrder: item.toConOrder,
                    inflexionPoint: item.inflexionPoint,
                    startPoint: item.startPoint,
                    endPoint: item.endPoint,
                    lineModel: item.lineModel,
                    customProperties: item.customProperties
                }

                if (item.source && Object.hasOwnProperty.call(this.elementDict, item.source)){
                    lineParam.from = this.elementDict[item.source];
                }
                if (item.target && Object.hasOwnProperty.call(this.elementDict, item.target)){
                    lineParam.to = this.elementDict[item.target];
                }
                const relation = EditorFunction.createRelation.call(this, lineParam);
                relation.draw();
            }
        }
        if (!isLoadCache){
            //当前数据记入缓存 
            this.stepCache.push(EditorFunction.outPut(this.elements));
            this.stepMark = this.stepCache.length - 1;
        }
    }

    addEventListener(operation, func){
        let isExists = true;
        if (Object.hasOwnProperty.call(this.eventDict, operation)) {
            let any = this.eventDict[operation].filter(function(value){
                return value === func;
            });
            if (!any || any.length === 0) {
                isExists = false;
            }
        } else {
            this.eventDict[operation] = [];
            isExists = false;
            
        }

        if (!isExists) {
            this.eventDict[operation].push(func);
            this.canvas.addEventListener(operation, func);
        }
    }

    removeEventListener(operation, func){
        let isExists = true;
        if (Object.hasOwnProperty.call(this.eventDict, operation)) {
            let any = this.eventDict[operation].filter(function(value){
                return value === func;
            });
            if (!any || any.length === 0) {
                isExists = false;
            }
        } else {
            this.eventDict[operation] = [];
            isExists = false;
        }

        if (isExists) {
            this.eventDict[operation].splice(this.eventDict[operation].indexOf(func), 1);
            this.canvas.removeEventListener(operation, func);
        }
    }

    resetEventListener() {
        for (const key in this.eventDict) {
            if (Object.hasOwnProperty.call(this.eventDict, key)) {
                const funcArray = this.eventDict[key];
                for (let index = 0; index < funcArray.length; index++) {
                    const func = funcArray[index];
                    this.canvas.removeEventListener(key, func);
                }
            }
        }
        this.eventDict = {};
        this.addEventListener('mousedown', e => {
            //先触发失去焦点事件
            document.activeElement.blur();
            EventHandler.mouseDownEventHandler.call(this, e);
        });
        this.addEventListener('mousemove', this.mouseOverSelect);
    }

    get data(){
        return EditorFunction.outPut(this.elements);
    }

    on(eventName, eventHandler){
        if (!Event[eventName]){
            throw new NoSuchEventError("编辑器不支持此事件。");
        }
        if(eventName === 'click'){
            eventName = 'canvasClick';
        };
        this.canvas.addEventListener(eventName, eventHandler);
    }

    update(elementId, property){
        if (Object.hasOwnProperty.call(this.elementDict, elementId)) {
            if(Settings.properties.indexOf(property.name) !== -1){
                this.elementDict[elementId][property.name] = property.value;
                EditorFunction.saveStepCache.call(this);
                EditorFunction.reload.call(this);
            } else {
                this.elementDict[elementId].customProperties[property.name] = property.value;
            }
        }
    }

    set itemPannel(value){
        document.body.onselectstart= function(){
            return false;
        };
        this.itemPannelEle = document.getElementById(value);
        for (const div of this.itemPannelEle.children) {
            div.addEventListener('mousedown', e => nodeDrag.call(this, e));
        }
    }

    set detailPannel(value){
        this.detailPannelEle = document.getElementById(value);
    }

    set toolbar(value){
        this.toolbarEle = document.getElementById(value);
        for (const btn of this.toolbarEle.childNodes) {
            if(btn.getAttribute && btn.getAttribute('data-command')){
                switch (btn.getAttribute('data-command')) {
                    case 'undo':
                        btn.addEventListener('click', e => EditorFunction.undo.call(this));
                        break;
                    case 'redo':
                        btn.addEventListener('click', e => EditorFunction.redo.call(this));
                        break;
                    case 'delete':
                        btn.addEventListener('click', e => EditorFunction.deleteEle.call(this));
                        break;
                    case 'save':
                        btn.addEventListener('click', e => EditorFunction.save.call(this));
                        break;
                    case 'alignLeft':
                        btn.addEventListener('click', e => EditorFunction.changeTextAlign.call(this, 'left'));
                        break;
                    case 'alignCenter':
                        btn.addEventListener('click', e => EditorFunction.changeTextAlign.call(this, 'center'));
                        break;
                    case 'alignRight':
                        btn.addEventListener('click', e => EditorFunction.changeTextAlign.call(this, 'right'));
                        break;
                    case 'baselineTop':
                        btn.addEventListener('click', e => EditorFunction.changeBaseline.call(this, 'top'));
                        break;
                    case 'baselineMiddle':
                        btn.addEventListener('click', e => EditorFunction.changeBaseline.call(this, 'middle'));
                        break;
                    case 'baselineBottom':
                        btn.addEventListener('click', e => EditorFunction.changeBaseline.call(this, 'bottom'));
                        break;
                    default:
                        throw new NoSuchCommandError("编辑器不支持此命令。");
                }
            }
        }
    }

    set width(value){
        const type = Object.prototype.toString.call(value);
        if (type === '[object Function]') {
            this.widthFunc = value;
            const width = this.widthFunc();
            this.canvas.style.width = width + "px";
            this.canvas.width = width * Settings.ratio;
        }  else if (type === '[object Number]') {
            this.canvas.style.width = value + "px";
            this.canvas.width = value * Settings.ratio;
        }
    }

    set height(value){
        const type = Object.prototype.toString.call(value);
        if (type === '[object Function]') {
            this.heightFunc = value;
            const height = this.heightFunc();
            this.canvas.style.height = height + "px";
            this.canvas.height = height * Settings.ratio;
        } else if (type === '[object Number]') {
            this.canvas.style.height = value + "px";
            this.canvas.height = value * Settings.ratio;
        }
    }
}

window.GraphEditor = GraphEditor;

//创建画布
function createCanvas(width, height){
    const canvasDiv = document.getElementById('canvas');
    const canvas = document.createElement('canvas');
    
    const cwidth = width ? width : canvasDiv.width;
    const cheight = height ? height :canvasDiv.height;
    canvas.style.width = cwidth + "px";
    canvas.style.height = cheight + "px";

    canvas.width = cwidth * Settings.ratio;
    canvas.height = cheight * Settings.ratio;
    canvasDiv.appendChild(canvas);

    return canvas;
}

function nodeDrag(event){
    this.dragedNode = {};
    let target = null;
    if(event.target.localName === 'div'){
        target = event.target;
    } else {
        target = event.target.parentNode;
    };
    const size = target.getAttribute('data-size').split('*');
    this.dragedNode.type = 'node';
    this.dragedNode.shape = target.getAttribute('data-shape');
    this.dragedNode.width = parseInt(size[0]) * Settings.ratio;
    this.dragedNode.height = parseInt(size[1]) * Settings.ratio;
    this.dragedNode.text = {};
    this.dragedNode.text.content = target.getAttribute('data-label');
    this.dragedNode.fillStyle = target.getAttribute('data-color');
    this.dragedNode.strokeStyle = target.getAttribute('data-edgecolor');

    this.addEventListener('mouseenter', this.mouseEnterEventHandler);
    window.addEventListener('mouseup', this.mouseUpEventHandler);
}

function mouseUpEventHandler(event){
    this.resetEventListener();
    window.removeEventListener('mouseup', this.mouseUpEventHandler);
}

// function getPixelRatio(context) {
//     var backingStore = context.backingStorePixelRatio 
//     || context.webkitBackingStorePixelRatio 
//     || context.mozBackingStorePixelRatio 
//     || context.msBackingStorePixelRatio 
//     || context.oBackingStorePixelRatio 
//     || context.backingStorePixelRatio || 1;
//     return (window.devicePixelRatio || 1) / backingStore;
// }