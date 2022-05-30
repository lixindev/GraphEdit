import { Line } from './line';
import Arrow from './arrow';
import CommonFunctions from '../tools/commonFunctions';

const margin = 25;
const offset = 10;
const hitWidth = 5;

const orientation = {
    north: 1,
    northEast: 2,
    east: 3,
    southEast: 4,
    south: 5,
    southWest: 6,
    west: 7,
    northWest: 8
};

export class PolyLine extends Line{
    constructor(params, canvas){
        super(params, canvas);
        
        if (params.inflexionPoint){
            this.inflexionPoint = CommonFunctions.deepClone(params.inflexionPoint);
        } else {
            this.inflexionPoint = null;
        }
    }

    get textPoint(){
        if (this.inflexionPoint && this.inflexionPoint.length > 0){
            let total = 0;
            let length = 0;
            let collection = [];
            let part1 = {};
            let part2 = {};
            part1.first = this.startPoint;
            part1.second = this.inflexionPoint[0];
            part1.distance = part1.first.x === part1.second.x ? Math.abs(part1.first.y - part1.second.y) : Math.abs(part1.first.x - part1.second.x);
            collection.push(part1);
            total += part1.distance;
            if (this.inflexionPoint.length > 1){
                for (let index = 0; index < this.inflexionPoint.length - 1; index++) {
                    let part = {};
                    part.first = this.inflexionPoint[index];
                    part.second = this.inflexionPoint[index + 1];
                    part.distance = part.first.x === part.second.x ? Math.abs(part.first.y - part.second.y) : Math.abs(part.first.x - part.second.x);
                    collection.push(part);
                    total += part.distance;
                }
            }
            part2.first = this.inflexionPoint[this.inflexionPoint.length - 1];
            part2.second = this.endPoint;
            part2.distance = part2.first.x === part2.second.x ? Math.abs(part2.first.y - part2.second.y) : Math.abs(part2.first.x - part2.second.x);
            collection.push(part2);
            total += part2.distance;

            for (const part of collection) {
                length += part.distance;
                if (length >= total/2){
                    if(part.first.x === part.second.x){
                        return {
                            x: part.first.x,
                            y: part.second.y > part.first.y ? part.second.y - length + total/2 : part.second.y + length - total/2
                        }
                    } else if (part.first.y === part.second.y){
                        return {
                            x: part.second.x > part.first.x ? part.second.x - length + total/2 : part.second.x + length - total/2,
                            y: part.second.y
                        }
                    }
                }
            }
        } else {
            if (this.startPoint.x === this.endPoint.x){
                return {
                    x: this.startPoint.x,
                    y: (this.startPoint.y + this.endPoint.y)/2
                }
            } else if (this.startPoint.y === this.endPoint.y) {
                return{
                    x: (this.startPoint.x + this.endPoint.x)/2,
                    y: this.startPoint.y
                }
            }
        }
    }

