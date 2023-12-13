import { P, ParseErrorReason, Parser, reject, success } from "./parse";
import { Length } from "./parseInput";
import { map } from "./transform";

export function alt<I extends Length, O>(...parsers: Parser<I, O>[]): Parser<I, O> {
    return P(i => {
        for (const parser of parsers) {
            const result = parser.parseFragment(i);
            if (result.success || result.fatal) return result;
        }
        return reject({
            location: i,
            reason: ParseErrorReason.Alt,
        })
    });
}

export function optional<I extends Length, O>(parser: Parser<I, O>): Parser<I, O | null> {
    return P(i => {
        const result = parser.parseFragment(i);
        if (result.success || result.fatal) return result;
        return success(i, 0, null);
    })
}

export function orDefault<I extends Length, O>(parser: Parser<I, O>, defaultValue: O): Parser<I, O> {
    return map(optional(parser), i => i || defaultValue);
}
