'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    generateUUID: function generateUUID() {
        var d = new Date().getTime();
        if (window.performance && typeof window.performance.now === "function") {
            d += performance.now(); //use high-precision timer if available
        }
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : r & 0x3 | 0x8).toString(16);
        });
        return uuid;
    },
    deepClone: function deepClone(obj) {
        var type = Object.prototype.toString.call(obj);
        if (type !== '[object Object]' && type !== '[object Array]') {
            return null;
        }

        var target = type === '[object Array]' ? [] : {};
        for (var prop in obj) {
            if (Object.hasOwnProperty.call(obj, prop)) {
                var element = obj[prop];
                var elementType = Object.prototype.toString.call(element);
                if (elementType === '[object Object]' || elementType === '[object Array]') {
                    target[prop] = this.deepClone(element);
                } else {
                    target[prop] = element;
                }
            }
        }

        return target;
    }
};