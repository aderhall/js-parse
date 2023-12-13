import { P, Parser } from "./parse";
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
