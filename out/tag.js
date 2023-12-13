"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parse_1 = require("./parse");
function tag(s) {
    return (0, parse_1.P)((i) => {
        if (i.end - i.start < s.length) {
            return (0, parse_1.reject)({ location: i, reason: parse_1.ParseErrorReason.EOF });
        }
        else if (i.source.slice(i.start, s.length) === s) {
            return (0, parse_1.success)(i, s.length, s);
        }
        else {
            return (0, parse_1.reject)({ location: i, reason: parse_1.ParseErrorReason.TagError });
        }
    });
}
exports.default = tag;
