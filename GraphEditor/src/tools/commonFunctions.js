export default {
    generateUUID() {
        let d = new Date().getTime();
        if (window.performance && typeof window.performance.now === "function") {
            d += performance.now(); //use high-precision timer if available
        }
        let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    },
    deepClone(obj) {
        const type = Object.prototype.toString.call(obj);
        if (type !== '[object Object]' && type !== '[object Array]') {
            return null;
        }

        let target = type === '[object Array]' ? [] : {};
        for (const prop in obj) {
            if (Object.hasOwnProperty.call(obj, prop)) {
                const element = obj[prop];
                const elementType = Object.prototype.toString.call(element);
                if (elementType === '[object Object]' || elementType === '[object Array]'){
                    target[prop] = this.deepClone(element);
                } else {
                    target[prop] = element;
                }
            }
        }

        return target;
    }
}