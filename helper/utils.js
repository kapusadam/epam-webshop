"use strict";

Number.isInteger = Number.isInteger || function(value) {
        return typeof value === "number" &&
            isFinite(value) &&
            Math.floor(value) === value;
    };

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.min = min;
function min(arr) {
    return arr.map(function (item) {
        return +item;
    }).filter(function (item) {
        return Number.isInteger(item);
    }).reduce(function (current, next) {
        return current < next ? current : next;
    });
}