    //路线规划
    createPath(){
        this.inflexionPoint = [];
        //两边都没有关联节点
        if (!this.from && !this.to){
            if (this.startPoint.x !== this.endPoint.x && this.startPoint.y !== this.endPoint.y){
                let point = {};
                [point.x, point.y] = [this.startPoint.x, this.endPoint.y];
                this.inflexionPoint.push(point);
            }
        } else {
            let hitResult = false;
            if(this.from){
                hitResult = this.from.hitNode(this.endPoint.x, this.endPoint.y);
            }
            if(this.to){
                hitResult = hitResult || this.to.hitNode(this.startPoint.x, this.startPoint.y);
            }
            //锚点命中图形
            if(hitResult && this.from !== this.to) {
                if (this.from) {
                    let curDirection = this.startPoint.order % 2 === 1 ? 'y' : 'x';
                    if (!this.to || (this.to && (this.startPoint.order + this.endPoint.order) % 2 === 1)) {
                        //直角连接
                        connectToEnd(curDirection, this.startPoint, this.endPoint, this.inflexionPoint);
                    } else {
                        polylineConnect(curDirection, this.startPoint, this.endPoint, this.inflexionPoint);
                    }
                } else {
                    //起点不在节点锚点上
                    let curDirection = this.endPoint.order % 2 === 1 ? 'y' : 'x';
                    //逆向规划路线
                    connectToEnd(curDirection, this.endPoint, this.startPoint, this.inflexionPoint);
                }
            } else if (!this.to) {
                //线的终点不在图形锚点上
                anchorToPoint(this.from, this.startPoint, this.endPoint, this.inflexionPoint);
            } else if (!this.from) {
                //线的起点不在图形锚点上
                //逆向规划路线
                anchorToPoint(this.to, this.endPoint, this.startPoint, this.inflexionPoint);
                if (this.inflexionPoint && this.inflexionPoint.length > 1) {
                    this.inflexionPoint.reverse();
                }
            } else if (this.from === this.to) {
                //自环
                twoStep.call(this, 4, {x:0, y:0});
            } else {
                let startToSource = getPositionForAnchor(this.startPoint.order);
                let startToTarget = getPosition(this.startPoint, this.to);
                let endToSource = getPosition(this.endPoint, this.from);
                let endToTarget = getPositionForAnchor(this.endPoint.order);

                let distanceSource = getDistance(startToSource.orientation, endToSource.orientation);
                let distanceTarget = getDistance(startToTarget.orientation, endToTarget.orientation);
                let flag = Math.abs(this.startPoint.order - this.endPoint.order);
                let gap = getGap(this.from, this.to);
                let curDirection = this.startPoint.order % 2 === 1 ? 'y' : 'x';
                switch (flag) {
                    case 0:
                        //连接点同向
                        if (distanceSource === 4) {
                            twoStep.call(this, 2, gap);
                        } else if (distanceTarget === 4) {
                            nodeAboveStart.call(this, curDirection, gap);
                        } else {
                            if (curDirection === 'y') {
                                if ((Math.abs(this.endPoint.x - this.from.shape.left) < offset || Math.abs(this.endPoint.x - this.from.shape.right) < offset) 
                                && gap.y > offset && distanceSource === 3) {
                                    twoStep.call(this, 2, gap);
                                } else {
                                    twoStep.call(this, 4, gap);
                                }
                            } else {
                                if ((Math.abs(this.endPoint.y - this.from.shape.top) < offset || Math.abs(this.endPoint.y - this.from.shape.bottom) < offset) 
                                && gap.x > offset && distanceSource === 3) {
                                    twoStep.call(this, 2, gap);
                                } else {
                                    twoStep.call(this, 4, gap);
                                }
                            }
                        }
                        break;
                    case 1:
                    case 3:
                        if (distanceSource < 2 && distanceTarget < 2) {
                            let point = {};
                            if (curDirection === 'y') {
                                [point.x, point.y] = [this.startPoint.x, this.endPoint.y];
                            } else {
                                [point.x, point.y] = [this.endPoint.x, this.startPoint.y];
                            }
                            this.inflexionPoint.push(point);
                        } else if (distanceSource < 2 && distanceTarget === 2) {
                            nodeAboveStart.call(this, curDirection, gap);
                        } else if (distanceSource < 2 && distanceTarget === 3) {
                            if ((curDirection === 'y' && gap.y < offset) || (curDirection === 'x' && gap.x < offset)) {
                                twoStep.call(this, 4, gap);
                            } else {
                                nodeAboveStart.call(this, curDirection, gap);
                            }
                        } else if (distanceSource < 2 && distanceTarget === 4) {
                            twoStep.call(this, 4, gap);
                        } else if (distanceSource === 2 && distanceTarget >= 2) {
                            twoStep.call(this, 3, gap);
                        } else if (distanceSource === 2 && distanceTarget < 2) {
                            twoStep.call(this, 1, gap);
                        } else if (distanceSource === 3 && distanceTarget >= 2) {
                            twoStep.call(this, 3, gap);
                        } else if (distanceSource === 3 && distanceTarget < 2) {
                            if ((curDirection === 'y' && gap.x > offset) || (curDirection === 'x' && gap.y > offset)) {
                                twoStep.call(this, 1, gap);
                            } else {
                                if ((curDirection === 'y' && gap.y > offset) || (curDirection === 'x' && gap.x > offset)) {
                                    twoStep.call(this, 2, gap);
                                } else {
                                    twoStep.call(this, 5, gap);
                                }
                            }
                        } else if (distanceSource === 4) {
                            if ((((this.endPoint.order === 1 && this.endPoint.y > this.startPoint.y) || (this.endPoint.order === 3 && this.endPoint.y < this.startPoint.y))
                            && gap.x > offset) 
                            || (((this.endPoint.order === 2 && this.endPoint.x < this.startPoint.x) || (this.endPoint.order === 4 && this.endPoint.x > this.startPoint.x))
                            && gap.y > offset)) {
                                twoStep.call(this, 2, gap);
                            } else {
                                twoStep.call(this, 5, gap);
                            }
                        }
                        break;
                    case 2:
                        //连接点对向
                        if (distanceSource < 2 && distanceTarget < 2) {
                            nodeAboveStart.call(this, curDirection, gap);
                        } else if (distanceSource < 4) {
                            if ((curDirection === 'y' && gap.x > offset) || (curDirection === 'x' && gap.y > offset)) {
                                twoStep.call(this, 1, gap);
                            } else if ((curDirection === 'y' && gap.y > offset) || (curDirection === 'x' && gap.x > offset)) {
                                let point = getMiddlePoint(this.startPoint, this.endPoint, this.from, this.to, gap, 2);
                                if (curDirection === 'y' && !(this.startPoint.x < this.endPoint.x ^ point.x < this.endPoint.x)) {
                                    curDirection = anchorToPoint(this.from, this.startPoint, point, this.inflexionPoint);
                                    this.inflexionPoint.push(point);
                                    curDirection = curDirection === 'y' ? 'x' : 'y';
                                    pointToAnchor(this.to, point, this.endPoint, curDirection, this.inflexionPoint);
                                } else {
                                    twoStep.call(this, 3, gap);
                                }
                                
                            } else {
                                twoStep.call(this, 3, gap);
                            }
                        } else {
                            twoStep.call(this, 3, gap);
                        }
                        break;
                }
            }
        }
    }

