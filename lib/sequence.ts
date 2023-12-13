import { alt } from "./option";
import { P, Parser, success } from "./parse";
import { Length, Slice } from "./parseInput";
import { map, recognize } from "./transform";

/** Matches multiple concatenated parsers, all with the same output type, and returns an array of their outputs. */
export function sequence<I extends Length, O>(...parsers: Parser<I, O>[]): Parser<I, O[]> {
    return P(i => {
        let runningInput = i;
        let runningOutput = [];
        for (const parser of parsers) {
            const result = parser.parseFragment(runningInput);
            if (!result.success) return result;
            runningInput = result.parsed.rest;
            runningOutput.push(result.parsed.output);
        }
        return success(i, runningInput.start - i.start, runningOutput);
    });
}

/** Matches the same parser multiple times, up to infinitely many times or `maxLength` if specified. Returns an array of their outputs. */
export function repeat<I extends Length, O>(parser: Parser<I, O>, maxLength?: number): Parser<I, O[]> {
    return P(i => {
        let runningInput = i;
        let runningOutput = [];
        for (let j = 0; j < (maxLength || Infinity); j++) {
            const result = parser.parseFragment(runningInput);
            if (!result.success) {
                if (result.fatal) return result;
                break;
            }
            runningInput = result.parsed.rest;
            runningOutput.push(result.parsed.output);
        }
        return success(i, runningInput.start - i.start, runningOutput);
    })
}

export function string<I extends Length & Slice<I>, O>(parsers: Parser<I, O>[], maxLength?: number): Parser<I, I> {
    return recognize(repeat(alt(...parsers), maxLength));
}

export function separatedList<I extends Length, O>(item: Parser<I, O>, separator: Parser<I, any>, maxLength?: number): Parser<I, O[]> {
    return map(
        pair(
            item,
            repeat(pair(separator, item), maxLength ? maxLength - 1 : undefined)
        ),
        ([first, pairs]) => [first, ...pairs.map(([_separator, item]) => item)]
    );
}

/** Matches two parsers in succession and returns their outputs in a tuple. */
export function pair<I extends Length, O1, O2>(p1: Parser<I, O1>, p2: Parser<I, O2>): Parser<I, [O1, O2]> {
    return P(i => {
        const r1 = p1.parseFragment(i);
        if (!r1.success) return r1;
        const r2 = p2.parseFragment(r1.parsed.rest);
        if (!r2.success) return r2;
        return success(i, r2.parsed.rest.start - i.start, [r1.parsed.output, r2.parsed.output]);
    });
}

export function triple<I extends Length, O1, O2, O3>(p1: Parser<I, O1>, p2: Parser<I, O2>, p3: Parser<I, O3>): Parser<I, [O1, O2, O3]> {
    return P(i => {
        const r1 = p1.parseFragment(i);
        if (!r1.success) return r1;
        const r2 = p2.parseFragment(r1.parsed.rest);
        if (!r2.success) return r2;
        const r3 = p3.parseFragment(r2.parsed.rest);
        if (!r3.success) return r3;
        return success(i, r3.parsed.rest.start - i.start, [r1.parsed.output, r2.parsed.output, r3.parsed.output]);
    })
}

export function delimited<I extends Length, O>(left: Parser<I, any>, inner: Parser<I, O>, right: Parser<I, any>): Parser<I, O> {
    return map(triple(left, inner, right), ([_left, inner, _right]) => inner);
}

export function preceded<I extends Length, O>(prefix: Parser<I, any>, main: Parser<I, O>): Parser<I, O> {
    return map(pair(prefix, main), ([_prefix, main]) => main);
}

export function terminated<I extends Length, O>(main: Parser<I, O>, suffix: Parser<I, any>): Parser<I, O> {
    return map(pair(main, suffix), ([main, _suffix]) => main);
}
