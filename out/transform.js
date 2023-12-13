"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recognize = exports.map = void 0;
const parse_1 = require("./parse");
/**
 * Applies a transformation to the parsed output if the parser succeeds.
 */
function map(parser, transform) {
    return (0, parse_1.P)(i => {
        const result = parser.parseFragment(i);
        if (result.success)
            return Object.assign(Object.assign({}, result), { parsed: Object.assign(Object.assign({}, result.parsed), { output: transform(result.parsed.output) }) });
        else
            return result;
    });
}
exports.map = map;
/**
 * Produces a parser that outputs the consumed input of its inner parser.
 */
function recognize(parser) {
    return (0, parse_1.P)(i => {
        const result = parser.parseFragment(i);
        if (!result.success)
            return result;
        return Object.assign(Object.assign({}, result), { parsed: Object.assign(Object.assign({}, result.parsed), { output: result.parsed.consumed.source.slice(result.parsed.consumed.start, result.parsed.consumed.end) }) });
    });
}
exports.recognize = recognize;
