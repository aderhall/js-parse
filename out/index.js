"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const terminal_1 = require("./terminal");
const sequence_1 = require("./sequence");
const parser = (0, sequence_1.separatedList)((0, sequence_1.string)([terminal_1.alphanum, (0, terminal_1.oneOf)("(!) ")]), (0, terminal_1.tag)(",").suffix((0, terminal_1.tag)(" ")));
const result = parser.parse("a man, a plan, a canal(!), panama");
if (result.success) {
    console.log(`Parse successful:\nMatched:`, result.parsed.output, `\nFrom input "${result.parsed.consumed.source.slice(result.parsed.consumed.start, result.parsed.consumed.end)}".\nRemaining input: "${result.parsed.rest.source.slice(result.parsed.rest.start, result.parsed.rest.end)}"`);
}
else {
    console.log(`Parse failed with ${result.fatal ? "'fatal'" : "'reject'"} error: ${result.error.reason}\nOn input: "${result.error.location.source.slice(result.error.location.start, result.error.location.end)}"`);
}
