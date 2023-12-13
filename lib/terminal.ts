import { P, ParseErrorReason, Parser, reject, success } from "./parse";
import { Length, Slice } from "./parseInput";
import { repeat } from "./sequence";
import { map, recognize } from "./transform";

/** Matches the exact target `t`. */
export function tag<I extends Length & Slice<I>>(t: I): Parser<I, I> {
    return P(i => {
        if (i.end - i.start < t.length) {
            return reject({ location: i, reason: ParseErrorReason.EOF });
        } else if (i.source.slice(i.start, i.start + t.length) === t) {
            return success(i, t.length, t);
        } else {
            return reject({ location: i, reason: ParseErrorReason.Tag })
        }
    });
}

/** Matches any character in the provided string `chars` */
export function charIn(chars: string): Parser<string, string> {
    return P(i => {
        if (i.end - i.start > 0) {
            if (chars.indexOf(i.source.charAt(i.start)) !== -1) {
                return success(i, 1, i.source.charAt(i.start));
            } else return reject({ location: i, reason: ParseErrorReason.Alt });

        }
        else return reject({ location: i, reason: ParseErrorReason.EOF });
    })
}

export const alphanum: Parser<string, string> = P(i => {
    if (i.end - i.start > 0) {
        const code = i.source.charCodeAt(i.start);
        if ((code > 47 && code < 58) || // numeric (0-9)
            (code > 64 && code < 91) || // upper alpha (A-Z)
            (code > 96 && code < 123)   // lower alpha (a-z)
        ) {
            return success(i, 1, i.source.charAt(i.start));
        } else return reject({ location: i, reason: ParseErrorReason.AlphaNum });
    } else return reject({ location: i, reason: ParseErrorReason.EOF });
});

export const alpha: Parser<string, string> = P(i => {
    if (i.end - i.start > 0) {
        const code = i.source.charCodeAt(i.start);
        if ((code > 64 && code < 91) || // upper alpha (A-Z)
            (code > 96 && code < 123)   // lower alpha (a-z)
        ) {
            return success(i, 1, i.source.charAt(i.start));
        } else return reject({ location: i, reason: ParseErrorReason.Alpha });
    } else return reject({ location: i, reason: ParseErrorReason.EOF });
});

export const decDigit: Parser<string, string> = P(i => {
    if (i.end - i.start > 0) {
        const code = i.source.charCodeAt(i.start);
        if ((code > 47 && code < 58)
        ) {
            return success(i, 1, i.source.charAt(i.start));
        } else return reject({ location: i, reason: ParseErrorReason.DecDigit });
    } else return reject({ location: i, reason: ParseErrorReason.EOF });
});

export const toDecInt: Parser<string, number> = map(recognize(repeat(decDigit)), parseInt);

export const hexDigit: Parser<string, string> = P(i => {
    if (i.end - i.start > 0) {
        const code = i.source.charCodeAt(i.start);
        if ((code > 47 && code < 58) || // numeric (0-9)
            (code > 64 && code < 71) || // upper alpha (A-F)
            (code > 96 && code < 103)   // lower alpha (a-f)
        ) {
            return success(i, 1, i.source.charAt(i.start));
        } else return reject({ location: i, reason: ParseErrorReason.HexDigit });
    } else return reject({ location: i, reason: ParseErrorReason.EOF });
});

export const toHexInt: Parser<string, number> = map(recognize(repeat(hexDigit)), s => parseInt(s, 16));
