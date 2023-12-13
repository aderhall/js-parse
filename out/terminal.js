"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toHexInt = exports.hexDigit = exports.toDecInt = exports.decDigit = exports.alpha = exports.alphanum = exports.oneOf = exports.tag = void 0;
const parse_1 = require("./parse");
const sequence_1 = require("./sequence");
const transform_1 = require("./transform");
/** Matches the exact target `t`. */
function tag(t) {
    return (0, parse_1.P)(i => {
        if (i.end - i.start < t.length) {
            return (0, parse_1.reject)({ location: i, reason: parse_1.ParseErrorReason.EOF });
        }
        else if (i.source.slice(i.start, i.start + t.length) === t) {
            return (0, parse_1.success)(i, t.length, t);
        }
        else {
            return (0, parse_1.reject)({ location: i, reason: parse_1.ParseErrorReason.Tag });
        }
    });
}
exports.tag = tag;
/** Matches any character in the provided string `chars` */
function oneOf(chars) {
    return (0, parse_1.P)(i => {
        if (i.end - i.start > 0) {
            if (chars.indexOf(i.source.charAt(i.start)) !== -1) {
                return (0, parse_1.success)(i, 1, i.source.charAt(i.start));
            }
            else
                return (0, parse_1.reject)({ location: i, reason: parse_1.ParseErrorReason.Alt });
        }
        else
            return (0, parse_1.reject)({ location: i, reason: parse_1.ParseErrorReason.EOF });
    });
}
exports.oneOf = oneOf;
exports.alphanum = (0, parse_1.P)(i => {
    if (i.end - i.start > 0) {
        const code = i.source.charCodeAt(i.start);
        if ((code > 47 && code < 58) || // numeric (0-9)
            (code > 64 && code < 91) || // upper alpha (A-Z)
            (code > 96 && code < 123) // lower alpha (a-z)
        ) {
            return (0, parse_1.success)(i, 1, i.source.charAt(i.start));
        }
        else
            return (0, parse_1.reject)({ location: i, reason: parse_1.ParseErrorReason.AlphaNum });
    }
    else
        return (0, parse_1.reject)({ location: i, reason: parse_1.ParseErrorReason.EOF });
});
exports.alpha = (0, parse_1.P)(i => {
    if (i.end - i.start > 0) {
        const code = i.source.charCodeAt(i.start);
        if ((code > 64 && code < 91) || // upper alpha (A-Z)
            (code > 96 && code < 123) // lower alpha (a-z)
        ) {
            return (0, parse_1.success)(i, 1, i.source.charAt(i.start));
        }
        else
            return (0, parse_1.reject)({ location: i, reason: parse_1.ParseErrorReason.Alpha });
    }
    else
        return (0, parse_1.reject)({ location: i, reason: parse_1.ParseErrorReason.EOF });
});
exports.decDigit = (0, parse_1.P)(i => {
    if (i.end - i.start > 0) {
        const code = i.source.charCodeAt(i.start);
        if ((code > 47 && code < 58)) {
            return (0, parse_1.success)(i, 1, i.source.charAt(i.start));
        }
        else
            return (0, parse_1.reject)({ location: i, reason: parse_1.ParseErrorReason.DecDigit });
    }
    else
        return (0, parse_1.reject)({ location: i, reason: parse_1.ParseErrorReason.EOF });
});
exports.toDecInt = (0, transform_1.map)((0, transform_1.recognize)((0, sequence_1.repeat)(exports.decDigit)), parseInt);
exports.hexDigit = (0, parse_1.P)(i => {
    if (i.end - i.start > 0) {
        const code = i.source.charCodeAt(i.start);
        if ((code > 47 && code < 58) || // numeric (0-9)
            (code > 64 && code < 71) || // upper alpha (A-F)
            (code > 96 && code < 103) // lower alpha (a-f)
        ) {
            return (0, parse_1.success)(i, 1, i.source.charAt(i.start));
        }
        else
            return (0, parse_1.reject)({ location: i, reason: parse_1.ParseErrorReason.HexDigit });
    }
    else
        return (0, parse_1.reject)({ location: i, reason: parse_1.ParseErrorReason.EOF });
});
exports.toHexInt = (0, transform_1.map)((0, transform_1.recognize)((0, sequence_1.repeat)(exports.hexDigit)), s => parseInt(s, 16));
