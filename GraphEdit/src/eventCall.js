import { Node } from './node';
import { Line } from './lines/line';
import { Group } from './tools/group'
import EditorFunction from './editorFunction';
import Event from './event'
import Settings from './tools/settings'

const minHeight = 20;
const minWidth = 20;
const minCapsuleLine = 10;
const minMovement = 5;

export default {
    //mousedown调用
    mouseDownEventHandler: function(event){
        let isHitLineController = false;
        let isHitNodeController = false;
        //是否命中连接点
        let isHitConnector = false;
        let hitItem = [];

        this.clickPoint.x = event.offsetX * Settings.ratio;
        this.clickPoint.y = event.offsetY * Settings.ratio;
        
        //清空图片缓存
        this.moveCache = null;
        // this.lineCache_X = null;
        // this.lineCache_Y = null;
        //是否命中控制点
        if(this.selectedElement){
            if(this.selectedElement instanceof Line){
                isHitLineController = this.selectedElement.controller.hitCheck(this.clickPoint.x, this.clickPoint.y);
                if(isHitLineController){
                    this.lineCache = {};
                    this.currentLine  = this.selectedElement;
                    this.lineCache.operation = isHitLineController.operation;
                    this.canvas.removeEventListener('mousemove', this.mouseOverSelect);
                    if (isHitLineController.operation === 'startPointChange' || isHitLineController.operation === 'endPointChange'){
                        this.lineCache.from = this.currentLine.from;
                        this.lineCache.fromConOrder = this.currentLine.fromConOrder;
                        this.lineCache.to = this.currentLine.to;
                        this.lineCache.toConOrder = this.currentLine.toConOrder;
                        this.canvas.addEventListener('mousemove', this.changeStartOrEndOfLine);
                        this.canvas.addEventListener('mouseup', this.drawLine);
                        this.canvas.addEventListener('mouseleave', this.mouseLeaveHandler);
                    } else {
                        this.lineCache.points = isHitLineController.points;
                        this.canvas.addEventListener('mousemove', this.drawCurrentDashLine);
                        this.canvas.addEventListener('mouseup', this.drawLine);
                        this.canvas.addEventListener('mouseleave', this.mouseLeaveHandler);
                    }
                    //触发点击事件
                    let event = Event.click;
                    event.element = EditorFunction.outPutUnit(this.selectedElement);
                    this.canvas.dispatchEvent(event);
                    event.element = null;
                    return;
                }
            } else if(this.selectedElement instanceof Node){
                isHitNodeController = this.selectedElement.shape.controller.hitCheck(this.clickPoint.x, this.clickPoint.y);
                if(isHitNodeController){
                    this.nodeResizeCache = {};
                    this.nodeResizeCache.resizeType = isHitNodeController.order;
                    this.nodeResizeCache.x = this.selectedElement.shape.center.x;
                    this.nodeResizeCache.y = this.selectedElement.shape.center.y;
                    this.nodeResizeCache.width = this.selectedElement.shape.width;
                    this.nodeResizeCache.height = this.selectedElement.shape.height;
                    
                    //触发点击事件
                    let event = Event.click;
                    event.element = EditorFunction.outPutUnit(this.selectedElement);
                    this.canvas.dispatchEvent(event);
                    event.element = null;

                    this.canvas.removeEventListener('mousemove', this.mouseOverSelect);
                    this.canvas.addEventListener('mousemove', this.nodeResizing);
                    this.canvas.addEventListener('mouseup', this.nodeResize);
                    this.canvas.addEventListener('mouseleave', this.mouseLeaveHandler);
                    return;
                }
            }
        }
        
        if(this.mouseOverNode && !isHitLineController){
            isHitConnector = this.mouseOverNode.connectorHitCheck(this.clickPoint.x, this.clickPoint.y);
        }
        
        if(isHitConnector){
            this.startPoint = {};
            this.startPoint.from = this.mouseOverNode;
            this.startPoint.order = isHitConnector;

            //触发点击事件
            let event = Event.click;
            event.element = EditorFunction.outPutUnit(this.selectedElement);
            this.canvas.dispatchEvent(event);
            event.element = null;

            this.canvas.removeEventListener('mousemove', this.mouseOverSelect);
            this.canvas.addEventListener('mousemove', this.drawNewDashLine);
            this.canvas.addEventListener('mouseup', this.drawLine);
            this.canvas.addEventListener('mouseleave', this.mouseLeaveHandler);
        } else {
            for (const element of this.elements){
                if (element.hitCheck(this.clickPoint.x, this.clickPoint.y)){
                    hitItem.push(element);
                } //else {
                //     if (element.isSelected === true){
                //         element.isSelected = false;
                //     };              
                // };      
            };
            hitItem.sort(function(a, b){return a.index - b.index;});
            //啥也没点到
            if (hitItem.length === 0){
                this.selectedElement = null;
                if(event.ctrlKey){
                    this.canvas.style.cursor = 'crosshair';
                    this.composeModel = true;
                } else {
                    this.canvas.style.cursor = '-webkit-grabbing';
                }
                this.canvas.removeEventListener('mousemove', this.mouseOverSelect);
                this.canvas.addEventListener('mousemove', this.moveCanvasOrCompose);
                this.canvas.addEventListener('mouseup', this.moveCanvasComplete);
                this.canvas.addEventListener('mouseleave', this.canvasMoveLeave);
                //触发点击事件
                let clickEvent = Event.click;
                clickEvent.element = EditorFunction.outPutUnit(this.selectedElement);
                this.canvas.dispatchEvent(clickEvent);
                clickEvent.element = null;
            } else {
                let topItem = hitItem.pop();
                // for (const item of hitItem) {
                //     if (item.isSelected === true && item.index < topItem.index){
                //         item.isSelected = false;
                //         break;
                //     };    
                // }
                if(!this.selectedElement || !(this.selectedElement instanceof Group)
                    || (this.selectedElement.nodes.indexOf(topItem) == -1 && this.selectedElement.lines.indexOf(topItem) == -1)){
                        this.selectedElement = topItem;
                }
                // topItem.isSelected = true;

                if (this.selectedElement instanceof Node || this.selectedElement instanceof Group){
                    this.canvas.removeEventListener('mousemove', this.mouseOverSelect);
                    this.canvas.addEventListener('mousemove', this.drawDashShape);
                    this.canvas.addEventListener('mouseup', this.moveSelectedElement);
                    this.canvas.addEventListener('mouseleave', this.mouseLeaveHandler);
                };
                //触发选中元素事件
                let selectedElementEvent = Event.selectedElement;
                selectedElementEvent.element = EditorFunction.outPutUnit(this.selectedElement);
                this.canvas.dispatchEvent(selectedElementEvent);
                selectedElementEvent.element = null;

                //触发点击事件
                let clickEvent = Event.click;
                clickEvent.element = EditorFunction.outPutUnit(this.selectedElement);
                this.canvas.dispatchEvent(clickEvent);
                clickEvent.element = null;
            };
            EditorFunction.reload.call(this);
            if(this.mouseOverNode) this.mouseOverNode.drawConnector();
        } 
    },
    //mousemove事件调用，拖动线条端点
    changeStartOrEndOfLine: function(event){
        let point = {};
        let collection = [];
        point.x = event.offsetX * Settings.ratio;
        point.y = event.offsetY * Settings.ratio;
        if(this.mouseOverNode){
            this.mouseOverNode.isOver = false;
            this.mouseOverNode = null;
            EditorFunction.reload.call(this);
        }
        for (const node of this.nodes) {
            node.shape.anchor.draw();
        };

        for (const node of this.nodes) {
            const result = node.shape.connector.connectCheck(event.offsetX * Settings.ratio, event.offsetY * Settings.ratio);
            if(result){
                let connectNode = {};
                connectNode.node = node;
                connectNode.distance = result.distance;
                connectNode.order = result.order;
                collection.push(connectNode);
            }
        }

        if(this.lineCache.operation === 'startPointChange'){
            if(collection.length > 0){
                collection.sort(sortCon);
                const conNode = collection.pop();
                this.currentLine.from = conNode.node;
                this.currentLine.fromConOrder = conNode.order;
                this.currentLine.startPoint = null;
            } else {
                this.currentLine.startPoint = point;
                this.currentLine.from = null;
            }          
        } else if (this.lineCache.operation === 'endPointChange'){
            if(collection.length > 0){
                collection.sort(sortCon);
                const conNode = collection.pop();
                this.currentLine.to = conNode.node;
                this.currentLine.toConOrder = conNode.order;
                this.currentLine.endPoint = null;
            } else {
                this.currentLine.endPoint = point;
                this.currentLine.to = null;
            }
        }
        this.currentLine.createPath();    
        
        EditorFunction.rollbackForMoving.call(this);
        EditorFunction.saveAll.call(this);
        this.currentLine.drawDashLine(this.lineCache.operation);
    },
    //mousemove事件调用，拖动线条中段控制点
    drawCurrentDashLine: function(event){
        if(this.lineCache.points[1].x === this.lineCache.points[3].x){
            this.lineCache.points[1].x = event.offsetX * Settings.ratio;
            this.lineCache.points[3].x = event.offsetX * Settings.ratio;
        } else if (this.lineCache.points[1].y === this.lineCache.points[3].y){
            this.lineCache.points[1].y = event.offsetY * Settings.ratio;
            this.lineCache.points[3].y = event.offsetY * Settings.ratio;
        }

        EditorFunction.rollbackForMoving.call(this);
        EditorFunction.saveAll.call(this);
        this.currentLine.drawDashLine(this.lineCache.operation);
    },
    //mousemove事件调用，拖动线条，从连接点开始的新线条
    drawNewDashLine: function(event){
        let endPoint = {};
        let collection = [];
        endPoint.x = event.offsetX * Settings.ratio;
        endPoint.y = event.offsetY * Settings.ratio;
        
        if(this.mouseOverNode){
            this.mouseOverNode.isOver = false;
            this.mouseOverNode = null;
            EditorFunction.reload.call(this, false);
        }
        for (const node of this.nodes) {
            node.shape.anchor.draw();
        };
        if(!this.currentLine){
            let params = {};
            if(this.startPoint && this.startPoint.from){
                params.from = this.startPoint.from;
                params.fromConOrder = this.startPoint.order;
                params.endPoint = endPoint;
            }
            this.currentLine = EditorFunction.createLine.call(this, params);
        } else {
            this.currentLine.endPoint = endPoint;
            this.currentLine.to = null;
        }
        for (const node of this.nodes) {
            const result = node.shape.connector.connectCheck(event.offsetX * Settings.ratio, event.offsetY * Settings.ratio);
            if(result){
                let connectNode = {};
                connectNode.node = node;
                connectNode.distance = result.distance;
                connectNode.order = result.order;
                collection.push(connectNode);
            }
        }
        if(collection.length > 0){
            collection.sort(sortCon);
            const conNode = collection.pop();
            this.currentLine.to = conNode.node;
            this.currentLine.toConOrder = conNode.order;
            this.currentLine.endPoint = null;
        }   
        this.currentLine.createPath();    
        
        EditorFunction.rollbackForMoving.call(this);
        EditorFunction.saveAll.call(this);
        this.currentLine.drawDashLine('endPointChange');
    },
    //mousemove事件调用，节点拖拽, 绘制标志线
    drawDashShape: function(event){
        this.start_x = null;
        this.end_x = null;
        this.start_y = null;
        this.end_y = null;
        const x = event.offsetX * Settings.ratio - this.clickPoint.x;
        const y = event.offsetY * Settings.ratio - this.clickPoint.y;
        //步骤一：还原区域图形
        EditorFunction.rollbackForMoving.call(this);
        if(((0 <= x && x < minMovement )|| (minMovement * -1 < x && x < 0)) 
        && ((0 <= y && y < minMovement) || (minMovement * -1 < y && y < 0))) return;
        if(this.selectedElement instanceof Node){
            //步骤二：获取上下左右节点
            const center = { x: this.selectedElement.shape.center.x + x, y: this.selectedElement.shape.center.y + y };
            const right = getCompareNode_Right(this.nodes, center, this.selectedElement);
            const left = getCompareNode_Left(this.nodes, center, this.selectedElement);
            const top = getCompareNode_Top(this.nodes, center, this.selectedElement);
            const bottom = getCompareNode_Bottom(this.nodes, center, this.selectedElement);
            let isHitRight = false;
            let isHitLeft = false;
            let isHitTop = false;
            let isHitBottom = false;
            let offset_right = 0;
            let offset_left = 0;
            let offset_top = 0;
            let offset_bottom = 0;
            //步骤三：判断是否进入标志线范围，并计算偏移量
            if (right && center.y >= right.shape.center.y - 10 && center.y <= right.shape.center.y + 10){
                isHitRight = true;
                offset_right = right.shape.center.y - center.y;
            }
            if (left && center.y >= left.shape.center.y - 10 && center.y <= left.shape.center.y + 10){
                isHitLeft = true;
                offset_left = left.shape.center.y - center.y;
            }
            if (top && center.x >= top.shape.center.x - 10 && center.x <= top.shape.center.x + 10){
                isHitTop = true;
                offset_top = top.shape.center.x - center.x;
            }
            if (bottom && center.x >= bottom.shape.center.x - 10 && center.x <= bottom.shape.center.x + 10){
                isHitBottom = true;
                offset_bottom = bottom.shape.center.x - center.x;
            }

            //步骤四：依据标记判断如何绘制标志线（计算起始点位置），并保存绘制区域图形
            if (isHitTop){
                if (isHitBottom){
                    if (top.shape.center.x === bottom.shape.center.x){  //上下图形中心点有相同的X坐标
                        this.offset_X = offset_top;
                        center.x = top.shape.center.x;
                        this.start_y = { x: center.x, y: top.shape.center.y - top.shape.height/2 - 15 };
                        this.end_y = { x: center.x, y: bottom.shape.center.y + top.shape.height/2 + 15 };
                        //EditorFunction.saveStateForLine_Y.call(this);
                    } else {  //上下图形中心点都进入了偏移范围
                        const s_top = offset_top < 0 ? offset_top * -1 : offset_top;
                        const s_bottom = offset_bottom < 0 ? offset_bottom * -1 : offset_bottom;
                        //上边优先，谁近向谁靠拢
                        if (s_bottom < s_top){
                            this.offset_X = offset_bottom;
                            EditorFunction.saveStateForLine_Bottom.call(this, center, bottom);
                        } else {
                            this.offset_X = offset_top;
                            EditorFunction.saveStateForLine_Top.call(this, center, top);
                        }
                    }
                } else { //只有上边图形中心点都进入了偏移范围
                    this.offset_X = offset_top;
                    EditorFunction.saveStateForLine_Top.call(this, center, top);
                }   
            } else if (isHitBottom){ //只有下边图形中心点都进入了偏移范围
                this.offset_X = offset_bottom;
                EditorFunction.saveStateForLine_Bottom.call(this, center, bottom);
            }

            if (isHitRight){
                if (isHitLeft){
                    if (right.shape.center.y === left.shape.center.y){  //左右图形中心点有相同的Y坐标
                        this.offset_Y = offset_right;
                        center.y = right.shape.center.y;
                        this.start_x = { x: left.shape.center.x - left.shape.width/2 - 15, y: center.y };
                        this.end_x = { x: right.shape.center.x + right.shape.width/2 + 15, y: center.y };
                        //EditorFunction.saveStateForLine_X.call(this);
                    } else {  //左右图形中心点都进入了偏移范围
                        const s_right = offset_right < 0 ? offset_right * -1 : offset_right;
                        const s_left = offset_left < 0 ? offset_left * -1 : offset_left;
                        //左边优先，谁近向谁靠拢
                        if (s_right < s_left){
                            this.offset_Y = offset_right;
                            EditorFunction.saveStateForLine_Right.call(this, center, right);
                        } else {
                            this.offset_Y = offset_left;
                            EditorFunction.saveStateForLine_Left.call(this, center, left);
                        }
                    }
                } else { //只有右边图形中心点都进入了偏移范围
                    this.offset_Y = offset_right;
                    EditorFunction.saveStateForLine_Right.call(this, center, right);
                }   
            } else if (isHitLeft){ //只有左边图形中心点都进入了偏移范围
                this.offset_Y = offset_left;
                EditorFunction.saveStateForLine_Left.call(this, center, left);
            }

            //步骤五：保存区域图形
            EditorFunction.saveAll.call(this);
            //步骤六：开始绘制标志线和拖拽图形
            if (this.start_x && this.end_x){
                drawMarkLine(this.start_x, this.end_x, this.ctx);
            }
            if (this.start_y && this.end_y){
                drawMarkLine(this.start_y, this.end_y, this.ctx);
            }
            this.selectedElement.drawDashNode(x + this.offset_X, y + this.offset_Y);
        } else if (this.selectedElement instanceof Group){
            EditorFunction.saveAll.call(this);
            this.selectedElement.drawDashGroup(x, y);
        }
    },
    //mouseup事件调用,移动节点
    moveSelectedElement: function(event){
        const x = event.offsetX * Settings.ratio - this.clickPoint.x;
        const y = event.offsetY * Settings.ratio - this.clickPoint.y;
        EditorFunction.rollbackForMoving.call(this);
        this.moveCache = null;
        if (x > minMovement || x < minMovement * -1 || y > minMovement || y < minMovement * -1){
            if(this.selectedElement instanceof Node){
                EditorFunction.moveShape.call(this, x + this.offset_X, y + this.offset_Y); 
            } else if (this.selectedElement instanceof Group){
                EditorFunction.moveGroup.call(this, x, y); 
            }
            
            if (this.stepMark < this.stepCache.length - 1){
                this.stepCache.splice(this.stepMark + 1, this.stepCache.length - this.stepMark - 1);
            }
            this.stepCache.push(EditorFunction.outPut(this.elements));
            this.stepMark = this.stepCache.length - 1;
        }

        this.canvas.addEventListener('mousemove', this.mouseOverSelect);
        this.canvas.removeEventListener('mousemove', this.drawDashShape);
        this.canvas.removeEventListener('mouseup', this.moveSelectedElement);
        this.canvas.removeEventListener('mouseleave', this.mouseLeaveHandler);
    },
    //mouseup事件调用,绘制线条
    drawLine: function(event){
        const point = {};
        point.x = event.offsetX * Settings.ratio;
        point.y = event.offsetY * Settings.ratio;
        //新的线条
        if (this.currentLine && !this.lineCache){
            this.canvas.removeEventListener('mousemove', this.drawNewDashLine);
            if (!this.currentLine.to){
                this.currentLine.endPoint = point;
            } else {
                this.currentLine.endPoint = null;
                pushHashSet(this.currentLine.to.lines, this.currentLine);
            }
            this.currentLine.createPath();
            // this.currentLine.isSelected = true;
            this.selectedElement = this.currentLine;
            this.currentLine = null;
            EditorFunction.reload.call(this);  
            
            //触发选中元素事件
            let event = Event.selectedElement;
            event.element = EditorFunction.outPutUnit(this.selectedElement);
            this.canvas.dispatchEvent(event);
            event.element = null;
            //当前数据记入缓存 
            if (this.stepMark < this.stepCache.length - 1){
                this.stepCache.splice(this.stepMark + 1, this.stepCache.length - this.stepMark - 1);
            }
            this.stepCache.push(EditorFunction.outPut(this.elements));   
            this.stepMark = this.stepCache.length - 1;   
        //变更线条路径
        } else if (this.currentLine && this.lineCache) {
            //上调线的图层
            this.selectedElement.index = this.indexMark;
            this.indexMark ++;
            if (this.lineCache.operation !== 'middlePathChange'){
                this.canvas.removeEventListener('mousemove', this.changeStartOrEndOfLine);
                if ((this.currentLine.from && this.lineCache.from === this.currentLine.from) && this.lineCache.fromConOrder === this.currentLine.fromConOrder
                && (this.currentLine.to && this.lineCache.to === this.currentLine.to) && this.lineCache.toConOrder === this.currentLine.toConOrder){
                    this.lineCache = null;
                    this.canvas.addEventListener('mousemove', this.mouseOverSelect);
                    this.canvas.removeEventListener('mouseup', this.drawLine);
                    return;
                }
                if (this.lineCache.from){
                    this.lineCache.from.lines.splice(this.lineCache.from.lines.findIndex(line => line === this.currentLine), 1);
                };
                if (this.lineCache.to){
                    this.lineCache.to.lines.splice(this.lineCache.to.lines.findIndex(line => line === this.currentLine), 1);
                };
                if (this.currentLine.from){
                    this.currentLine.startPoint = null;
                    pushHashSet(this.currentLine.from.lines, this.currentLine);
                } else if (this.currentLine.operation === 'startPointChange') {
                    this.currentLine.startPoint = point;
                };
                if (this.currentLine.to){
                    this.currentLine.endPoint = null;
                    pushHashSet(this.currentLine.to.lines, this.currentLine);
                } else if (this.currentLine.operation === 'endPointChange') {
                    this.currentLine.endPoint = point;
                }; 
                this.currentLine.createPath();
            } else {
                this.canvas.removeEventListener('mousemove', this.drawCurrentDashLine);
                if (this.clickPoint.x === point.x && this.clickPoint.y === point.y){
                    this.lineCache = null;
                    this.canvas.addEventListener('mousemove', this.mouseOverSelect);
                    this.canvas.removeEventListener('mouseup', this.drawLine);
                    return;
                }
            }   
            // this.currentLine.isSelected = true;
            this.selectedElement = this.currentLine;
            
            EditorFunction.reload.call(this);   
            //当前数据记入缓存 
            if (this.stepMark < this.stepCache.length - 1){
                this.stepCache.splice(this.stepMark + 1, this.stepCache.length - this.stepMark - 1);
            }
            this.stepCache.push(EditorFunction.outPut(this.elements)); 
            this.stepMark = this.stepCache.length - 1;  
        } else {
            this.canvas.removeEventListener('mousemove', this.drawNewDashLine);
        }      
        
        this.currentLine = null;
        this.lineCache = null;
        this.selectedConnector = null;
        this.moveCache = null;

        this.canvas.addEventListener('mousemove', this.mouseOverSelect);
        this.canvas.removeEventListener('mouseup', this.drawLine);
        this.canvas.removeEventListener('mouseleave', this.mouseLeaveHandler);
    },
    //mousemove事件调用
    mouseOverSelect: function(event){
        if(this.selectedElement){
            //是否命中线的控制点
            if(this.selectedElement instanceof Line){
                let isHitLineController = false;
                isHitLineController = this.selectedElement.controller.hitCheck(event.offsetX * Settings.ratio, event.offsetY * Settings.ratio);
                if(isHitLineController){
                    if (isHitLineController.operation === 'startPointChange' || isHitLineController.operation === 'endPointChange'){
                        this.canvas.style.cursor = 'crosshair';
                    } else if (isHitLineController.points[1].x === isHitLineController.points[3].x) {
                        this.canvas.style.cursor = 'e-resize';
                    } else if (isHitLineController.points[1].y === isHitLineController.points[3].y) {
                        this.canvas.style.cursor = 'n-resize';
                    }
                    return;
                }
            }
            //是否命中节点的控制点
            if(this.selectedElement instanceof Node){
                let isHitNodeController = false;
                isHitNodeController = this.selectedElement.shape.controller.hitCheck(event.offsetX * Settings.ratio, event.offsetY * Settings.ratio);
                if(isHitNodeController){
                    if (isHitNodeController.order === 'n' || isHitNodeController.order === 's'){
                        this.canvas.style.cursor = 'n-resize';
                    } else if (isHitNodeController.order === 'e' || isHitNodeController.order === 'w') {
                        this.canvas.style.cursor = 'e-resize';
                    } else if (isHitNodeController.order === 'ne' || isHitNodeController.order === 'sw') {
                        this.canvas.style.cursor = 'ne-resize';
                    } else if (isHitNodeController.order === 'nw' || isHitNodeController.order === 'se') {
                        this.canvas.style.cursor = 'nw-resize';
                    }
                    return;
                }
            }
        }

        //先判断是否命中连接点
        let isHitConnector = false;
        if(this.mouseOverNode){
            isHitConnector = this.mouseOverNode.connectorHitCheck(event.offsetX * Settings.ratio, event.offsetY * Settings.ratio);
            if (isHitConnector && !this.selectedConnector){
                EditorFunction.saveStateForConnector.call(this, this.mouseOverNode);
                this.mouseOverNode.selectConnector(isHitConnector);
                this.selectedConnector = {};
                this.selectedConnector.node = this.mouseOverNode;
                this.selectedConnector.order = isHitConnector;
                this.canvas.style.cursor = 'default';
            } else if (this.selectedConnector && !isHitConnector) {
                EditorFunction.rollbackConnector.call(this);
                this.selectedConnector = null;
            }
        }

        //未命中连接点
        if (!isHitConnector){
            let hitItem = [];
            for (const element of this.elements){
                if (element.hitCheck(event.offsetX * Settings.ratio, event.offsetY * Settings.ratio)){
                    hitItem.push(element);
                }     
            };
            if (hitItem.length === 0){
                this.canvas.style.cursor = '-webkit-grab';
            } else {
                hitItem.sort(function(a, b){return a.index - b.index;});
                const top = hitItem.pop();
                if(top instanceof Node){
                    this.canvas.style.cursor = 'move';
                } else if (top instanceof Line){
                    this.canvas.style.cursor = 'default';
                }
                
            };
            hitItem = [];
            for (const node of this.nodes){
                if (node.hitCheck_Over(event.offsetX * Settings.ratio, event.offsetY * Settings.ratio)){
                    hitItem.push(node);
                } else {
                    if (node.isOver === true){
                        node.isOver = false;
                        EditorFunction.reload.call(this);
                    };              
                };      
            };
            hitItem.sort(function(a, b){return a.index - b.index;});
            if (hitItem.length === 0){
                this.mouseOverNode = null;
            } else {
                const topItem = hitItem.pop();
                for (const item of hitItem) {
                    if (item.isOver === true && item.index < topItem.index){
                        item.isOver = false;
                        EditorFunction.reload.call(this);
                        break;
                    };    
                }
                if (!this.mouseOverNode || (this.mouseOverNode && topItem !== this.mouseOverNode)){
                    this.mouseOverNode = topItem;
                    topItem.isOver = true;
                    this.mouseOverNode.drawConnector();
                };
            };
        }
    },
    //节点形状调整
    nodeResizing: function(event){
        //偏移量
        const x = event.offsetX * Settings.ratio - this.clickPoint.x;
        const y = event.offsetY * Settings.ratio - this.clickPoint.y;
        if(this.selectedElement.index + 1 !== this.indexMark){
            this.selectedElement.index = this.indexMark;
            this.indexMark ++;
        }
        const shapeType = this.selectedElement.shape.type;
        const bottom = this.nodeResizeCache.y + this.nodeResizeCache.height/2,
        top = this.nodeResizeCache.y - this.nodeResizeCache.height/2,
        left = this.nodeResizeCache.x - this.nodeResizeCache.width/2,
        right = this.nodeResizeCache.x + this.nodeResizeCache.width/2;
        let height,width,newMinWidth,newMinHeight;
        switch (this.nodeResizeCache.resizeType) {
            case 'n':
                height = this.nodeResizeCache.height - y < minHeight ? minHeight : this.nodeResizeCache.height - y;
                if(shapeType === 'capsule' && height > this.nodeResizeCache.width - minCapsuleLine){
                    height = this.nodeResizeCache.width - minCapsuleLine;
                }
                this.selectedElement.shape.y = bottom - height/2;
                this.selectedElement.shape.height = height;
                break;
            case 's':
                height = this.nodeResizeCache.height + y < minHeight ? minHeight : this.nodeResizeCache.height + y;
                if(shapeType === 'capsule' && height > this.nodeResizeCache.width - minCapsuleLine){
                    height = this.nodeResizeCache.width - minCapsuleLine;
                }
                this.selectedElement.shape.y = top + height/2;
                this.selectedElement.shape.height = height;
                break;
            case 'e':
                width = this.nodeResizeCache.width + x < minWidth ? minWidth : this.nodeResizeCache.width + x;
                if(shapeType === 'capsule' && this.nodeResizeCache.height > width - minCapsuleLine){
                    width = this.nodeResizeCache.height + minCapsuleLine;
                }
                this.selectedElement.shape.x = left + width/2;
                this.selectedElement.shape.width = width;
                break;
            case 'w':
                width = this.nodeResizeCache.width - x < minWidth ? minWidth : this.nodeResizeCache.width - x;
                if(shapeType === 'capsule' && this.nodeResizeCache.height > width - minCapsuleLine){
                    width = this.nodeResizeCache.height + minCapsuleLine;
                }
                this.selectedElement.shape.x = right - width/2;
                this.selectedElement.shape.width = width;
                break;
            case 'ne':
                newMinWidth  = minWidth;
                newMinHeight = minHeight;
                if(this.nodeResizeCache.width > this.nodeResizeCache.height){
                    newMinWidth = minHeight * this.nodeResizeCache.width / this.nodeResizeCache.height;
                } else {
                    newMinHeight = minWidth * this.nodeResizeCache.height / this.nodeResizeCache.width;
                }
                height = this.nodeResizeCache.height - y < newMinHeight ? newMinHeight : this.nodeResizeCache.height - y;
                width = this.nodeResizeCache.width + x < newMinWidth ? newMinWidth : this.nodeResizeCache.width + x;
                if(height/width > this.nodeResizeCache.height/this.nodeResizeCache.width){
                    width = height * this.nodeResizeCache.width/this.nodeResizeCache.height;
                } else {
                    height = width * this.nodeResizeCache.height/this.nodeResizeCache.width;
                }
                this.selectedElement.shape.x = left + width/2;
                this.selectedElement.shape.y = bottom - height/2;
                this.selectedElement.shape.height = height;
                this.selectedElement.shape.width = width;
                break;
            case 'se':
                newMinWidth = minWidth;
                newMinHeight = minHeight;
                if(this.nodeResizeCache.width > this.nodeResizeCache.height){
                    newMinWidth = minHeight * this.nodeResizeCache.width / this.nodeResizeCache.height;
                } else {
                    newMinHeight = minWidth * this.nodeResizeCache.height / this.nodeResizeCache.width;
                }
                height = this.nodeResizeCache.height + y < newMinHeight ? newMinHeight : this.nodeResizeCache.height + y;
                width = this.nodeResizeCache.width + x < newMinWidth ? newMinWidth : this.nodeResizeCache.width + x;
                if(height/width > this.nodeResizeCache.height/this.nodeResizeCache.width){
                    width = height * this.nodeResizeCache.width/this.nodeResizeCache.height;
                } else {
                    height = width * this.nodeResizeCache.height/this.nodeResizeCache.width;
                }
                this.selectedElement.shape.x = left + width/2;
                this.selectedElement.shape.y = top + height/2;
                this.selectedElement.shape.height = height;
                this.selectedElement.shape.width = width;
                break;
            case 'sw':
                newMinWidth = minWidth;
                newMinHeight = minHeight;
                if(this.nodeResizeCache.width > this.nodeResizeCache.height){
                    newMinWidth = minHeight * this.nodeResizeCache.width / this.nodeResizeCache.height;
                } else {
                    newMinHeight = minWidth * this.nodeResizeCache.height / this.nodeResizeCache.width;
                }
                height = this.nodeResizeCache.height + y < newMinHeight ? newMinHeight : this.nodeResizeCache.height + y;
                width = this.nodeResizeCache.width - x < newMinWidth ? newMinWidth : this.nodeResizeCache.width - x;
                if(height/width > this.nodeResizeCache.height/this.nodeResizeCache.width){
                    width = height * this.nodeResizeCache.width/this.nodeResizeCache.height;
                } else {
                    height = width * this.nodeResizeCache.height/this.nodeResizeCache.width;
                }
                this.selectedElement.shape.x = right - width/2;
                this.selectedElement.shape.y = top + height/2;
                this.selectedElement.shape.height = height;
                this.selectedElement.shape.width = width;
                break;
            case 'nw':
                newMinWidth = minWidth;
                newMinHeight = minHeight;
                if(this.nodeResizeCache.width > this.nodeResizeCache.height){
                    newMinWidth = minHeight * this.nodeResizeCache.width / this.nodeResizeCache.height;
                } else {
                    newMinHeight = minWidth * this.nodeResizeCache.height / this.nodeResizeCache.width;
                }
                height = this.nodeResizeCache.height - y < newMinHeight ? newMinHeight : this.nodeResizeCache.height - y;
                width = this.nodeResizeCache.width - x < newMinWidth ? newMinWidth : this.nodeResizeCache.width - x;
                if(height/width > this.nodeResizeCache.height/this.nodeResizeCache.width){
                    width = height * this.nodeResizeCache.width/this.nodeResizeCache.height;
                } else {
                    height = width * this.nodeResizeCache.height/this.nodeResizeCache.width;
                }
                this.selectedElement.shape.x = right - width/2;
                this.selectedElement.shape.y = bottom - height/2;
                this.selectedElement.shape.height = height;
                this.selectedElement.shape.width = width;
                break;
            default:
                break;
        }
        this.selectedElement.lines.map(line => {
            line.createPath();
            line.index = this.indexMark;
            this.indexMark ++;
        });
        EditorFunction.reload.call(this);
    },
    nodeResize: function(event){
        if (this.stepMark < this.stepCache.length - 1){
            this.stepCache.splice(this.stepMark + 1, this.stepCache.length - this.stepMark - 1);
        }
        this.stepCache.push(EditorFunction.outPut(this.elements));
        this.stepMark = this.stepCache.length - 1;

        this.canvas.addEventListener('mousemove', this.mouseOverSelect);
        this.canvas.removeEventListener('mousemove', this.nodeResizing);
        this.canvas.removeEventListener('mouseup', this.nodeResize);
        this.canvas.removeEventListener('mouseleave', this.mouseLeaveHandler);
    },
    //键盘事件
    keyDown: function(event){
        //删除元素
        if(event.keyCode === 46 && this.selectedElement){
            event.preventDefault();
            EditorFunction.deleteEle.call(this);
        };
        //撤销
        if(event.keyCode === 90 && event.ctrlKey){
            event.preventDefault();
            EditorFunction.undo.call(this);
        }
        //重做
        if(event.keyCode === 89 && event.ctrlKey){
            event.preventDefault();
            EditorFunction.redo.call(this);
        }

        //保存
        if(event.keyCode === 83 && event.ctrlKey){
            event.preventDefault();
            //触发保存事件
            EditorFunction.save.call(this);
        };
    },
    resize: function(event){
        const width = document.documentElement.clientWidth * 7 / 12 - 25;
        const height = document.documentElement.clientHeight - 6;

        this.canvas.style.width = width + "px";
        this.canvas.style.height = height + "px";

        this.canvas.width = width * Settings.ratio;
        this.canvas.height = height * Settings.ratio;
        EditorFunction.reload.call(this);
    },
    mouseLeaveHandler: function(event){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.load(this.stepCache[this.stepMark], true);
        this.currentLine = null;
        this.lineCache = null;
        this.selectedConnector = null;
        this.moveCache = null;
        this.selectedElement = null;

        this.canvas.addEventListener('mousemove', this.mouseOverSelect);
        this.canvas.removeEventListener('mousemove', this.changeStartOrEndOfLine);
        this.canvas.removeEventListener('mousemove', this.drawCurrentDashLine);
        this.canvas.removeEventListener('mousemove', this.drawNewDashLine);
        this.canvas.removeEventListener('mousemove', this.drawDashShape);
        this.canvas.removeEventListener('mousemove', this.nodeResizing);

        this.canvas.removeEventListener('mouseup', this.drawLine);
        this.canvas.removeEventListener('mouseup', this.moveSelectedElement);
        this.canvas.removeEventListener('mouseup', this.nodeResize);
        this.canvas.removeEventListener('mouseleave', this.mouseLeaveHandler);
    },
    canvasMoveLeave: function(event){
        this.canvasMoveCache = null;

        this.canvas.addEventListener('mousemove', this.mouseOverSelect);

        this.canvas.removeEventListener('mousemove', this.moveCanvasOrCompose);
        this.canvas.removeEventListener('mouseup', this.moveCanvasComplete);
        this.canvas.removeEventListener('mouseleave', this.mouseLeaveHandler);
    },
    moveCanvasOrCompose: function(event){
        const x = event.offsetX * Settings.ratio - this.clickPoint.x;
        const y = event.offsetY * Settings.ratio - this.clickPoint.y;

        if(this.composeModel && event.ctrlKey){
            EditorFunction.rollbackForMoving.call(this);
            EditorFunction.saveAll.call(this);
            let lt = { x:this.clickPoint.x, y:this.clickPoint.y }, width = 0, height = 0;
            if(x > 0 && y > 0){
                width = x;
                height = y;
            } else if (x > 0 && y < 0){
                lt.y = event.offsetY * Settings.ratio;
                width = x;
                height = y * -1;
            } else if (x < 0 && y > 0){
                lt.x = event.offsetX * Settings.ratio;
                width = x * -1;
                height = y;
            } else if (x < 0 && y < 0){
                lt.x = event.offsetX * Settings.ratio;
                lt.y = event.offsetY * Settings.ratio;
                width = x * -1;
                height = y * -1;
            }

            this.ctx.save();
            this.ctx.lineWidth = 0.7;
            this.ctx.setLineDash([6, 3]);
            this.ctx.lineDashOffset = 0;
            this.ctx.strokeRect (lt.x, lt.y, width, height); 
            this.ctx.restore();  

        } else if(this.composeModel && !event.ctrlKey) {
            this.composeModel = false;
        } else { //拖拽画布
            //缓存拖拽前的位置信息
            if (!this.canvasMoveCache){
                this.canvasMoveCache = [];
                for (const element of this.elements) {
                    const ele = {};
                    if(element instanceof Node){
                        ele.id = element.id;
                        ele.x = element.shape.x;
                        ele.y = element.shape.y;
                        this.canvasMoveCache.push(ele);
                    } else if (element instanceof Line){
                        ele.id = element.id;
                        if(!element.from && element.start){
                            ele.startPoint = {};
                            ele.startPoint.x = element.start.x;
                            ele.startPoint.y = element.start.y;
                        }
                        if(!element.to && element.end){
                            ele.endPoint = {};
                            ele.endPoint.x = element.end.x;
                            ele.endPoint.y = element.end.y;
                        }
                        if (element.inflexionPoint){
                            ele.inflexionPoint = JSON.parse(JSON.stringify(element.inflexionPoint));
                        }
                        this.canvasMoveCache.push(ele);
                    }
                }
            }
    
            for (const element of this.elements) {
                let x_original,y_original;
                if(element instanceof Node){
                    this.canvasMoveCache.map(ele =>{
                        if(ele.id === element.id){
                            x_original = ele.x;
                            y_original = ele.y;
                        }
                    });
                    element.shape.x = x_original + x;
                    element.shape.y = y_original + y;
                } else if (element instanceof Line){
                    if(!element.from && element.start){
                        this.canvasMoveCache.map(ele =>{
                            if(ele.id === element.id){
                                x_original = ele.startPoint.x;
                                y_original = ele.startPoint.y;
                            }
                        });
                        element.start.x =  x_original + x;
                        element.start.y =  y_original + y;
                    }
                    if(!element.to && element.end){
                        this.canvasMoveCache.map(ele =>{
                            if(ele.id === element.id){
                                x_original = ele.endPoint.x;
                                y_original = ele.endPoint.y;
                            }
                        });
                        element.end.x =  x_original + x;
                        element.end.y =  y_original + y;
                    }
                    if (element.inflexionPoint){
                        element.inflexionPoint = [];
                        this.canvasMoveCache.map(ele =>{
                            if(ele.id === element.id){
                                for (const point of ele.inflexionPoint) {
                                    const newpoint = {};
                                    newpoint.x = point.x + x;
                                    newpoint.y = point.y + y;
                                    element.inflexionPoint.push(newpoint);
                                }
                            }
                        });
                    }
                }
            }
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            EditorFunction.reload.call(this);
        } 
    },
    moveCanvasComplete: function(event){
        this.canvasMoveCache = null;
        //组合
        if(this.composeModel){
            this.composeModel = false;
            EditorFunction.rollbackForMoving.call(this);
            const left = this.clickPoint.x < event.offsetX * Settings.ratio ? this.clickPoint.x : event.offsetX * Settings.ratio;
            const top = this.clickPoint.y < event.offsetY * Settings.ratio ? this.clickPoint.y : event.offsetY * Settings.ratio;
            const right = this.clickPoint.x > event.offsetX * Settings.ratio ? this.clickPoint.x : event.offsetX * Settings.ratio;
            const bottom = this.clickPoint.y > event.offsetY * Settings.ratio ? this.clickPoint.y : event.offsetY * Settings.ratio;
            const nodeInArea = function(node){
                return top <= node.shape.top && left <= node.shape.left && right >= node.shape.right 
                    && bottom >= node.shape.bottom;
            }
            const composeNodes = this.nodes.filter(nodeInArea);
            const lineInArea = function(line){
                return composeNodes.indexOf(line.from) != -1 && composeNodes.indexOf(line.to) != -1
            }
            if(composeNodes.length === 1){
                this.selectedElement = composeNodes[0];
                EditorFunction.reload.call(this);
            } else if (composeNodes.length > 1){
                this.selectedElement = new Group(this.canvas);
                this.selectedElement.nodes = composeNodes;
                this.selectedElement.lines = this.lines.filter(lineInArea);
                EditorFunction.reload.call(this);
            }
            //触发选中元素事件
            let selectedElementEvent = Event.selectedElement;
            selectedElementEvent.element = EditorFunction.outPutUnit(this.selectedElement);
            this.canvas.dispatchEvent(selectedElementEvent);
            selectedElementEvent.element = null;
        }
        
        this.canvas.addEventListener('mousemove', this.mouseOverSelect);
        this.canvas.removeEventListener('mousemove', this.moveCanvasOrCompose);
        this.canvas.removeEventListener('mouseup', this.moveCanvasComplete);
    }
}

