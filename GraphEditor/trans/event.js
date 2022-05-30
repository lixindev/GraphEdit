'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var selectedElement = void 0,
    click = void 0,
    save = void 0,
    undo = void 0,
    redo = void 0;
if (Event instanceof Function) {
    selectedElement = new Event('selectedElement');
    click = new Event('canvasClick');
    save = new Event('save');
    undo = new Event('undo');
    redo = new Event('redo');
} else {
    selectedElement = document.createEvent('Event');
    click = document.createEvent('Event');
    save = document.createEvent('Event');
    undo = document.createEvent('Event');
    redo = document.createEvent('Event');

    selectedElement.initEvent('selectedElement', false, false);
    click.initEvent('canvasClick', false, false);
    save.initEvent('save', false, false);
    undo.initEvent('undo', false, false);
    redo.initEvent('redo', false, false);
}

exports.default = {
    selectedElement: selectedElement,
    click: click,
    save: save,
    undo: undo,
    redo: redo
};