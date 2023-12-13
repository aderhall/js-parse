import { complete, cut, uncut } from "./error"
import { mapResult } from "./transform"
import { mapError } from "./transform"
import { optional, orDefault } from "./option"
import { Length, Slice } from "./parseInput"
import { delimited, pair, preceded, repeat, terminated } from "./sequence"
import { map, recognize } from "./transform"

export interface Fragment<I> {
    source: I,
    start: number,
    end: number,
}

export interface Parsed<I, O> {
    consumed: Fragment<I>,
    rest: Fragment<I>,
    output: O,
}

export enum ParseErrorReason {
    EOF = "End of file before input could be recognized",
    Tag = "Input does not match search string",
    Alt = "All child parsers rejected the input",
    Alpha = "Expected alphabetical character",
    DecDigit = "Expected decimal digit character",
    HexDigit = "Expected hexadecimal digit character",
    AlphaNum = "Expected alphanumeric character",
    UpperCase = "Expected uppercase character",
    LowerCase = "Expected lowercase character",
    RemainingInput = "Unparsable remainder at end of input",
}
export interface ParseError<I> {
    location: Fragment<I>,
    reason: string | ParseErrorReason,
}

export interface ParseSuccess<I, O> {
    success: true,
    parsed: Parsed<I, O>,
}
export function success<I, O>(i: Fragment<I>, length: number, result: O): ParseSuccess<I, O> {
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
    }
}

export interface ParseRejected<I> {
    success: false,
    fatal: false,
    error: ParseError<I>
}
export function reject<I>(error: ParseError<I>): ParseRejected<I> {
    return {
        success: false,
        fatal: false,
        error: error,
    }
}

export interface ParseFatal<I> {
    success: false,
    fatal: true,
    error: ParseError<I>
}
export function fatal<I>(error: ParseError<I>): ParseFatal<I> {
    return {
        success: false,
        fatal: true,
        error: error,
    }
}

export type ParseResult<I, O> = ParseSuccess<I, O> | ParseRejected<I> | ParseFatal<I>;

export class Parser<I, O> {
    parse: (i: I) => ParseResult<I, O>;
    parseFragment: (i: Fragment<I>) => ParseResult<I, O>;
    constructor(
        parse: (i: I) => ParseResult<I, O>,
        parseFragment: (i: Fragment<I>) => ParseResult<I, O>,
    ) {
        this.parse = parse.bind(this);
        this.parseFragment = parseFragment.bind(this);
    }
    /** Applies a transformation to the parsed output if the parser succeeds. */
    map<I1 extends Length, O2>(this: Parser<I1, O>, transform: (i: O) => O2) {
        return map(this, transform);
    }
    /** In case of inner parser returning an error, applies a transformation to that error. */
    mapError<I1 extends Length>(this: Parser<I1, O>, transform: (i: ParseError<I1>) => ParseError<I1>) {
        return mapError(this, transform);
    }
    /** Applies a transformation to the ParseResult output of the inner parser. */
    mapResult<I1 extends Length, O2>(this: Parser<I1, O>, transform: (i: ParseResult<I1, O>) => ParseResult<I1, O2>) {
        return mapResult(this, transform);
    }
    /** Applies a second parser on the remaining input and returns both outputs in a tuple. */
    then<I1 extends Length, O2>(this: Parser<I1, O>, parser: Parser<I1, O2>) {
        return pair(this, parser);
    }
    /** Matches the parser multiple times, up to infinitely many times or `maxLength` if specified. Returns an array of their outputs. */
    repeat<I1 extends Length>(this: Parser<I1, O>, maxLength?: number) {
        return repeat(this, maxLength);
    }
    precedes<I1 extends Length, O2>(this: Parser<I1, O>, parser: Parser<I, O2>) {
        return preceded(this, parser);
    }
    terminates<I1 extends Length, O2>(this: Parser<I1, O>, parser: Parser<I, O2>) {
        return terminated(parser, this);
    }
    prefix<I1 extends Length>(this: Parser<I1, O>, prefix: Parser<I, any>) {
        return preceded(prefix, this);
    }
    suffix<I1 extends Length>(this: Parser<I1, O>, suffix: Parser<I1, any>) {
        return terminated(this, suffix);
    }
    delimitedBy<I1 extends Length>(this: Parser<I1, O>, left: Parser<I, any>, right: Parser<I, any>) {
        return delimited(left, this, right);
    }
    /**
     * Catches `reject` errors and "hardens" them to `fatal` errors.
     * This function confirms that this parsing branch is the only possible correct one. If the input fails to match the parser, the input is assumed to be invalid.
     */
    cut<I1 extends Length>(this: Parser<I1, O>): Parser<I1, O> {
        return cut(this);
    }
    /**
     * Catches `fatal` errors and "softens" them to `reject` errors.
     * This function allows input deemed invalid to be retried with a different parser.
     */
    uncut<I1 extends Length>(this: Parser<I1, O>): Parser<I1, O> {
        return uncut(this);
    }
    /** Requires the inner parser to match all the remaining input. Returns a `reject` error otherwise. */
    complete<I1 extends Length>(this: Parser<I1, O>): Parser<I1, O> {
        return complete(this);
    }
    optional<I1 extends Length>(this: Parser<I1, O>) {
        return optional(this);
    }
    orDefault<I1 extends Length>(this: Parser<I1, O>, defaultValue: O) {
        return orDefault(this, defaultValue);
    }
    next<I1 extends Length & Slice<I1>, O2>(this: Parser<I1, O>, parser: Parser<I1, O2>): Parser<I1, O2> {
        return mapResult(recognize(this), r1 => {
            if (!r1.success) return r1;
            return parser.parseFragment(r1.parsed.consumed);
        })
    }
}
export function P<I extends Length, O>(parseFragment: (i: Fragment<I>) => ParseResult<I, O>): Parser<I, O> {
    return new Parser(
        (i: I) => parseFragment({ source: i, start: 0, end: i.length }),
        parseFragment,
    );
}