function drawMarkLine(start, end, context){
    if (!context) return;
    context.save();
    context.beginPath();
    context.lineWidth = 0.6;
    context.strokeStyle = "rgb(150, 50, 50, 1)";
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
    context.restore();
};

function sortNode_Right(a,b){
    return a.shape.center.x - b.shape.center.x;
}

function sortNode_Left(a,b){
    return b.shape.center.x - a.shape.center.x;
}

function sortNode_Top(a,b){
    return b.shape.center.y - a.shape.center.y;
}

function sortNode_Bottom(a,b){
    return a.shape.center.y - b.shape.center.y;
}

function sortCon(a,b)
{
    return b.distance - a.distance;
}

function getCompareNode_Right(nodes, center, currentNode){
    const rightNodes = [];
    //找到所有右边的节点
    nodes.map(node => {
        if (node.shape.center.x > center.x && currentNode !== node){
            rightNodes.push(node);
        }
    });
    rightNodes.sort(sortNode_Right);
    for (const item of rightNodes) {
        if (item.shape.top <= center.y && item.shape.bottom >= center.y){
            return item;
        }
    }
    return null;
}

function getCompareNode_Left(nodes, center, currentNode){
    const leftNodes = [];
    //找到所有左边的节点
    nodes.map(node => {
        if (node.shape.center.x < center.x && currentNode !== node){
            leftNodes.push(node);
        }
    });
    leftNodes.sort(sortNode_Left);
    for (const item of leftNodes) {
        if (item.shape.top <= center.y && item.shape.bottom >= center.y){
            return item;
        }
    }
    return null;
}

function getCompareNode_Top(nodes, center, currentNode){
    const topNodes = [];
    //找到所有上边的节点
    nodes.map(node => {
        if (node.shape.center.y < center.y && currentNode !== node){
            topNodes.push(node);
        }
    });
    topNodes.sort(sortNode_Top);
    for (const item of topNodes) {
        if (item.shape.left <= center.x && item.shape.right >= center.x){
            return item;
        }
    }
    return null;
}

function getCompareNode_Bottom(nodes, center, currentNode){
    const bottomNodes = [];
    //找到所有下边的节点
    nodes.map(node => {
        if (node.shape.center.y > center.y && currentNode !== node){
            bottomNodes.push(node);
        }
    });
    bottomNodes.sort(sortNode_Bottom);
    for (const item of bottomNodes) {
        if (item.shape.left <= center.x && item.shape.right >= center.x){
            return item;
        }
    }
    return null;
}

function pushHashSet(hashSet, item){
    for (const key of hashSet) {
        if (item === key){
            return false;
        }
    }
    hashSet.push(item);
    return true;
}