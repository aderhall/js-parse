"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parse_1 = require("./parse");
function alt(...parsers) {
    return (0, parse_1.P)((i) => {
        for (const parser of parsers) {
            const result = parser.parseFragment(i);
            if (result.success || result.fatal)
                return result;
        }
        return (0, parse_1.reject)({
            location: i,
            reason: parse_1.ParseErrorReason.AltError,
        });
    });
}
exports.default = alt;
