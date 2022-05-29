'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var settings = {
    ratio: 1.25,
    elementTypes: { node: 'node', relation: 'relation' },
    properties: ['label', 'fontSize', 'lineModel', 'textAlign', 'textBaseline'],
    defaultFont: { nodeFontSize: '16px', relationFontSize: '14px', fontFamily: 'Microsoft Yahei' },
    lineOperations: { startPointChange: 'startPointChange', endPointChange: 'endPointChange', middlePathChange: 'middlePathChange' }
};

exports.default = settings;