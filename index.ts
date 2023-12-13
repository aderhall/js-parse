import { alt } from "./option";
import { alphanum, charIn, tag } from "./terminal";
import { separatedList, string } from "./sequence";
import { Parser } from "./parse";

const parser = separatedList<string, string>(
    string([alphanum, charIn("(!) ")]),
    tag(",").suffix(tag(" ")),
);

const result = parser.parse("a man, a plan, a canal(!), panama");

if (result.success) {
    console.log(`Parse successful:\nMatched:`, result.parsed.output, `\nFrom input "${result.parsed.consumed.source.slice(result.parsed.consumed.start, result.parsed.consumed.end)}".\nRemaining input: "${result.parsed.rest.source.slice(result.parsed.rest.start, result.parsed.rest.end)}"`);
} else {
    console.log(`Parse failed with ${result.fatal ? "'fatal'" : "'reject'"} error: ${result.error.reason}\nOn input: "${result.error.location.source.slice(result.error.location.start, result.error.location.end)}"`);
}