import { P, ParseErrorReason, Parser, reject } from "./parse";
import { Length } from "./parseInput";

/**
 * Catches `reject` errors and "hardens" them to `fatal` errors.
 * This function confirms that this parsing branch is the only possible correct one. If the input fails to match the parser, the input is assumed to be invalid.
 */
export function cut<I extends Length, O>(parser: Parser<I, O>): Parser<I, O> {
    return P(i => {
        const result = parser.parseFragment(i);
        if (!result.success && !result.fatal) return {
            success: false,
            fatal: true,
            error: result.error,
        }
        else return result;
    })
}

/**
 * Catches `fatal` errors and "softens" them to `reject` errors.
 * This function allows input deemed invalid to be retried with a different parser.
 */
export function uncut<I extends Length, O>(parser: Parser<I, O>): Parser<I, O> {
    return P(i => {
        const result = parser.parseFragment(i);
        if (!result.success && result.fatal) return {
            success: false,
            fatal: false,
            error: result.error,
        }
        else return result;
    })
}

/** Requires the inner parser to match all the remaining input. Returns a `reject` error otherwise. */
export function complete<I extends Length, O>(parser: Parser<I, O>): Parser<I, O> {
    return P(i => {
        const result = parser.parseFragment(i);
        if (!result.success) return result;
        // Test if `rest` is empty
        if (result.parsed.rest.start !== result.parsed.rest.end) {
            return reject({ location: result.parsed.rest, reason: ParseErrorReason.RemainingInput })
        }
        return result;
    })
}
