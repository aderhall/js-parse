"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapResult = exports.mapError = exports.complete = exports.uncut = exports.cut = void 0;
const parse_1 = require("./parse");
/**
 * Catches `reject` errors and "hardens" them to `fatal` errors.
 * This function confirms that this parsing branch is the only possible correct one. If the input fails to match the parser, the input is assumed to be invalid.
 */
function cut(parser) {
    return (0, parse_1.P)(i => {
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
exports.cut = cut;
/**
 * Catches `fatal` errors and "softens" them to `reject` errors.
 * This function allows input deemed invalid to be retried with a different parser.
 */
function uncut(parser) {
    return (0, parse_1.P)(i => {
        const result = parser.parseFragment(i);
        if (!result.success && result.fatal)
            return {
                success: false,
                fatal: false,
                error: result.error,
            };
        else
            return result;
    });
}
exports.uncut = uncut;
/** Requires the inner parser to match all the remaining input. Returns a `reject` error otherwise. */
function complete(parser) {
    return (0, parse_1.P)(i => {
        const result = parser.parseFragment(i);
        if (!result.success)
            return result;
        // Test if `rest` is empty
        if (result.parsed.rest.start !== result.parsed.rest.end) {
            return (0, parse_1.reject)({ location: result.parsed.rest, reason: parse_1.ParseErrorReason.RemainingInput });
        }
        return result;
    });
}
exports.complete = complete;
/**
 * In case of inner parser returning an error, applies a transformation to that error.
 */
function mapError(parser, transform) {
    return (0, parse_1.P)(i => {
        const result = parser.parseFragment(i);
        if (result.success)
            return result;
        return Object.assign(Object.assign({}, result), { error: transform(result.error) });
    });
}
exports.mapError = mapError;
/**
 * Applies a transformation to the ParseResult output of the inner parser.
 */
function mapResult(parser, transform) {
    return (0, parse_1.P)(i => transform(parser.parseFragment(i)));
}
exports.mapResult = mapResult;