    drawLine(width, isDash){
        const context = this.ctx; 
        if (!context) return;
        context.save();
        context.lineWidth = width;
        context.strokeStyle = this.strokeStyle;
        context.fillStyle = 'rgba(100, 100, 100, 1)';
        
        if(isDash){
            context.setLineDash([6, 3]);
            context.lineDashOffset = 0;
        }
        context.beginPath();
        context.moveTo(this.startPoint.x, this.startPoint.y);
        if (this.inflexionPoint){
            this.inflexionPoint.map(point => {
                context.lineTo(point.x, point.y);
            });
        }
        context.lineTo(this.endPoint.x, this.endPoint.y);
        
        context.stroke();

        let lastPoint = null;
        if (this.inflexionPoint && this.inflexionPoint.length > 0){
            lastPoint = this.inflexionPoint.pop();
            this.inflexionPoint.push(lastPoint);
        } else {
            lastPoint = this.startPoint;
        }
        Arrow.drawCommonArrow(context, this.endPoint.x - lastPoint.x, this.endPoint.y - lastPoint.y, this.endPoint);
        this.fillText(isDash, this.textPoint);
        context.restore();
    }

    //判断坐标是否命中线
    hitCheck(x, y){
        let isHit = false;
        let point1 = this.startPoint;
        if (this.inflexionPoint){
            this.inflexionPoint.push(this.endPoint);
        } else {
            this.inflexionPoint = [];
            this.inflexionPoint.push(this.endPoint);
        }
        for (const point of this.inflexionPoint) {
            if (point1.x === point.x){
                if (x >= point1.x - hitWidth && x <= point1.x + hitWidth 
                    && y >= (point1.y > point.y ? point.y : point1.y) 
                    && y <= (point1.y < point.y ? point.y : point1.y) ){
                    isHit = true;
                    break;
                }
            } else if (point1.y === point.y) {
                if (y >= point1.y - hitWidth && y <= point1.y + hitWidth 
                    && x >= (point1.x > point.x ? point.x : point1.x) 
                    && x <= (point1.x < point.x ? point.x : point1.x) ){
                    isHit = true;
                    break;
                }
            }
            point1 = point;
        }
        this.inflexionPoint.pop();
        if (this.inflexionPoint.length === 0){
            this.inflexionPoint = null;
        }

        return isHit;
    }
}

