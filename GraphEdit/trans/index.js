'use strict';

require('bootstrap/dist/css/bootstrap.min.css');

require('./assets/css/editor.css');

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

require('popper.js/dist/umd/popper.min');

require('bootstrap/dist/js/bootstrap.min');

require('font-awesome-webpack');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import { GraphEditor } from './graphEditor'

var data = {};
//节点格式
data.nodes = [{
    color: "rgba(200,200,255,1)",
    customProperties: {
        nodestyle: "11"
    },
    edgeColor: "#1890FF",
    id: "9471a484-7a2e-4ca9-949d-6ec4b495a1a2",
    index: 1,
    label: "测试加载节点",
    shape: "rect",
    size: "100*50",
    type: "node",
    x: 282,
    y: 222
}, {
    color: "rgba(200,200,255,1)",
    customProperties: {
        nodestyle: "22"
    },
    edgeColor: "#1890FF",
    id: "9471a484-7a2e-4ca9-949d-6ec4b495a1a3",
    index: 2,
    label: "测试加载判断",
    shape: "rhomb",
    size: "100*80",
    type: "node",
    x: 282,
    y: 422,
    fontSize: "12px"
}];
//线条格式
data.relations = [{
    color: "rgba(0,0,0,1)",
    customProperties: {
        btnstyle: "test"
    },
    index: 3,
    label: "测试线条1",
    fontSize: "12px",
    fromConOrder: 3,
    source: "9471a484-7a2e-4ca9-949d-6ec4b495a1a2",
    type: "relation",
    endPoint: { x: 81, y: 210 },
    inflexionPoint: [{ x: 282, y: 272 }, { x: 81, y: 272 }]
}, {
    color: "rgba(0,0,0,1)",
    customProperties: {
        btnstyle: "test"
    },
    index: 4,
    label: "测试线条2",
    fontSize: "14px",
    toConOrder: 1,
    startPoint: { x: 555, y: 447 },
    target: "9471a484-7a2e-4ca9-949d-6ec4b495a1a3",
    type: "relation",
    inflexionPoint: [{ x: 555, y: 357 }, { x: 282, y: 357 }]
}];
//创建编辑器
function width() {
    return document.documentElement.clientWidth * 7 / 12 - 25;
}
function height() {
    return document.documentElement.clientHeight - 45;
}
var editor = new GraphEditor(width, height);
//编辑器加载数据
//editor.load(data);

//绑定元素容器
editor.itemPannel = 'itempannel';
//绑定详细属性栏
editor.detailPannel = 'detailpannel';
//绑定工具栏
editor.toolbar = 'toolbar';
var nodeDetail = (0, _jquery2.default)('#nodedetail');
var lineDetail = (0, _jquery2.default)('#linedetail');
var nodeName = (0, _jquery2.default)('#nodename');
var lineName = (0, _jquery2.default)('#linename');
var nodeCustom = (0, _jquery2.default)('#nodecustom');
var lineCustom = (0, _jquery2.default)('#linecustom');
var nodeFontSize = (0, _jquery2.default)('#fontsize_node');
var lineFontSize = (0, _jquery2.default)('#fontsize_line');
var lineModel = (0, _jquery2.default)('#linemodel');

//选择元素事件
editor.on('selectedElement', function (e) {
    if (e.element && e.element.isNode) {
        lineDetail.hide();
        nodeDetail.show();
        nodeName.val(e.element.label);
        nodeFontSize.val(e.element.fontSize);
        nodeCustom.val(e.element.customProperties.nodestyle);
    } else if (e.element && e.element.isLine) {
        nodeDetail.hide();
        lineDetail.show();
        lineName.val(e.element.label);
        lineFontSize.val(e.element.fontSize);
        lineModel.val(e.element.lineModel);
        lineCustom.val(e.element.customProperties.btnstyle);
    }
});
//点击画布事件
editor.on('click', function (e) {
    if (!e.element) {
        nodeDetail.hide();
        lineDetail.hide();
    }
});
//撤销事件
editor.on('undo', function (e) {
    nodeDetail.hide();
    lineDetail.hide();
});
//重做事件
editor.on('redo', function (e) {
    nodeDetail.hide();
    lineDetail.hide();
});
//保存事件
editor.on('save', function (e) {
    console.log(e.data);
});

nodeName.on('change', function (e) {
    updateEditor(e, 'label');
});

lineName.on('change', function (e) {
    updateEditor(e, 'label');
});

nodeFontSize.on('change', function (e) {
    updateEditor(e, 'fontSize');
});

lineFontSize.on('change', function (e) {
    updateEditor(e, 'fontSize');
});

lineModel.on('change', function (e) {
    updateEditor(e, 'lineModel');
});

nodeCustom.on('change', function (e) {
    updateEditor(e, 'nodestyle');
});

lineCustom.on('change', function (e) {
    updateEditor(e, 'btnstyle');
});

function updateEditor(e, name) {
    var property = {};
    property.name = name;
    property.value = (0, _jquery2.default)('#' + e.target.id).val();
    if (editor.selectedElement) {
        editor.update(editor.selectedElement.id, property);
    };
}