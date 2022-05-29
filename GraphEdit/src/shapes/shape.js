import { Connector } from './connector'
import { NodeAnchor } from './nodeAnchor'
import { Base } from './base'
import { NodeController } from './nodeController'
import Settings from '../tools/settings'

export class Shape extends Base{
    constructor(params, canvas){
        super(params, canvas);        
        this.type = params.shape;
        this.width = params.width;
        this.height = params.height;
        this.x = params.x;
        this.y = params.y;
        if (params.text) {
            this.text = params.text;
        }
        this.connector = new Connector(this, canvas);
        this.anchor = new NodeAnchor(this, canvas);
        this.controller = new NodeController(this, canvas);
    }

    get top(){
        return this.y - this.height/2;
    }

    get bottom(){
        return this.y + this.height/2;
    }

    get left(){
        return this.x - this.width/2;
    }

    get right(){
        return this.x + this.width/2;
    }

    get center(){
        return { x: this.x, y: this.y };
    }

    //处理文字信息
    fillText(){
        let context = this.ctx; 
        if (!context) return;
        if(this.text && this.text.content){
            context.lineWidth = 1;
            context.fillStyle = 'rgba(0, 0, 0, 1)';
            if (this.text.fontSize){
                context.font = this.text.fontSize + ' ' + Settings.defaultFont.fontFamily;
            } else {
                context.font = Settings.defaultFont.nodeFontSize + ' ' + Settings.defaultFont.fontFamily;
                this.text.fontSize = Settings.defaultFont.nodeFontSize;
            }

            let content = this.text.content;
            let size = parseInt((this.text.fontSize || Settings.defaultFont.nodeFontSize).replace('px', ''));
            let chars = content.split("");
            let temp = "";
            let rows = [];
            for (let i = 0; i < chars.length; i++) {
                if (context.measureText(temp).width < this.width && context.measureText(temp+(chars[i])).width <= this.width) {
                    temp += chars[i];;
                } else {
                    rows.push(temp);
                    temp = chars[i];
                }
            }
            rows.push(temp);

            context.textAlign = this.text.textAlign ? this.text.textAlign : 'center';
            context.textBaseline = this.text.textBaseline ? this.text.textBaseline : 'middle';

            let start_x, start_y;
            switch(context.textAlign) {
                case 'center':
                    start_x = this.center.x;
                    break;
                case 'left':
                    start_x = this.left + 1;
                    break;
                case 'right':
                    start_x = this.right - 1;
                    break;
            }

            switch(context.textBaseline) {
                case 'middle':
                    start_y = this.center.y - (rows.length - 1)/2 * (size + 1);
                    break;
                case 'top':
                    start_y = this.top + 1;
                    break;
                case 'bottom':
                    start_y = this.bottom - (rows.length - 1) * (size + 1);
                    break;
            }
            for (let index = 0; index < rows.length; index++) {
                const row = rows[index];
                context.fillText(row, start_x, start_y + (size + 1) * index);
            }
        }
    }

    //选择元素渲染
    selectShape(){
        this.controller.draw();
    }

    //移出区域取消悬停效果
    hitCheck_Over(x, y){
        if (x >= this.left - 20 && x <= this.right + 20 && y >= this.top - 20 && y <= this.bottom + 20){
            return true;
        } else {
            return false;
        }
    }

    nodeResizing(nodeResizeCache, length){
        //Virtual Function
        return length;
    }
}