//节点位于起点上方
function nodeAboveStart(curDirection, gap) {
    let point = {};
    if (curDirection === 'x' && gap.x < margin * 2) {
        [point.x, point.y] = [this.startPoint.order === 2 ? this.startPoint.x + gap.x / 2 : this.startPoint.x - gap.x / 2, this.startPoint.y];
        this.inflexionPoint.push(point);
    } else if (curDirection === 'y' && gap.y < margin * 2) {
        [point.x, point.y] = [this.startPoint.x, this.startPoint.order === 1 ? this.startPoint.y - gap.y / 2 : this.startPoint.y + gap.y / 2];
        this.inflexionPoint.push(point);
    } else {
        point = firstStep(this.startPoint, this.inflexionPoint);
    }
    curDirection = curDirection === 'y' ? 'x' : 'y';
    pointToAnchor(this.to, point, this.endPoint, curDirection, this.inflexionPoint);
}

//先由起点绕起始节点至中点，然后由中点绕目标节点至终点
function twoStep(scene, gap){
    let point = getMiddlePoint(this.startPoint, this.endPoint, this.from, this.to, gap, scene);
    let curDirection = anchorToPoint(this.from, this.startPoint, point, this.inflexionPoint);
    this.inflexionPoint.push(point);
    curDirection = curDirection === 'y' ? 'x' : 'y';
    pointToAnchor(this.to, point, this.endPoint, curDirection, this.inflexionPoint);
}

//从节点锚点开始绕过节点至指定点
function anchorToPoint(node, startPoint, endPoint, inflexionPoint) {
    let endToNode = getPosition(endPoint, node);
    let startToNode = getPositionForAnchor(startPoint.order);
    let curDirection = startPoint.order % 2 === 1 ? 'y' : 'x';

    //第一步
    let isCompleted = false;
    let curPoint = startPoint;
    let distance = getDistance(startToNode.orientation, endToNode.orientation);
    if (distance < 2) {
        curDirection = connectToEnd(curDirection, curPoint, endPoint, inflexionPoint);
        isCompleted = true;
    } else {
        curPoint = firstStep(startPoint, inflexionPoint);
        curDirection = curDirection === 'y' ? 'x' : 'y';
    }
    while(!isCompleted) {
        let curToNode = getPosition(curPoint, node);
        let distance = getDistance(curToNode.orientation, endToNode.orientation);
        if (curToNode.orientation % 2 === 1) {
            if (distance > 1 && distance < 4) {
                curDirection = connectToEnd(curDirection, curPoint, endPoint, inflexionPoint);
                isCompleted = true;
            } else if (distance === 4) {
                curPoint = aroundNode(curDirection, curPoint, endPoint, node, inflexionPoint);
                curDirection = curDirection === 'y' ? 'x' : 'y';
            }
        } else if (curToNode.orientation % 2 === 0) {
            curDirection = connectToEnd(curDirection, curPoint, endPoint, inflexionPoint);
            isCompleted = true;
        }
    }

    return curDirection;
}

