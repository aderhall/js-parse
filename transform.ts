import { P, ParseError, ParseResult, Parser } from "./parse";
import { Length, Slice } from "./parseInput";

/**
 * Applies a transformation to the parsed output if the parser succeeds.
 */
export function map<I extends Length, O1, O2>(parser: Parser<I, O1>, transform: (i: O1) => O2): Parser<I, O2> {
    return P(i => {
        const result = parser.parseFragment(i);
        if (result.success) return {
            ...result,
            parsed: {
                ...result.parsed,
                output: transform(result.parsed.output)
            },
        }
        else return result;
    });
}

/**
 * Produces a parser that outputs the consumed input of its inner parser.
 */
export function recognize<I extends Length & Slice<I>>(parser: Parser<I, any>): Parser<I, I> {
    return P(i => {
        const result = parser.parseFragment(i);
        if (!result.success) return result;
        return {
            ...result,
            parsed: {
                ...result.parsed,
                output: result.parsed.consumed.source.slice(result.parsed.consumed.start, result.parsed.consumed.end)
            }
        }
    })
}

/**
 * In case of inner parser returning an error, applies a transformation to that error.
 */

export function mapError<I extends Length, O>(parser: Parser<I, O>, transform: (err: ParseError<I>) => ParseError<I>): Parser<I, O> {
    return P(i => {
        const result = parser.parseFragment(i);
        if (result.success) return result;
        return {
            ...result,
            error: transform(result.error)
        };
    });
}

/**
 * Applies a transformation to the ParseResult output of the inner parser.
 */
export function mapResult<I extends Length, O1, O2>(parser: Parser<I, O1>, transform: (i: ParseResult<I, O1>) => ParseResult<I, O2>): Parser<I, O2> {
    return P(i => transform(parser.parseFragment(i)));
}
