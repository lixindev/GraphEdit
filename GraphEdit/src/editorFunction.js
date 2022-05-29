import { Node } from './node';
import { Relation } from './relation';
import Event from './event';
import { Group } from './tools/group';
import Settings from './tools/settings';
import CommonFunctions from './tools/commonFunctions';

const editorFunction = {
    saveAll(){
        this.moveCache = {};
        this.moveCache.x = 0;
        this.moveCache.y = 0;
        this.moveCache.imgData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    },
    saveStateForConnector(node){
        this.connectorCache = node.shape.connector.saveState();
    },
    saveStateForLine_Right(center, right){
        center.y = right.shape.center.y;
        this.start_x = { x: center.x - this.selectedElement.shape.width/2 - 15 + this.offset_X, y: center.y };
        this.end_x = { x: right.shape.center.x + right.shape.width/2 + 15, y: center.y };
    },
    saveStateForLine_Left(center, left){
        center.y = left.shape.center.y;
        this.start_x = { x: left.shape.center.x - left.shape.width/2 - 15, y: center.y };
        this.end_x = { x: center.x + this.selectedElement.shape.width/2 + 15 + this.offset_X, y: center.y };
    },
    saveStateForLine_Top(center, top){
        center.x = top.shape.center.x;
        this.start_y = { x: center.x, y: top.shape.center.y - top.shape.height/2 - 15 };
        this.end_y = { x: center.x, y: center.y + this.selectedElement.shape.height/2 + 15 + this.offset_Y };

    },
    saveStateForLine_Bottom(center, bottom){
        center.x = bottom.shape.center.x;
        this.start_y = { x: center.x, y: center.y - this.selectedElement.shape.height/2 - 15 + this.offset_Y };
        this.end_y = { x: center.x, y: bottom.shape.center.y + bottom.shape.height/2 + 15 };
    },
    rollbackForMoving(){
        let context = this.ctx;
        if (this.moveCache){
            context.putImageData(this.moveCache.imgData, this.moveCache.x, this.moveCache.y);
        }
    },
    rollbackConnector(){
        if (this.connectorCache){
            for (const cache of this.connectorCache) {
                this.ctx.putImageData(cache.imgData, cache.x, cache.y);
            }
            this.connectorCache = null;
        }
    },
    createNode(params, isVirtual = false){
        let node = new Node(params, this.canvas);
        node.index = this.indexMark;
        this.indexMark ++;
        if(!isVirtual){
            node.draw();
            this.nodes.push(node);
            this.elements.push(node);
            this.elementDict[node.id] = node;
        };
        return node;
    },
    createRelation(params){
        let relation = new Relation(params, this.canvas);
        relation.index = this.indexMark;
        this.indexMark ++;
        if (!relation.line.inflexionPoint){
            relation.createPath();
        }

        if (relation.from){
            relation.from.relations.push(relation);
        };
        if(relation.to){
            relation.to.relations.push(relation);
        }
        this.relations.push(relation);
        this.elements.push(relation);
        this.elementDict[relation.id] = relation;

        return relation;
    },
    moveShape(x, y){
        if (!(this.selectedElement instanceof Node)) return;
        //清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.selectedElement.shape.x = this.selectedElement.shape.x + x;
        this.selectedElement.shape.y = this.selectedElement.shape.y + y;
        this.selectedElement.index = this.indexMark;
        this.indexMark ++;

        for (const relation of this.selectedElement.relations) {
            relation.createPath();
            relation.index = this.indexMark;
            this.indexMark ++;
        }

        this.elements = this.elements.sort(function(a, b){return a.index - b.index;});
        this.elements.map(element => {
            element.draw();
        });
        //绘制连接点
        this.selectedElement.drawConnector();
        this.selectedElement.showController();
    },
    moveGroup(x, y){
        if (!(this.selectedElement instanceof Group)) return;
        //清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        //先处理节点
        this.selectedElement.nodes = this.selectedElement.nodes.sort(function(a, b){return a.index - b.index;});
        for (const node of this.selectedElement.nodes) {
            node.shape.x = node.shape.x + x;
            node.shape.y = node.shape.y + y;
            node.index = this.indexMark;
            this.indexMark++;
        }
        //再处理线
        for (const node of this.selectedElement.nodes) {
            for (const relation of node.relations) {
                if(this.selectedElement.relations.indexOf(relation) == -1){
                    relation.createPath();
                    relation.index = this.indexMark;
                    this.indexMark ++;
                }
            }
        }
        for (const relation of this.selectedElement.relations) {
            if(relation.line.inflexionPoint){
                for (const point of relation.line.inflexionPoint) {
                    point.x = point.x + x;
                    point.y = point.y + y;
                }
            }
            relation.index = this.indexMark;
            this.indexMark++;
        }

        this.elements = this.elements.sort(function(a, b){return a.index - b.index;});
        this.elements.map(element => {
            element.draw();
        });

        for (const node of this.selectedElement.nodes) {
            node.showController();
        }
        this.selectedElement.draw();
    },
    //重新加载图形
    reload(isShowController = true){
        //清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.elements = this.elements.sort(function(a, b){return a.index - b.index;});
        this.elements.map(element => {
            element.draw();
        });
        if (this.selectedElement && isShowController){
            if(this.selectedElement instanceof Group){
                for (const node of this.selectedElement.nodes) {
                    node.showController();
                }
                this.selectedElement.draw();
            } else {
                this.selectedElement.showController();
            }
        }
    },
    undo(){
        let loadCache = null;
        if (this.stepMark > 0){
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            loadCache = this.stepCache[--this.stepMark];

            //触发undo事件
            let undoEvent = Event.undo;
            this.canvas.dispatchEvent(undoEvent);

            this.load(loadCache, true);
        }
    },
    redo(){
        let loadCache = null;
        if (this.stepMark < this.stepCache.length - 1){
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            loadCache = this.stepCache[++this.stepMark];

            //触发redo事件
            let redoEvent = Event.redo;
            this.canvas.dispatchEvent(redoEvent);

            this.load(loadCache, true);
        }
    },
    deleteEle(){
        if (this.selectedElement instanceof Node){
            if(this.nodes.indexOf(this.selectedElement) == -1) return;
            this.nodes.splice(this.nodes.indexOf(this.selectedElement), 1);
            this.elements.splice(this.elements.indexOf(this.selectedElement), 1);
            for (const relation of this.selectedElement.relations) {
                if (relation.from === this.selectedElement){
                    relation.startPoint = {
                        x: relation.startPoint.x,
                        y: relation.startPoint.y
                    }
                    relation.from = null;
                }
                if (relation.to === this.selectedElement){
                    relation.endPoint = {
                        x: relation.endPoint.x,
                        y: relation.endPoint.y
                    };
                    relation.to = null;
                }
            }
        } else if (this.selectedElement instanceof Relation) {
            if(this.relations.indexOf(this.selectedElement) == -1) return;
            this.relations.splice(this.relations.findIndex(relation => relation === this.selectedElement), 1);
            this.elements.splice(this.elements.findIndex(relation => relation === this.selectedElement), 1);
            if(this.selectedElement.from){
                this.selectedElement.from.relations.splice(this.selectedElement.from.relations.findIndex(relation => relation === this.selectedElement), 1);
            }
            if(this.selectedElement.to && this.selectedElement.to !== this.selectedElement.from){
                this.selectedElement.to.relations.splice(this.selectedElement.to.relations.findIndex(relation => relation === this.selectedElement), 1);
            }
        } else {
            return;
        }
        Reflect.deleteProperty(this.elementDict, this.selectedElement.id);
        this.selectedElement = null;
        editorFunction.reload.call(this);
        editorFunction.saveStepCache.call(this);
    },
    //上下左右键平移图形
    moveShapeOrGroup(vector){
        if (this.selectedElement && this.selectedElement instanceof Node){
            editorFunction.moveShape.call(this, vector.x, vector.y);
        } else if (this.selectedElement && this.selectedElement instanceof Group) {
            editorFunction.moveGroup.call(this, vector.x, vector.y);
        }
    },
    saveStepCache(){
        //当前数据记入缓存 
        if (this.stepMark < this.stepCache.length -1){
            this.stepCache.splice(this.stepMark + 1, this.stepCache.length - this.stepMark - 1);
        }
        this.stepCache.push(outPut(this.elements));  
        while(this.stepCache.length > 100) {
            this.stepCache.pop();
        }
        this.stepMark = this.stepCache.length - 1; 
    },
    save(){
        //触发保存事件
        let saveEvent = Event.save;
        saveEvent.data = {};
        saveEvent.data.dict = this.elementDict;
        saveEvent.data.elements = outPut(this.elements);
        this.canvas.dispatchEvent(saveEvent);
        saveEvent.data = null;
    },
    changeTextAlign(textAlign){
        if (this.selectedElement instanceof Node){
            this.selectedElement.shape.text.textAlign = textAlign;
            editorFunction.reload.call(this);
            editorFunction.saveStepCache.call(this);
        }
    },
    changeBaseline(textBaseline){
        if (this.selectedElement instanceof Node){
            this.selectedElement.shape.text.textBaseline = textBaseline;
            editorFunction.reload.call(this);
            editorFunction.saveStepCache.call(this);
        }
    },
    outPut: function(elements){
        return outPut(elements);
    },
    outPutUnit: function(element){
        return outPutUnit(element);
    }
}