function firstStep(startPoint, inflexionPoint) {
    let point = {};
    switch(startPoint.order) {
        case 1:
            [point.x, point.y] = [startPoint.x, startPoint.y - margin];
            break;
        case 2:
            [point.x, point.y] = [startPoint.x + margin, startPoint.y];
            break;
        case 3:
            [point.x, point.y] = [startPoint.x, startPoint.y + margin];
            break;
        case 4:
            [point.x, point.y] = [startPoint.x - margin, startPoint.y];
            break;
    }
    
    inflexionPoint.push(point);
    return point;
}

function getMiddlePoint(startPoint, endPoint, source, target, gap, scene) {
    let point = {};
    let s = 0;
    let right = source.shape.right > target.shape.right ? source.shape.right : target.shape.right;
    let left = source.shape.left < target.shape.left ? source.shape.left : target.shape.left;
    let top = source.shape.top < target.shape.top ? source.shape.top : target.shape.top;
    let bottom = source.shape.bottom > target.shape.bottom ? source.shape.bottom : target.shape.bottom;
    switch (scene) {
        case 1:
            //对于起始节点，起始点与终点的方位差为2，且节点之间存在空隙，定位到空隙中间
            switch(startPoint.order) {
                case 1:
                    s = gap.x > 2 * margin ? margin : gap.x / 2;
                    [point.x, point.y] = [endPoint.x > startPoint.x ? source.shape.right + s : source.shape.left - s, startPoint.y - margin];
                    break;
                case 2:
                    s = gap.y > 2 * margin ? margin : gap.y / 2;
                    [point.x, point.y] = [startPoint.x + margin, endPoint.y > startPoint.y ? source.shape.bottom + s : source.shape.top - s];
                    break;
                case 3:
                    s = gap.x > 2 * margin ? margin : gap.x / 2;
                    [point.x, point.y] = [endPoint.x > startPoint.x ? source.shape.right + s : source.shape.left - s, startPoint.y + margin];
                    break;
                case 4:
                    s = gap.y > 2 * margin ? margin : gap.y / 2;
                    [point.x, point.y] = [startPoint.x - margin, endPoint.y > startPoint.y ? source.shape.bottom + s : source.shape.top - s];
                    break;
            }
            break;
        case 2:
            //对于起始节点，起始点与终点的方位差为3或4，且节点之间存在空隙，定位到空隙中间
            switch(startPoint.order) {
                case 1:
                    s = gap.y > 2 * margin ? margin : gap.y / 2;
                    [point.x, point.y] = [endPoint.x > startPoint.x ? source.shape.right + margin : source.shape.left - margin, source.shape.bottom + s];
                    break;
                case 2:
                    s = gap.x > 2 * margin ? margin : gap.x / 2;
                    [point.x, point.y] = [source.shape.left - s, endPoint.y > startPoint.y ? source.shape.bottom + margin : source.shape.top - margin];
                    break;
                case 3:
                    s = gap.y > 2 * margin ? margin : gap.y / 2;
                    [point.x, point.y] = [endPoint.x > startPoint.x ? source.shape.right + margin : source.shape.left - margin, source.shape.top - s];
                    break;
                case 4:
                    s = gap.x > 2 * margin ? margin : gap.x / 2;
                    [point.x, point.y] = [source.shape.right + s, endPoint.y > startPoint.y ? source.shape.bottom + margin : source.shape.top - margin];
                    break;
            }
            break;
        case 3:
            //节点之间不存在空隙，视两节点为整体，定位到整体的一角
            switch(startPoint.order) {
                case 1:
                    [point.x, point.y] = [endPoint.x > startPoint.x ? right + margin : left - margin, top - margin];
                    break;
                case 2:
                    [point.x, point.y] = [right + margin, endPoint.y > startPoint.y ? bottom + margin : top - margin];
                    break;
                case 3:
                    [point.x, point.y] = [endPoint.x > startPoint.x ? right + margin : left - margin, bottom + margin];
                    break;
                case 4:
                    [point.x, point.y] = [left - margin, endPoint.y > startPoint.y ? bottom + margin : top - margin];
                    break;
            }
            break;
        case 4:
            //节点之间不存在空隙，视两节点为整体,从起点按起始方向前进margin距离
            switch(startPoint.order) {
                case 1:
                    [point.x, point.y] = [startPoint.x, top - margin];
                    break;
                case 2:
                    [point.x, point.y] = [right + margin, startPoint.y];
                    break;
                case 3:
                    [point.x, point.y] = [startPoint.x, bottom + margin];
                    break;
                case 4:
                    [point.x, point.y] = [left - margin, startPoint.y];
                    break;
            }
            break;
        case 5:
            //节点之间不存在空隙，反向绕开
            if ((startPoint.order === 1 && endPoint.order === 4) || (startPoint.order === 4 && endPoint.order === 1)) {
                [point.x, point.y] = [source.shape.left - margin, source.shape.top - margin];
            } else if ((startPoint.order === 1 && endPoint.order === 2) || (startPoint.order === 2 && endPoint.order === 1)) {
                [point.x, point.y] = [source.shape.right + margin, source.shape.top - margin];
            } else if ((startPoint.order === 3 && endPoint.order === 4) || (startPoint.order === 4 && endPoint.order === 3)) {
                [point.x, point.y] = [source.shape.left - margin, source.shape.bottom + margin];
            } else if ((startPoint.order === 3 && endPoint.order === 2) || (startPoint.order === 2 && endPoint.order === 3)) {
                [point.x, point.y] = [source.shape.right + margin, source.shape.bottom + margin];
            }
            break;
    }
    
    return point;
}

