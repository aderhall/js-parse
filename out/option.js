"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orDefault = exports.optional = exports.alt = void 0;
const parse_1 = require("./parse");
const transform_1 = require("./transform");
function alt(...parsers) {
    return (0, parse_1.P)(i => {
        for (const parser of parsers) {
            const result = parser.parseFragment(i);
            if (result.success || result.fatal)
                return result;
        }
        return (0, parse_1.reject)({
            location: i,
            reason: parse_1.ParseErrorReason.Alt,
        });
    });
}
exports.alt = alt;
function optional(parser) {
    return (0, parse_1.P)(i => {
        const result = parser.parseFragment(i);
        if (result.success || result.fatal)
            return result;
        return (0, parse_1.success)(i, 0, null);
    });
}
exports.optional = optional;
function orDefault(parser, defaultValue) {
    return (0, transform_1.map)(optional(parser), i => i || defaultValue);
}
exports.orDefault = orDefault;
