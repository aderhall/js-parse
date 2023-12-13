"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.P = exports.Parser = exports.fatal = exports.reject = exports.success = exports.ParseErrorReason = void 0;
const error_1 = require("./error");
const option_1 = require("./option");
const sequence_1 = require("./sequence");
const transform_1 = require("./transform");
var ParseErrorReason;
(function (ParseErrorReason) {
    ParseErrorReason["EOF"] = "End of file before input could be recognized";
    ParseErrorReason["Tag"] = "Input does not match search string";
    ParseErrorReason["Alt"] = "All child parsers rejected the input";
    ParseErrorReason["Alpha"] = "Expected alphabetical character";
    ParseErrorReason["DecDigit"] = "Expected decimal digit character";
    ParseErrorReason["HexDigit"] = "Expected hexadecimal digit character";
    ParseErrorReason["AlphaNum"] = "Expected alphanumeric character";
    ParseErrorReason["UpperCase"] = "Expected uppercase character";
    ParseErrorReason["LowerCase"] = "Expected lowercase character";
    ParseErrorReason["RemainingInput"] = "Unparsable remainder at end of input";
})(ParseErrorReason || (exports.ParseErrorReason = ParseErrorReason = {}));
function success(i, length, result) {
    return {
        success: true,
        parsed: {
            consumed: {
                source: i.source,
                start: i.start,
                end: i.start + length,
            },
            rest: {
                source: i.source,
                start: i.start + length,
                end: i.end,
            },
            output: result,
        }
    };
}
exports.success = success;
function reject(error) {
    return {
        success: false,
        fatal: false,
        error: error,
    };
}
exports.reject = reject;
function fatal(error) {
    return {
        success: false,
        fatal: true,
        error: error,
    };
}
exports.fatal = fatal;
class Parser {
    constructor(parse, parseFragment) {
        this.parse = parse.bind(this);
        this.parseFragment = parseFragment.bind(this);
    }
    /** Applies a transformation to the parsed output if the parser succeeds. */
    map(transform) {
        return (0, transform_1.map)(this, transform);
    }
    /** In case of inner parser returning an error, applies a transformation to that error. */
    mapError(transform) {
        return (0, error_1.mapError)(this, transform);
    }
    /** Applies a transformation to the ParseResult output of the inner parser. */
    mapResult(transform) {
        return (0, error_1.mapResult)(this, transform);
    }
    /** Applies a second parser on the remaining input and returns both outputs in a tuple. */
    then(parser) {
        return (0, sequence_1.pair)(this, parser);
    }
    /** Matches the parser multiple times, up to infinitely many times or `maxLength` if specified. Returns an array of their outputs. */
    repeat(maxLength) {
        return (0, sequence_1.repeat)(this, maxLength);
    }
    precedes(parser) {
        return (0, sequence_1.preceded)(this, parser);
    }
    terminates(parser) {
        return (0, sequence_1.terminated)(parser, this);
    }
    prefix(prefix) {
        return (0, sequence_1.preceded)(prefix, this);
    }
    suffix(suffix) {
        return (0, sequence_1.terminated)(this, suffix);
    }
    delimitedBy(left, right) {
        return (0, sequence_1.delimited)(left, this, right);
    }
    /**
     * Catches `reject` errors and "hardens" them to `fatal` errors.
     * This function confirms that this parsing branch is the only possible correct one. If the input fails to match the parser, the input is assumed to be invalid.
     */
    cut() {
        return (0, error_1.cut)(this);
    }
    /**
     * Catches `fatal` errors and "softens" them to `reject` errors.
     * This function allows input deemed invalid to be retried with a different parser.
     */
    uncut() {
        return (0, error_1.uncut)(this);
    }
    /** Requires the inner parser to match all the remaining input. Returns a `reject` error otherwise. */
    complete() {
        return (0, error_1.complete)(this);
    }
    optional() {
        return (0, option_1.optional)(this);
    }
    orDefault(defaultValue) {
        return (0, option_1.orDefault)(this, defaultValue);
    }
    next(parser) {
        return (0, error_1.mapResult)((0, transform_1.recognize)(this), r1 => {
            if (!r1.success)
                return r1;
            return parser.parseFragment(r1.parsed.consumed);
        });
    }
}
exports.Parser = Parser;
function P(parseFragment) {
    return new Parser((i) => parseFragment({ source: i, start: 0, end: i.length }), parseFragment);
}
exports.P = P;