//从指定点出发绕过节点至节点锚点
function pointToAnchor(node, startPoint, endPoint, curDirection, inflexionPoint) {
    let endToNode = getPositionForAnchor(endPoint.order);
    let isCompleted = false;
    let curPoint = startPoint;

    while(!isCompleted) {
        let curToNode = getPosition(curPoint, node);
        let distance = getDistance(curToNode.orientation, endToNode.orientation);
        if (curToNode.orientation % 2 === 1) {
            if (distance === 0) {
                connectToEnd(curDirection, curPoint, endPoint, inflexionPoint);
                isCompleted = true;
            } else if (distance === 4) {
                curPoint = aroundNode(curDirection, curPoint, endPoint, node, inflexionPoint, false);
                curDirection = curDirection === 'y' ? 'x' : 'y';
            } else {
                curPoint = aroundNode(curDirection, curPoint, endPoint, node, inflexionPoint);
                curDirection = curDirection === 'y' ? 'x' : 'y';
            }
        } else if (curToNode.orientation % 2 === 0) {
            if (distance < 3) {
                connectToEnd(curDirection, curPoint, endPoint, inflexionPoint);
                isCompleted = true;
            } else {
                curPoint = aroundNode(curDirection, curPoint, endPoint, node, inflexionPoint);
                curDirection = curDirection === 'y' ? 'x' : 'y';
            }
        }
    }
}

//从指定点直接连接至终点
function connectToEnd(curDirection, curPoint, endPoint, inflexionPoint) {
    let point = {};
    if (curDirection === 'x' && curPoint.y !== endPoint.y) {
        [point.x, point.y] = [endPoint.x, curPoint.y];
        if (inflexionPoint.length > 0 && inflexionPoint[inflexionPoint.length - 1].x === point.x 
        && inflexionPoint[inflexionPoint.length - 1].y === point.y) {
            inflexionPoint.pop();
        }
        else{
            inflexionPoint.push(point);
        }
        curDirection = curDirection === 'y' ? 'x' : 'y';
    } else if (curDirection === 'y' && curPoint.x !== endPoint.x) {
        [point.x, point.y] = [curPoint.x, endPoint.y];
        if (inflexionPoint.length > 0 && inflexionPoint[inflexionPoint.length - 1].x === point.x 
        && inflexionPoint[inflexionPoint.length - 1].y === point.y) {
            inflexionPoint.pop();
        }
        else{
            inflexionPoint.push(point);
        }
        curDirection = curDirection === 'y' ? 'x' : 'y';
    }

    return curDirection;
}