export default editorFunction;

function outPut(elements){
    let data = {};
    let nodecollction = [];
    let relationcollction = [];
    for (const element of elements) {
        let outPut = outPutUnit(element);
        if(outPut && outPut.isNode){
            nodecollction.push(outPut);
        } else if (outPut && outPut.isLine){
            relationcollction.push(outPut);
        }
    }
    data.nodes = nodecollction;
    data.relations = relationcollction;

    return data;
}

function outPutUnit(element){
    if(element instanceof Node){
        const node = {
            id: element.id,
            type: Settings.elementTypes.node,
            shape: element.shape.type,
            index: element.index,
            x: element.shape.x,
            y: element.shape.y,
            size: element.shape.width.toString() + '*' + element.shape.height.toString(),
            label: element.label,
            fontSize: element.fontSize,
            textAlign: element.textAlign,
            textBaseline: element.textBaseline,
            color: element.shape.fillStyle,
            edgeColor: element.shape.strokeStyle,
            customProperties: CommonFunctions.deepClone(element.customProperties),
            isNode: true,
            isLine: false
        };
        return node;
    } else if (element instanceof Relation){
        const relation = {
            id: element.id,
            type: Settings.elementTypes.relation,
            index: element.index,
            source: element.source,
            fromConOrder: element.fromConOrder,
            target: element.target,
            toConOrder: element.toConOrder,
            inflexionPoint: CommonFunctions.deepClone(element.line.inflexionPoint),
            label: element.label,
            fontSize: element.fontSize,
            color: element.line.strokeStyle,
            startPoint: CommonFunctions.deepClone(element.line.start),
            endPoint: CommonFunctions.deepClone(element.line.end),
            lineModel: element.lineModel,
            customProperties: CommonFunctions.deepClone(element.customProperties),
            isNode: false,
            isLine: true
        };
        return relation;
    } else if (element instanceof Group) {
        return outPut(element.nodes.concat(element.relations));
    } else {
        return null;
    }
}