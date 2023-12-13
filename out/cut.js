"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parse_1 = require("./parse");
function cut(parser) {
    return (0, parse_1.P)((i) => {
        const result = parser.parseFragment(i);
        if (!result.success && !result.fatal)
            return {
                success: false,
                fatal: true,
                error: result.error,
            };
        else
            return result;
    });
}
exports.default = cut;