//环绕节点寻路
function aroundNode(curDirection, curPoint, endPoint, node, inflexionPoint, flag = true) {
    let point = {};
    if (curDirection === 'x') {
        if (!(endPoint.x < curPoint.x ^ flag)) {
            [point.x, point.y] = [node.shape.left - margin, curPoint.y];
        } else {
            [point.x, point.y] = [node.shape.right + margin, curPoint.y];
        }
    } else {
        if (!(endPoint.y < curPoint.y ^ flag)) {
            [point.x, point.y] = [curPoint.x, node.shape.top - margin];
        } else {
            [point.x, point.y] = [curPoint.x, node.shape.bottom + margin];
        }
    }
    inflexionPoint.push(point);
    return point;
}

//折线连接
function polylineConnect(curDirection, startPoint, endPoint, inflexionPoint) {
    let point1 = {};
    let point2 = {};
    if (curDirection === 'y' && startPoint.x !== endPoint.x) {
        [point1.x, point1.y] = [startPoint.x, (endPoint.y + startPoint.y) / 2];
        inflexionPoint.push(point1);
        [point2.x, point2.y] = [endPoint.x, point1.y];
        inflexionPoint.push(point2);
    } else if (curDirection === 'x' && startPoint.y !== endPoint.y) {
        [point1.x, point1.y] = [(startPoint.x + startPoint.x) / 2, endPoint.y];
        inflexionPoint.push(point1);
        [point2.x, point2.y] = [point1.x, endPoint.y];
        inflexionPoint.push(point2);
    }
}

//获得两个节点之间的空隙
function getGap(node1, node2) {
    let gap = {};
    if (node1.shape.center.x < node2.shape.center.x) {
        gap.x = node2.shape.left - node1.shape.right;
    } else {
        gap.x = node1.shape.left - node2.shape.right;
    }

    if (node1.shape.center.y < node2.shape.center.y) {
        gap.y = node2.shape.top - node1.shape.bottom;
    } else {
        gap.y = node1.shape.top - node2.shape.bottom;
    }
    return gap;
}

//根据锚点信息获取其与节点位置信息
function getPositionForAnchor(order) {
    let position ={};
    position.distanceX = 0;
    position.distanceY = 0;
    switch(order) {
        case 1:
            position.orientation = orientation.north;
            break;
        case 2:
            position.orientation = orientation.east;
            break;
        case 3:
            position.orientation = orientation.south;
            break;
        case 4:
            position.orientation = orientation.west;
            break;
    }

    return position;
}

//获得点相对于节点的位置信息
function getPosition(point, node) {
    let position ={};
    const flag1 = node.shape.top > point.y;
    const flag2 = node.shape.bottom < point.y;
    const flag3 = node.shape.left > point.x;
    const flag4 = node.shape.right < point.x;
    if (flag1 && flag3) {
        position.orientation = orientation.northWest;
    } else if (flag1 && flag4) {
        position.orientation = orientation.northEast;
    } else if (flag1 && !flag3 && !flag4) {
        position.orientation = orientation.north;
    } else if (flag2 && flag3) {
        position.orientation = orientation.southWest;
    } else if (flag2 && flag4) {
        position.orientation = orientation.southEast;
    } else if (flag2 && !flag3 && !flag4) {
        position.orientation = orientation.south;
    } else if (!flag1 && !flag2 && flag3) {
        position.orientation = orientation.west;
    } else if (!flag1 && !flag2 && flag4) {
        position.orientation = orientation.east;
    } else {
        position.orientation = null;
    }

    return position;
}

//方位之间的距离
function getDistance(orientation1, orientation2) {
    let distance = Math.abs(orientation2 - orientation1);
    //最大距离为4
    if (distance > 4) {
        distance = 8 - distance;
    }
    return distance;
}