"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.terminated = exports.preceded = exports.delimited = exports.triple = exports.pair = exports.separatedList = exports.string = exports.repeat = exports.sequence = void 0;
const option_1 = require("./option");
const parse_1 = require("./parse");
const transform_1 = require("./transform");
/** Matches multiple concatenated parsers, all with the same output type, and returns an array of their outputs. */
function sequence(...parsers) {
    return (0, parse_1.P)(i => {
        let runningInput = i;
        let runningOutput = [];
        for (const parser of parsers) {
            const result = parser.parseFragment(runningInput);
            if (!result.success)
                return result;
            runningInput = result.parsed.rest;
            runningOutput.push(result.parsed.output);
        }
        return (0, parse_1.success)(i, runningInput.start - i.start, runningOutput);
    });
}
exports.sequence = sequence;
/** Matches the same parser multiple times, up to infinitely many times or `maxLength` if specified. Returns an array of their outputs. */
function repeat(parser, maxLength) {
    return (0, parse_1.P)(i => {
        let runningInput = i;
        let runningOutput = [];
        for (let j = 0; j < (maxLength || Infinity); j++) {
            const result = parser.parseFragment(runningInput);
            if (!result.success) {
                if (result.fatal)
                    return result;
                break;
            }
            runningInput = result.parsed.rest;
            runningOutput.push(result.parsed.output);
        }
        return (0, parse_1.success)(i, runningInput.start - i.start, runningOutput);
    });
}
exports.repeat = repeat;
function string(parsers, maxLength) {
    return (0, transform_1.recognize)(repeat((0, option_1.alt)(...parsers), maxLength));
}
exports.string = string;
function separatedList(item, separator, maxLength) {
    return (0, transform_1.map)(pair(item, repeat(pair(separator, item), maxLength ? maxLength - 1 : undefined)), ([first, pairs]) => [first, ...pairs.map(([_separator, item]) => item)]);
}
exports.separatedList = separatedList;
/** Matches two parsers in succession and returns their outputs in a tuple. */
function pair(p1, p2) {
    return (0, parse_1.P)(i => {
        const r1 = p1.parseFragment(i);
        if (!r1.success)
            return r1;
        const r2 = p2.parseFragment(r1.parsed.rest);
        if (!r2.success)
            return r2;
        return (0, parse_1.success)(i, r2.parsed.rest.start - i.start, [r1.parsed.output, r2.parsed.output]);
    });
}
exports.pair = pair;
function triple(p1, p2, p3) {
    return (0, parse_1.P)(i => {
        const r1 = p1.parseFragment(i);
        if (!r1.success)
            return r1;
        const r2 = p2.parseFragment(r1.parsed.rest);
        if (!r2.success)
            return r2;
        const r3 = p3.parseFragment(r2.parsed.rest);
        if (!r3.success)
            return r3;
        return (0, parse_1.success)(i, r3.parsed.rest.start - i.start, [r1.parsed.output, r2.parsed.output, r3.parsed.output]);
    });
}
exports.triple = triple;
function delimited(left, inner, right) {
    return (0, transform_1.map)(triple(left, inner, right), ([_left, inner, _right]) => inner);
}
exports.delimited = delimited;
function preceded(prefix, main) {
    return (0, transform_1.map)(pair(prefix, main), ([_prefix, main]) => main);
}
exports.preceded = preceded;
function terminated(main, suffix) {
    return (0, transform_1.map)(pair(main, suffix), ([main, _suffix]) => main);
}
exports.terminated = terminated;
