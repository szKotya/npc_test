// @ts-nocheck
import { Instance, PointTemplate, CSWeaponAttackType } from "cs_script/point_script";

function ChessJS() {
    /**
     * @license
     * Copyright (c) 2025, Jeff Hlywa (jhlywa@gmail.com)
     * All rights reserved.
     *
     * Redistribution and use in source and binary forms, with or without
     * modification, are permitted provided that the following conditions are met:
     *
     * 1. Redistributions of source code must retain the above copyright notice,
     *    this list of conditions and the following disclaimer.
     * 2. Redistributions in binary form must reproduce the above copyright notice,
     *    this list of conditions and the following disclaimer in the documentation
     *    and/or other materials provided with the distribution.
     *
     * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
     * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
     * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
     * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
     * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
     * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
     * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
     * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
     * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
     * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
     * POSSIBILITY OF SUCH DAMAGE.
     */

    function rootNode(comment) {
        return comment !== null ? { comment, variations: [] } : { variations: [] };
    }

    function node(move, suffix, nag, comment, variations) {
        const node = { move, variations };

        if (suffix) {
            node.suffix = suffix;
        }

        if (nag) {
            node.nag = nag;
        }

        if (comment !== null) {
            node.comment = comment;
        }

        return node;
    }

    function lineToTree(...nodes) {
        const [root, ...rest] = nodes;

        let parent = root;

        for (const child of rest) {
            if (child !== null) {
                parent.variations = [child, ...child.variations];
                child.variations = [];
                parent = child;
            }
        }

        return root;
    }

    function pgn(headers, game) {
        if (game.marker && game.marker.comment) {
            let node = game.root;
            while (true) {
                const next = node.variations[0];
                if (!next) {
                    node.comment = game.marker.comment;
                    break;
                }
                node = next;
            }
        }

        return {
            headers,
            root: game.root,
            result: (game.marker && game.marker.result) ?? undefined,
        };
    }

    function peg$subclass(child, parent) {
        function C() {
            this.constructor = child;
        }
        C.prototype = parent.prototype;
        child.prototype = new C();
    }

    function peg$SyntaxError(message, expected, found, location) {
        var self = Error.call(this, message);
        // istanbul ignore next Check is a necessary evil to support older environments
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(self, peg$SyntaxError.prototype);
        }
        self.expected = expected;
        self.found = found;
        self.location = location;
        self.name = "SyntaxError";
        return self;
    }

    peg$subclass(peg$SyntaxError, Error);

    function peg$padEnd(str, targetLength, padString) {
        padString = padString || " ";
        if (str.length > targetLength) {
            return str;
        }
        targetLength -= str.length;
        padString += padString.repeat(targetLength);
        return str + padString.slice(0, targetLength);
    }

    peg$SyntaxError.prototype.format = function (sources) {
        var str = "Error: " + this.message;
        if (this.location) {
            var src = null;
            var k;
            for (k = 0; k < sources.length; k++) {
                if (sources[k].source === this.location.source) {
                    src = sources[k].text.split(/\r\n|\n|\r/g);
                    break;
                }
            }
            var s = this.location.start;
            var offset_s = this.location.source && typeof this.location.source.offset === "function" ? this.location.source.offset(s) : s;
            var loc = this.location.source + ":" + offset_s.line + ":" + offset_s.column;
            if (src) {
                var e = this.location.end;
                var filler = peg$padEnd("", offset_s.line.toString().length, " ");
                var line = src[s.line - 1];
                var last = s.line === e.line ? e.column : line.length + 1;
                var hatLen = last - s.column || 1;
                str += "\n --> " + loc + "\n" + filler + " |\n" + offset_s.line + " | " + line + "\n" + filler + " | " + peg$padEnd("", s.column - 1, " ") + peg$padEnd("", hatLen, "^");
            } else {
                str += "\n at " + loc;
            }
        }
        return str;
    };

    peg$SyntaxError.buildMessage = function (expected, found) {
        var DESCRIBE_EXPECTATION_FNS = {
            literal: function (expectation) {
                return '"' + literalEscape(expectation.text) + '"';
            },

            class: function (expectation) {
                var escapedParts = expectation.parts.map(function (part) {
                    return Array.isArray(part) ? classEscape(part[0]) + "-" + classEscape(part[1]) : classEscape(part);
                });

                return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]";
            },

            any: function () {
                return "any character";
            },

            end: function () {
                return "end of input";
            },

            other: function (expectation) {
                return expectation.description;
            },
        };

        function hex(ch) {
            return ch.charCodeAt(0).toString(16).toUpperCase();
        }

        function literalEscape(s) {
            return s
                .replace(/\\/g, "\\\\")
                .replace(/"/g, '\\"')
                .replace(/\0/g, "\\0")
                .replace(/\t/g, "\\t")
                .replace(/\n/g, "\\n")
                .replace(/\r/g, "\\r")
                .replace(/[\x00-\x0F]/g, function (ch) {
                    return "\\x0" + hex(ch);
                })
                .replace(/[\x10-\x1F\x7F-\x9F]/g, function (ch) {
                    return "\\x" + hex(ch);
                });
        }

        function classEscape(s) {
            return s
                .replace(/\\/g, "\\\\")
                .replace(/\]/g, "\\]")
                .replace(/\^/g, "\\^")
                .replace(/-/g, "\\-")
                .replace(/\0/g, "\\0")
                .replace(/\t/g, "\\t")
                .replace(/\n/g, "\\n")
                .replace(/\r/g, "\\r")
                .replace(/[\x00-\x0F]/g, function (ch) {
                    return "\\x0" + hex(ch);
                })
                .replace(/[\x10-\x1F\x7F-\x9F]/g, function (ch) {
                    return "\\x" + hex(ch);
                });
        }

        function describeExpectation(expectation) {
            return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
        }

        function describeExpected(expected) {
            var descriptions = expected.map(describeExpectation);
            var i, j;

            descriptions.sort();

            if (descriptions.length > 0) {
                for (i = 1, j = 1; i < descriptions.length; i++) {
                    if (descriptions[i - 1] !== descriptions[i]) {
                        descriptions[j] = descriptions[i];
                        j++;
                    }
                }
                descriptions.length = j;
            }

            switch (descriptions.length) {
                case 1:
                    return descriptions[0];

                case 2:
                    return descriptions[0] + " or " + descriptions[1];

                default:
                    return descriptions.slice(0, -1).join(", ") + ", or " + descriptions[descriptions.length - 1];
            }
        }

        function describeFound(found) {
            return found ? '"' + literalEscape(found) + '"' : "end of input";
        }

        return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
    };

    function peg$parse(input, options) {
        options = options !== undefined ? options : {};

        var peg$FAILED = {};
        var peg$source = options.grammarSource;

        var peg$startRuleFunctions = { pgn: peg$parsepgn };
        var peg$startRuleFunction = peg$parsepgn;

        var peg$c0 = "[";
        var peg$c1 = '"';
        var peg$c2 = "]";
        var peg$c3 = ".";
        var peg$c4 = "O-O-O";
        var peg$c5 = "O-O";
        var peg$c6 = "0-0-0";
        var peg$c7 = "0-0";
        var peg$c8 = "$";
        var peg$c9 = "{";
        var peg$c10 = "}";
        var peg$c11 = ";";
        var peg$c12 = "(";
        var peg$c13 = ")";
        var peg$c14 = "1-0";
        var peg$c15 = "0-1";
        var peg$c16 = "1/2-1/2";
        var peg$c17 = "*";

        var peg$r0 = /^[a-zA-Z]/;
        var peg$r1 = /^[^"]/;
        var peg$r2 = /^[0-9]/;
        var peg$r3 = /^[.]/;
        var peg$r4 = /^[a-zA-Z1-8\-=]/;
        var peg$r5 = /^[+#]/;
        var peg$r6 = /^[!?]/;
        var peg$r7 = /^[^}]/;
        var peg$r8 = /^[^\r\n]/;
        var peg$r9 = /^[ \t\r\n]/;

        var peg$e0 = peg$otherExpectation("tag pair");
        var peg$e1 = peg$literalExpectation("[", false);
        var peg$e2 = peg$literalExpectation('"', false);
        var peg$e3 = peg$literalExpectation("]", false);
        var peg$e4 = peg$otherExpectation("tag name");
        var peg$e5 = peg$classExpectation(
            [
                ["a", "z"],
                ["A", "Z"],
            ],
            false,
            false
        );
        var peg$e6 = peg$otherExpectation("tag value");
        var peg$e7 = peg$classExpectation(['"'], true, false);
        var peg$e8 = peg$otherExpectation("move number");
        var peg$e9 = peg$classExpectation([["0", "9"]], false, false);
        var peg$e10 = peg$literalExpectation(".", false);
        var peg$e11 = peg$classExpectation(["."], false, false);
        var peg$e12 = peg$otherExpectation("standard algebraic notation");
        var peg$e13 = peg$literalExpectation("O-O-O", false);
        var peg$e14 = peg$literalExpectation("O-O", false);
        var peg$e15 = peg$literalExpectation("0-0-0", false);
        var peg$e16 = peg$literalExpectation("0-0", false);
        var peg$e17 = peg$classExpectation([["a", "z"], ["A", "Z"], ["1", "8"], "-", "="], false, false);
        var peg$e18 = peg$classExpectation(["+", "#"], false, false);
        var peg$e19 = peg$otherExpectation("suffix annotation");
        var peg$e20 = peg$classExpectation(["!", "?"], false, false);
        var peg$e21 = peg$otherExpectation("NAG");
        var peg$e22 = peg$literalExpectation("$", false);
        var peg$e23 = peg$otherExpectation("brace comment");
        var peg$e24 = peg$literalExpectation("{", false);
        var peg$e25 = peg$classExpectation(["}"], true, false);
        var peg$e26 = peg$literalExpectation("}", false);
        var peg$e27 = peg$otherExpectation("rest of line comment");
        var peg$e28 = peg$literalExpectation(";", false);
        var peg$e29 = peg$classExpectation(["\r", "\n"], true, false);
        var peg$e30 = peg$otherExpectation("variation");
        var peg$e31 = peg$literalExpectation("(", false);
        var peg$e32 = peg$literalExpectation(")", false);
        var peg$e33 = peg$otherExpectation("game termination marker");
        var peg$e34 = peg$literalExpectation("1-0", false);
        var peg$e35 = peg$literalExpectation("0-1", false);
        var peg$e36 = peg$literalExpectation("1/2-1/2", false);
        var peg$e37 = peg$literalExpectation("*", false);
        var peg$e38 = peg$otherExpectation("whitespace");
        var peg$e39 = peg$classExpectation([" ", "\t", "\r", "\n"], false, false);

        var peg$f0 = function (headers, game) {
            return pgn(headers, game);
        };
        var peg$f1 = function (tagPairs) {
            return Object.fromEntries(tagPairs);
        };
        var peg$f2 = function (tagName, tagValue) {
            return [tagName, tagValue];
        };
        var peg$f3 = function (root, marker) {
            return { root, marker };
        };
        var peg$f4 = function (comment, moves) {
            return lineToTree(rootNode(comment), ...moves.flat());
        };
        var peg$f5 = function (san, suffix, nag, comment, variations) {
            return node(san, suffix, nag, comment, variations);
        };
        var peg$f6 = function (nag) {
            return nag;
        };
        var peg$f7 = function (comment) {
            return comment.replace(/[\r\n]+/g, " ");
        };
        var peg$f8 = function (comment) {
            return comment.trim();
        };
        var peg$f9 = function (line) {
            return line;
        };
        var peg$f10 = function (result, comment) {
            return { result, comment };
        };
        var peg$currPos = options.peg$currPos | 0;
        var peg$posDetailsCache = [{ line: 1, column: 1 }];
        var peg$maxFailPos = peg$currPos;
        var peg$maxFailExpected = options.peg$maxFailExpected || [];
        var peg$silentFails = options.peg$silentFails | 0;

        var peg$result;

        if (options.startRule) {
            if (!(options.startRule in peg$startRuleFunctions)) {
                throw new Error("Can't start parsing from rule \"" + options.startRule + '".');
            }

            peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
        }

        function peg$literalExpectation(text, ignoreCase) {
            return { type: "literal", text: text, ignoreCase: ignoreCase };
        }

        function peg$classExpectation(parts, inverted, ignoreCase) {
            return {
                type: "class",
                parts: parts,
                inverted: inverted,
                ignoreCase: ignoreCase,
            };
        }

        function peg$endExpectation() {
            return { type: "end" };
        }

        function peg$otherExpectation(description) {
            return { type: "other", description: description };
        }

        function peg$computePosDetails(pos) {
            var details = peg$posDetailsCache[pos];
            var p;

            if (details) {
                return details;
            } else {
                if (pos >= peg$posDetailsCache.length) {
                    p = peg$posDetailsCache.length - 1;
                } else {
                    p = pos;
                    while (!peg$posDetailsCache[--p]) { }
                }

                details = peg$posDetailsCache[p];
                details = {
                    line: details.line,
                    column: details.column,
                };

                while (p < pos) {
                    if (input.charCodeAt(p) === 10) {
                        details.line++;
                        details.column = 1;
                    } else {
                        details.column++;
                    }

                    p++;
                }

                peg$posDetailsCache[pos] = details;

                return details;
            }
        }

        function peg$computeLocation(startPos, endPos) {
            var startPosDetails = peg$computePosDetails(startPos);
            var endPosDetails = peg$computePosDetails(endPos);

            var res = {
                source: peg$source,
                start: {
                    offset: startPos,
                    line: startPosDetails.line,
                    column: startPosDetails.column,
                },
                end: {
                    offset: endPos,
                    line: endPosDetails.line,
                    column: endPosDetails.column,
                },
            };
            return res;
        }

        function peg$fail(expected) {
            if (peg$currPos < peg$maxFailPos) {
                return;
            }

            if (peg$currPos > peg$maxFailPos) {
                peg$maxFailPos = peg$currPos;
                peg$maxFailExpected = [];
            }

            peg$maxFailExpected.push(expected);
        }

        function peg$buildStructuredError(expected, found, location) {
            return new peg$SyntaxError(peg$SyntaxError.buildMessage(expected, found), expected, found, location);
        }

        function peg$parsepgn() {
            var s0, s1, s2;

            s0 = peg$currPos;
            s1 = peg$parsetagPairSection();
            s2 = peg$parsemoveTextSection();
            s0 = peg$f0(s1, s2);

            return s0;
        }

        function peg$parsetagPairSection() {
            var s0, s1, s2;

            s0 = peg$currPos;
            s1 = [];
            s2 = peg$parsetagPair();
            while (s2 !== peg$FAILED) {
                s1.push(s2);
                s2 = peg$parsetagPair();
            }
            s2 = peg$parse_();
            s0 = peg$f1(s1);

            return s0;
        }

        function peg$parsetagPair() {
            var s0, s2, s4, s6, s7, s8, s10;

            peg$silentFails++;
            s0 = peg$currPos;
            peg$parse_();
            if (input.charCodeAt(peg$currPos) === 91) {
                s2 = peg$c0;
                peg$currPos++;
            } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e1);
                }
            }
            if (s2 !== peg$FAILED) {
                peg$parse_();
                s4 = peg$parsetagName();
                if (s4 !== peg$FAILED) {
                    peg$parse_();
                    if (input.charCodeAt(peg$currPos) === 34) {
                        s6 = peg$c1;
                        peg$currPos++;
                    } else {
                        s6 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e2);
                        }
                    }
                    if (s6 !== peg$FAILED) {
                        s7 = peg$parsetagValue();
                        if (input.charCodeAt(peg$currPos) === 34) {
                            s8 = peg$c1;
                            peg$currPos++;
                        } else {
                            s8 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e2);
                            }
                        }
                        if (s8 !== peg$FAILED) {
                            peg$parse_();
                            if (input.charCodeAt(peg$currPos) === 93) {
                                s10 = peg$c2;
                                peg$currPos++;
                            } else {
                                s10 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e3);
                                }
                            }
                            if (s10 !== peg$FAILED) {
                                s0 = peg$f2(s4, s7);
                            } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            peg$silentFails--;
            if (s0 === peg$FAILED) {
                if (peg$silentFails === 0) {
                    peg$fail(peg$e0);
                }
            }

            return s0;
        }

        function peg$parsetagName() {
            var s0, s1, s2;

            peg$silentFails++;
            s0 = peg$currPos;
            s1 = [];
            s2 = input.charAt(peg$currPos);
            if (peg$r0.test(s2)) {
                peg$currPos++;
            } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e5);
                }
            }
            if (s2 !== peg$FAILED) {
                while (s2 !== peg$FAILED) {
                    s1.push(s2);
                    s2 = input.charAt(peg$currPos);
                    if (peg$r0.test(s2)) {
                        peg$currPos++;
                    } else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e5);
                        }
                    }
                }
            } else {
                s1 = peg$FAILED;
            }
            if (s1 !== peg$FAILED) {
                s0 = input.substring(s0, peg$currPos);
            } else {
                s0 = s1;
            }
            peg$silentFails--;
            if (s0 === peg$FAILED) {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e4);
                }
            }

            return s0;
        }

        function peg$parsetagValue() {
            var s0, s1, s2;

            peg$silentFails++;
            s0 = peg$currPos;
            s1 = [];
            s2 = input.charAt(peg$currPos);
            if (peg$r1.test(s2)) {
                peg$currPos++;
            } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e7);
                }
            }
            while (s2 !== peg$FAILED) {
                s1.push(s2);
                s2 = input.charAt(peg$currPos);
                if (peg$r1.test(s2)) {
                    peg$currPos++;
                } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e7);
                    }
                }
            }
            s0 = input.substring(s0, peg$currPos);
            peg$silentFails--;
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e6);
            }

            return s0;
        }

        function peg$parsemoveTextSection() {
            var s0, s1, s3;

            s0 = peg$currPos;
            s1 = peg$parseline();
            peg$parse_();
            s3 = peg$parsegameTerminationMarker();
            if (s3 === peg$FAILED) {
                s3 = null;
            }
            peg$parse_();
            s0 = peg$f3(s1, s3);

            return s0;
        }

        function peg$parseline() {
            var s0, s1, s2, s3;

            s0 = peg$currPos;
            s1 = peg$parsecomment();
            if (s1 === peg$FAILED) {
                s1 = null;
            }
            s2 = [];
            s3 = peg$parsemove();
            while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$parsemove();
            }
            s0 = peg$f4(s1, s2);

            return s0;
        }

        function peg$parsemove() {
            var s0, s4, s5, s6, s7, s8, s9, s10;

            s0 = peg$currPos;
            peg$parse_();
            peg$parsemoveNumber();
            peg$parse_();
            s4 = peg$parsesan();
            if (s4 !== peg$FAILED) {
                s5 = peg$parsesuffixAnnotation();
                if (s5 === peg$FAILED) {
                    s5 = null;
                }
                s6 = [];
                s7 = peg$parsenag();
                while (s7 !== peg$FAILED) {
                    s6.push(s7);
                    s7 = peg$parsenag();
                }
                s7 = peg$parse_();
                s8 = peg$parsecomment();
                if (s8 === peg$FAILED) {
                    s8 = null;
                }
                s9 = [];
                s10 = peg$parsevariation();
                while (s10 !== peg$FAILED) {
                    s9.push(s10);
                    s10 = peg$parsevariation();
                }
                s0 = peg$f5(s4, s5, s6, s8, s9);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }

            return s0;
        }

        function peg$parsemoveNumber() {
            var s0, s1, s2, s3, s4, s5;

            peg$silentFails++;
            s0 = peg$currPos;
            s1 = [];
            s2 = input.charAt(peg$currPos);
            if (peg$r2.test(s2)) {
                peg$currPos++;
            } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e9);
                }
            }
            while (s2 !== peg$FAILED) {
                s1.push(s2);
                s2 = input.charAt(peg$currPos);
                if (peg$r2.test(s2)) {
                    peg$currPos++;
                } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e9);
                    }
                }
            }
            if (input.charCodeAt(peg$currPos) === 46) {
                s2 = peg$c3;
                peg$currPos++;
            } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e10);
                }
            }
            if (s2 !== peg$FAILED) {
                s3 = peg$parse_();
                s4 = [];
                s5 = input.charAt(peg$currPos);
                if (peg$r3.test(s5)) {
                    peg$currPos++;
                } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e11);
                    }
                }
                while (s5 !== peg$FAILED) {
                    s4.push(s5);
                    s5 = input.charAt(peg$currPos);
                    if (peg$r3.test(s5)) {
                        peg$currPos++;
                    } else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e11);
                        }
                    }
                }
                s1 = [s1, s2, s3, s4];
                s0 = s1;
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            peg$silentFails--;
            if (s0 === peg$FAILED) {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e8);
                }
            }

            return s0;
        }

        function peg$parsesan() {
            var s0, s1, s2, s3, s4, s5;

            peg$silentFails++;
            s0 = peg$currPos;
            s1 = peg$currPos;
            if (input.substr(peg$currPos, 5) === peg$c4) {
                s2 = peg$c4;
                peg$currPos += 5;
            } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e13);
                }
            }
            if (s2 === peg$FAILED) {
                if (input.substr(peg$currPos, 3) === peg$c5) {
                    s2 = peg$c5;
                    peg$currPos += 3;
                } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e14);
                    }
                }
                if (s2 === peg$FAILED) {
                    if (input.substr(peg$currPos, 5) === peg$c6) {
                        s2 = peg$c6;
                        peg$currPos += 5;
                    } else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e15);
                        }
                    }
                    if (s2 === peg$FAILED) {
                        if (input.substr(peg$currPos, 3) === peg$c7) {
                            s2 = peg$c7;
                            peg$currPos += 3;
                        } else {
                            s2 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e16);
                            }
                        }
                        if (s2 === peg$FAILED) {
                            s2 = peg$currPos;
                            s3 = input.charAt(peg$currPos);
                            if (peg$r0.test(s3)) {
                                peg$currPos++;
                            } else {
                                s3 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e5);
                                }
                            }
                            if (s3 !== peg$FAILED) {
                                s4 = [];
                                s5 = input.charAt(peg$currPos);
                                if (peg$r4.test(s5)) {
                                    peg$currPos++;
                                } else {
                                    s5 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e17);
                                    }
                                }
                                if (s5 !== peg$FAILED) {
                                    while (s5 !== peg$FAILED) {
                                        s4.push(s5);
                                        s5 = input.charAt(peg$currPos);
                                        if (peg$r4.test(s5)) {
                                            peg$currPos++;
                                        } else {
                                            s5 = peg$FAILED;
                                            if (peg$silentFails === 0) {
                                                peg$fail(peg$e17);
                                            }
                                        }
                                    }
                                } else {
                                    s4 = peg$FAILED;
                                }
                                if (s4 !== peg$FAILED) {
                                    s3 = [s3, s4];
                                    s2 = s3;
                                } else {
                                    peg$currPos = s2;
                                    s2 = peg$FAILED;
                                }
                            } else {
                                peg$currPos = s2;
                                s2 = peg$FAILED;
                            }
                        }
                    }
                }
            }
            if (s2 !== peg$FAILED) {
                s3 = input.charAt(peg$currPos);
                if (peg$r5.test(s3)) {
                    peg$currPos++;
                } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e18);
                    }
                }
                if (s3 === peg$FAILED) {
                    s3 = null;
                }
                s2 = [s2, s3];
                s1 = s2;
            } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
            }
            if (s1 !== peg$FAILED) {
                s0 = input.substring(s0, peg$currPos);
            } else {
                s0 = s1;
            }
            peg$silentFails--;
            if (s0 === peg$FAILED) {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e12);
                }
            }

            return s0;
        }

        function peg$parsesuffixAnnotation() {
            var s0, s1, s2;

            peg$silentFails++;
            s0 = peg$currPos;
            s1 = [];
            s2 = input.charAt(peg$currPos);
            if (peg$r6.test(s2)) {
                peg$currPos++;
            } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e20);
                }
            }
            while (s2 !== peg$FAILED) {
                s1.push(s2);
                if (s1.length >= 2) {
                    s2 = peg$FAILED;
                } else {
                    s2 = input.charAt(peg$currPos);
                    if (peg$r6.test(s2)) {
                        peg$currPos++;
                    } else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e20);
                        }
                    }
                }
            }
            if (s1.length < 1) {
                peg$currPos = s0;
                s0 = peg$FAILED;
            } else {
                s0 = s1;
            }
            peg$silentFails--;
            if (s0 === peg$FAILED) {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e19);
                }
            }

            return s0;
        }

        function peg$parsenag() {
            var s0, s2, s3, s4, s5;

            peg$silentFails++;
            s0 = peg$currPos;
            peg$parse_();
            if (input.charCodeAt(peg$currPos) === 36) {
                s2 = peg$c8;
                peg$currPos++;
            } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e22);
                }
            }
            if (s2 !== peg$FAILED) {
                s3 = peg$currPos;
                s4 = [];
                s5 = input.charAt(peg$currPos);
                if (peg$r2.test(s5)) {
                    peg$currPos++;
                } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e9);
                    }
                }
                if (s5 !== peg$FAILED) {
                    while (s5 !== peg$FAILED) {
                        s4.push(s5);
                        s5 = input.charAt(peg$currPos);
                        if (peg$r2.test(s5)) {
                            peg$currPos++;
                        } else {
                            s5 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e9);
                            }
                        }
                    }
                } else {
                    s4 = peg$FAILED;
                }
                if (s4 !== peg$FAILED) {
                    s3 = input.substring(s3, peg$currPos);
                } else {
                    s3 = s4;
                }
                if (s3 !== peg$FAILED) {
                    s0 = peg$f6(s3);
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            peg$silentFails--;
            if (s0 === peg$FAILED) {
                if (peg$silentFails === 0) {
                    peg$fail(peg$e21);
                }
            }

            return s0;
        }

        function peg$parsecomment() {
            var s0;

            s0 = peg$parsebraceComment();
            if (s0 === peg$FAILED) {
                s0 = peg$parserestOfLineComment();
            }

            return s0;
        }

        function peg$parsebraceComment() {
            var s0, s1, s2, s3, s4;

            peg$silentFails++;
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 123) {
                s1 = peg$c9;
                peg$currPos++;
            } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e24);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                s3 = [];
                s4 = input.charAt(peg$currPos);
                if (peg$r7.test(s4)) {
                    peg$currPos++;
                } else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e25);
                    }
                }
                while (s4 !== peg$FAILED) {
                    s3.push(s4);
                    s4 = input.charAt(peg$currPos);
                    if (peg$r7.test(s4)) {
                        peg$currPos++;
                    } else {
                        s4 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e25);
                        }
                    }
                }
                s2 = input.substring(s2, peg$currPos);
                if (input.charCodeAt(peg$currPos) === 125) {
                    s3 = peg$c10;
                    peg$currPos++;
                } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e26);
                    }
                }
                if (s3 !== peg$FAILED) {
                    s0 = peg$f7(s2);
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            peg$silentFails--;
            if (s0 === peg$FAILED) {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e23);
                }
            }

            return s0;
        }

        function peg$parserestOfLineComment() {
            var s0, s1, s2, s3, s4;

            peg$silentFails++;
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 59) {
                s1 = peg$c11;
                peg$currPos++;
            } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e28);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                s3 = [];
                s4 = input.charAt(peg$currPos);
                if (peg$r8.test(s4)) {
                    peg$currPos++;
                } else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e29);
                    }
                }
                while (s4 !== peg$FAILED) {
                    s3.push(s4);
                    s4 = input.charAt(peg$currPos);
                    if (peg$r8.test(s4)) {
                        peg$currPos++;
                    } else {
                        s4 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e29);
                        }
                    }
                }
                s2 = input.substring(s2, peg$currPos);
                s0 = peg$f8(s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            peg$silentFails--;
            if (s0 === peg$FAILED) {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e27);
                }
            }

            return s0;
        }

        function peg$parsevariation() {
            var s0, s2, s3, s5;

            peg$silentFails++;
            s0 = peg$currPos;
            peg$parse_();
            if (input.charCodeAt(peg$currPos) === 40) {
                s2 = peg$c12;
                peg$currPos++;
            } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e31);
                }
            }
            if (s2 !== peg$FAILED) {
                s3 = peg$parseline();
                if (s3 !== peg$FAILED) {
                    peg$parse_();
                    if (input.charCodeAt(peg$currPos) === 41) {
                        s5 = peg$c13;
                        peg$currPos++;
                    } else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e32);
                        }
                    }
                    if (s5 !== peg$FAILED) {
                        s0 = peg$f9(s3);
                    } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            peg$silentFails--;
            if (s0 === peg$FAILED) {
                if (peg$silentFails === 0) {
                    peg$fail(peg$e30);
                }
            }

            return s0;
        }

        function peg$parsegameTerminationMarker() {
            var s0, s1, s3;

            peg$silentFails++;
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 3) === peg$c14) {
                s1 = peg$c14;
                peg$currPos += 3;
            } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e34);
                }
            }
            if (s1 === peg$FAILED) {
                if (input.substr(peg$currPos, 3) === peg$c15) {
                    s1 = peg$c15;
                    peg$currPos += 3;
                } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e35);
                    }
                }
                if (s1 === peg$FAILED) {
                    if (input.substr(peg$currPos, 7) === peg$c16) {
                        s1 = peg$c16;
                        peg$currPos += 7;
                    } else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e36);
                        }
                    }
                    if (s1 === peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 42) {
                            s1 = peg$c17;
                            peg$currPos++;
                        } else {
                            s1 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e37);
                            }
                        }
                    }
                }
            }
            if (s1 !== peg$FAILED) {
                peg$parse_();
                s3 = peg$parsecomment();
                if (s3 === peg$FAILED) {
                    s3 = null;
                }
                s0 = peg$f10(s1, s3);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            peg$silentFails--;
            if (s0 === peg$FAILED) {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e33);
                }
            }

            return s0;
        }

        function peg$parse_() {
            var s0, s1;

            peg$silentFails++;
            s0 = [];
            s1 = input.charAt(peg$currPos);
            if (peg$r9.test(s1)) {
                peg$currPos++;
            } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e39);
                }
            }
            while (s1 !== peg$FAILED) {
                s0.push(s1);
                s1 = input.charAt(peg$currPos);
                if (peg$r9.test(s1)) {
                    peg$currPos++;
                } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e39);
                    }
                }
            }
            peg$silentFails--;
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e38);
            }

            return s0;
        }

        peg$result = peg$startRuleFunction();

        if (options.peg$library) {
            return /** @type {any} */ ({
                peg$result,
                peg$currPos,
                peg$FAILED,
                peg$maxFailExpected,
                peg$maxFailPos,
            });
        }
        if (peg$result !== peg$FAILED && peg$currPos === input.length) {
            return peg$result;
        } else {
            if (peg$result !== peg$FAILED && peg$currPos < input.length) {
                peg$fail(peg$endExpectation());
            }

            throw peg$buildStructuredError(
                peg$maxFailExpected,
                peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
                peg$maxFailPos < input.length ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1) : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
            );
        }
    }

    /**
     * @license
     * Copyright (c) 2025, Jeff Hlywa (jhlywa@gmail.com)
     * All rights reserved.
     *
     * Redistribution and use in source and binary forms, with or without
     * modification, are permitted provided that the following conditions are met:
     *
     * 1. Redistributions of source code must retain the above copyright notice,
     *    this list of conditions and the following disclaimer.
     * 2. Redistributions in binary form must reproduce the above copyright notice,
     *    this list of conditions and the following disclaimer in the documentation
     *    and/or other materials provided with the distribution.
     *
     * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
     * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
     * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
     * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
     * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
     * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
     * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
     * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
     * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
     * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
     * POSSIBILITY OF SUCH DAMAGE.
     */
    const MASK64 = 0xffffffffffffffffn;
    function rotl(x, k) {
        return ((x << k) | (x >> (64n - k))) & 0xffffffffffffffffn;
    }
    function wrappingMul(x, y) {
        return (x * y) & MASK64;
    }
    // xoroshiro128**
    function xoroshiro128(state) {
        return function () {
            let s0 = BigInt(state & MASK64);
            let s1 = BigInt((state >> 64n) & MASK64);
            const result = wrappingMul(rotl(wrappingMul(s0, 5n), 7n), 9n);
            s1 ^= s0;
            s0 = (rotl(s0, 24n) ^ s1 ^ (s1 << 16n)) & MASK64;
            s1 = rotl(s1, 37n);
            state = (s1 << 64n) | s0;
            return result;
        };
    }
    const rand = xoroshiro128(0xa187eb39cdcaed8f31c4b365b102e01en);
    const PIECE_KEYS = Array.from({ length: 2 }, () => Array.from({ length: 6 }, () => Array.from({ length: 128 }, () => rand())));
    const EP_KEYS = Array.from({ length: 8 }, () => rand());
    const CASTLING_KEYS = Array.from({ length: 16 }, () => rand());
    const SIDE_KEY = rand();
    const WHITE = "w";
    const BLACK = "b";
    const PAWN = "p";
    const KNIGHT = "n";
    const BISHOP = "b";
    const ROOK = "r";
    const QUEEN = "q";
    const KING = "k";
    const DEFAULT_POSITION = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    class Move {
        color;
        from;
        to;
        piece;
        captured;
        promotion;
        /**
         * @deprecated This field is deprecated and will be removed in version 2.0.0.
         * Please use move descriptor functions instead: `isCapture`, `isPromotion`,
         * `isEnPassant`, `isKingsideCastle`, `isQueensideCastle`, `isCastle`, and
         * `isBigPawn`
         */
        flags;
        san;
        lan;
        before;
        after;
        constructor(chess, internal) {
            const { color, piece, from, to, flags, captured, promotion } = internal;
            const fromAlgebraic = algebraic(from);
            const toAlgebraic = algebraic(to);
            this.color = color;
            this.piece = piece;
            this.from = fromAlgebraic;
            this.to = toAlgebraic;
            /*
             * HACK: The chess['_method']() calls below invoke private methods in the
             * Chess class to generate SAN and FEN. It's a bit of a hack, but makes the
             * code cleaner elsewhere.
             */
            this.san = chess["_moveToSan"](internal, chess["_moves"]({ legal: true }));
            this.lan = fromAlgebraic + toAlgebraic;
            this.before = chess.fen();
            // Generate the FEN for the 'after' key
            chess["_makeMove"](internal);
            this.after = chess.fen();
            chess["_undoMove"]();
            // Build the text representation of the move flags
            this.flags = "";
            for (const flag in BITS) {
                if (BITS[flag] & flags) {
                    this.flags += FLAGS[flag];
                }
            }
            if (captured) {
                this.captured = captured;
            }
            if (promotion) {
                this.promotion = promotion;
                this.lan += promotion;
            }
        }
        isCapture() {
            return this.flags.indexOf(FLAGS["CAPTURE"]) > -1;
        }
        isPromotion() {
            return this.flags.indexOf(FLAGS["PROMOTION"]) > -1;
        }
        isEnPassant() {
            return this.flags.indexOf(FLAGS["EP_CAPTURE"]) > -1;
        }
        isKingsideCastle() {
            return this.flags.indexOf(FLAGS["KSIDE_CASTLE"]) > -1;
        }
        isQueensideCastle() {
            return this.flags.indexOf(FLAGS["QSIDE_CASTLE"]) > -1;
        }
        isBigPawn() {
            return this.flags.indexOf(FLAGS["BIG_PAWN"]) > -1;
        }
    }
    const EMPTY = -1;
    const FLAGS = {
        NORMAL: "n",
        CAPTURE: "c",
        BIG_PAWN: "b",
        EP_CAPTURE: "e",
        PROMOTION: "p",
        KSIDE_CASTLE: "k",
        QSIDE_CASTLE: "q",
        NULL_MOVE: "-",
    };
    // prettier-ignore
    const SQUARES = [
        'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8',
        'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7',
        'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',
        'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',
        'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',
        'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',
        'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',
        'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'
    ];
    const BITS = {
        NORMAL: 1,
        CAPTURE: 2,
        BIG_PAWN: 4,
        EP_CAPTURE: 8,
        PROMOTION: 16,
        KSIDE_CASTLE: 32,
        QSIDE_CASTLE: 64,
        NULL_MOVE: 128,
    };
    /* eslint-disable @typescript-eslint/naming-convention */
    // these are required, according to spec
    const SEVEN_TAG_ROSTER = {
        Event: "?",
        Site: "?",
        Date: "????.??.??",
        Round: "?",
        White: "?",
        Black: "?",
        Result: "*",
    };
    /**
     * These nulls are placeholders to fix the order of tags (as they appear in PGN spec); null values will be
     * eliminated in getHeaders()
     */
    const SUPLEMENTAL_TAGS = {
        WhiteTitle: null,
        BlackTitle: null,
        WhiteElo: null,
        BlackElo: null,
        WhiteUSCF: null,
        BlackUSCF: null,
        WhiteNA: null,
        BlackNA: null,
        WhiteType: null,
        BlackType: null,
        EventDate: null,
        EventSponsor: null,
        Section: null,
        Stage: null,
        Board: null,
        Opening: null,
        Variation: null,
        SubVariation: null,
        ECO: null,
        NIC: null,
        Time: null,
        UTCTime: null,
        UTCDate: null,
        TimeControl: null,
        SetUp: null,
        FEN: null,
        Termination: null,
        Annotator: null,
        Mode: null,
        PlyCount: null,
    };
    const HEADER_TEMPLATE = {
        ...SEVEN_TAG_ROSTER,
        ...SUPLEMENTAL_TAGS,
    };
    /* eslint-enable @typescript-eslint/naming-convention */
    /*
     * NOTES ABOUT 0x88 MOVE GENERATION ALGORITHM
     * ----------------------------------------------------------------------------
     * From https://github.com/jhlywa/chess.js/issues/230
     *
     * A lot of people are confused when they first see the internal representation
     * of chess.js. It uses the 0x88 Move Generation Algorithm which internally
     * stores the board as an 8x16 array. This is purely for efficiency but has a
     * couple of interesting benefits:
     *
     * 1. 0x88 offers a very inexpensive "off the board" check. Bitwise AND (&) any
     *    square with 0x88, if the result is non-zero then the square is off the
     *    board. For example, assuming a knight square A8 (0 in 0x88 notation),
     *    there are 8 possible directions in which the knight can move. These
     *    directions are relative to the 8x16 board and are stored in the
     *    PIECE_OFFSETS map. One possible move is A8 - 18 (up one square, and two
     *    squares to the left - which is off the board). 0 - 18 = -18 & 0x88 = 0x88
     *    (because of two-complement representation of -18). The non-zero result
     *    means the square is off the board and the move is illegal. Take the
     *    opposite move (from A8 to C7), 0 + 18 = 18 & 0x88 = 0. A result of zero
     *    means the square is on the board.
     *
     * 2. The relative distance (or difference) between two squares on a 8x16 board
     *    is unique and can be used to inexpensively determine if a piece on a
     *    square can attack any other arbitrary square. For example, let's see if a
     *    pawn on E7 can attack E2. The difference between E7 (20) - E2 (100) is
     *    -80. We add 119 to make the ATTACKS array index non-negative (because the
     *    worst case difference is A8 - H1 = -119). The ATTACKS array contains a
     *    bitmask of pieces that can attack from that distance and direction.
     *    ATTACKS[-80 + 119=39] gives us 24 or 0b11000 in binary. Look at the
     *    PIECE_MASKS map to determine the mask for a given piece type. In our pawn
     *    example, we would check to see if 24 & 0x1 is non-zero, which it is
     *    not. So, naturally, a pawn on E7 can't attack a piece on E2. However, a
     *    rook can since 24 & 0x8 is non-zero. The only thing left to check is that
     *    there are no blocking pieces between E7 and E2. That's where the RAYS
     *    array comes in. It provides an offset (in this case 16) to add to E7 (20)
     *    to check for blocking pieces. E7 (20) + 16 = E6 (36) + 16 = E5 (52) etc.
     */
    // prettier-ignore
    // eslint-disable-next-line
    const Ox88 = {
        a8: 0, b8: 1, c8: 2, d8: 3, e8: 4, f8: 5, g8: 6, h8: 7,
        a7: 16, b7: 17, c7: 18, d7: 19, e7: 20, f7: 21, g7: 22, h7: 23,
        a6: 32, b6: 33, c6: 34, d6: 35, e6: 36, f6: 37, g6: 38, h6: 39,
        a5: 48, b5: 49, c5: 50, d5: 51, e5: 52, f5: 53, g5: 54, h5: 55,
        a4: 64, b4: 65, c4: 66, d4: 67, e4: 68, f4: 69, g4: 70, h4: 71,
        a3: 80, b3: 81, c3: 82, d3: 83, e3: 84, f3: 85, g3: 86, h3: 87,
        a2: 96, b2: 97, c2: 98, d2: 99, e2: 100, f2: 101, g2: 102, h2: 103,
        a1: 112, b1: 113, c1: 114, d1: 115, e1: 116, f1: 117, g1: 118, h1: 119
    };
    const PAWN_OFFSETS = {
        b: [16, 32, 17, 15],
        w: [-16, -32, -17, -15],
    };
    const PIECE_OFFSETS = {
        n: [-18, -33, -31, -14, 18, 33, 31, 14],
        b: [-17, -15, 17, 15],
        r: [-16, 1, 16, -1],
        q: [-17, -16, -15, 1, 17, 16, 15, -1],
        k: [-17, -16, -15, 1, 17, 16, 15, -1],
    };
    // prettier-ignore
    const ATTACKS = [
        20, 0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 20, 0,
        0, 20, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 20, 0, 0,
        0, 0, 20, 0, 0, 0, 0, 24, 0, 0, 0, 0, 20, 0, 0, 0,
        0, 0, 0, 20, 0, 0, 0, 24, 0, 0, 0, 20, 0, 0, 0, 0,
        0, 0, 0, 0, 20, 0, 0, 24, 0, 0, 20, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 20, 2, 24, 2, 20, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 2, 53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
        24, 24, 24, 24, 24, 24, 56, 0, 56, 24, 24, 24, 24, 24, 24, 0,
        0, 0, 0, 0, 0, 2, 53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 20, 2, 24, 2, 20, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 20, 0, 0, 24, 0, 0, 20, 0, 0, 0, 0, 0,
        0, 0, 0, 20, 0, 0, 0, 24, 0, 0, 0, 20, 0, 0, 0, 0,
        0, 0, 20, 0, 0, 0, 0, 24, 0, 0, 0, 0, 20, 0, 0, 0,
        0, 20, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 20, 0, 0,
        20, 0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 20
    ];
    // prettier-ignore
    const RAYS = [
        17, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 15, 0,
        0, 17, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 15, 0, 0,
        0, 0, 17, 0, 0, 0, 0, 16, 0, 0, 0, 0, 15, 0, 0, 0,
        0, 0, 0, 17, 0, 0, 0, 16, 0, 0, 0, 15, 0, 0, 0, 0,
        0, 0, 0, 0, 17, 0, 0, 16, 0, 0, 15, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 17, 0, 16, 0, 15, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 17, 16, 15, 0, 0, 0, 0, 0, 0, 0,
        1, 1, 1, 1, 1, 1, 1, 0, -1, -1, -1, -1, -1, -1, -1, 0,
        0, 0, 0, 0, 0, 0, -15, -16, -17, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, -15, 0, -16, 0, -17, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, -15, 0, 0, -16, 0, 0, -17, 0, 0, 0, 0, 0,
        0, 0, 0, -15, 0, 0, 0, -16, 0, 0, 0, -17, 0, 0, 0, 0,
        0, 0, -15, 0, 0, 0, 0, -16, 0, 0, 0, 0, -17, 0, 0, 0,
        0, -15, 0, 0, 0, 0, 0, -16, 0, 0, 0, 0, 0, -17, 0, 0,
        -15, 0, 0, 0, 0, 0, 0, -16, 0, 0, 0, 0, 0, 0, -17
    ];
    const PIECE_MASKS = { p: 0x1, n: 0x2, b: 0x4, r: 0x8, q: 0x10, k: 0x20 };
    const SYMBOLS = "pnbrqkPNBRQK";
    const PROMOTIONS = [KNIGHT, BISHOP, ROOK, QUEEN];
    const RANK_1 = 7;
    const RANK_2 = 6;
    /*
     * const RANK_3 = 5
     * const RANK_4 = 4
     * const RANK_5 = 3
     * const RANK_6 = 2
     */
    const RANK_7 = 1;
    const RANK_8 = 0;
    const SIDES = {
        [KING]: BITS.KSIDE_CASTLE,
        [QUEEN]: BITS.QSIDE_CASTLE,
    };
    const ROOKS = {
        w: [
            { square: Ox88.a1, flag: BITS.QSIDE_CASTLE },
            { square: Ox88.h1, flag: BITS.KSIDE_CASTLE },
        ],
        b: [
            { square: Ox88.a8, flag: BITS.QSIDE_CASTLE },
            { square: Ox88.h8, flag: BITS.KSIDE_CASTLE },
        ],
    };
    const SECOND_RANK = { b: RANK_7, w: RANK_2 };
    const SAN_NULLMOVE = "--";
    // Extracts the zero-based rank of an 0x88 square.
    function rank(square) {
        return square >> 4;
    }
    // Extracts the zero-based file of an 0x88 square.
    function file(square) {
        return square & 0xf;
    }
    function isDigit(c) {
        return "0123456789".indexOf(c) !== -1;
    }
    // Converts a 0x88 square to algebraic notation.
    function algebraic(square) {
        const f = file(square);
        const r = rank(square);
        return "abcdefgh".substring(f, f + 1) + "87654321".substring(r, r + 1);
    }
    function swapColor(color) {
        return color === WHITE ? BLACK : WHITE;
    }
    function validateFen(fen) {
        // 1st criterion: 6 space-seperated fields?
        const tokens = fen.split(/\s+/);
        if (tokens.length !== 6) {
            return {
                ok: false,
                error: "Invalid FEN: must contain six space-delimited fields",
            };
        }
        // 2nd criterion: move number field is a integer value > 0?
        const moveNumber = parseInt(tokens[5], 10);
        if (isNaN(moveNumber) || moveNumber <= 0) {
            return {
                ok: false,
                error: "Invalid FEN: move number must be a positive integer",
            };
        }
        // 3rd criterion: half move counter is an integer >= 0?
        const halfMoves = parseInt(tokens[4], 10);
        if (isNaN(halfMoves) || halfMoves < 0) {
            return {
                ok: false,
                error: "Invalid FEN: half move counter number must be a non-negative integer",
            };
        }
        // 4th criterion: 4th field is a valid e.p.-string?
        if (!/^(-|[abcdefgh][36])$/.test(tokens[3])) {
            return {
                ok: false,
                error: "Invalid FEN: en-passant square is invalid",
            };
        }
        // 5th criterion: 3th field is a valid castle-string?
        if (/[^kKqQ-]/.test(tokens[2])) {
            return {
                ok: false,
                error: "Invalid FEN: castling availability is invalid",
            };
        }
        // 6th criterion: 2nd field is "w" (white) or "b" (black)?
        if (!/^(w|b)$/.test(tokens[1])) {
            return { ok: false, error: "Invalid FEN: side-to-move is invalid" };
        }
        // 7th criterion: 1st field contains 8 rows?
        const rows = tokens[0].split("/");
        if (rows.length !== 8) {
            return {
                ok: false,
                error: "Invalid FEN: piece data does not contain 8 '/'-delimited rows",
            };
        }
        // 8th criterion: every row is valid?
        for (let i = 0; i < rows.length; i++) {
            // check for right sum of fields AND not two numbers in succession
            let sumFields = 0;
            let previousWasNumber = false;
            for (let k = 0; k < rows[i].length; k++) {
                if (isDigit(rows[i][k])) {
                    if (previousWasNumber) {
                        return {
                            ok: false,
                            error: "Invalid FEN: piece data is invalid (consecutive number)",
                        };
                    }
                    sumFields += parseInt(rows[i][k], 10);
                    previousWasNumber = true;
                } else {
                    if (!/^[prnbqkPRNBQK]$/.test(rows[i][k])) {
                        return {
                            ok: false,
                            error: "Invalid FEN: piece data is invalid (invalid piece)",
                        };
                    }
                    sumFields += 1;
                    previousWasNumber = false;
                }
            }
            if (sumFields !== 8) {
                return {
                    ok: false,
                    error: "Invalid FEN: piece data is invalid (too many squares in rank)",
                };
            }
        }
        // 9th criterion: is en-passant square legal?
        if ((tokens[3][1] == "3" && tokens[1] == "w") || (tokens[3][1] == "6" && tokens[1] == "b")) {
            return {
                ok: false,
                error: "Invalid FEN: illegal en-passant square",
            };
        }
        // 10th criterion: does chess position contain exact two kings?
        const kings = [
            { color: "white", regex: /K/g },
            { color: "black", regex: /k/g },
        ];
        for (const { color, regex } of kings) {
            if (!regex.test(tokens[0])) {
                return {
                    ok: false,
                    error: `Invalid FEN: missing ${color} king`,
                };
            }
            if ((tokens[0].match(regex) || []).length > 1) {
                return {
                    ok: false,
                    error: `Invalid FEN: too many ${color} kings`,
                };
            }
        }
        // 11th criterion: are any pawns on the first or eighth rows?
        if (Array.from(rows[0] + rows[7]).some((char) => char.toUpperCase() === "P")) {
            return {
                ok: false,
                error: "Invalid FEN: some pawns are on the edge rows",
            };
        }
        return { ok: true };
    }
    // this function is used to uniquely identify ambiguous moves
    function getDisambiguator(move, moves) {
        const from = move.from;
        const to = move.to;
        const piece = move.piece;
        let ambiguities = 0;
        let sameRank = 0;
        let sameFile = 0;
        for (let i = 0, len = moves.length; i < len; i++) {
            const ambigFrom = moves[i].from;
            const ambigTo = moves[i].to;
            const ambigPiece = moves[i].piece;
            /*
             * if a move of the same piece type ends on the same to square, we'll need
             * to add a disambiguator to the algebraic notation
             */
            if (piece === ambigPiece && from !== ambigFrom && to === ambigTo) {
                ambiguities++;
                if (rank(from) === rank(ambigFrom)) {
                    sameRank++;
                }
                if (file(from) === file(ambigFrom)) {
                    sameFile++;
                }
            }
        }
        if (ambiguities > 0) {
            if (sameRank > 0 && sameFile > 0) {
                /*
                 * if there exists a similar moving piece on the same rank and file as
                 * the move in question, use the square as the disambiguator
                 */
                return algebraic(from);
            } else if (sameFile > 0) {
                /*
                 * if the moving piece rests on the same file, use the rank symbol as the
                 * disambiguator
                 */
                return algebraic(from).charAt(1);
            } else {
                // else use the file symbol
                return algebraic(from).charAt(0);
            }
        }
        return "";
    }
    function addMove(moves, color, from, to, piece, captured = undefined, flags = BITS.NORMAL) {
        const r = rank(to);
        if (piece === PAWN && (r === RANK_1 || r === RANK_8)) {
            for (let i = 0; i < PROMOTIONS.length; i++) {
                const promotion = PROMOTIONS[i];
                moves.push({
                    color,
                    from,
                    to,
                    piece,
                    captured,
                    promotion,
                    flags: flags | BITS.PROMOTION,
                });
            }
        } else {
            moves.push({
                color,
                from,
                to,
                piece,
                captured,
                flags,
            });
        }
    }
    function inferPieceType(san) {
        let pieceType = san.charAt(0);
        if (pieceType >= "a" && pieceType <= "h") {
            const matches = san.match(/[a-h]\d.*[a-h]\d/);
            if (matches) {
                return undefined;
            }
            return PAWN;
        }
        pieceType = pieceType.toLowerCase();
        if (pieceType === "o") {
            return KING;
        }
        return pieceType;
    }
    // parses all of the decorators out of a SAN string
    function strippedSan(move) {
        return move.replace(/=/, "").replace(/[+#]?[?!]*$/, "");
    }
    class Chess {
        _board = new Array(128);
        _turn = WHITE;
        _header = {};
        _kings = { w: EMPTY, b: EMPTY };
        _epSquare = -1;
        _halfMoves = 0;
        _moveNumber = 0;
        _history = [];
        _comments = {};
        _castling = { w: 0, b: 0 };
        _hash = 0n;
        // tracks number of times a position has been seen for repetition checking
        _positionCount = new Map();
        constructor(fen = DEFAULT_POSITION, { skipValidation = false } = {}) {
            this.load(fen, { skipValidation });
        }
        clear({ preserveHeaders = false } = {}) {
            this._board = new Array(128);
            this._kings = { w: EMPTY, b: EMPTY };
            this._turn = WHITE;
            this._castling = { w: 0, b: 0 };
            this._epSquare = EMPTY;
            this._halfMoves = 0;
            this._moveNumber = 1;
            this._history = [];
            this._comments = {};
            this._header = preserveHeaders ? this._header : { ...HEADER_TEMPLATE };
            this._hash = this._computeHash();
            this._positionCount = new Map();
            /*
             * Delete the SetUp and FEN headers (if preserved), the board is empty and
             * these headers don't make sense in this state. They'll get added later
             * via .load() or .put()
             */
            this._header["SetUp"] = null;
            this._header["FEN"] = null;
        }
        load(fen, { skipValidation = false, preserveHeaders = false } = {}) {
            let tokens = fen.split(/\s+/);
            // append commonly omitted fen tokens
            if (tokens.length >= 2 && tokens.length < 6) {
                const adjustments = ["-", "-", "0", "1"];
                fen = tokens.concat(adjustments.slice(-(6 - tokens.length))).join(" ");
            }
            tokens = fen.split(/\s+/);
            if (!skipValidation) {
                const { ok, error } = validateFen(fen);
                if (!ok) {
                    throw new Error(error);
                }
            }
            const position = tokens[0];
            let square = 0;
            this.clear({ preserveHeaders });
            for (let i = 0; i < position.length; i++) {
                const piece = position.charAt(i);
                if (piece === "/") {
                    square += 8;
                } else if (isDigit(piece)) {
                    square += parseInt(piece, 10);
                } else {
                    const color = piece < "a" ? WHITE : BLACK;
                    this._put({ type: piece.toLowerCase(), color }, algebraic(square));
                    square++;
                }
            }
            this._turn = tokens[1];
            if (tokens[2].indexOf("K") > -1) {
                this._castling.w |= BITS.KSIDE_CASTLE;
            }
            if (tokens[2].indexOf("Q") > -1) {
                this._castling.w |= BITS.QSIDE_CASTLE;
            }
            if (tokens[2].indexOf("k") > -1) {
                this._castling.b |= BITS.KSIDE_CASTLE;
            }
            if (tokens[2].indexOf("q") > -1) {
                this._castling.b |= BITS.QSIDE_CASTLE;
            }
            this._epSquare = tokens[3] === "-" ? EMPTY : Ox88[tokens[3]];
            this._halfMoves = parseInt(tokens[4], 10);
            this._moveNumber = parseInt(tokens[5], 10);
            this._hash = this._computeHash();
            this._updateSetup(fen);
            this._incPositionCount();
        }
        fen({ forceEnpassantSquare = false } = {}) {
            let empty = 0;
            let fen = "";
            for (let i = Ox88.a8; i <= Ox88.h1; i++) {
                if (this._board[i]) {
                    if (empty > 0) {
                        fen += empty;
                        empty = 0;
                    }
                    const { color, type: piece } = this._board[i];
                    fen += color === WHITE ? piece.toUpperCase() : piece.toLowerCase();
                } else {
                    empty++;
                }
                if ((i + 1) & 0x88) {
                    if (empty > 0) {
                        fen += empty;
                    }
                    if (i !== Ox88.h1) {
                        fen += "/";
                    }
                    empty = 0;
                    i += 8;
                }
            }
            let castling = "";
            if (this._castling[WHITE] & BITS.KSIDE_CASTLE) {
                castling += "K";
            }
            if (this._castling[WHITE] & BITS.QSIDE_CASTLE) {
                castling += "Q";
            }
            if (this._castling[BLACK] & BITS.KSIDE_CASTLE) {
                castling += "k";
            }
            if (this._castling[BLACK] & BITS.QSIDE_CASTLE) {
                castling += "q";
            }
            // do we have an empty castling flag?
            castling = castling || "-";
            let epSquare = "-";
            /*
             * only print the ep square if en passant is a valid move (pawn is present
             * and ep capture is not pinned)
             */
            if (this._epSquare !== EMPTY) {
                if (forceEnpassantSquare) {
                    epSquare = algebraic(this._epSquare);
                } else {
                    const bigPawnSquare = this._epSquare + (this._turn === WHITE ? 16 : -16);
                    const squares = [bigPawnSquare + 1, bigPawnSquare - 1];
                    for (const square of squares) {
                        // is the square off the board?
                        if (square & 0x88) {
                            continue;
                        }
                        const color = this._turn;
                        // is there a pawn that can capture the epSquare?
                        if (this._board[square]?.color === color && this._board[square]?.type === PAWN) {
                            // if the pawn makes an ep capture, does it leave its king in check?
                            this._makeMove({
                                color,
                                from: square,
                                to: this._epSquare,
                                piece: PAWN,
                                captured: PAWN,
                                flags: BITS.EP_CAPTURE,
                            });
                            const isLegal = !this._isKingAttacked(color);
                            this._undoMove();
                            // if ep is legal, break and set the ep square in the FEN output
                            if (isLegal) {
                                epSquare = algebraic(this._epSquare);
                                break;
                            }
                        }
                    }
                }
            }
            return [fen, this._turn, castling, epSquare, this._halfMoves, this._moveNumber].join(" ");
        }
        _pieceKey(i) {
            if (!this._board[i]) {
                return 0n;
            }
            const { color, type } = this._board[i];
            const colorIndex = {
                w: 0,
                b: 1,
            }[color];
            const typeIndex = {
                p: 0,
                n: 1,
                b: 2,
                r: 3,
                q: 4,
                k: 5,
            }[type];
            return PIECE_KEYS[colorIndex][typeIndex][i];
        }
        _epKey() {
            return this._epSquare === EMPTY ? 0n : EP_KEYS[this._epSquare & 7];
        }
        _castlingKey() {
            const index = (this._castling.w >> 5) | (this._castling.b >> 3);
            return CASTLING_KEYS[index];
        }
        _computeHash() {
            let hash = 0n;
            for (let i = Ox88.a8; i <= Ox88.h1; i++) {
                // did we run off the end of the board
                if (i & 0x88) {
                    i += 7;
                    continue;
                }
                if (this._board[i]) {
                    hash ^= this._pieceKey(i);
                }
            }
            hash ^= this._epKey();
            hash ^= this._castlingKey();
            if (this._turn === "b") {
                hash ^= SIDE_KEY;
            }
            return hash;
        }
        /*
         * Called when the initial board setup is changed with put() or remove().
         * modifies the SetUp and FEN properties of the header object. If the FEN
         * is equal to the default position, the SetUp and FEN are deleted the setup
         * is only updated if history.length is zero, ie moves haven't been made.
         */
        _updateSetup(fen) {
            if (this._history.length > 0) return;
            if (fen !== DEFAULT_POSITION) {
                this._header["SetUp"] = "1";
                this._header["FEN"] = fen;
            } else {
                this._header["SetUp"] = null;
                this._header["FEN"] = null;
            }
        }
        reset() {
            this.load(DEFAULT_POSITION);
        }
        get(square) {
            return this._board[Ox88[square]];
        }
        findPiece(piece) {
            const squares = [];
            for (let i = Ox88.a8; i <= Ox88.h1; i++) {
                // did we run off the end of the board
                if (i & 0x88) {
                    i += 7;
                    continue;
                }
                // if empty square or wrong color
                if (!this._board[i] || this._board[i]?.color !== piece.color) {
                    continue;
                }
                // check if square contains the requested piece
                if (this._board[i].color === piece.color && this._board[i].type === piece.type) {
                    squares.push(algebraic(i));
                }
            }
            return squares;
        }
        put({ type, color }, square) {
            if (this._put({ type, color }, square)) {
                this._updateCastlingRights();
                this._updateEnPassantSquare();
                this._updateSetup(this.fen());
                return true;
            }
            return false;
        }
        _set(sq, piece) {
            this._hash ^= this._pieceKey(sq);
            this._board[sq] = piece;
            this._hash ^= this._pieceKey(sq);
        }
        _put({ type, color }, square) {
            // check for piece
            if (SYMBOLS.indexOf(type.toLowerCase()) === -1) {
                return false;
            }
            // check for valid square
            if (!(square in Ox88)) {
                return false;
            }
            const sq = Ox88[square];
            // don't let the user place more than one king
            if (type == KING && !(this._kings[color] == EMPTY || this._kings[color] == sq)) {
                return false;
            }
            const currentPieceOnSquare = this._board[sq];
            // if one of the kings will be replaced by the piece from args, set the `_kings` respective entry to `EMPTY`
            if (currentPieceOnSquare && currentPieceOnSquare.type === KING) {
                this._kings[currentPieceOnSquare.color] = EMPTY;
            }
            this._set(sq, { type: type, color: color });
            if (type === KING) {
                this._kings[color] = sq;
            }
            return true;
        }
        _clear(sq) {
            this._hash ^= this._pieceKey(sq);
            delete this._board[sq];
        }
        remove(square) {
            const piece = this.get(square);
            this._clear(Ox88[square]);
            if (piece && piece.type === KING) {
                this._kings[piece.color] = EMPTY;
            }
            this._updateCastlingRights();
            this._updateEnPassantSquare();
            this._updateSetup(this.fen());
            return piece;
        }
        _updateCastlingRights() {
            this._hash ^= this._castlingKey();
            const whiteKingInPlace = this._board[Ox88.e1]?.type === KING && this._board[Ox88.e1]?.color === WHITE;
            const blackKingInPlace = this._board[Ox88.e8]?.type === KING && this._board[Ox88.e8]?.color === BLACK;
            if (!whiteKingInPlace || this._board[Ox88.a1]?.type !== ROOK || this._board[Ox88.a1]?.color !== WHITE) {
                this._castling.w &= -65;
            }
            if (!whiteKingInPlace || this._board[Ox88.h1]?.type !== ROOK || this._board[Ox88.h1]?.color !== WHITE) {
                this._castling.w &= -33;
            }
            if (!blackKingInPlace || this._board[Ox88.a8]?.type !== ROOK || this._board[Ox88.a8]?.color !== BLACK) {
                this._castling.b &= -65;
            }
            if (!blackKingInPlace || this._board[Ox88.h8]?.type !== ROOK || this._board[Ox88.h8]?.color !== BLACK) {
                this._castling.b &= -33;
            }
            this._hash ^= this._castlingKey();
        }
        _updateEnPassantSquare() {
            if (this._epSquare === EMPTY) {
                return;
            }
            const startSquare = this._epSquare + (this._turn === WHITE ? -16 : 16);
            const currentSquare = this._epSquare + (this._turn === WHITE ? 16 : -16);
            const attackers = [currentSquare + 1, currentSquare - 1];
            if (this._board[startSquare] !== null || this._board[this._epSquare] !== null || this._board[currentSquare]?.color !== swapColor(this._turn) || this._board[currentSquare]?.type !== PAWN) {
                this._hash ^= this._epKey();
                this._epSquare = EMPTY;
                return;
            }
            const canCapture = (square) => !(square & 0x88) && this._board[square]?.color === this._turn && this._board[square]?.type === PAWN;
            if (!attackers.some(canCapture)) {
                this._hash ^= this._epKey();
                this._epSquare = EMPTY;
            }
        }
        _attacked(color, square, verbose) {
            const attackers = [];
            for (let i = Ox88.a8; i <= Ox88.h1; i++) {
                // did we run off the end of the board
                if (i & 0x88) {
                    i += 7;
                    continue;
                }
                // if empty square or wrong color
                if (this._board[i] === undefined || this._board[i].color !== color) {
                    continue;
                }
                const piece = this._board[i];
                const difference = i - square;
                // skip - to/from square are the same
                if (difference === 0) {
                    continue;
                }
                const index = difference + 119;
                if (ATTACKS[index] & PIECE_MASKS[piece.type]) {
                    if (piece.type === PAWN) {
                        if ((difference > 0 && piece.color === WHITE) || (difference <= 0 && piece.color === BLACK)) {
                            if (!verbose) {
                                return true;
                            } else {
                                attackers.push(algebraic(i));
                            }
                        }
                        continue;
                    }
                    // if the piece is a knight or a king
                    if (piece.type === "n" || piece.type === "k") {
                        if (!verbose) {
                            return true;
                        } else {
                            attackers.push(algebraic(i));
                            continue;
                        }
                    }
                    const offset = RAYS[index];
                    let j = i + offset;
                    let blocked = false;
                    while (j !== square) {
                        if (this._board[j] != null) {
                            blocked = true;
                            break;
                        }
                        j += offset;
                    }
                    if (!blocked) {
                        if (!verbose) {
                            return true;
                        } else {
                            attackers.push(algebraic(i));
                            continue;
                        }
                    }
                }
            }
            if (verbose) {
                return attackers;
            } else {
                return false;
            }
        }
        attackers(square, attackedBy) {
            if (!attackedBy) {
                return this._attacked(this._turn, Ox88[square], true);
            } else {
                return this._attacked(attackedBy, Ox88[square], true);
            }
        }
        _isKingAttacked(color) {
            const square = this._kings[color];
            return square === -1 ? false : this._attacked(swapColor(color), square);
        }
        hash() {
            return this._hash.toString(16);
        }
        isAttacked(square, attackedBy) {
            return this._attacked(attackedBy, Ox88[square]);
        }
        isCheck() {
            return this._isKingAttacked(this._turn);
        }
        inCheck() {
            return this.isCheck();
        }
        isCheckmate() {
            return this.isCheck() && this._moves().length === 0;
        }
        isStalemate() {
            return !this.isCheck() && this._moves().length === 0;
        }
        isInsufficientMaterial() {
            /*
             * k.b. vs k.b. (of opposite colors) with mate in 1:
             * 8/8/8/8/1b6/8/B1k5/K7 b - - 0 1
             *
             * k.b. vs k.n. with mate in 1:
             * 8/8/8/8/1n6/8/B7/K1k5 b - - 2 1
             */
            const pieces = {
                b: 0,
                n: 0,
                r: 0,
                q: 0,
                k: 0,
                p: 0,
            };
            const bishops = [];
            let numPieces = 0;
            let squareColor = 0;
            for (let i = Ox88.a8; i <= Ox88.h1; i++) {
                squareColor = (squareColor + 1) % 2;
                if (i & 0x88) {
                    i += 7;
                    continue;
                }
                const piece = this._board[i];
                if (piece) {
                    pieces[piece.type] = piece.type in pieces ? pieces[piece.type] + 1 : 1;
                    if (piece.type === BISHOP) {
                        bishops.push(squareColor);
                    }
                    numPieces++;
                }
            }
            // k vs. k
            if (numPieces === 2) {
                return true;
            } else if (
                // k vs. kn .... or .... k vs. kb
                numPieces === 3 &&
                (pieces[BISHOP] === 1 || pieces[KNIGHT] === 1)
            ) {
                return true;
            } else if (numPieces === pieces[BISHOP] + 2) {
                // kb vs. kb where any number of bishops are all on the same color
                let sum = 0;
                const len = bishops.length;
                for (let i = 0; i < len; i++) {
                    sum += bishops[i];
                }
                if (sum === 0 || sum === len) {
                    return true;
                }
            }
            return false;
        }
        isThreefoldRepetition() {
            return this._getPositionCount(this._hash) >= 3;
        }
        isDrawByFiftyMoves() {
            return this._halfMoves >= 100; // 50 moves per side = 100 half moves
        }
        isDraw() {
            return this.isDrawByFiftyMoves() || this.isStalemate() || this.isInsufficientMaterial() || this.isThreefoldRepetition();
        }
        isGameOver() {
            return this.isCheckmate() || this.isDraw();
        }
        moves({ verbose = false, square = undefined, piece = undefined } = {}) {
            const moves = this._moves({ square, piece });
            if (verbose) {
                return moves.map((move) => new Move(this, move));
            } else {
                return moves.map((move) => this._moveToSan(move, moves));
            }
        }
        _moves({ legal = true, piece = undefined, square = undefined } = {}) {
            const forSquare = square ? square.toLowerCase() : undefined;
            const forPiece = piece?.toLowerCase();
            const moves = [];
            const us = this._turn;
            const them = swapColor(us);
            let firstSquare = Ox88.a8;
            let lastSquare = Ox88.h1;
            let singleSquare = false;
            // are we generating moves for a single square?
            if (forSquare) {
                // illegal square, return empty moves
                if (!(forSquare in Ox88)) {
                    return [];
                } else {
                    firstSquare = lastSquare = Ox88[forSquare];
                    singleSquare = true;
                }
            }
            for (let from = firstSquare; from <= lastSquare; from++) {
                // did we run off the end of the board
                if (from & 0x88) {
                    from += 7;
                    continue;
                }
                // empty square or opponent, skip
                if (!this._board[from] || this._board[from].color === them) {
                    continue;
                }
                const { type } = this._board[from];
                let to;
                if (type === PAWN) {
                    if (forPiece && forPiece !== type) continue;
                    // single square, non-capturing
                    to = from + PAWN_OFFSETS[us][0];
                    if (!this._board[to]) {
                        addMove(moves, us, from, to, PAWN);
                        // double square
                        to = from + PAWN_OFFSETS[us][1];
                        if (SECOND_RANK[us] === rank(from) && !this._board[to]) {
                            addMove(moves, us, from, to, PAWN, undefined, BITS.BIG_PAWN);
                        }
                    }
                    // pawn captures
                    for (let j = 2; j < 4; j++) {
                        to = from + PAWN_OFFSETS[us][j];
                        if (to & 0x88) continue;
                        if (this._board[to]?.color === them) {
                            addMove(moves, us, from, to, PAWN, this._board[to].type, BITS.CAPTURE);
                        } else if (to === this._epSquare) {
                            addMove(moves, us, from, to, PAWN, PAWN, BITS.EP_CAPTURE);
                        }
                    }
                } else {
                    if (forPiece && forPiece !== type) continue;
                    for (let j = 0, len = PIECE_OFFSETS[type].length; j < len; j++) {
                        const offset = PIECE_OFFSETS[type][j];
                        to = from;
                        while (true) {
                            to += offset;
                            if (to & 0x88) break;
                            if (!this._board[to]) {
                                addMove(moves, us, from, to, type);
                            } else {
                                // own color, stop loop
                                if (this._board[to].color === us) break;
                                addMove(moves, us, from, to, type, this._board[to].type, BITS.CAPTURE);
                                break;
                            }
                            /* break, if knight or king */
                            if (type === KNIGHT || type === KING) break;
                        }
                    }
                }
            }
            /*
             * check for castling if we're:
             *   a) generating all moves, or
             *   b) doing single square move generation on the king's square
             */
            if (forPiece === undefined || forPiece === KING) {
                if (!singleSquare || lastSquare === this._kings[us]) {
                    // king-side castling
                    if (this._castling[us] & BITS.KSIDE_CASTLE) {
                        const castlingFrom = this._kings[us];
                        const castlingTo = castlingFrom + 2;
                        if (
                            !this._board[castlingFrom + 1] &&
                            !this._board[castlingTo] &&
                            !this._attacked(them, this._kings[us]) &&
                            !this._attacked(them, castlingFrom + 1) &&
                            !this._attacked(them, castlingTo)
                        ) {
                            addMove(moves, us, this._kings[us], castlingTo, KING, undefined, BITS.KSIDE_CASTLE);
                        }
                    }
                    // queen-side castling
                    if (this._castling[us] & BITS.QSIDE_CASTLE) {
                        const castlingFrom = this._kings[us];
                        const castlingTo = castlingFrom - 2;
                        if (
                            !this._board[castlingFrom - 1] &&
                            !this._board[castlingFrom - 2] &&
                            !this._board[castlingFrom - 3] &&
                            !this._attacked(them, this._kings[us]) &&
                            !this._attacked(them, castlingFrom - 1) &&
                            !this._attacked(them, castlingTo)
                        ) {
                            addMove(moves, us, this._kings[us], castlingTo, KING, undefined, BITS.QSIDE_CASTLE);
                        }
                    }
                }
            }
            /*
             * return all pseudo-legal moves (this includes moves that allow the king
             * to be captured)
             */
            if (!legal || this._kings[us] === -1) {
                return moves;
            }
            // filter out illegal moves
            const legalMoves = [];
            for (let i = 0, len = moves.length; i < len; i++) {
                this._makeMove(moves[i]);
                if (!this._isKingAttacked(us)) {
                    legalMoves.push(moves[i]);
                }
                this._undoMove();
            }
            return legalMoves;
        }
        move(move, { strict = false } = {}) {
            /*
             * The move function can be called with in the following parameters:
             *
             * .move('Nxb7')       <- argument is a case-sensitive SAN string
             *
             * .move({ from: 'h7', <- argument is a move object
             *         to :'h8',
             *         promotion: 'q' })
             *
             *
             * An optional strict argument may be supplied to tell chess.js to
             * strictly follow the SAN specification.
             */
            let moveObj = null;
            if (typeof move === "string") {
                moveObj = this._moveFromSan(move, strict);
            } else if (move === null) {
                moveObj = this._moveFromSan(SAN_NULLMOVE, strict);
            } else if (typeof move === "object") {
                const moves = this._moves();
                // convert the pretty move object to an ugly move object
                for (let i = 0, len = moves.length; i < len; i++) {
                    if (move.from === algebraic(moves[i].from) && move.to === algebraic(moves[i].to) && (!("promotion" in moves[i]) || move.promotion === moves[i].promotion)) {
                        moveObj = moves[i];
                        break;
                    }
                }
            }
            // failed to find move
            if (!moveObj) {
                if (typeof move === "string") {
                    throw new Error(`Invalid move: ${move}`);
                } else {
                    throw new Error(`Invalid move: ${JSON.stringify(move)}`);
                }
            }
            //disallow null moves when in check
            if (this.isCheck() && moveObj.flags & BITS.NULL_MOVE) {
                throw new Error("Null move not allowed when in check");
            }
            /*
             * need to make a copy of move because we can't generate SAN after the move
             * is made
             */
            const prettyMove = new Move(this, moveObj);
            this._makeMove(moveObj);
            this._incPositionCount();
            return prettyMove;
        }
        _push(move) {
            this._history.push({
                move,
                kings: { b: this._kings.b, w: this._kings.w },
                turn: this._turn,
                castling: { b: this._castling.b, w: this._castling.w },
                epSquare: this._epSquare,
                halfMoves: this._halfMoves,
                moveNumber: this._moveNumber,
            });
        }
        _movePiece(from, to) {
            this._hash ^= this._pieceKey(from);
            this._board[to] = this._board[from];
            delete this._board[from];
            this._hash ^= this._pieceKey(to);
        }
        _makeMove(move) {
            const us = this._turn;
            const them = swapColor(us);
            this._push(move);
            if (move.flags & BITS.NULL_MOVE) {
                if (us === BLACK) {
                    this._moveNumber++;
                }
                this._halfMoves++;
                this._turn = them;
                this._epSquare = EMPTY;
                return;
            }
            this._hash ^= this._epKey();
            this._hash ^= this._castlingKey();
            if (move.captured) {
                this._hash ^= this._pieceKey(move.to);
            }
            this._movePiece(move.from, move.to);
            // if ep capture, remove the captured pawn
            if (move.flags & BITS.EP_CAPTURE) {
                if (this._turn === BLACK) {
                    this._clear(move.to - 16);
                } else {
                    this._clear(move.to + 16);
                }
            }
            // if pawn promotion, replace with new piece
            if (move.promotion) {
                this._clear(move.to);
                this._set(move.to, { type: move.promotion, color: us });
            }
            // if we moved the king
            if (this._board[move.to].type === KING) {
                this._kings[us] = move.to;
                // if we castled, move the rook next to the king
                if (move.flags & BITS.KSIDE_CASTLE) {
                    const castlingTo = move.to - 1;
                    const castlingFrom = move.to + 1;
                    this._movePiece(castlingFrom, castlingTo);
                } else if (move.flags & BITS.QSIDE_CASTLE) {
                    const castlingTo = move.to + 1;
                    const castlingFrom = move.to - 2;
                    this._movePiece(castlingFrom, castlingTo);
                }
                // turn off castling
                this._castling[us] = 0;
            }
            // turn off castling if we move a rook
            if (this._castling[us]) {
                for (let i = 0, len = ROOKS[us].length; i < len; i++) {
                    if (move.from === ROOKS[us][i].square && this._castling[us] & ROOKS[us][i].flag) {
                        this._castling[us] ^= ROOKS[us][i].flag;
                        break;
                    }
                }
            }
            // turn off castling if we capture a rook
            if (this._castling[them]) {
                for (let i = 0, len = ROOKS[them].length; i < len; i++) {
                    if (move.to === ROOKS[them][i].square && this._castling[them] & ROOKS[them][i].flag) {
                        this._castling[them] ^= ROOKS[them][i].flag;
                        break;
                    }
                }
            }
            this._hash ^= this._castlingKey();
            // if big pawn move, update the en passant square
            if (move.flags & BITS.BIG_PAWN) {
                let epSquare;
                if (us === BLACK) {
                    epSquare = move.to - 16;
                } else {
                    epSquare = move.to + 16;
                }
                if (
                    (!((move.to - 1) & 0x88) && this._board[move.to - 1]?.type === PAWN && this._board[move.to - 1]?.color === them) ||
                    (!((move.to + 1) & 0x88) && this._board[move.to + 1]?.type === PAWN && this._board[move.to + 1]?.color === them)
                ) {
                    this._epSquare = epSquare;
                    this._hash ^= this._epKey();
                } else {
                    this._epSquare = EMPTY;
                }
            } else {
                this._epSquare = EMPTY;
            }
            // reset the 50 move counter if a pawn is moved or a piece is captured
            if (move.piece === PAWN) {
                this._halfMoves = 0;
            } else if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
                this._halfMoves = 0;
            } else {
                this._halfMoves++;
            }
            if (us === BLACK) {
                this._moveNumber++;
            }
            this._turn = them;
            this._hash ^= SIDE_KEY;
        }
        undo() {
            const hash = this._hash;
            const move = this._undoMove();
            if (move) {
                const prettyMove = new Move(this, move);
                this._decPositionCount(hash);
                return prettyMove;
            }
            return null;
        }
        _undoMove() {
            const old = this._history.pop();
            if (old === undefined) {
                return null;
            }
            this._hash ^= this._epKey();
            this._hash ^= this._castlingKey();
            const move = old.move;
            this._kings = old.kings;
            this._turn = old.turn;
            this._castling = old.castling;
            this._epSquare = old.epSquare;
            this._halfMoves = old.halfMoves;
            this._moveNumber = old.moveNumber;
            this._hash ^= this._epKey();
            this._hash ^= this._castlingKey();
            this._hash ^= SIDE_KEY;
            const us = this._turn;
            const them = swapColor(us);
            if (move.flags & BITS.NULL_MOVE) {
                return move;
            }
            this._movePiece(move.to, move.from);
            // to undo any promotions
            if (move.piece) {
                this._clear(move.from);
                this._set(move.from, { type: move.piece, color: us });
            }
            if (move.captured) {
                if (move.flags & BITS.EP_CAPTURE) {
                    // en passant capture
                    let index;
                    if (us === BLACK) {
                        index = move.to - 16;
                    } else {
                        index = move.to + 16;
                    }
                    this._set(index, { type: PAWN, color: them });
                } else {
                    // regular capture
                    this._set(move.to, { type: move.captured, color: them });
                }
            }
            if (move.flags & (BITS.KSIDE_CASTLE | BITS.QSIDE_CASTLE)) {
                let castlingTo, castlingFrom;
                if (move.flags & BITS.KSIDE_CASTLE) {
                    castlingTo = move.to + 1;
                    castlingFrom = move.to - 1;
                } else {
                    castlingTo = move.to - 2;
                    castlingFrom = move.to + 1;
                }
                this._movePiece(castlingFrom, castlingTo);
            }
            return move;
        }
        pgn({ newline = "\n", maxWidth = 0 } = {}) {
            /*
             * using the specification from http://www.chessclub.com/help/PGN-spec
             * example for html usage: .pgn({ max_width: 72, newline_char: "<br />" })
             */
            const result = [];
            let headerExists = false;
            /* add the PGN header information */
            for (const i in this._header) {
                /*
                 * TODO: order of enumerated properties in header object is not
                 * guaranteed, see ECMA-262 spec (section 12.6.4)
                 *
                 * By using HEADER_TEMPLATE, the order of tags should be preserved; we
                 * do have to check for null placeholders, though, and omit them
                 */
                const headerTag = this._header[i];
                if (headerTag) result.push(`[${i} "${this._header[i]}"]` + newline);
                headerExists = true;
            }
            if (headerExists && this._history.length) {
                result.push(newline);
            }
            const appendComment = (moveString) => {
                const comment = this._comments[this.fen()];
                if (typeof comment !== "undefined") {
                    const delimiter = moveString.length > 0 ? " " : "";
                    moveString = `${moveString}${delimiter}{${comment}}`;
                }
                return moveString;
            };
            // pop all of history onto reversed_history
            const reversedHistory = [];
            while (this._history.length > 0) {
                reversedHistory.push(this._undoMove());
            }
            const moves = [];
            let moveString = "";
            // special case of a commented starting position with no moves
            if (reversedHistory.length === 0) {
                moves.push(appendComment(""));
            }
            // build the list of moves.  a move_string looks like: "3. e3 e6"
            while (reversedHistory.length > 0) {
                moveString = appendComment(moveString);
                const move = reversedHistory.pop();
                // make TypeScript stop complaining about move being undefined
                if (!move) {
                    break;
                }
                // if the position started with black to move, start PGN with #. ...
                if (!this._history.length && move.color === "b") {
                    const prefix = `${this._moveNumber}. ...`;
                    // is there a comment preceding the first move?
                    moveString = moveString ? `${moveString} ${prefix}` : prefix;
                } else if (move.color === "w") {
                    // store the previous generated move_string if we have one
                    if (moveString.length) {
                        moves.push(moveString);
                    }
                    moveString = this._moveNumber + ".";
                }
                moveString = moveString + " " + this._moveToSan(move, this._moves({ legal: true }));
                this._makeMove(move);
            }
            // are there any other leftover moves?
            if (moveString.length) {
                moves.push(appendComment(moveString));
            }
            // is there a result? (there ALWAYS has to be a result according to spec; see Seven Tag Roster)
            moves.push(this._header.Result || "*");
            /*
             * history should be back to what it was before we started generating PGN,
             * so join together moves
             */
            if (maxWidth === 0) {
                return result.join("") + moves.join(" ");
            }
            // TODO (jah): huh?
            const strip = function () {
                if (result.length > 0 && result[result.length - 1] === " ") {
                    result.pop();
                    return true;
                }
                return false;
            };
            // NB: this does not preserve comment whitespace.
            const wrapComment = function (width, move) {
                for (const token of move.split(" ")) {
                    if (!token) {
                        continue;
                    }
                    if (width + token.length > maxWidth) {
                        while (strip()) {
                            width--;
                        }
                        result.push(newline);
                        width = 0;
                    }
                    result.push(token);
                    width += token.length;
                    result.push(" ");
                    width++;
                }
                if (strip()) {
                    width--;
                }
                return width;
            };
            // wrap the PGN output at max_width
            let currentWidth = 0;
            for (let i = 0; i < moves.length; i++) {
                if (currentWidth + moves[i].length > maxWidth) {
                    if (moves[i].includes("{")) {
                        currentWidth = wrapComment(currentWidth, moves[i]);
                        continue;
                    }
                }
                // if the current move will push past max_width
                if (currentWidth + moves[i].length > maxWidth && i !== 0) {
                    // don't end the line with whitespace
                    if (result[result.length - 1] === " ") {
                        result.pop();
                    }
                    result.push(newline);
                    currentWidth = 0;
                } else if (i !== 0) {
                    result.push(" ");
                    currentWidth++;
                }
                result.push(moves[i]);
                currentWidth += moves[i].length;
            }
            return result.join("");
        }
        /**
         * @deprecated Use `setHeader` and `getHeaders` instead. This method will return null header tags (which is not what you want)
         */
        header(...args) {
            for (let i = 0; i < args.length; i += 2) {
                if (typeof args[i] === "string" && typeof args[i + 1] === "string") {
                    this._header[args[i]] = args[i + 1];
                }
            }
            return this._header;
        }
        // TODO: value validation per spec
        setHeader(key, value) {
            this._header[key] = value ?? SEVEN_TAG_ROSTER[key] ?? null;
            return this.getHeaders();
        }
        removeHeader(key) {
            if (key in this._header) {
                this._header[key] = SEVEN_TAG_ROSTER[key] || null;
                return true;
            }
            return false;
        }
        // return only non-null headers (omit placemarker nulls)
        getHeaders() {
            const nonNullHeaders = {};
            for (const [key, value] of Object.entries(this._header)) {
                if (value !== null) {
                    nonNullHeaders[key] = value;
                }
            }
            return nonNullHeaders;
        }
        loadPgn(pgn, { strict = false, newlineChar = "\r?\n" } = {}) {
            // If newlineChar is not the default, replace all instances with \n
            if (newlineChar !== "\r?\n") {
                pgn = pgn.replace(new RegExp(newlineChar, "g"), "\n");
            }
            const parsedPgn = peg$parse(pgn);
            // Put the board in the starting position
            this.reset();
            // parse PGN header
            const headers = parsedPgn.headers;
            let fen = "";
            for (const key in headers) {
                // check to see user is including fen (possibly with wrong tag case)
                if (key.toLowerCase() === "fen") {
                    fen = headers[key];
                }
                this.header(key, headers[key]);
            }
            /*
             * the permissive parser should attempt to load a fen tag, even if it's the
             * wrong case and doesn't include a corresponding [SetUp "1"] tag
             */
            if (!strict) {
                if (fen) {
                    this.load(fen, { preserveHeaders: true });
                }
            } else {
                /*
                 * strict parser - load the starting position indicated by [Setup '1']
                 * and [FEN position]
                 */
                if (headers["SetUp"] === "1") {
                    if (!("FEN" in headers)) {
                        throw new Error("Invalid PGN: FEN tag must be supplied with SetUp tag");
                    }
                    // don't clear the headers when loading
                    this.load(headers["FEN"], { preserveHeaders: true });
                }
            }
            let node = parsedPgn.root;
            while (node) {
                if (node.move) {
                    const move = this._moveFromSan(node.move, strict);
                    if (move == null) {
                        throw new Error(`Invalid move in PGN: ${node.move}`);
                    } else {
                        this._makeMove(move);
                        this._incPositionCount();
                    }
                }
                if (node.comment !== undefined) {
                    this._comments[this.fen()] = node.comment;
                }
                node = node.variations[0];
            }
            /*
             * Per section 8.2.6 of the PGN spec, the Result tag pair must match match
             * the termination marker. Only do this when headers are present, but the
             * result tag is missing
             */
            const result = parsedPgn.result;
            if (result && Object.keys(this._header).length && this._header["Result"] !== result) {
                this.setHeader("Result", result);
            }
        }
        /*
         * Convert a move from 0x88 coordinates to Standard Algebraic Notation
         * (SAN)
         *
         * @param {boolean} strict Use the strict SAN parser. It will throw errors
         * on overly disambiguated moves (see below):
         *
         * r1bqkbnr/ppp2ppp/2n5/1B1pP3/4P3/8/PPPP2PP/RNBQK1NR b KQkq - 2 4
         * 4. ... Nge7 is overly disambiguated because the knight on c6 is pinned
         * 4. ... Ne7 is technically the valid SAN
         */
        _moveToSan(move, moves) {
            let output = "";
            if (move.flags & BITS.KSIDE_CASTLE) {
                output = "O-O";
            } else if (move.flags & BITS.QSIDE_CASTLE) {
                output = "O-O-O";
            } else if (move.flags & BITS.NULL_MOVE) {
                return SAN_NULLMOVE;
            } else {
                if (move.piece !== PAWN) {
                    const disambiguator = getDisambiguator(move, moves);
                    output += move.piece.toUpperCase() + disambiguator;
                }
                if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
                    if (move.piece === PAWN) {
                        output += algebraic(move.from)[0];
                    }
                    output += "x";
                }
                output += algebraic(move.to);
                if (move.promotion) {
                    output += "=" + move.promotion.toUpperCase();
                }
            }
            this._makeMove(move);
            if (this.isCheck()) {
                if (this.isCheckmate()) {
                    output += "#";
                } else {
                    output += "+";
                }
            }
            this._undoMove();
            return output;
        }
        // convert a move from Standard Algebraic Notation (SAN) to 0x88 coordinates
        _moveFromSan(move, strict = false) {
            // strip off any move decorations: e.g Nf3+?! becomes Nf3
            let cleanMove = strippedSan(move);
            if (!strict) {
                if (cleanMove === "0-0") {
                    cleanMove = "O-O";
                } else if (cleanMove === "0-0-0") {
                    cleanMove = "O-O-O";
                }
            }
            //first implementation of null with a dummy move (black king moves from a8 to a8), maybe this can be implemented better
            if (cleanMove == SAN_NULLMOVE) {
                const res = {
                    color: this._turn,
                    from: 0,
                    to: 0,
                    piece: "k",
                    flags: BITS.NULL_MOVE,
                };
                return res;
            }
            let pieceType = inferPieceType(cleanMove);
            let moves = this._moves({ legal: true, piece: pieceType });
            // strict parser
            for (let i = 0, len = moves.length; i < len; i++) {
                if (cleanMove === strippedSan(this._moveToSan(moves[i], moves))) {
                    return moves[i];
                }
            }
            // the strict parser failed
            if (strict) {
                return null;
            }
            let piece = undefined;
            let matches = undefined;
            let from = undefined;
            let to = undefined;
            let promotion = undefined;
            /*
             * The default permissive (non-strict) parser allows the user to parse
             * non-standard chess notations. This parser is only run after the strict
             * Standard Algebraic Notation (SAN) parser has failed.
             *
             * When running the permissive parser, we'll run a regex to grab the piece, the
             * to/from square, and an optional promotion piece. This regex will
             * parse common non-standard notation like: Pe2-e4, Rc1c4, Qf3xf7,
             * f7f8q, b1c3
             *
             * NOTE: Some positions and moves may be ambiguous when using the permissive
             * parser. For example, in this position: 6k1/8/8/B7/8/8/8/BN4K1 w - - 0 1,
             * the move b1c3 may be interpreted as Nc3 or B1c3 (a disambiguated bishop
             * move). In these cases, the permissive parser will default to the most
             * basic interpretation (which is b1c3 parsing to Nc3).
             */
            let overlyDisambiguated = false;
            matches = cleanMove.match(/([pnbrqkPNBRQK])?([a-h][1-8])x?-?([a-h][1-8])([qrbnQRBN])?/);
            if (matches) {
                piece = matches[1];
                from = matches[2];
                to = matches[3];
                promotion = matches[4];
                if (from.length == 1) {
                    overlyDisambiguated = true;
                }
            } else {
                /*
                 * The [a-h]?[1-8]? portion of the regex below handles moves that may be
                 * overly disambiguated (e.g. Nge7 is unnecessary and non-standard when
                 * there is one legal knight move to e7). In this case, the value of
                 * 'from' variable will be a rank or file, not a square.
                 */
                matches = cleanMove.match(/([pnbrqkPNBRQK])?([a-h]?[1-8]?)x?-?([a-h][1-8])([qrbnQRBN])?/);
                if (matches) {
                    piece = matches[1];
                    from = matches[2];
                    to = matches[3];
                    promotion = matches[4];
                    if (from.length == 1) {
                        overlyDisambiguated = true;
                    }
                }
            }
            pieceType = inferPieceType(cleanMove);
            moves = this._moves({
                legal: true,
                piece: piece ? piece : pieceType,
            });
            if (!to) {
                return null;
            }
            for (let i = 0, len = moves.length; i < len; i++) {
                if (!from) {
                    // if there is no from square, it could be just 'x' missing from a capture
                    if (cleanMove === strippedSan(this._moveToSan(moves[i], moves)).replace("x", "")) {
                        return moves[i];
                    }
                    // hand-compare move properties with the results from our permissive regex
                } else if (
                    (!piece || piece.toLowerCase() == moves[i].piece) &&
                    Ox88[from] == moves[i].from &&
                    Ox88[to] == moves[i].to &&
                    (!promotion || promotion.toLowerCase() == moves[i].promotion)
                ) {
                    return moves[i];
                } else if (overlyDisambiguated) {
                    /*
                     * SPECIAL CASE: we parsed a move string that may have an unneeded
                     * rank/file disambiguator (e.g. Nge7).  The 'from' variable will
                     */
                    const square = algebraic(moves[i].from);
                    if (
                        (!piece || piece.toLowerCase() == moves[i].piece) &&
                        Ox88[to] == moves[i].to &&
                        (from == square[0] || from == square[1]) &&
                        (!promotion || promotion.toLowerCase() == moves[i].promotion)
                    ) {
                        return moves[i];
                    }
                }
            }
            return null;
        }
        ascii() {
            let s = "   +------------------------+\n";
            for (let i = Ox88.a8; i <= Ox88.h1; i++) {
                // display the rank
                if (file(i) === 0) {
                    s += " " + "87654321"[rank(i)] + " |";
                }
                if (this._board[i]) {
                    const piece = this._board[i].type;
                    const color = this._board[i].color;
                    const symbol = color === WHITE ? piece.toUpperCase() : piece.toLowerCase();
                    s += " " + symbol + " ";
                } else {
                    s += " . ";
                }
                if ((i + 1) & 0x88) {
                    s += "|\n";
                    i += 8;
                }
            }
            s += "   +------------------------+\n";
            s += "     a  b  c  d  e  f  g  h";
            return s;
        }
        perft(depth) {
            const moves = this._moves({ legal: false });
            let nodes = 0;
            const color = this._turn;
            for (let i = 0, len = moves.length; i < len; i++) {
                this._makeMove(moves[i]);
                if (!this._isKingAttacked(color)) {
                    if (depth - 1 > 0) {
                        nodes += this.perft(depth - 1);
                    } else {
                        nodes++;
                    }
                }
                this._undoMove();
            }
            return nodes;
        }
        setTurn(color) {
            if (this._turn == color) {
                return false;
            }
            this.move("--");
            return true;
        }
        turn() {
            return this._turn;
        }
        board() {
            const output = [];
            let row = [];
            for (let i = Ox88.a8; i <= Ox88.h1; i++) {
                if (this._board[i] == null) {
                    row.push(null);
                } else {
                    row.push({
                        square: algebraic(i),
                        type: this._board[i].type,
                        color: this._board[i].color,
                    });
                }
                if ((i + 1) & 0x88) {
                    output.push(row);
                    row = [];
                    i += 8;
                }
            }
            return output;
        }
        squareColor(square) {
            if (square in Ox88) {
                const sq = Ox88[square];
                return (rank(sq) + file(sq)) % 2 === 0 ? "light" : "dark";
            }
            return null;
        }
        history({ verbose = false } = {}) {
            const reversedHistory = [];
            const moveHistory = [];
            while (this._history.length > 0) {
                reversedHistory.push(this._undoMove());
            }
            while (true) {
                const move = reversedHistory.pop();
                if (!move) {
                    break;
                }
                if (verbose) {
                    moveHistory.push(new Move(this, move));
                } else {
                    moveHistory.push(this._moveToSan(move, this._moves()));
                }
                this._makeMove(move);
            }
            return moveHistory;
        }
        /*
         * Keeps track of position occurrence counts for the purpose of repetition
         * checking. Old positions are removed from the map if their counts are reduced to 0.
         */
        _getPositionCount(hash) {
            return this._positionCount.get(hash) ?? 0;
        }
        _incPositionCount() {
            this._positionCount.set(this._hash, (this._positionCount.get(this._hash) ?? 0) + 1);
        }
        _decPositionCount(hash) {
            const currentCount = this._positionCount.get(hash) ?? 0;
            if (currentCount === 1) {
                this._positionCount.delete(hash);
            } else {
                this._positionCount.set(hash, currentCount - 1);
            }
        }
        _pruneComments() {
            const reversedHistory = [];
            const currentComments = {};
            const copyComment = (fen) => {
                if (fen in this._comments) {
                    currentComments[fen] = this._comments[fen];
                }
            };
            while (this._history.length > 0) {
                reversedHistory.push(this._undoMove());
            }
            copyComment(this.fen());
            while (true) {
                const move = reversedHistory.pop();
                if (!move) {
                    break;
                }
                this._makeMove(move);
                copyComment(this.fen());
            }
            this._comments = currentComments;
        }
        getComment() {
            return this._comments[this.fen()];
        }
        setComment(comment) {
            this._comments[this.fen()] = comment.replace("{", "[").replace("}", "]");
        }
        /**
         * @deprecated Renamed to `removeComment` for consistency
         */
        deleteComment() {
            return this.removeComment();
        }
        removeComment() {
            const comment = this._comments[this.fen()];
            delete this._comments[this.fen()];
            return comment;
        }
        getComments() {
            this._pruneComments();
            return Object.keys(this._comments).map((fen) => {
                return { fen: fen, comment: this._comments[fen] };
            });
        }
        /**
         * @deprecated Renamed to `removeComments` for consistency
         */
        deleteComments() {
            return this.removeComments();
        }
        removeComments() {
            this._pruneComments();
            return Object.keys(this._comments).map((fen) => {
                const comment = this._comments[fen];
                delete this._comments[fen];
                return { fen: fen, comment: comment };
            });
        }
        setCastlingRights(color, rights) {
            for (const side of [KING, QUEEN]) {
                if (rights[side] !== undefined) {
                    if (rights[side]) {
                        this._castling[color] |= SIDES[side];
                    } else {
                        this._castling[color] &= ~SIDES[side];
                    }
                }
            }
            this._updateCastlingRights();
            const result = this.getCastlingRights(color);
            return (rights[KING] === undefined || rights[KING] === result[KING]) && (rights[QUEEN] === undefined || rights[QUEEN] === result[QUEEN]);
        }
        getCastlingRights(color) {
            return {
                [KING]: (this._castling[color] & SIDES[KING]) !== 0,
                [QUEEN]: (this._castling[color] & SIDES[QUEEN]) !== 0,
            };
        }
        moveNumber() {
            return this._moveNumber;
        }
    }

    return {
        BISHOP,
        BLACK,
        Chess,
        DEFAULT_POSITION,
        KING,
        KNIGHT,
        Move,
        PAWN,
        QUEEN,
        ROOK,
        SEVEN_TAG_ROSTER,
        SQUARES,
        WHITE,
        validateFen,
        xoroshiro128,
    };
}

const P4wnEngine = (() => {
    "use strict";

    /* p4wn, AKA 5k chess - by Douglas Bagnall <douglas@paradise.net.nz>
    *
    * This code is in the public domain, or as close to it as various
    * laws allow. No warranty; no restrictions.
    *
    * lives at http://p4wn.sf.net/
    */

    /*Compatibility tricks:
     * backwards for old MSIEs (to 5.5)
     * sideways for seed command-line javascript.*/
    var p4_log;
    const __p4_global = (typeof globalThis !== "undefined") ? globalThis : {};

    if (__p4_global.imports !== undefined && __p4_global.printerr !== undefined) { // seed or gjs
        p4_log = function () {
            var args = Array.prototype.slice.call(arguments);
            __p4_global.printerr(args.join(", "));
        };
    } else if (__p4_global.console === undefined) { // MSIE
        p4_log = function () { };
    } else {
        p4_log = function () { __p4_global.console.log.apply(__p4_global.console, arguments); };
    }

    /*MSIE Date.now backport */
    if (Date.now === undefined)
        Date.now = function () { return (new Date).getTime(); };

    /* The pieces are stored as numbers between 2 and 13, inclusive.
     * Empty squares are stored as 0, and off-board squares as 16.
     * There is some bitwise logic to it:
     *  piece & 1 -> colour (white: 0, black: 1)
     *  piece & 2 -> single move piece (including pawn)
     *  if (piece & 2) == 0:
     *     piece & 4  -> row and column moves
     *     piece & 8  -> diagonal moves
     */
    var P4_PAWN = 2, P4_ROOK = 4, P4_KNIGHT = 6, P4_BISHOP = 8, P4_QUEEN = 12, P4_KING = 10;
    var P4_EDGE = 16;

    /* in order, even indices: <nothing>, pawn, rook, knight, bishop, king, queen. Only the
     * even indices are used.*/
    var P4_MOVES = [[], [],
    [], [],
    [1, 10, -1, -10], [],
    [21, 19, 12, 8, -21, -19, -12, -8], [],
    [11, 9, -11, -9], [],
    [1, 10, 11, 9, -1, -10, -11, -9], [],
    [1, 10, 11, 9, -1, -10, -11, -9], []
    ];

    /*P4_VALUES defines the relative value of various pieces.
     *
     * It follows the 1,3,3,5,9 pattern you learn as a kid, multiplied by
     * 20 to give sub-pawn resolution to other factors, with bishops given
     * a wee boost over knights.
     */
    var P4_VALUES = [0, 0,      //Piece values
        20, 20,    //pawns
        100, 100,  //rooks
        60, 60,    //knights
        61, 61,    //bishops
        8000, 8000,//kings
        180, 180,  //queens
        0];

    /* A score greater than P4_WIN indicates a king has been taken. It is
     * less than the value of a king, in case someone finds a way to, say,
     * sacrifice two queens in order to checkmate.
     */
    var P4_KING_VALUE = P4_VALUES[10];
    var P4_WIN = P4_KING_VALUE >> 1;

    /* every move, a winning score decreases by this much */
    var P4_WIN_DECAY = 300;
    var P4_WIN_NOW = P4_KING_VALUE - 250;

    /* P4_{MAX,MIN}_SCORE should be beyond any possible evaluated score */

    var P4_MAX_SCORE = 9999;    // extremes of evaluation range
    var P4_MIN_SCORE = -P4_MAX_SCORE;

    /*initialised in p4_initialise_state */
    var P4_CENTRALISING_WEIGHTS;
    var P4_BASE_PAWN_WEIGHTS;
    var P4_KNIGHT_WEIGHTS;

    /*P4_DEBUG turns on debugging features */
    var P4_DEBUG = 0;
    var P4_INITIAL_BOARD = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 1 1";

    /*use javascript typed arrays rather than plain arrays
     * (faster in some browsers, unsupported in others, possibly slower elsewhere) */
    var P4_USE_TYPED_ARRAYS = (typeof Int32Array !== "undefined");

    var P4_PIECE_LUT = { /*for FEN, PGN interpretation */
        P: 2,
        p: 3,
        R: 4,
        r: 5,
        N: 6,
        n: 7,
        B: 8,
        b: 9,
        K: 10,
        k: 11,
        Q: 12,
        q: 13
    };

    var P4_ENCODE_LUT = '  PPRRNNBBKKQQ';


    function p4_alphabeta_treeclimber(state, count, colour, score, s, e, alpha, beta) {
        var move = p4_make_move(state, s, e, P4_QUEEN);
        var i;
        var ncolour = 1 - colour;
        var movelist = p4_parse(state, colour, move.ep, -score);
        var movecount = movelist.length;
        if (count) {
            //branch nodes
            var t;
            for (i = 0; i < movecount; i++) {
                var mv = movelist[i];
                var mscore = mv[0];
                var ms = mv[1];
                var me = mv[2];
                if (mscore > P4_WIN) { //we won! Don't look further.
                    alpha = P4_KING_VALUE;
                    break;
                }
                t = -p4_alphabeta_treeclimber(state, count - 1, ncolour, mscore, ms, me,
                    -beta, -alpha);
                if (t > alpha) {
                    alpha = t;
                }
                if (alpha >= beta) {
                    break;
                }
            }
            if (alpha < -P4_WIN_NOW && !p4_check_check(state, colour)) {
                /* Whatever we do, we lose the king.
                 * But if it is not check then this is stalemate, and the
                 * score doesn't apply.
                 */
                alpha = state.stalemate_scores[colour];
            }
            if (alpha < -P4_WIN) {
                /*make distant checkmate seem less bad */
                alpha += P4_WIN_DECAY;
            }
        }
        else {
            //leaf nodes
            while (beta > alpha && --movecount != -1) {
                if (movelist[movecount][0] > alpha) {
                    alpha = movelist[movecount][0];
                }
            }
        }
        p4_unmake_move(state, move);
        return alpha;
    }


    /* p4_prepare() works out weightings for assessing various moves,
     * favouring centralising moves early, for example.
     *
     * It is called before each tree search, not for each parse(), so it
     * is OK for it to be a little bit slow. But that also means it drifts
     * out of sync with the real board state, especially on deep searches.
     */

    function p4_prepare(state) {
        var i, j, x, y, a;
        var pieces = state.pieces = [[], []];
        /*convert state.moveno half move count to move cycle count */
        var moveno = state.moveno >> 1;
        var board = state.board;

        /* high earliness_weight indicates a low move number. The formula
         * should work above moveno == 50, but this is javascript.
         */
        var earliness_weight = (moveno > 50) ? 0 : parseInt(6 * Math.exp(moveno * -0.07));
        var king_should_hide = moveno < 12;
        var early = moveno < 5;
        /* find the pieces, kings, and weigh material*/
        var kings = [0, 0];
        var material = [0, 0];
        var best_pieces = [0, 0];
        for (i = 20; i < 100; i++) {
            a = board[i];
            var piece = a & 14;
            var colour = a & 1;
            if (piece) {
                pieces[colour].push([a, i]);
                if (piece == P4_KING) {
                    kings[colour] = i;
                }
                else {
                    material[colour] += P4_VALUES[piece];
                    best_pieces[colour] = Math.max(best_pieces[colour], P4_VALUES[piece]);
                }
            }
        }

        /*does a draw seem likely soon?*/
        var draw_likely = (state.draw_timeout > 90 || state.current_repetitions >= 2);
        if (draw_likely)
            p4_log("draw likely", state.current_repetitions, state.draw_timeout);
        state.values = [[], []];
        var qvalue = P4_VALUES[P4_QUEEN]; /*used as ballast in various ratios*/
        var material_sum = material[0] + material[1] + 2 * qvalue;
        var wmul = 2 * (material[1] + qvalue) / material_sum;
        var bmul = 2 * (material[0] + qvalue) / material_sum;
        var multipliers = [wmul, bmul];
        var emptiness = 4 * P4_QUEEN / material_sum;
        state.stalemate_scores = [parseInt(0.5 + (wmul - 1) * 2 * qvalue),
        parseInt(0.5 + (bmul - 1) * 2 * qvalue)];
        //p4_log("value multipliers (W, B):", wmul, bmul,
        //       "stalemate scores", state.stalemate_scores);
        for (i = 0; i < P4_VALUES.length; i++) {
            var v = P4_VALUES[i];
            if (v < P4_WIN) {//i.e., not king
                state.values[0][i] = parseInt(v * wmul + 0.5);
                state.values[1][i] = parseInt(v * bmul + 0.5);
            }
            else {
                state.values[0][i] = v;
                state.values[1][i] = v;
            }
        }
        /*used for pruning quiescence search */
        state.best_pieces = [parseInt(best_pieces[0] * wmul + 0.5),
        parseInt(best_pieces[1] * bmul + 0.5)];

        var kx = [kings[0] % 10, kings[1] % 10];
        var ky = [parseInt(kings[0] / 10), parseInt(kings[1] / 10)];

        /* find the frontmost pawns in each file */
        var pawn_cols = [[], []];
        for (y = 3; y < 9; y++) {
            for (x = 1; x < 9; x++) {
                i = y * 10 + x;
                a = board[i];
                if ((a & 14) != P4_PAWN)
                    continue;
                if ((a & 1) == 0) {
                    pawn_cols[0][x] = y;
                }
                else if (pawn_cols[1][x] === undefined) {
                    pawn_cols[1][x] = y;
                }
            }
        }
        var target_king = (moveno >= 20 || material_sum < 5 * qvalue);
        var weights = state.weights;

        for (y = 2; y < 10; y++) {
            for (x = 1; x < 9; x++) {
                i = y * 10 + x;
                var early_centre = P4_CENTRALISING_WEIGHTS[i] * earliness_weight;
                var plateau = P4_KNIGHT_WEIGHTS[i];
                for (var c = 0; c < 2; c++) {
                    var dx = Math.abs(kx[1 - c] - x);
                    var dy = Math.abs(ky[1 - c] - y);
                    var our_dx = Math.abs(kx[c] - x);
                    var our_dy = Math.abs(ky[c] - y);

                    var d = Math.max(Math.sqrt(dx * dx + dy * dy), 1) + 1;
                    var mul = multipliers[c]; /*(mul < 1) <==> we're winning*/
                    var mul3 = mul * mul * mul;
                    var at_home = y == 2 + c * 7;
                    var pawn_home = y == 3 + c * 5;
                    var row4 = y == 5 + c;
                    var promotion_row = y == 9 - c * 7;
                    var get_out = (early && at_home) * -5;

                    var knight = parseInt(early_centre * 0.3) + 2 * plateau + get_out;
                    var rook = parseInt(early_centre * 0.3);
                    var bishop = parseInt(early_centre * 0.6) + plateau + get_out;
                    if (at_home) {
                        rook += (x == 4 || x == 5) * (earliness_weight + !target_king);
                        rook += (x == 1 || x == 8) * (moveno > 10 && moveno < 20) * -3;
                        rook += (x == 2 || x == 7) * (moveno > 10 && moveno < 20) * -1;
                    }

                    /*Queen wants to stay home early, then jump right in*/
                    /*keep kings back on home row for a while*/
                    var queen = parseInt(plateau * 0.5 + early_centre * (0.5 - early));
                    var king = (king_should_hide && at_home) * 2 * earliness_weight;

                    /*empty board means pawn advancement is more urgent*/
                    var get_on_with_it = Math.max(emptiness * 2, 1);
                    var pawn = get_on_with_it * P4_BASE_PAWN_WEIGHTS[c ? 119 - i : i];
                    if (early) {
                        /* Early pawn weights are slightly randomised, so each game is different.
                         */
                        if (y >= 4 && y <= 7) {
                            var boost = 1 + 3 * (y == 5 || y == 6);
                            pawn += parseInt((boost + p4_random_int(state, 4)) * 0.1 *
                                early_centre);
                        }
                        if (x == 4 || x == 5) {
                            //discourage middle pawns from waiting at home
                            pawn -= 3 * pawn_home;
                            pawn += 3 * row4;
                        }
                    }
                    /*pawn promotion row is weighted as a queen minus a pawn.*/
                    if (promotion_row)
                        pawn += state.values[c][P4_QUEEN] - state.values[c][P4_PAWN];

                    /*pawns in front of a castled king should stay there*/
                    pawn += 4 * (y == 3 && ky[c] == 2 && Math.abs(our_dx) < 2 &&
                        kx[c] != 5 && x != 4 && x != 5);
                    /*passed pawns (having no opposing pawn in front) are encouraged. */
                    var cols = pawn_cols[1 - c];
                    if (cols[x] == undefined ||
                        (c == 0 && cols[x] < y) ||
                        (c == 1 && cols[x] > y))
                        pawn += 2;

                    /* After a while, start going for opposite king. Just
                     * attract pieces into the area so they can mill about in
                     * the area, waiting for an opportunity.
                     *
                     * As prepare is only called at the beginning of each tree
                     * search, the king could wander out of the targetted area
                     * in deep searches. But that's OK. Heuristics are
                     * heuristics.
                     */
                    if (target_king) {
                        knight += 2 * parseInt(8 * mul / d);
                        rook += 2 * ((dx < 2) + (dy < 2));
                        bishop += 3 * (Math.abs((dx - dy)) < 2);
                        queen += 2 * parseInt(8 / d) + (dx * dy == 0) + (dx - dy == 0);
                        /* The losing king wants to stay in the middle, while
                         the winning king goes in for the kill.*/
                        var king_centre_wt = 8 * emptiness * P4_CENTRALISING_WEIGHTS[i];
                        king += parseInt(150 * emptiness / (mul3 * d) + king_centre_wt * mul3);
                    }
                    weights[P4_PAWN + c][i] = pawn;
                    weights[P4_KNIGHT + c][i] = knight;
                    weights[P4_ROOK + c][i] = rook;
                    weights[P4_BISHOP + c][i] = bishop;
                    weights[P4_QUEEN + c][i] = queen;
                    weights[P4_KING + c][i] = king;

                    if (draw_likely && mul < 1) {
                        /*The winning side wants to avoid draw, so adds jitter to its weights.*/
                        var range = 3 / mul3;
                        for (j = 2 + c; j < 14; j += 2) {
                            weights[j][i] += p4_random_int(state, range);
                        }
                    }
                }
            }
        }
        state.prepared = true;
    }

    function p4_maybe_prepare(state) {
        if (!state.prepared)
            p4_prepare(state);
    }


    function p4_parse(state, colour, ep, score) {
        var board = state.board;
        var s, e;    //start and end position
        var E, a;       //E=piece at end place, a= piece moving
        var i, j;
        var other_colour = 1 - colour;
        var dir = (10 - 20 * colour); //dir= 10 for white, -10 for black
        var movelist = [];
        var captures = [];
        var weight;
        var pieces = state.pieces[colour];
        var castle_flags = (state.castles >> (colour * 2)) & 3;
        var values = state.values[other_colour];
        var all_weights = state.weights;
        for (j = pieces.length - 1; j >= 0; j--) {
            s = pieces[j][1]; // board position
            a = board[s]; //piece number
            var weight_lut = all_weights[a];
            weight = score - weight_lut[s];
            a &= 14;
            if (a > 2) {    //non-pawns
                var moves = P4_MOVES[a];
                if (a & 2) {
                    for (i = 0; i < 8; i++) {
                        e = s + moves[i];
                        E = board[e];
                        if (!E) {
                            movelist.push([weight + values[E] + weight_lut[e], s, e]);
                        }
                        else if ((E & 17) == other_colour) {
                            captures.push([weight + values[E] + weight_lut[e] + all_weights[E][e], s, e]);
                        }
                    }
                    if (a == P4_KING && castle_flags) {
                        if ((castle_flags & 1) &&
                            (board[s - 1] + board[s - 2] + board[s - 3] == 0) &&
                            p4_check_castling(board, s - 2, other_colour, dir, -1)) {//Q side
                            movelist.push([weight + 12, s, s - 2]);     //no analysis, just encouragement
                        }
                        if ((castle_flags & 2) && (board[s + 1] + board[s + 2] == 0) &&
                            p4_check_castling(board, s, other_colour, dir, 1)) {//K side
                            movelist.push([weight + 13, s, s + 2]);
                        }
                    }
                }
                else {//rook, bishop, queen
                    var mlen = moves.length;
                    for (i = 0; i < mlen;) {     //goeth thru list of moves
                        var m = moves[i++];
                        e = s;
                        do {
                            e += m;
                            E = board[e];
                            if (!E) {
                                movelist.push([weight + values[E] + weight_lut[e], s, e]);
                            }
                            else if ((E & 17) == other_colour) {
                                captures.push([weight + values[E] + weight_lut[e] + all_weights[E][e], s, e]);
                            }
                        } while (!E);
                    }
                }
            }
            else {    //pawns
                e = s + dir;
                if (!board[e]) {
                    movelist.push([weight + weight_lut[e], s, e]);
                    /* s * (120 - s) < 3200 true for outer two rows on either side.*/
                    var e2 = e + dir;
                    if (s * (120 - s) < 3200 && (!board[e2])) {
                        movelist.push([weight + weight_lut[e2], s, e2]);
                    }
                }
                /* +/-1 for pawn capturing */
                E = board[--e];
                if (E && (E & 17) == other_colour) {
                    captures.push([weight + values[E] + weight_lut[e] + all_weights[E][e], s, e]);
                }
                e += 2;
                E = board[e];
                if (E && (E & 17) == other_colour) {
                    captures.push([weight + values[E] + weight_lut[e] + all_weights[E][e], s, e]);
                }
            }
        }
        if (ep) {
            var pawn = P4_PAWN | colour;
            var taken;
            /* Some repetitive calculation here could be hoisted out, but that would
                probably slow things: the common case is no pawns waiting to capture
                enpassant, not 2.
             */
            s = ep - dir - 1;
            if (board[s] == pawn) {
                taken = values[P4_PAWN] + all_weights[P4_PAWN | other_colour][ep - dir];
                captures.push([score - weight_lut[s] + weight_lut[ep] + taken, s, ep]);
            }
            s += 2;
            if (board[s] == pawn) {
                taken = values[P4_PAWN] + all_weights[P4_PAWN | other_colour][ep - dir];
                captures.push([score - weight_lut[s] + weight_lut[ep] + taken, s, ep]);
            }
        }
        return captures.concat(movelist);
    }

    /*Explaining the bit tricks used in check_castling and check_check:
     *
     * in binary:    16 8 4 2 1
     *   empty
     *   pawn               1 c
     *   rook             1   c
     *   knight           1 1 c
     *   bishop         1     c
     *   king           1   1 c
     *   queen          1 1   c
     *   wall         1
     *
     * so:
     *
     * piece & (16 | 4 | 2 | 1) is:
     *  2 + c  for kings and pawns
     *  4 + c  for rooks and queens
     *  6 + c  for knights
     *  0 + c  for bishops
     * 16      for walls
     *
     * thus:
     * ((piece & 23) == 4 | colour) separates the rooks and queens out
     * from the rest.
     * ((piece & 27) == 8 | colour) does the same for queens and bishops.
     */

    /* check_castling
     *
     * s - "start" location (either king home square, or king destination)
     *     the checks are done left to right.
     * * dir - direction of travel (White: 10, Black: -10)
     * side: -1 means Q side; 1, K side
     */

    function p4_check_castling(board, s, colour, dir, side) {
        var e;
        var E;
        var m, p;
        var knight = colour + P4_KNIGHT;
        var diag_slider = P4_BISHOP | colour;
        var diag_mask = 27;
        var grid_slider = P4_ROOK | colour;
        var king_pawn = 2 | colour;
        var grid_mask = 23;

        /* go through 3 positions, checking for check in each
         */
        for (p = s; p < s + 3; p++) {
            //bishops, rooks, queens
            e = p;
            do {
                e += dir;
                E = board[e];
            } while (!E);
            if ((E & grid_mask) == grid_slider)
                return 0;
            e = p;
            var delta = dir - 1;
            do {
                e += delta;
                E = board[e];
            } while (!E);
            if ((E & diag_mask) == diag_slider)
                return 0;
            e = p;
            delta += 2;
            do {
                e += delta;
                E = board[e];
            } while (!E);
            if ((E & diag_mask) == diag_slider)
                return 0;
            /*knights on row 7. (row 6 is handled below)*/
            if (board[p + dir - 2] == knight ||
                board[p + dir + 2] == knight)
                return 0;
        }

        /* a pawn or king in any of 5 positions on row 7.
         * or a knight on row 6. */
        for (p = s + dir - 1; p < s + dir + 4; p++) {
            E = board[p] & grid_mask;
            if (E == king_pawn || board[p + dir] == knight)
                return 0;
        }
        /* scan back row for rooks, queens on the other side.
         * Same side check is impossible, because the castling rook is there
         */
        e = (side < 0) ? s + 2 : s;
        do {
            e -= side;
            E = board[e];
        } while (!E);
        if ((E & grid_mask) == grid_slider)
            return 0;

        return 1;
    }

    function p4_check_check(state, colour) {
        var board = state.board;
        /*find the king.  The pieces list updates from the end,
         * so the last-most king is correctly placed.*/
        var pieces = state.pieces[colour];
        var p;
        var i = pieces.length;
        do {
            p = pieces[--i];
        } while (p[0] != (P4_KING | colour));
        var s = p[1];
        var other_colour = 1 - colour;
        var dir = 10 - 20 * colour;
        if (board[s + dir - 1] == (P4_PAWN | other_colour) ||
            board[s + dir + 1] == (P4_PAWN | other_colour))
            return true;
        var knight_moves = P4_MOVES[P4_KNIGHT];
        var king_moves = P4_MOVES[P4_KING];
        var knight = P4_KNIGHT | other_colour;
        var king = P4_KING | other_colour;
        for (i = 0; i < 8; i++) {
            if (board[s + knight_moves[i]] == knight ||
                board[s + king_moves[i]] == king)
                return true;
        }
        var diagonal_moves = P4_MOVES[P4_BISHOP];
        var grid_moves = P4_MOVES[P4_ROOK];

        /* diag_mask ignores rook moves of queens,
         * grid_mask ignores the bishop moves*/
        var diag_slider = P4_BISHOP | other_colour;
        var diag_mask = 27;
        var grid_slider = P4_ROOK | other_colour;
        var grid_mask = 23;
        for (i = 0; i < 4; i++) {
            var m = diagonal_moves[i];
            var e = s;
            var E;
            do {
                e += m;
                E = board[e];
            } while (!E);
            if ((E & diag_mask) == diag_slider)
                return true;

            m = grid_moves[i];
            e = s;
            do {
                e += m;
                E = board[e];
            } while (!E);
            if ((E & grid_mask) == grid_slider)
                return true;
        }
        return false;
    }

    function p4_optimise_piece_list(state) {
        var i, p, s, e;
        var movelists = [
            p4_parse(state, 0, 0, 0),
            p4_parse(state, 1, 0, 0)
        ];
        var weights = state.weights;
        var board = state.board;
        for (var colour = 0; colour < 2; colour++) {
            var our_values = state.values[colour];
            var pieces = state.pieces[colour];
            var movelist = movelists[colour];
            var threats = movelists[1 - colour];
            /* sparse array to index by score. */
            var scores = [];
            for (i = 0; i < pieces.length; i++) {
                p = pieces[i];
                scores[p[1]] = {
                    score: 0,
                    piece: p[0],
                    pos: p[1],
                    threatened: 0
                };
            }
            /* Find the best score for each piece by pure static weights,
             * ignoring captures, which have their own path to the top. */
            for (i = movelist.length - 1; i >= 0; i--) {
                var mv = movelist[i];
                var score = mv[0];
                s = mv[1];
                e = mv[2];
                if (!board[e]) {
                    var x = scores[s];
                    x.score = Math.max(x.score, score);
                }
            }
            /* moving out of a threat is worth considering, especially
             * if it is a pawn and you are not.*/
            for (i = threats.length - 1; i >= 0; i--) {
                var mv = threats[i];
                var x = scores[mv[2]];
                if (x !== undefined) {
                    var S = board[mv[1]];
                    var r = (1 + x.piece > 3 + S < 4) * 0.01;
                    if (x.threatened < r)
                        x.threatened = r;
                }
            }
            var pieces2 = [];
            for (i = 20; i < 100; i++) {
                p = scores[i];
                if (p !== undefined) {
                    p.score += p.threatened * our_values[p.piece];
                    pieces2.push(p);
                }
            }
            pieces2.sort(function (a, b) { return a.score - b.score; });
            for (i = 0; i < pieces2.length; i++) {
                p = pieces2[i];
                pieces[i] = [p.piece, p.pos];
            }
        }
    }

    function p4_findmove(state, level, colour, ep) {
        p4_prepare(state);
        p4_optimise_piece_list(state);
        var board = state.board;
        if (arguments.length == 2) {
            colour = state.to_play;
            ep = state.enpassant;
        }
        var movelist = p4_parse(state, colour, ep, 0);
        var alpha = P4_MIN_SCORE;
        var mv, t, i;
        var bs = 0;
        var be = 0;

        if (level <= 0) {
            for (i = 0; i < movelist.length; i++) {
                mv = movelist[i];
                if (movelist[i][0] > alpha) {
                    alpha = mv[0];
                    bs = mv[1];
                    be = mv[2];
                }
            }
            return [bs, be, alpha];
        }

        for (i = 0; i < movelist.length; i++) {
            mv = movelist[i];
            var mscore = mv[0];
            var ms = mv[1];
            var me = mv[2];
            if (mscore > P4_WIN) {
                p4_log("XXX taking king! it should never come to this");
                alpha = P4_KING_VALUE;
                bs = ms;
                be = me;
                break;
            }
            t = -state.treeclimber(state, level - 1, 1 - colour, mscore, ms, me,
                P4_MIN_SCORE, -alpha);
            if (t > alpha) {
                alpha = t;
                bs = ms;
                be = me;
            }
        }
        if (alpha < -P4_WIN_NOW && !p4_check_check(state, colour)) {
            alpha = state.stalemate_scores[colour];
        }
        return [bs, be, alpha];
    }

    /*p4_make_move changes the state and returns an object containing
     * everything necesary to undo the change.
     *
     * p4_unmake_move uses the p4_make_move return value to restore the
     * previous state.
     */

    function p4_make_move(state, s, e, promotion) {
        var board = state.board;
        var S = board[s];
        var E = board[e];
        board[e] = S;
        board[s] = 0;
        var piece = S & 14;
        var moved_colour = S & 1;
        var end_piece = S; /* can differ from S in queening*/
        //now some stuff to handle queening, castling
        var rs = 0, re, rook;
        var ep_taken = 0, ep_position;
        var ep = 0;
        if (piece == P4_PAWN) {
            if ((60 - e) * (60 - e) > 900) {
                /*got to end; replace the pawn on board and in pieces cache.*/
                promotion |= moved_colour;
                board[e] = promotion;
                end_piece = promotion;
            }
            else if (((s ^ e) & 1) && E == 0) {
                /*this is a diagonal move, but the end spot is empty, so we surmise enpassant */
                ep_position = e - 10 + 20 * moved_colour;
                ep_taken = board[ep_position];
                board[ep_position] = 0;
            }
            else if ((s - e) * (s - e) == 400) {
                /*delta is 20 --> two row jump at start*/
                ep = (s + e) >> 1;
            }
        }
        else if (piece == P4_KING && ((s - e) * (s - e) == 4)) {  //castling - move rook too
            rs = s - 4 + (s < e) * 7;
            re = (s + e) >> 1; //avg of s,e=rook's spot
            rook = moved_colour + P4_ROOK;
            board[rs] = 0;
            board[re] = rook;
            //piece_locations.push([rook, re]);
        }

        var old_castle_state = state.castles;
        if (old_castle_state) {
            var mask = 0;
            var shift = moved_colour * 2;
            var side = moved_colour * 70;
            var s2 = s - side;
            var e2 = e + side;
            //wipe both our sides if king moves
            if (s2 == 25)
                mask |= 3 << shift;
            //wipe one side on any move from rook points
            else if (s2 == 21)
                mask |= 1 << shift;
            else if (s2 == 28)
                mask |= 2 << shift;
            //or on any move *to* opposition corners
            if (e2 == 91)
                mask |= 4 >> shift;
            else if (e2 == 98)
                mask |= 8 >> shift;
            state.castles &= ~mask;
        }

        var old_pieces = state.pieces.concat();
        var our_pieces = old_pieces[moved_colour];
        var dest = state.pieces[moved_colour] = [];
        for (var i = 0; i < our_pieces.length; i++) {
            var x = our_pieces[i];
            var pp = x[0];
            var ps = x[1];
            if (ps != s && ps != rs) {
                dest.push(x);
            }
        }
        dest.push([end_piece, e]);
        if (rook)
            dest.push([rook, re]);

        if (E || ep_taken) {
            var their_pieces = old_pieces[1 - moved_colour];
            dest = state.pieces[1 - moved_colour] = [];
            var gone = ep_taken ? ep_position : e;
            for (i = 0; i < their_pieces.length; i++) {
                var x = their_pieces[i];
                if (x[1] != gone) {
                    dest.push(x);
                }
            }
        }

        return {
            /*some of these (e.g. rook) could be recalculated during
             * unmake, possibly more cheaply. */
            s: s,
            e: e,
            S: S,
            E: E,
            ep: ep,
            castles: old_castle_state,
            rs: rs,
            re: re,
            rook: rook,
            ep_position: ep_position,
            ep_taken: ep_taken,
            pieces: old_pieces
        };
    }

    function p4_unmake_move(state, move) {
        var board = state.board;
        if (move.ep_position) {
            board[move.ep_position] = move.ep_taken;
        }
        board[move.s] = move.S;
        board[move.e] = move.E;
        //move.piece_locations.length--;
        if (move.rs) {
            board[move.rs] = move.rook;
            board[move.re] = 0;
            //move.piece_locations.length--;
        }
        state.pieces = move.pieces;
        state.castles = move.castles;
    }


    function p4_insufficient_material(state) {
        var knights = false;
        var bishops = undefined;
        var i;
        var board = state.board;
        for (i = 20; i < 100; i++) {
            var piece = board[i] & 14;
            if (piece == 0 || piece == P4_KING) {
                continue;
            }
            if (piece == P4_KNIGHT) {
                /* only allow one knight of either colour, never with a bishop */
                if (knights || bishops !== undefined) {
                    return false;
                }
                knights = true;
            }
            else if (piece == P4_BISHOP) {
                /*any number of bishops, but on only one colour square */
                var x = i & 1;
                var y = parseInt(i / 10) & 1;
                var parity = x ^ y;
                if (knights) {
                    return false;
                }
                else if (bishops === undefined) {
                    bishops = parity;
                }
                else if (bishops != parity) {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        return true;
    }

    /* p4_move(state, s, e, promotion)
     * s, e are start and end positions
     *
     * promotion is the desired pawn promotion if the move gets a pawn to the other
     * end.
     *
     * return value contains bitwise flags
    */

    var P4_MOVE_FLAG_OK = 1;
    var P4_MOVE_FLAG_CHECK = 2;
    var P4_MOVE_FLAG_MATE = 4;
    var P4_MOVE_FLAG_CAPTURE = 8;
    var P4_MOVE_FLAG_CASTLE_KING = 16;
    var P4_MOVE_FLAG_CASTLE_QUEEN = 32;
    var P4_MOVE_FLAG_DRAW = 64;

    var P4_MOVE_ILLEGAL = 0;
    var P4_MOVE_MISSED_MATE = P4_MOVE_FLAG_CHECK | P4_MOVE_FLAG_MATE;
    var P4_MOVE_CHECKMATE = P4_MOVE_FLAG_OK | P4_MOVE_FLAG_CHECK | P4_MOVE_FLAG_MATE;
    var P4_MOVE_STALEMATE = P4_MOVE_FLAG_OK | P4_MOVE_FLAG_MATE;

    function p4_move(state, s, e, promotion) {
        var board = state.board;
        var colour = state.to_play;
        var other_colour = 1 - colour;
        if (s != parseInt(s)) {
            if (e === undefined) {
                var mv = p4_interpret_movestring(state, s);
                s = mv[0];
                e = mv[1];
                if (s == 0)
                    return { flags: P4_MOVE_ILLEGAL, ok: false };
                promotion = mv[2];
            }
            else {/*assume two point strings: 'e2', 'e4'*/
                s = p4_destringify_point(s);
                e = p4_destringify_point(e);
            }
        }
        if (promotion === undefined)
            promotion = P4_QUEEN;
        var E = board[e];
        var S = board[s];

        /*See if this move is even slightly legal, disregarding check.
         */
        var i;
        var legal = false;
        p4_maybe_prepare(state);
        var moves = p4_parse(state, colour, state.enpassant, 0);
        for (i = 0; i < moves.length; i++) {
            if (e == moves[i][2] && s == moves[i][1]) {
                legal = true;
                break;
            }
        }
        if (!legal) {
            return { flags: P4_MOVE_ILLEGAL, ok: false };
        }

        /*Try the move, and see what the response is.*/
        var changes = p4_make_move(state, s, e, promotion);

        /*is it check? */
        if (p4_check_check(state, colour)) {
            p4_unmake_move(state, changes);
            p4_log('in check', changes);
            return { flags: P4_MOVE_ILLEGAL, ok: false, string: "in check!" };
        }
        /*The move is known to be legal. We won't be undoing it.*/

        var flags = P4_MOVE_FLAG_OK;

        state.enpassant = changes.ep;
        state.history.push([s, e, promotion]);

        /*draw timeout: 50 moves without pawn move or capture is a draw */
        if (changes.E || changes.ep_position) {
            state.draw_timeout = 0;
            flags |= P4_MOVE_FLAG_CAPTURE;
        }
        else if ((S & 14) == P4_PAWN) {
            state.draw_timeout = 0;
        }
        else {
            state.draw_timeout++;
        }
        if (changes.rs) {
            flags |= (s > e) ? P4_MOVE_FLAG_CASTLE_QUEEN : P4_MOVE_FLAG_CASTLE_KING;
        }
        var shortfen = p4_state2fen(state, true);
        var repetitions = (state.position_counts[shortfen] || 0) + 1;
        state.position_counts[shortfen] = repetitions;
        state.current_repetitions = repetitions;
        if (state.draw_timeout > 100 || repetitions >= 3 ||
            p4_insufficient_material(state)) {
            flags |= P4_MOVE_FLAG_DRAW;
        }
        state.moveno++;
        state.to_play = other_colour;

        if (p4_check_check(state, other_colour)) {
            flags |= P4_MOVE_FLAG_CHECK;
        }
        /* check for (stale|check)mate, by seeing if there is a move for
         * the other side that doesn't result in check. (In other words,
         * reduce the pseudo-legal-move list down to a legal-move list,
         * and check it isn't empty).
         *
         * We don't need to p4_prepare because other colour pieces can't
         * have moved (just disappeared) since previous call. Also,
         * setting the promotion piece is unnecessary, because all
         * promotions block check equally well.
        */
        var is_mate = true;
        var replies = p4_parse(state, other_colour, changes.ep, 0);
        for (i = 0; i < replies.length; i++) {
            var m = replies[i];
            var change2 = p4_make_move(state, m[1], m[2], P4_QUEEN);
            var check = p4_check_check(state, other_colour);
            p4_unmake_move(state, change2);
            if (!check) {
                is_mate = false;
                break;
            }
        }
        if (is_mate)
            flags |= P4_MOVE_FLAG_MATE;

        var movestring = p4_move2string(state, s, e, S, promotion, flags, moves);
        p4_log("successful move", s, e, movestring, flags);
        state.prepared = false;
        return {
            flags: flags,
            string: movestring,
            ok: true
        };
    }


    function p4_move2string(state, s, e, S, promotion, flags, moves) {
        var piece = S & 14;
        var src, dest;
        var mv, i;
        var capture = flags & P4_MOVE_FLAG_CAPTURE;

        src = p4_stringify_point(s);
        dest = p4_stringify_point(e);
        if (piece == P4_PAWN) {
            if (capture) {
                mv = src.charAt(0) + 'x' + dest;
            }
            else
                mv = dest;
            if (e > 90 || e < 30) {  //end row, queening
                if (promotion === undefined)
                    promotion = P4_QUEEN;
                mv += '=' + P4_ENCODE_LUT.charAt(promotion);
            }
        }
        else if (piece == P4_KING && (s - e) * (s - e) == 4) {
            if (e < s)
                mv = 'O-O-O';
            else
                mv = 'O-O';
        }
        else {
            var row_qualifier = '';
            var col_qualifier = '';
            var pstr = P4_ENCODE_LUT.charAt(S);
            var sx = s % 10;
            var sy = parseInt(s / 10);

            /* find any other pseudo-legal moves that would put the same
             * piece in the same place, for which we'd need
             * disambiguation. */
            var co_landers = [];
            for (i = 0; i < moves.length; i++) {
                var m = moves[i];
                if (e == m[2] && s != m[1] && state.board[m[1]] == S) {
                    co_landers.push(m[1]);
                }
            }
            if (co_landers.length) {
                for (i = 0; i < co_landers.length; i++) {
                    var c = co_landers[i];
                    var cx = c % 10;
                    var cy = parseInt(c / 10);
                    if (cx == sx)/*same column, so qualify by row*/
                        row_qualifier = src.charAt(1);
                    if (cy == sy)
                        col_qualifier = src.charAt(0);
                }
                if (row_qualifier == '' && col_qualifier == '') {
                    /*no co-landers on the same rank or file, so one or the other will do.
                     * By convention, use the column (a-h) */
                    col_qualifier = src.charAt(0);
                }
            }
            mv = pstr + col_qualifier + row_qualifier + (capture ? 'x' : '') + dest;
        }
        if (flags & P4_MOVE_FLAG_CHECK) {
            if (flags & P4_MOVE_FLAG_MATE)
                mv += '#';
            else
                mv += '+';
        }
        else if (flags & P4_MOVE_FLAG_MATE)
            mv += ' stalemate';
        return mv;
    }


    function p4_jump_to_moveno(state, moveno) {
        p4_log('jumping to move', moveno);
        if (moveno === undefined || moveno > state.moveno)
            moveno = state.moveno;
        else if (moveno < 0) {
            moveno = state.moveno + moveno;
        }
        var state2 = p4_fen2state(state.beginning);
        var i = 0;
        while (state2.moveno < moveno) {
            var m = state.history[i++];
            p4_move(state2, m[0], m[1], m[2]);
        }
        /* copy the replayed state across, not all that deeply, but
         * enough to cover, eg, held references to board. */
        var attr, dest;
        for (attr in state2) {
            var src = state2[attr];
            if (attr instanceof Array) {
                dest = state[attr];
                dest.length = 0;
                for (i = 0; i < src.length; i++) {
                    dest[i] = src[i];
                }
            }
            else {
                state[attr] = src;
            }
        }
        state.prepared = false;
    }


    /* write a standard FEN notation
     * http://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation
     * */
    function p4_state2fen(state, reduced) {
        var piece_lut = '  PpRrNnBbKkQq';
        var board = state.board;
        var fen = '';
        //fen does Y axis backwards, X axis forwards */
        for (var y = 9; y > 1; y--) {
            var count = 0;
            for (var x = 1; x < 9; x++) {
                var piece = board[y * 10 + x];
                if (piece == 0)
                    count++;
                else {
                    if (count)
                        fen += count.toString();
                    fen += piece_lut.charAt(piece);
                    count = 0;
                }
            }
            if (count)
                fen += count;
            if (y > 2)
                fen += '/';
        }
        /*white or black */
        fen += ' ' + 'wb'.charAt(state.to_play) + ' ';
        /*castling */
        if (state.castles) {
            var lut = [2, 'K', 1, 'Q', 8, 'k', 4, 'q'];
            for (var i = 0; i < 8; i += 2) {
                if (state.castles & lut[i]) {
                    fen += lut[i + 1];
                }
            }
        }
        else
            fen += '-';
        /*enpassant */
        if (state.enpassant !== 0) {
            fen += ' ' + p4_stringify_point(state.enpassant);
        }
        else
            fen += ' -';
        if (reduced) {
            /*if the 'reduced' flag is set, the move number and draw
             *timeout are not added. This form is used to detect draws by
             *3-fold repetition.*/
            return fen;
        }
        fen += ' ' + state.draw_timeout + ' ';
        fen += (state.moveno >> 1) + 1;
        return fen;
    }

    function p4_stringify_point(p) {
        var letters = " abcdefgh";
        var x = p % 10;
        var y = (p - x) / 10 - 1;
        return letters.charAt(x) + y;
    }

    function p4_destringify_point(p) {
        var x = parseInt(p.charAt(0), 19) - 9; //a-h <-> 10-18, base 19
        var y = parseInt(p.charAt(1)) + 1;
        if (y >= 2 && y < 10 && x >= 1 && x < 9)
            return y * 10 + x;
        return undefined;
    }

    /* read a standard FEN notation
     * http://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation
     * */
    function p4_fen2state(fen, state) {
        if (state === undefined)
            state = p4_initialise_state();
        var board = state.board;
        var fenbits = fen.split(' ');
        var fen_board = fenbits[0];
        var fen_toplay = fenbits[1];
        var fen_castles = fenbits[2];
        var fen_enpassant = fenbits[3];
        var fen_timeout = fenbits[4];
        var fen_moveno = fenbits[5];
        if (fen_timeout === undefined)
            fen_timeout = 0;
        //fen does Y axis backwards, X axis forwards */
        var y = 90;
        var x = 1;
        var i, c;
        for (var j = 0; j < fen_board.length; j++) {
            c = fen_board.charAt(j);
            if (c == '/') {
                x = 1;
                y -= 10;
                if (y < 20)
                    break;
                continue;
            }
            var piece = P4_PIECE_LUT[c];
            if (piece && x < 9) {
                board[y + x] = piece;
                x++;
            }
            else {
                var end = Math.min(x + parseInt(c), 9);
                for (; x < end; x++) {
                    board[y + x] = 0;
                }
            }
        }
        state.to_play = (fen_toplay.toLowerCase() == 'b') ? 1 : 0;
        state.castles = 0;
        /* Sometimes we meet bad FEN that says it can castle when it can't. */
        var wk = board[25] == P4_KING;
        var bk = board[95] == P4_KING + 1;
        var castle_lut = {
            k: 8 * (bk && board[98] == P4_ROOK + 1),
            q: 4 * (bk && board[91] == P4_ROOK + 1),
            K: 2 * (wk && board[28] == P4_ROOK),
            Q: 1 * (wk && board[21] == P4_ROOK)
        };
        for (i = 0; i < fen_castles.length; i++) {
            c = fen_castles.charAt(i);
            var castle = castle_lut[c];
            if (castle !== undefined) {
                state.castles |= castle;
                if (castle == 0) {
                    console.log("FEN claims castle state " + fen_castles +
                        " but pieces are not in place for " + c);
                }
            }
        }

        state.enpassant = (fen_enpassant != '-') ? p4_destringify_point(fen_enpassant) : 0;
        state.draw_timeout = parseInt(fen_timeout);
        if (fen_moveno === undefined) {
            /*have a guess based on entropy and pieces remaining*/
            var pieces = 0;
            var mix = 0;
            var p, q, r;
            for (y = 20; y < 100; y += 10) {
                for (x = 1; x < 9; x++) {
                    p = board[y + x] & 15;
                    pieces += (!!p);
                    if (x < 8) {
                        q = board[y + x + 1];
                        mix += (!q) != (!p);
                    }
                    if (y < 90) {
                        q = board[y + x + 10];
                        mix += (!q) != (!p);
                    }
                }
            }
            fen_moveno = Math.max(1, parseInt((32 - pieces) * 1.3 + (4 - fen_castles.length) * 1.5 + ((mix - 16) / 5)));
            //p4_log("pieces", pieces, "mix", mix, "estimate", fen_moveno);
        }
        state.moveno = 2 * (parseInt(fen_moveno) - 1) + state.to_play;
        state.history = [];
        state.beginning = fen;
        state.prepared = false;
        state.position_counts = {};
        /* Wrap external functions as methods. */
        state.move = function (s, e, promotion) {
            return p4_move(this, s, e, promotion);
        };
        state.findmove = function (level) {
            return p4_findmove(this, level);
        };
        state.jump_to_moveno = function (moveno) {
            return p4_jump_to_moveno(this, moveno);
        };
        return state;
    }

    /*
    Weights would all fit within an Int8Array *except* for the last row
    for pawns, which is close to the queen value (180, max is 127).
    
    Int8Array seems slightly quicker in Chromium 18, no different in
    Firefox 12.
    
    Int16Array is no faster, perhaps slower than Int32Array.
    
    Int32Array is marginally slower than plain arrays with Firefox 12, but
    significantly quicker with Chromium.
     */

    var P4_ZEROS = [];
    function p4_zero_array() {
        if (P4_USE_TYPED_ARRAYS)
            return new Int32Array(120);
        if (P4_ZEROS.length == 0) {
            for (var i = 0; i < 120; i++) {
                P4_ZEROS[i] = 0;
            }
        }
        return P4_ZEROS.slice();
    }

    /* p4_initialise_state() creates the board and initialises weight
     * arrays etc.  Some of this is really only needs to be done once.
     */

    function p4_initialise_state() {
        var board = p4_zero_array();
        P4_CENTRALISING_WEIGHTS = p4_zero_array();
        P4_BASE_PAWN_WEIGHTS = p4_zero_array();
        P4_KNIGHT_WEIGHTS = p4_zero_array();
        for (var i = 0; i < 120; i++) {
            var y = parseInt(i / 10);
            var x = i % 10;
            var dx = Math.abs(x - 4.5);
            var dy = Math.abs(y - 5.5);
            P4_CENTRALISING_WEIGHTS[i] = parseInt(6 - Math.pow((dx * dx + dy * dy) * 1.5, 0.6));
            //knights have a flat topped centre (bishops too, but less so).
            P4_KNIGHT_WEIGHTS[i] = parseInt(((dx < 2) + (dy < 2) * 1.5)
                + (dx < 3) + (dy < 3)) - 2;
            P4_BASE_PAWN_WEIGHTS[i] = parseInt('000012347000'.charAt(y));
            if (y > 9 || y < 2 || x < 1 || x > 8)
                board[i] = 16;
        }
        var weights = [];
        for (i = 0; i < 14; i++) {
            weights[i] = p4_zero_array();
        }
        var state = {
            board: board,
            weights: weights,
            history: [],
            treeclimber: p4_alphabeta_treeclimber
        };
        p4_random_seed(state, P4_DEBUG ? 1 : Date.now());
        return state;
    }

    function p4_new_game() {
        return p4_fen2state(P4_INITIAL_BOARD);
    }

    /*convert an arbitrary movestring into a pair of integers offsets into
     * the board. The string might be in any of these forms:
     *
     *  "d2-d4" "d2d4" "d4" -- moving a pawn
     *
     *  "b1-c3" "b1c3" "Nc3" "N1c3" "Nbc3" "Nb1c3" -- moving a knight
     *
     *  "b1xc3" "b1xc3" "Nxc3" -- moving a knight, also happens to capture.
     *
     *  "O-O" "O-O-O" -- special cases for castling ("e1-c1", etc, also work)
     *
     *  Note that for the "Nc3" (pgn) format, some knowledge of the board
     *  is necessary, so the state parameter is required. If it is
     *  undefined, the other forms will still work.
     */

    function p4_interpret_movestring(state, str) {
        /* Ignore any irrelevant characters, then tokenise.
         *
         */
        var FAIL = [0, 0];
        var algebraic_re = /^\s*([RNBQK]?[a-h]?[1-8]?)[ :x-]*([a-h][1-8]?)(=[RNBQ])?[!?+#e.p]*\s*$/;
        var castle_re = /^\s*([O0o]-[O0o](-[O0o])?)\s*$/;
        var position_re = /^[a-h][1-8]$/;

        var m = algebraic_re.exec(str);
        if (m == null) {
            /*check for castling notation (O-O, O-O-O) */
            m = castle_re.exec(str);
            if (m) {
                s = 25 + state.to_play * 70;
                if (m[2])/*queenside*/
                    e = s - 2;
                else
                    e = s + 2;
            }
            else
                return FAIL;
        }
        var src = m[1];
        var dest = m[2];
        var queen = m[3];
        var s, e, q;
        var moves, i;
        if (src == '' || src == undefined) {
            /* a single coordinate pawn move */
            e = p4_destringify_point(dest);
            s = p4_find_source_point(state, e, 'P' + dest.charAt(0));
        }
        else if (/^[RNBQK]/.test(src)) {
            /*pgn format*/
            e = p4_destringify_point(dest);
            s = p4_find_source_point(state, e, src);
        }
        else if (position_re.test(src) && position_re.test(dest)) {
            s = p4_destringify_point(src);
            e = p4_destringify_point(dest);
        }
        else if (/^[a-h]$/.test(src)) {
            e = p4_destringify_point(dest);
            s = p4_find_source_point(state, e, 'P' + src);
        }
        if (s == 0)
            return FAIL;

        if (queen) {
            /* the chosen queen piece */
            q = P4_PIECE_LUT[queen.charAt(1)];
        }
        return [s, e, q];
    }


    function p4_find_source_point(state, e, str) {
        var colour = state.to_play;
        var piece = P4_PIECE_LUT[str.charAt(0)];
        piece |= colour;
        var s, i;

        var row, column;
        /* can be specified as Na, Na3, N3, and who knows, N3a? */
        for (i = 1; i < str.length; i++) {
            var c = str.charAt(i);
            if (/[a-h]/.test(c)) {
                column = str.charCodeAt(i) - 96;
            }
            else if (/[1-8]/.test(c)) {
                /*row goes 2 - 9 */
                row = 1 + parseInt(c);
            }
        }
        var possibilities = [];
        p4_prepare(state);
        var moves = p4_parse(state, colour,
            state.enpassant, 0);
        for (i = 0; i < moves.length; i++) {
            var mv = moves[i];
            if (e == mv[2]) {
                s = mv[1];
                if (state.board[s] == piece &&
                    (column === undefined || column == s % 10) &&
                    (row === undefined || row == parseInt(s / 10))
                ) {
                    var change = p4_make_move(state, s, e, P4_QUEEN);
                    if (!p4_check_check(state, colour))
                        possibilities.push(s);
                    p4_unmake_move(state, change);
                }
            }
        }
        p4_log("finding", str, "that goes to", e, "got", possibilities);

        if (possibilities.length == 0) {
            return 0;
        }
        else if (possibilities.length > 1) {
            p4_log("p4_find_source_point seems to have failed",
                state, e, str,
                possibilities);
        }
        return possibilities[0];
    }

    /*random number generator based on
     * http://burtleburtle.net/bob/rand/smallprng.html
     */
    function p4_random_seed(state, seed) {
        seed &= 0xffffffff;
        state.rng = (P4_USE_TYPED_ARRAYS) ? new Uint32Array(4) : [];
        state.rng[0] = 0xf1ea5eed;
        state.rng[1] = seed;
        state.rng[2] = seed;
        state.rng[3] = seed;
        for (var i = 0; i < 20; i++)
            p4_random31(state);
    }

    function p4_random31(state) {
        var rng = state.rng;
        var b = rng[1];
        var c = rng[2];
        /* These shifts amount to rotates.
         * Note the three-fold right shift '>>>', meaning an unsigned shift.
         * The 0xffffffff masks are needed to keep javascript to 32bit. (supposing
         * untyped arrays).
         */
        var e = rng[0] - ((b << 27) | (b >>> 5));
        rng[0] = b ^ ((c << 17) | (c >>> 15));
        rng[1] = (c + rng[3]) & 0xffffffff;
        rng[2] = (rng[3] + e) & 0xffffffff;
        rng[3] = (e + rng[0]) & 0xffffffff;
        return rng[3] & 0x7fffffff;
    }

    function p4_random_int(state, top) {
        /* uniform integer in range [0 <= n < top), supposing top < 2 ** 31
         *
         * This method is slightly (probably pointlessly) more accurate
         * than converting to 0-1 float, multiplying and truncating, and
         * considerably more accurate than a simple modulus.
         * Obviously it is a bit slower.
         */
        /* mask becomes one less than the next highest power of 2 */
        var mask = top;
        mask--;
        mask |= mask >>> 1;
        mask |= mask >>> 2;
        mask |= mask >>> 4;
        mask |= mask >>> 8;
        mask |= mask >>> 16;
        var r;
        do {
            r = p4_random31(state) & mask;
        } while (r >= top);
        return r;
    }
    // ---- END P4WN ----

    function _p4wnBestMoveFromFen(fen, depth) {
        const st = p4_fen2state(fen);                 // internal function from pasted code
        const lvl = Math.max(1, depth | 0);
        const res = st.findmove(lvl);                 // [s, e, score]
        const s = res && res[0];
        const e = res && res[1];
        if (!s || !e) return null;

        const from = p4_stringify_point(s);           // "e2"
        const to = p4_stringify_point(e);             // "e4"
        return { from, to };
    }

    return class P4wnEngine {
        constructor() { }

        bestMoveFromFen(fen, depth) {
            const mv = _p4wnBestMoveFromFen(fen, depth);
            if (!mv) return null;
            return mv;
        }
    };
})();

const { BLACK, Chess, PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING, WHITE } = ChessJS();

const CFG = {
    FLAGS: {
        DEBUG: true,
        SOLO_TEST_MODE: false,
    },

    BOT: {
        ENABLED_DEFAULT: false,

        WEAK: 2,
        MEDIUM: 3,
        HARD: 5,

        SEARCH_DEPTH: 2,
        MIN_THINK_SECONDS: 1.0,
        MAX_THINK_SECONDS: 2.5,

        THINK_JITTER_SECONDS: 0.35,

        PANIC_TIME_SECONDS: 6.0,
        PANIC_THINK_SECONDS: 0.15,
    },


    RULESET: {
        APPLY_SERVER_RULESET: true,
        APPLY_DELAY_SECONDS: 0.25,
        ECHO: false,
        CMDS: [
            "mp_roundtime 1000",
            "mp_roundtime_defuse 1000",
            "mp_roundtime_hostage 1000",
            "mp_freezetime 0",
            "sv_infinite_ammo 1",

            "mp_ct_default_primary weapon_m4a1_silencer",
            "mp_ct_default_secondary weapon_usp_silencer",

            "mp_t_default_primary weapon_ak47",
            "mp_t_default_secondary weapon_glock",

            "mp_warmup_end",
            "mp_team_intro_time 0",
            "mp_ignore_round_win_conditions 1",
            "mp_autoteambalance 0",
            "mp_limitteams 0",
            "bot_kick",
            "bot_quota 0",
            "mp_restartgame 1",
        ],
    },

    MATCH: {
        TEAM_SPEC: 1,
        TICK_DT_SECONDS: 0.05,
        STATUS_INTERVAL_SECONDS: 0.25,
        CLEAR_SEATS_ON_ROUND_START: true,
        WHITE_FIRST_MOVE_GRACE_SECONDS: 3.0,
    },

    TEXT: {
        MIN_UPDATE_INTERVAL_SECONDS: 0.1,
    },

    BOARD: {
        DEFAULT_SPACING: 72,
        DEFAULT_PICK_RADIUS: 64,
        MIN_PICK_RADIUS: 40,
        PICK_RADIUS_MULT: 0.9,
        INIT_MAX_ATTEMPTS: 80,
        INIT_RETRY_DELAY_SECONDS: 0.1,
    },

    HIGHLIGHT: {
        Z_OFFSET_ALL: 0.1,
        Z_LAYERS: {
            LASTMOVE: 0.1,
            SELECTED: 0.15,
            LEGAL: 0.20,
            CAPTURE: 0.25,
            HOVER: 0.3,
        },
        PREFIX: "chess.squarefx",
        TEMPLATES: {
            SELECTED: "chess.squares.selected",
            LEGAL: "chess.squares.legal",
            CAPTURE: "chess.squares.capture",
            HOVER: "chess.squares.hover",
            LASTMOVE: "chess.squares.lastmove",
        },
    },

    PROMO: {
        GRID_FRACTION_OF_SQUARE: 0.25,
        PIECE_SCALE_MULT: 0.6,
        HOVER_SCALE_MULT: 0.6,
        PREFIX: "chess.promofx",
        HOVER_TEMPLATE: "chess.squares.hover",
        LOOK_PICK_RADIUS_FRACTION: 0.35,
        LAYOUT: [
            { key: "q", dxSign: -1, dySign: +1 },
            { key: "r", dxSign: +1, dySign: +1 },
            { key: "b", dxSign: -1, dySign: -1 },
            { key: "n", dxSign: +1, dySign: -1 },
        ],
    },

    ANIM: {
        MOVE_SLIDE_SECONDS: 0.35,
        CAPTURE_DIE_SECONDS: 0.1,
        KNIGHT_JUMP_HEIGHT_FRAC: 0.8,
        KNIGHT_JUMP_HEIGHT_MIN: 35,
        KNIGHT_PEAK_T_FRAC: 0.16,
        KNIGHT_RISE_POW: 2.4,
        KNIGHT_FALL_POW: 1.6,
        PROMO_PAWN_PREVIEW_SPEED_MULT: 0.9,
    },

    CHESS: {
        FILES: "abcdefgh",
        OFFBOARD_Z_DROP: 4096,
        OFFBOARD_FALLBACK: { x: 0, y: 0, z: -10000 },
    },

    ENT: {
        SPAWNS: {
            LOBBY: "chess.spawn.lobby",
            WHITE: "chess.spawn.white",
            BLACK: "chess.spawn.black",
            SPEC: "chess.spawn.spec",
        },

        LOBBY_SEAT_WHITE: "chess.lobby.seat.white",
        LOBBY_SEAT_BLACK: "chess.lobby.seat.black",

        STATUS_PHASE: "chess.status.phase",
        STATUS_LEGAL_MOVES: "chess.status.legal_moves",
        STATUS_LAST_MOVE: "chess.status.last_move",
        STATUS_TIMECONTROL: "chess.status.timecontrol",
        STATUS_TIMECONTROL_TIME: "chess.status.timecontrol.time",

        CLOCK_WHITE: "chess.clock.white.time",
        CLOCK_BLACK: "chess.clock.black.time",
        CLOCK_INCREMENT: "chess.clock.increment",

        STATE: "chess.state",
        TURN: "chess.turn",
        LASTMOVE_VERBOSE: "chess.lastmove",
        MOVES_PREFIX: "chess.moves",

        PIECE_WILDCARD: "chess.piece.*",
        PIECE_NAME_PREFIX: "chess.piece",
        PIECE_TEMPLATE_PREFIX: "chess.template",

        BTNVIS_PREFIX: "chess.btnvis",

        ENGINE_STATUS: "chess.engine",
        ENGINE_BOOL: "chess.engine.bool",

        FEN: "chess.fen"
    },

    UI: {
        BUTTON_FLASH_SECONDS: 1.0,
        BUTTON_COLOR_OK: { r: 0, g: 255, b: 0, a: 255 },
        BUTTON_COLOR_FAIL: { r: 255, g: 0, b: 0, a: 255 },
        BUTTON_COLOR_NORMAL: { r: 255, g: 255, b: 255, a: 255 },

        BTN_TEXT: {
            join_white: "chess.lobby.btn.join_white",
            join_black: "chess.lobby.btn.join_black",
            join_spec: "chess.lobby.btn.join_spec",
            swap_sides: "chess.lobby.btn.swap_sides",
            toggle_legal_moves: "chess.lobby.btn.toggle_legal_moves",
            toggle_last_move: "chess.lobby.btn.toggle_lastmove",
            toggle_time_control: "chess.lobby.btn.toggle_time_control",

            time_preset_5_3: "chess.lobby.btn.preset_5_3",
            time_preset_10_0: "chess.lobby.btn.preset_10_0",
            time_preset_15_10: "chess.lobby.btn.preset_15_10",

            start_match: "chess.lobby.btn.start_match",
            reset: "chess.lobby.btn.reset",

            toggle_computer: "chess.lobby.btn.toggle_computer",

            engine_weak: "chess.lobby.btn.engine_weak",
            engine_medium: "chess.lobby.btn.engine_medium",
            engine_strong: "chess.lobby.btn.engine_strong",
        },

        BTN_VIS: {
            join_white: "join_white",
            join_black: "join_black",
            join_spec: "join_spec",
            swap_sides: "swap_sides",

            toggle_legal_moves: "toggle_legal",
            toggle_last_move: "toggle_lastmove",
            toggle_time_control: "toggle_time",

            time_preset_5_3: "preset_5_3",
            time_preset_10_0: "preset_10_0",
            time_preset_15_10: "preset_15_10",

            start_match: "start_match",
            reset: "reset",

            toggle_computer: "toggle_computer",

            engine_weak: "engine_weak",
            engine_medium: "engine_medium",
            engine_strong: "engine_strong",
        },
    },

    SND: {
        UI_PRESS: "chess.snd.ui_press",
        MOVE: "chess.snd.move",
        CAPTURE: "chess.snd.capture",
        WIN: "chess.snd.win",
        DRAW: "chess.snd.draw",
    },
};

function LOG(msg) {
    Instance.Msg(`[chess] ${String(msg)}`);
}

function DBG(msg) {
    if (!CFG.FLAGS.DEBUG) return;
    LOG(`[DBG] ${String(msg)}`);
}

function SafeCall(label, fn) {
    try {
        return fn();
    } catch (e) {
        DBG(`[EXCEPTION] ${label}: ${e}`);
        return undefined;
    }
}

function _IsFiniteInt(x) {
    return typeof x === "number" && isFinite(x) && Math.floor(x) === x;
}

let gRulesetAppliedOnce = false;

function ApplyServerRulesetOnce(label) {
    if (!CFG.RULESET.APPLY_SERVER_RULESET) return;
    if (gRulesetAppliedOnce) return;
    gRulesetAppliedOnce = true;

    const cmds = CFG.RULESET.CMDS;
    DBG(`Applying server ruleset ONCE (${label}) cmds=${cmds.length}`);
    if (CFG.RULESET.ECHO) Instance.ServerCommand(`echo [chess] Applying server ruleset ONCE (${label})`);
    for (const c of cmds) Instance.ServerCommand(c);
}

function DistSq(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return dx * dx + dy * dy + dz * dz;
}

function Sub(a, b) {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function Add(a, b) {
    return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function Mul(a, s) {
    return { x: a.x * s, y: a.y * s, z: a.z * s };
}

function Dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function DegToRad(d) {
    return (d * Math.PI) / 180.0;
}

function AnglesToForward(ang) {
    const sp = Math.sin(DegToRad(ang.pitch));
    const cp = Math.cos(DegToRad(ang.pitch));
    const sy = Math.sin(DegToRad(ang.yaw));
    const cy = Math.cos(DegToRad(ang.yaw));
    return { x: cp * cy, y: cp * sy, z: -sp };
}

function YawToFlatForward(yawDeg) {
    const sy = Math.sin(DegToRad(yawDeg));
    const cy = Math.cos(DegToRad(yawDeg));
    return { x: cy, y: sy, z: 0 };
}

function YawToFlatRight(yawDeg) {
    return YawToFlatForward(yawDeg + 90);
}

function RotateZ(vec, yawDeg) {
    const r = DegToRad(yawDeg);
    const c = Math.cos(r);
    const s = Math.sin(r);
    return { x: vec.x * c - vec.y * s, y: vec.x * s + vec.y * c, z: vec.z };
}

function Clamp(x, a, b) {
    return Math.max(a, Math.min(b, x));
}

const thinkQueue = [];

function QueueThink(time, callback) {
    const indexAfter = thinkQueue.findIndex((t) => t.time > time);
    if (indexAfter === -1) thinkQueue.push({ time, callback });
    else thinkQueue.splice(indexAfter, 0, { time, callback });
    if (indexAfter === 0 || indexAfter === -1) Instance.SetNextThink(time);
}

function RunThinkQueue() {
    const upperThinkTime = Instance.GetGameTime() + 1 / 128;
    while (thinkQueue.length > 0 && thinkQueue[0].time <= upperThinkTime) thinkQueue.shift().callback();
    if (thinkQueue.length > 0) Instance.SetNextThink(thinkQueue[0].time);
}

function Delay(delay) {
    return new Promise((resolve) => QueueThink(Instance.GetGameTime() + delay, resolve));
}

function FindMarker(name) {
    const ent = Instance.FindEntityByName(name);
    return ent && ent.IsValid && ent.IsValid() ? ent : undefined;
}

function GetControllerFromEntity(ent) {
    if (!ent || !ent.IsValid || !ent.IsValid()) return undefined;
    const c1 = SafeCall("ent.GetPlayerController()", () =>
        ent.GetPlayerController ? ent.GetPlayerController() : undefined
    );
    if (c1) return c1;
    if (ent.GetPlayerSlot && ent.GetPlayerPawn) return ent;
    return undefined;
}

function GetSlotFromEntity(ent) {
    const c = GetControllerFromEntity(ent);
    if (!c) return null;
    return SafeCall("controller.GetPlayerSlot()", () => c.GetPlayerSlot());
}

function GetPawnFromController(controller) {
    if (!controller) return undefined;
    return SafeCall("controller.GetPlayerPawn()", () => controller.GetPlayerPawn());
}

function TeleportPawnToMarker(pawn, markerName) {
    if (!pawn || !pawn.IsValid || !pawn.IsValid()) return false;
    const marker = FindMarker(markerName);
    if (!marker) return false;
    pawn.Teleport({ position: marker.GetAbsOrigin(), angles: marker.GetAbsAngles() });
    return true;
}

function _FindValidMarkerNames(names) {
    const out = [];
    for (const n of names) {
        const m = FindMarker(n);
        if (m) out.push(n);
    }
    return out;
}

function _GetSpecSpawnNames() {
    const numbered = [];
    for (let i = 1; i <= 12; i++) numbered.push(`chess.spawn.spec.${i}`);

    const validNumbered = _FindValidMarkerNames(numbered);
    if (validNumbered.length > 0) return validNumbered;

    const legacy = _FindValidMarkerNames([CFG.ENT.SPAWNS.SPEC]);
    if (legacy.length > 0) return legacy;

    return _FindValidMarkerNames([CFG.ENT.SPAWNS.LOBBY]);
}

function TeleportPawnToSpecSpawn(pawn, slot) {
    if (!pawn || !pawn.IsValid || !pawn.IsValid()) return false;

    const names = _GetSpecSpawnNames();
    if (!names || names.length === 0) return false;

    const s = (typeof slot === "number" && isFinite(slot)) ? slot : 0;
    const idx = ((s % names.length) + names.length) % names.length;

    return TeleportPawnToMarker(pawn, names[idx]);
}

function _IsValidEnt(e) {
    return !!(e && e.IsValid && e.IsValid());
}

function _GetTeamNumber(controller) {
    if (!controller) return null;

    const t1 = SafeCall("controller.GetTeamNumber()", () =>
        controller.GetTeamNumber ? controller.GetTeamNumber() : null
    );
    if (typeof t1 === "number" && isFinite(t1)) return t1;

    const t2 = SafeCall("controller.GetTeam()", () => (controller.GetTeam ? controller.GetTeam() : null));
    if (typeof t2 === "number" && isFinite(t2)) return t2;

    const t3 = SafeCall("controller.GetTeamNum()", () =>
        controller.GetTeamNum ? controller.GetTeamNum() : null
    );
    if (typeof t3 === "number" && isFinite(t3)) return t3;

    const pawn = GetPawnFromController(controller);
    const pTeam = SafeCall("pawn.GetTeamNumber()", () => (pawn && pawn.GetTeamNumber ? pawn.GetTeamNumber() : null));
    if (typeof pTeam === "number" && isFinite(pTeam)) return pTeam;

    return null;
}

function _FindTeamSpawnEntities(teamNum) {
    const classNames =
        teamNum === 2
            ? ["info_player_terrorist"]
            : teamNum === 3
                ? ["info_player_counterterrorist"]
                : [];

    const out = [];
    for (const cls of classNames) {
        const ents = SafeCall(`FindEntitiesByClass(${cls})`, () => Instance.FindEntitiesByClass(cls)) || [];
        if (Array.isArray(ents)) {
            for (const e of ents) if (_IsValidEnt(e)) out.push(e);
        }
    }
    return out;
}

function _PickDeterministicSpawn(spawns, slot) {
    if (!spawns || spawns.length === 0) return null;
    const s = (typeof slot === "number" && isFinite(slot)) ? slot : 0;
    const idx = ((s % spawns.length) + spawns.length) % spawns.length;
    return spawns[idx];
}

function TeleportPawnToTeamSpawn(pawn, controller, slot, fallbackMarkerName) {
    if (!pawn || !pawn.IsValid || !pawn.IsValid()) return false;

    const teamNum = _GetTeamNumber(controller);

    if (teamNum !== 2 && teamNum !== 3) {
        if (fallbackMarkerName) return TeleportPawnToMarker(pawn, fallbackMarkerName);
        return false;
    }

    const spawns = _FindTeamSpawnEntities(teamNum);
    const chosen = _PickDeterministicSpawn(spawns, slot);
    if (!chosen) {
        if (fallbackMarkerName) return TeleportPawnToMarker(pawn, fallbackMarkerName);
        return false;
    }

    pawn.Teleport({ position: chosen.GetAbsOrigin(), angles: chosen.GetAbsAngles() });
    return true;
}

function NameOfSlot(slot) {
    if (slot === null || slot === undefined) return "(none)";
    const c = Instance.GetPlayerController(slot);
    if (!c) return "(none)";
    const n = SafeCall("controller.GetPlayerName()", () => (c.GetPlayerName ? c.GetPlayerName() : ""));
    return n ? n : `slot${slot}`;
}

let gHudHintSerial = 0;

function _EscapeForCmdString(s) {
    return String(s ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\r")
        .replace(/\r/g, "");
}

function _KillHudHintImmediate() {
    const ent = SafeCall("FindEntityByName(chess_hudhint)", () => Instance.FindEntityByName("chess_hudhint"));
    if (ent && ent.IsValid && ent.IsValid()) SafeCall("hudhint.Remove()", () => ent.Remove());
    SafeCall("ent_fire chess_hudhint kill 0", () => Instance.ServerCommand(`ent_fire chess_hudhint kill`, 0.0));
}

function ShowHudHintLobby(msg, seconds = 0.9) {
    if (match.phase !== "lobby") return;

    gHudHintSerial++;
    const mySerial = gHudHintSerial;

    _KillHudHintImmediate();

    const m = _EscapeForCmdString(msg);
    SafeCall("ent_create env_hudhint", () =>
        Instance.ServerCommand(`ent_create env_hudhint {"targetname" "chess_hudhint" "message" "${m}"}`, 0.0)
    );
    SafeCall("ent_fire ShowHudHint", () => Instance.ServerCommand(`ent_fire chess_hudhint ShowHudHint`, 0.0));

    const killAt = Instance.GetGameTime() + Math.max(0.01, seconds);
    QueueThink(killAt, () => {
        if (gHudHintSerial !== mySerial) return;
        _KillHudHintImmediate();
    });
}

function PlaySoundTarget(targetName) {
    if (!targetName) return;
    SafeCall("EntFireAtName(StartSound)", () =>
        Instance.EntFireAtName({
            name: targetName,
            input: "StartSound",
            value: "",
        })
    );
}

const gBtnVisRestoreRGBA = new Map();
const gBtnVisBaselineRGBA = new Map();
const gBtnVisFlashToken = new Map();
let gBtnVisGlobalToken = 0;

function _EntKey(ent) {
    const idx = SafeCall("ent.GetEntityIndex()", () =>
        ent && ent.GetEntityIndex ? ent.GetEntityIndex() : undefined
    );
    if (typeof idx === "number" && isFinite(idx)) return idx;

    const idx2 = SafeCall("ent.entindex()", () =>
        ent
            ? typeof ent.entindex === "function"
                ? ent.entindex()
                : typeof ent.entindex === "number"
                    ? ent.entindex
                    : undefined
            : undefined
    );
    if (typeof idx2 === "number" && isFinite(idx2)) return idx2;

    const idx3 = SafeCall("ent.GetIndex()", () => (ent && ent.GetIndex ? ent.GetIndex() : undefined));
    if (typeof idx3 === "number" && isFinite(idx3)) return idx3;

    return ent;
}

function _FindEntityByIndexMaybe(idx) {
    if (typeof idx !== "number" || !isFinite(idx)) return undefined;

    const tries = [
        () => (Instance.GetEntityByIndex ? Instance.GetEntityByIndex(idx) : undefined),
        () => (Instance.GetEntity ? Instance.GetEntity(idx) : undefined),
        () =>
            typeof globalThis !== "undefined" && typeof globalThis.EntIndexToHScript === "function"
                ? globalThis.EntIndexToHScript(idx)
                : undefined,
    ];

    for (const t of tries) {
        const e = SafeCall("ResultSpawner._FindEntityByIndexMaybe", t);
        if (e && e.IsValid && e.IsValid()) return e;
    }

    return undefined;
}

function _RS_Num(x, fallback = 0) {
    const n = Number(x);
    return isFinite(n) ? n : fallback;
}

function _RS_Angles(ang) {
    if (!ang) return { pitch: 0, yaw: 0, roll: 0 };
    return {
        pitch: _RS_Num(ang.pitch ?? ang.x ?? ang[0], 0),
        yaw: _RS_Num(ang.yaw ?? ang.y ?? ang[1], 0),
        roll: _RS_Num(ang.roll ?? ang.z ?? ang[2], 0),
    };
}

function _RS_Name(ent) {
    const n1 = SafeCall("RS.ent.GetEntityName()", () =>
        ent && ent.GetEntityName ? ent.GetEntityName() : undefined
    );
    if (n1) return String(n1);

    const n2 = SafeCall("RS.ent.GetName()", () => (ent && ent.GetName ? ent.GetName() : undefined));
    if (n2) return String(n2);

    const n3 = SafeCall("RS.ent.GetEntityName property", () =>
        ent && typeof ent.GetEntityName === "string" ? ent.GetEntityName : undefined
    );
    if (n3) return String(n3);

    return "";
}

function _RS_AnchorScore(ent) {
    const n = _RS_Name(ent).toLowerCase();
    if (!n) return 0;
    if (n.endsWith(".origin")) return 5;
    if (n.includes("origin")) return 4;
    if (n.includes("anchor")) return 3;
    if (n.includes("root")) return 2;
    return 1;
}

function _RS_PickAnchor(list) {
    let best = list[0];
    let bestScore = _RS_AnchorScore(best);

    for (let i = 1; i < list.length; i++) {
        const s = _RS_AnchorScore(list[i]);
        if (s > bestScore) {
            best = list[i];
            bestScore = s;
        }
    }

    return best;
}


class ResultSpawner {
    spawned = [];

    constructor({ markerName, tplWhite, tplDraw, tplBlack }) {
        this.markerName = markerName;
        this.tplWhite = tplWhite;
        this.tplDraw = tplDraw;
        this.tplBlack = tplBlack;
    }

    _isValid(ent) {
        return !!(ent && ent.IsValid && ent.IsValid());
    }

    _findMarker() {
        const m = SafeCall("ResultSpawner.FindMarker", () => Instance.FindEntityByName(this.markerName));
        return this._isValid(m) ? m : undefined;
    }

    _findTemplate(templateName) {
        const pt = SafeCall("ResultSpawner.FindPointTemplate", () => Instance.FindEntityByName(templateName));
        if (!(pt instanceof PointTemplate)) return undefined;
        return pt;
    }

    clear() {
        for (const it of this.spawned) {
            const ent = it?.ref;
            if (this._isValid(ent)) SafeCall("ResultSpawner.ent.Remove()", () => ent.Remove());
        }

        for (const it of this.spawned) {
            const k = it?.key;
            if (typeof k === "number" && isFinite(k)) {
                const ent = _FindEntityByIndexMaybe(k);
                if (this._isValid(ent)) SafeCall("ResultSpawner.ent.Remove()(idx)", () => ent.Remove());
            }
        }

        this.spawned = [];
    }

    spawnForWinner(winnerColor) {
        this.clear();

        const marker = this._findMarker();
        if (!marker) {
            DBG(`[result][ERROR] marker missing: '${this.markerName}'`);
            return;
        }

        const templateName =
            winnerColor === WHITE ? this.tplWhite : winnerColor === BLACK ? this.tplBlack : this.tplDraw;

        const pt = this._findTemplate(templateName);
        if (!pt) {
            DBG(`[result][ERROR] template missing/not PointTemplate: '${templateName}'`);
            return;
        }

        const spawned = SafeCall(`ResultSpawner.ForceSpawn(${templateName})`, () => pt.ForceSpawn());
        const list = Array.isArray(spawned) ? spawned.filter((e) => this._isValid(e)) : [];

        if (list.length === 0) {
            DBG(`[result][WARN] ForceSpawn returned nothing for '${templateName}'`);
            return;
        }

        const anchor = _RS_PickAnchor(list);

        const anchorPos = anchor.GetAbsOrigin();
        const anchorAng = _RS_Angles(anchor.GetAbsAngles());

        const markerPos = marker.GetAbsOrigin();
        const markerAng = _RS_Angles(marker.GetAbsAngles());

        const dPitch = markerAng.pitch - anchorAng.pitch;
        const dYaw = markerAng.yaw - anchorAng.yaw;
        const dRoll = markerAng.roll - anchorAng.roll;

        for (const ent of list) {
            const o = ent.GetAbsOrigin();
            const a = _RS_Angles(ent.GetAbsAngles());

            const rel = Sub(o, anchorPos);
            const relRot = RotateZ(rel, dYaw);
            const newPos = Add(markerPos, relRot);

            const newAng = {
                pitch: a.pitch + dPitch,
                yaw: a.yaw + dYaw,
                roll: a.roll + dRoll,
            };

            SafeCall("ResultSpawner.Teleport()", () => ent.Teleport({ position: newPos, angles: newAng }));
            this.spawned.push({ ref: ent, key: _EntKey(ent) });
        }

        DBG(`[result] spawned '${templateName}' ents=${list.length}`);
    }
}

const resultSpawner = new ResultSpawner({
    markerName: "chess.result",
    tplWhite: "chess.result.white",
    tplDraw: "chess.result.draw",
    tplBlack: "chess.result.black",
});

function _ClampByte(x) {
    const n = Math.round(Number(x));
    if (!isFinite(n)) return 255;
    return Clamp(n, 0, 255);
}

function _NormalizeRGBA(rgba) {
    if (!rgba) return null;
    return { r: _ClampByte(rgba.r), g: _ClampByte(rgba.g), b: _ClampByte(rgba.b), a: _ClampByte(rgba.a) };
}

function _ParseRGBAAny(v) {
    if (v === null || v === undefined) return null;

    if (typeof v === "string") {
        const parts = v
            .trim()
            .split(/[,\s]+/)
            .filter((p) => p.length > 0)
            .map((p) => Number(p));
        if (parts.length >= 3) {
            return _NormalizeRGBA({
                r: parts[0],
                g: parts[1],
                b: parts[2],
                a: parts.length >= 4 ? parts[3] : 255,
            });
        }
        return null;
    }

    if (Array.isArray(v)) {
        if (v.length >= 3) return _NormalizeRGBA({ r: v[0], g: v[1], b: v[2], a: v.length >= 4 ? v[3] : 255 });
        return null;
    }

    if (typeof v === "object") {
        const r = v.r ?? v.x ?? v[0];
        const g = v.g ?? v.y ?? v[1];
        const b = v.b ?? v.z ?? v[2];
        const a = v.a ?? v.w ?? v[3] ?? 255;
        if (r === undefined || g === undefined || b === undefined) return null;
        return _NormalizeRGBA({ r, g, b, a });
    }

    return null;
}

function _ReadEntRGBA(ent) {
    if (!ent || !ent.IsValid || !ent.IsValid()) return null;

    const c1 = SafeCall("ent.GetColor()", () => (ent.GetColor ? ent.GetColor() : undefined));
    const p1 = _ParseRGBAAny(c1);
    if (p1) return p1;

    const c2 = SafeCall("ent.GetRenderColor()", () => (ent.GetRenderColor ? ent.GetRenderColor() : undefined));
    const p2 = _ParseRGBAAny(c2);
    let a2 = undefined;

    if (!p2) {
        const c3 = SafeCall("ent.GetRenderColor", () => (ent.GetRenderColor ? ent.GetRenderColor : undefined));
        const p3 = _ParseRGBAAny(c3);
        if (p3) return p3;
    } else {
        a2 = p2.a;
    }

    const alpha1 = SafeCall("ent.GetRenderAlpha()", () => (ent.GetRenderAlpha ? ent.GetRenderAlpha() : undefined));
    const alpha2 = SafeCall("ent.GetAlpha()", () => (ent.GetAlpha ? ent.GetAlpha() : undefined));
    const alpha = alpha1 ?? alpha2 ?? a2;

    if (p2) return _NormalizeRGBA({ r: p2.r, g: p2.g, b: p2.b, a: alpha ?? p2.a ?? 255 });

    return null;
}

function _EntName(ent) {
    const n1 = SafeCall("ent.GetEntityName()", () => (ent && ent.GetEntityName ? ent.GetEntityName() : undefined));
    if (n1) return String(n1);

    const n2 = SafeCall("ent.GetName()", () => (ent && ent.GetName ? ent.GetName() : undefined));
    if (n2) return String(n2);

    const n3 = SafeCall("ent.GetEntityName property", () =>
        ent && typeof ent.GetEntityName === "string" ? ent.GetEntityName : undefined
    );
    if (n3) return String(n3);

    return "";
}

function _EntFireColorByName(name, rgba) {
    const rgb = `${_ClampByte(rgba.r)} ${_ClampByte(rgba.g)} ${_ClampByte(rgba.b)}`;
    const a = `${_ClampByte(rgba.a)}`;

    const colorInputs = ["Color", "SetRenderColor", "RenderColor"];
    const alphaInputs = ["Alpha", "SetRenderAlpha", "RenderAlpha"];

    for (const input of colorInputs) {
        SafeCall(`EntFireAtName(${input})`, () =>
            Instance.EntFireAtName({
                name,
                input,
                value: rgb,
            })
        );
    }

    for (const input of alphaInputs) {
        SafeCall(`EntFireAtName(${input})`, () =>
            Instance.EntFireAtName({
                name,
                input,
                value: a,
            })
        );
    }
}

function _ApplyRGBA(ent, rgba) {
    if (!ent || !ent.IsValid || !ent.IsValid()) return;
    const col = _NormalizeRGBA(rgba);
    if (!col) return;

    const hasSetColor = typeof ent.SetColor === "function";
    if (hasSetColor) {
        SafeCall("ent.SetColor()", () => ent.SetColor(col));
        return;
    }

    const name = _EntName(ent);
    if (!name) return;

    _EntFireColorByName(name, col);
}

function _FindBtnVisEntitiesExact(fullName) {
    const list = SafeCall("FindEntitiesByName(btnvis)", () => Instance.FindEntitiesByName(fullName)) || [];
    return Array.isArray(list) ? list.filter((e) => e && e.IsValid && e.IsValid()) : [];
}

function FlashButtonVis(inputName, ok) {
    const namesTried = [];
    const exactName = `${CFG.ENT.BTNVIS_PREFIX}.${inputName}`;
    namesTried.push(exactName);

    let ents = _FindBtnVisEntitiesExact(exactName);

    function _GetBtnVisBaselineRGBA(ent) {
        const key = _EntKey(ent);
        if (gBtnVisBaselineRGBA.has(key)) return gBtnVisBaselineRGBA.get(key);
        const base = _ReadEntRGBA(ent) ?? CFG.UI.BUTTON_COLOR_NORMAL;
        gBtnVisBaselineRGBA.set(key, base);
        return base;
    }

    const mapped = CFG.UI.BTN_VIS[inputName];
    if ((!ents || ents.length === 0) && mapped) {
        const mappedName = `${CFG.ENT.BTNVIS_PREFIX}.${mapped}`;
        if (mappedName !== exactName) {
            namesTried.push(mappedName);
            ents = _FindBtnVisEntitiesExact(mappedName);
        }
    }

    if (!ents || ents.length === 0) {
        DBG(`[btnvis][MISS] input=${inputName} tried=${namesTried.join(",")}`);
        return;
    }

    const token = ++gBtnVisGlobalToken;
    const flashCol = ok ? CFG.UI.BUTTON_COLOR_OK : CFG.UI.BUTTON_COLOR_FAIL;

    for (const ent of ents) {
        const key = _EntKey(ent);
        const base = _GetBtnVisBaselineRGBA(ent);
        gBtnVisRestoreRGBA.set(key, base);
        gBtnVisFlashToken.set(key, token);
        _ApplyRGBA(ent, flashCol);
    }

    const restoreAt = Instance.GetGameTime() + CFG.UI.BUTTON_FLASH_SECONDS;
    QueueThink(restoreAt, () => {
        for (const ent of ents) {
            if (!ent || !ent.IsValid || !ent.IsValid()) continue;
            const key = _EntKey(ent);
            const t = gBtnVisFlashToken.get(key);
            if (t !== token) continue;

            const before = gBtnVisRestoreRGBA.get(key);
            if (before) _ApplyRGBA(ent, before);
            else {
                const base = gBtnVisBaselineRGBA.get(key);
                if (base) _ApplyRGBA(ent, base);
                else _ApplyRGBA(ent, CFG.UI.BUTTON_COLOR_NORMAL);
            }
        }
    });
}

function UIPress(inputName, ok, hudText) {
    PlaySoundTarget(CFG.SND.UI_PRESS);
    FlashButtonVis(inputName, ok);
    if (hudText) ShowHudHintLobby(hudText);
}

function EscapeForEntFireMessage(msg) {
    return String(msg).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/;/g, ",").replace(/\r/g, "");
}


class WorldTextLine {
    lastMsg = "";
    lastUpdateTime = 0;

    constructor(targetName) {
        this.targetName = targetName;
    }

    set(msg, force = false) {
        const now = Instance.GetGameTime();
        if (!force) {
            if (msg === this.lastMsg) return;
            if (now - this.lastUpdateTime < CFG.TEXT.MIN_UPDATE_INTERVAL_SECONDS) return;
        }

        this.lastMsg = msg;
        this.lastUpdateTime = now;

        Instance.EntFireAtName({
            name: this.targetName,
            input: "SetMessage",
            value: EscapeForEntFireMessage(msg),
        });
    }
}

const WT = {
    lobbySeatWhite: new WorldTextLine(CFG.ENT.LOBBY_SEAT_WHITE),
    lobbySeatBlack: new WorldTextLine(CFG.ENT.LOBBY_SEAT_BLACK),

    statusPhase: new WorldTextLine(CFG.ENT.STATUS_PHASE),
    statusLegalMoves: new WorldTextLine(CFG.ENT.STATUS_LEGAL_MOVES),
    statusLastMove: new WorldTextLine(CFG.ENT.STATUS_LAST_MOVE),
    statusTimeControl: new WorldTextLine(CFG.ENT.STATUS_TIMECONTROL),
    statusTimeControlTime: new WorldTextLine(CFG.ENT.STATUS_TIMECONTROL_TIME),

    clockWhite: new WorldTextLine(CFG.ENT.CLOCK_WHITE),
    clockBlack: new WorldTextLine(CFG.ENT.CLOCK_BLACK),
    clockIncrement: new WorldTextLine(CFG.ENT.CLOCK_INCREMENT),

    state: new WorldTextLine(CFG.ENT.STATE),
    turn: new WorldTextLine(CFG.ENT.TURN),
    lastMoveVerbose: new WorldTextLine(CFG.ENT.LASTMOVE_VERBOSE),
    moves: Array.from({ length: 10 }, (_, i) => new WorldTextLine(`${CFG.ENT.MOVES_PREFIX}.${i + 1}`)),

    fen: new WorldTextLine(CFG.ENT.FEN),

    engineStatus: new WorldTextLine(CFG.ENT.ENGINE_STATUS),
    engineBool: new WorldTextLine(CFG.ENT.ENGINE_BOOL),

    btn: {
        join_white: new WorldTextLine(CFG.UI.BTN_TEXT.join_white),
        join_black: new WorldTextLine(CFG.UI.BTN_TEXT.join_black),
        join_spec: new WorldTextLine(CFG.UI.BTN_TEXT.join_spec),
        swap_sides: new WorldTextLine(CFG.UI.BTN_TEXT.swap_sides),
        toggle_legal_moves: new WorldTextLine(CFG.UI.BTN_TEXT.toggle_legal_moves),
        toggle_last_move: new WorldTextLine(CFG.UI.BTN_TEXT.toggle_last_move),
        toggle_time_control: new WorldTextLine(CFG.UI.BTN_TEXT.toggle_time_control),
        time_preset_5_3: new WorldTextLine(CFG.UI.BTN_TEXT.time_preset_5_3),
        time_preset_10_0: new WorldTextLine(CFG.UI.BTN_TEXT.time_preset_10_0),
        time_preset_15_10: new WorldTextLine(CFG.UI.BTN_TEXT.time_preset_15_10),
        start_match: new WorldTextLine(CFG.UI.BTN_TEXT.start_match),
        reset: new WorldTextLine(CFG.UI.BTN_TEXT.reset),
        toggle_computer: new WorldTextLine(CFG.UI.BTN_TEXT.toggle_computer),
        engine_weak: new WorldTextLine(CFG.UI.BTN_TEXT.engine_weak),
        engine_medium: new WorldTextLine(CFG.UI.BTN_TEXT.engine_medium),
        engine_strong: new WorldTextLine(CFG.UI.BTN_TEXT.engine_strong),
    },
};

function FmtClock(seconds) {
    const s = Math.max(0, Math.floor(seconds));
    const hh = Math.floor(s / 3600);
    const mm = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    if (hh > 0) return `${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
    return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

function _FmtBaseAsMinutesOrClock(baseSeconds) {
    if (baseSeconds % 60 === 0) return `${baseSeconds / 60}`;
    return FmtClock(baseSeconds);
}

function FmtControl(baseSeconds, incSeconds) {
    return `${_FmtBaseAsMinutesOrClock(baseSeconds)}+${Math.max(0, Math.floor(incSeconds))}`;
}

function FmtTimeBaseLabel(baseSeconds) {
    if (baseSeconds % 60 === 0) {
        const m = baseSeconds / 60;
        return `Time: ${m} minute${m === 1 ? "" : "s"}`;
    }
    return `Time: ${FmtClock(baseSeconds)}`;
}

function UpdateFEN() {
    const fen = SafeCall("chess.fen()", () => (chess && chess.fen ? chess.fen() : ""));
    WT.fen.set(fen || "", true);
    DBG(`[FEN] ${fen}`);
}

class Board {
    centers = {};
    squarePickRadius = CFG.BOARD.DEFAULT_PICK_RADIUS;
    squareSpacing = CFG.BOARD.DEFAULT_SPACING;
    boardReady = false;
    initAttempts = 0;

    findCenters() {
        for (const k of Object.keys(this.centers)) delete this.centers[k];
        const entities = Instance.FindEntitiesByClass("info_target");
        for (const ent of entities) {
            const name = ent.GetEntityName();
            if (/^[a-h][1-8]$/.test(name)) this.centers[name] = { origin: ent.GetAbsOrigin(), angles: ent.GetAbsAngles() };
        }
        this.computeSpacingAndPickRadius();
    }

    computeSpacingAndPickRadius() {
        const a1 = this.centers["a1"]?.origin;
        const b1 = this.centers["b1"]?.origin;
        if (a1 && b1) {
            const d = Math.sqrt(DistSq(a1, b1));
            this.squareSpacing = d;
            this.squarePickRadius = Math.max(CFG.BOARD.MIN_PICK_RADIUS, d * CFG.BOARD.PICK_RADIUS_MULT);
            return;
        }
        this.squareSpacing = CFG.BOARD.DEFAULT_SPACING;
        this.squarePickRadius = CFG.BOARD.DEFAULT_PICK_RADIUS;
    }

    ensureReady(onReady) {
        this.initAttempts++;
        this.findCenters();
        const n = Object.keys(this.centers).length;

        if (n >= 64) {
            this.boardReady = true;
            onReady();
            return;
        }

        if (this.initAttempts >= CFG.BOARD.INIT_MAX_ATTEMPTS) {
            DBG(`[ERROR] Board NOT ready after ${this.initAttempts} tries (squares=${n}).`);
            onReady();
            return;
        }

        QueueThink(Instance.GetGameTime() + CFG.BOARD.INIT_RETRY_DELAY_SECONDS, () => this.ensureReady(onReady));
    }

    getLookedAtSquare(pawn) {
        if (!this.boardReady) return null;
        if (!pawn || !pawn.IsValid()) return null;

        const eyePos = pawn.GetEyePosition();
        const eyeAng = pawn.GetEyeAngles();
        const fwd = AnglesToForward(eyeAng);

        let bestSq = null;
        let bestPerpD2 = Infinity;

        for (const [sq, data] of Object.entries(this.centers)) {
            const c = data.origin;
            const v = Sub(c, eyePos);
            const t = Dot(v, fwd);
            if (t < 0) continue;

            const closest = Add(eyePos, Mul(fwd, t));
            const perpD2 = DistSq(c, closest);

            if (perpD2 < bestPerpD2) {
                bestPerpD2 = perpD2;
                bestSq = sq;
            }
        }

        if (!bestSq) return null;
        if (Math.sqrt(bestPerpD2) > this.squarePickRadius) return null;
        return bestSq;
    }
}

const board = new Board();

function OffboardPos() {
    const a1 = board?.centers?.["a1"]?.origin;
    if (a1) return { x: a1.x, y: a1.y, z: a1.z - CFG.CHESS.OFFBOARD_Z_DROP };
    return { ...CFG.CHESS.OFFBOARD_FALLBACK };
}

function PieceTemplateName(type, color) {
    return `${CFG.ENT.PIECE_TEMPLATE_PREFIX}.${type}.${color}`;
}

function PieceTemplateFallbackName(type) {
    return `${CFG.ENT.PIECE_TEMPLATE_PREFIX}.${type}`;
}

function PieceEntityName(color, type) {
    return `${CFG.ENT.PIECE_NAME_PREFIX}.${color}.${type}`;
}

function PieceAnglesForSquare(baseAngles, color, type) {
    const a = { ...baseAngles };
    if (color === BLACK) a.yaw -= 180;
    if (type === KNIGHT) a.yaw += 90;
    return a;
}

function SpawnPiece(type, color) {
    let spawner = Instance.FindEntityByName(PieceTemplateName(type, color));
    if (!spawner) spawner = Instance.FindEntityByName(PieceTemplateFallbackName(type));
    if (!(spawner instanceof PointTemplate)) return undefined;
    const spawned = spawner.ForceSpawn();
    return spawned ? spawned[0] : undefined;
}

function FindPieceEntity(color, type, square) {
    const list = Instance.FindEntitiesByName(PieceEntityName(color, type));
    return list.find((p) => p && p.square === square) || null;
}

function GetPieceAtSquare(squareName) {
    for (const line of chess.board()) for (const sq of line) if (sq && sq.square === squareName) return sq;
    return null;
}

function RenderPieces() {
    if (Object.keys(board.centers).length === 0) return;

    const existing = Instance.FindEntitiesByName(CFG.ENT.PIECE_WILDCARD);
    const pool = existing.slice();

    for (const line of chess.board()) {
        for (const sqObj of line) {
            if (!sqObj) continue;
            const center = board.centers[sqObj.square];
            if (!center) continue;

            let piece = null;
            const idx = pool.findIndex((p) => p && p.type === sqObj.type && p.color === sqObj.color);
            if (idx !== -1) piece = pool.splice(idx, 1)[0];
            else {
                piece = SpawnPiece(sqObj.type, sqObj.color);
                if (!piece) continue;
                piece.SetEntityName(PieceEntityName(sqObj.color, sqObj.type));
                piece.type = sqObj.type;
                piece.color = sqObj.color;
            }

            piece.square = sqObj.square;
            piece.Teleport({
                position: center.origin,
                angles: PieceAnglesForSquare(center.angles, sqObj.color, sqObj.type),
            });
        }
    }

    for (const ent of pool) if (ent && ent.IsValid && ent.IsValid()) ent.Remove();

    UpdateFEN();
}


class HighlightManager {
    entSelected = null;
    entHover = null;
    entLastMoveFrom = null;
    entLastMoveTo = null;

    entsLegal = {};
    entsCapture = {};
    hoverLastSq = null;

    cleanupOrphans() {
        const existing = Instance.FindEntitiesByName(`${CFG.HIGHLIGHT.PREFIX}.*`);
        for (const ent of existing) if (ent && ent.IsValid && ent.IsValid()) ent.Remove();
        this.entSelected = null;
        this.entHover = null;
        this.entLastMoveFrom = null;
        this.entLastMoveTo = null;
        this.entsLegal = {};
        this.entsCapture = {};
        this.hoverLastSq = null;
    }

    _isValid(ent) {
        return !!(ent && ent.IsValid && ent.IsValid());
    }

    _hide(ent) {
        if (!this._isValid(ent)) return;
        ent.Teleport({ position: OffboardPos() });
    }

    spawnOne(templateName) {
        const spawner = Instance.FindEntityByName(templateName);
        if (!(spawner instanceof PointTemplate)) {
            DBG(`[hl][ERROR] '${templateName}' missing or not a PointTemplate`);
            return undefined;
        }
        const spawned = spawner.ForceSpawn();
        return spawned ? spawned[0] : undefined;
    }

    _teleportToSquare(ent, sq, extraZ = 0) {
        if (!this._isValid(ent)) return false;
        const c = board.centers[sq];
        if (!c) return false;
        ent.Teleport({
            position: { ...c.origin, z: c.origin.z + CFG.HIGHLIGHT.Z_OFFSET_ALL + extraZ },
            angles: c.angles,
        });
        return true;
    }

    ensureHoverSpawned() {
        if (this._isValid(this.entHover)) return true;
        const ent = this.spawnOne(CFG.HIGHLIGHT.TEMPLATES.HOVER);
        if (!ent) return false;
        ent.SetEntityName(`${CFG.HIGHLIGHT.PREFIX}.hover`);
        this.entHover = ent;
        this.hoverLastSq = null;
        this._hide(ent);
        return true;
    }

    setHoverSquare(sqOrNull) {
        if (!this.ensureHoverSpawned()) return;

        if (!sqOrNull) {
            if (this.hoverLastSq !== null) {
                this._hide(this.entHover);
                this.hoverLastSq = null;
            }
            return;
        }

        if (sqOrNull === this.hoverLastSq) return;

        const z = CFG.HIGHLIGHT.Z_LAYERS.HOVER;
        if (!this._teleportToSquare(this.entHover, sqOrNull, z)) {
            this._hide(this.entHover);
            this.hoverLastSq = null;
            return;
        }

        this.hoverLastSq = sqOrNull;
    }

    ensureSelectedAt(fromSq) {
        if (!fromSq) return;

        if (!this._isValid(this.entSelected)) {
            const ent = this.spawnOne(CFG.HIGHLIGHT.TEMPLATES.SELECTED);
            if (!ent) return;
            ent.SetEntityName(`${CFG.HIGHLIGHT.PREFIX}.selected`);
            this.entSelected = ent;
        }

        if (!this._teleportToSquare(this.entSelected, fromSq, CFG.HIGHLIGHT.Z_LAYERS.SELECTED)) this._hide(this.entSelected);
    }

    clearSelected() {
        if (this._isValid(this.entSelected)) this.entSelected.Remove();
        this.entSelected = null;
    }

    clearLegalCapture() {
        for (const ent of Object.values(this.entsLegal)) if (this._isValid(ent)) ent.Remove();
        for (const ent of Object.values(this.entsCapture)) if (this._isValid(ent)) ent.Remove();
        this.entsLegal = {};
        this.entsCapture = {};
    }

    clearSelectionHighlights() {
        this.clearSelected();
        this.clearLegalCapture();
    }

    showSelection(fromSq, legalVerboseMoves, showLegalMoves) {
        this.ensureSelectedAt(fromSq);

        if (!showLegalMoves) {
            this.clearLegalCapture();
            return;
        }

        this.clearLegalCapture();

        const captureSet = new Set();
        const legalSet = new Set();

        for (const m of legalVerboseMoves || []) {
            if (!m || !m.to) continue;
            if (m.captured) captureSet.add(m.to);
            else if (!captureSet.has(m.to)) legalSet.add(m.to);
        }

        for (const sq of captureSet) {
            const ent = this.spawnOne(CFG.HIGHLIGHT.TEMPLATES.CAPTURE);
            if (!ent) continue;
            ent.SetEntityName(`${CFG.HIGHLIGHT.PREFIX}.capture.${sq}`);
            if (!this._teleportToSquare(ent, sq, CFG.HIGHLIGHT.Z_LAYERS.CAPTURE)) this._hide(ent);
            this.entsCapture[sq] = ent;
        }

        for (const sq of legalSet) {
            const ent = this.spawnOne(CFG.HIGHLIGHT.TEMPLATES.LEGAL);
            if (!ent) continue;
            ent.SetEntityName(`${CFG.HIGHLIGHT.PREFIX}.legal.${sq}`);
            if (!this._teleportToSquare(ent, sq, CFG.HIGHLIGHT.Z_LAYERS.LEGAL)) this._hide(ent);
            this.entsLegal[sq] = ent;
        }
    }

    _ensureLastMoveSpawned() {
        if (!this._isValid(this.entLastMoveFrom)) {
            const e = this.spawnOne(CFG.HIGHLIGHT.TEMPLATES.LASTMOVE);
            if (e) {
                e.SetEntityName(`${CFG.HIGHLIGHT.PREFIX}.lastmove.from`);
                this.entLastMoveFrom = e;
                this._hide(e);
            }
        }

        if (!this._isValid(this.entLastMoveTo)) {
            const e = this.spawnOne(CFG.HIGHLIGHT.TEMPLATES.LASTMOVE);
            if (e) {
                e.SetEntityName(`${CFG.HIGHLIGHT.PREFIX}.lastmove.to`);
                this.entLastMoveTo = e;
                this._hide(e);
            }
        }

        return this._isValid(this.entLastMoveFrom) && this._isValid(this.entLastMoveTo);
    }

    clearLastMove() {
        if (this._isValid(this.entLastMoveFrom)) this.entLastMoveFrom.Remove();
        if (this._isValid(this.entLastMoveTo)) this.entLastMoveTo.Remove();
        this.entLastMoveFrom = null;
        this.entLastMoveTo = null;
    }

    setLastMove(fromSqOrNull, toSqOrNull, show) {
        if (!show || !fromSqOrNull || !toSqOrNull) {
            this.clearLastMove();
            return;
        }
        if (!this._ensureLastMoveSpawned()) return;

        const z = CFG.HIGHLIGHT.Z_LAYERS.LASTMOVE;
        if (!this._teleportToSquare(this.entLastMoveFrom, fromSqOrNull, z)) this._hide(this.entLastMoveFrom);
        if (!this._teleportToSquare(this.entLastMoveTo, toSqOrNull, z)) this._hide(this.entLastMoveTo);
    }

    tickHover(ownerPawnOrNull) {
        if (!board.boardReady) return;
        if (!ownerPawnOrNull || !ownerPawnOrNull.IsValid || !ownerPawnOrNull.IsValid()) {
            this.setHoverSquare(null);
            return;
        }
        this.setHoverSquare(board.getLookedAtSquare(ownerPawnOrNull));
    }
}

const highlights = new HighlightManager();

const gPieceBaseModelScale = { [PAWN]: 1, [KNIGHT]: 1, [BISHOP]: 1, [ROOK]: 1, [QUEEN]: 1, [KING]: 1 };
let gPieceBaseModelScaleReady = false;

function EntGetModelScale(ent) {
    const s = SafeCall("ent.GetModelScale()", () => (ent && ent.GetModelScale ? ent.GetModelScale() : undefined));
    return typeof s === "number" && isFinite(s) && s > 0 ? s : undefined;
}

function EntSetModelScale(ent, scale) {
    SafeCall("ent.SetModelScale()", () => (ent && ent.SetModelScale ? ent.SetModelScale(scale) : undefined));
}

function EnsurePieceBaseModelScales() {
    if (gPieceBaseModelScaleReady) return;

    const types = [PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING];
    const off = OffboardPos();

    for (const t of types) {
        let ent = SpawnPiece(t, WHITE);
        if (!ent) ent = SpawnPiece(t, BLACK);

        if (!ent || !ent.IsValid || !ent.IsValid()) {
            gPieceBaseModelScale[t] = 1;
            continue;
        }

        gPieceBaseModelScale[t] = EntGetModelScale(ent) ?? 1;
        SafeCall("sample.Teleport(offboard)", () => ent.Teleport({ position: off }));
        SafeCall("sample.Remove()", () => ent.Remove());
    }

    gPieceBaseModelScaleReady = true;
}


class PromotionUI {
    hoverEnt = null;
    hoverLastKey = null;
    options = {};
    active = false;

    cleanupOrphans() {
        const existing = Instance.FindEntitiesByName(`${CFG.PROMO.PREFIX}.*`);
        for (const ent of existing) if (ent && ent.IsValid && ent.IsValid()) ent.Remove();
        this.hoverEnt = null;
        this.hoverLastKey = null;
        this.options = {};
        this.active = false;
    }

    _isValid(ent) {
        return !!(ent && ent.IsValid && ent.IsValid());
    }

    _hide(ent) {
        if (!this._isValid(ent)) return;
        ent.Teleport({ position: OffboardPos() });
    }

    _spawnHover() {
        if (this._isValid(this.hoverEnt)) return true;

        const spawner = Instance.FindEntityByName(CFG.PROMO.HOVER_TEMPLATE);
        if (!(spawner instanceof PointTemplate)) return false;

        const spawned = spawner.ForceSpawn();
        const ent = spawned ? spawned[0] : undefined;
        if (!ent) return false;

        ent.SetEntityName(`${CFG.PROMO.PREFIX}.hover`);

        const base = EntGetModelScale(ent) ?? 1;
        EntSetModelScale(ent, base * CFG.PROMO.HOVER_SCALE_MULT);

        this.hoverEnt = ent;
        this._hide(ent);
        return true;
    }

    _spawnPromoPiece(type, color, name) {
        EnsurePieceBaseModelScales();

        let spawner = Instance.FindEntityByName(PieceTemplateName(type, color));
        if (!spawner) spawner = Instance.FindEntityByName(PieceTemplateFallbackName(type));
        if (!(spawner instanceof PointTemplate)) return undefined;

        const spawned = spawner.ForceSpawn();
        const ent = spawned ? spawned[0] : undefined;
        if (ent && ent.SetEntityName) ent.SetEntityName(name);

        const base = gPieceBaseModelScale[type] ?? EntGetModelScale(ent) ?? 1;
        EntSetModelScale(ent, base * CFG.PROMO.PIECE_SCALE_MULT);

        return ent;
    }

    open(toSq, moverColor) {
        this.close();
        EnsurePieceBaseModelScales();

        const c = board.centers[toSq];
        if (!c) return;

        const base = { ...c.origin };
        const ang = c.angles;

        const right = YawToFlatRight(ang.yaw);
        const fwd = YawToFlatForward(ang.yaw);
        const d = board.squareSpacing * CFG.PROMO.GRID_FRACTION_OF_SQUARE;

        for (const it of CFG.PROMO.LAYOUT) {
            const pos = Add(Add(base, Mul(right, it.dxSign * d)), Mul(fwd, it.dySign * d));
            const hoverPos = { ...pos, z: pos.z + CFG.HIGHLIGHT.Z_OFFSET_ALL + CFG.HIGHLIGHT.Z_LAYERS.HOVER };

            const name = `${CFG.PROMO.PREFIX}.opt.${moverColor}.${it.key}`;
            const ent = this._spawnPromoPiece(it.key, moverColor, name);
            if (!ent) continue;

            const a = PieceAnglesForSquare(ang, moverColor, it.key);
            ent.Teleport({ position: pos, angles: a });

            this.options[it.key] = { type: it.key, ent, pos, hoverPos, ang: a };
        }

        this._spawnHover();
        this.active = true;
        this.hoverLastKey = null;
        if (this._isValid(this.hoverEnt)) this._hide(this.hoverEnt);
    }

    close() {
        for (const o of Object.values(this.options)) if (o.ent && o.ent.IsValid && o.ent.IsValid()) o.ent.Remove();
        this.options = {};
        if (this._isValid(this.hoverEnt)) this.hoverEnt.Remove();
        this.hoverEnt = null;
        this.hoverLastKey = null;
        this.active = false;
    }

    getLookedOption(pawn) {
        if (!this.active) return null;
        if (!pawn || !pawn.IsValid || !pawn.IsValid()) return null;

        const eyePos = pawn.GetEyePosition();
        const eyeAng = pawn.GetEyeAngles();
        const fwd = AnglesToForward(eyeAng);

        let bestKey = null;
        let bestPerpD2 = Infinity;

        for (const [k, o] of Object.entries(this.options)) {
            const center = o.pos;
            const v = Sub(center, eyePos);
            const t = Dot(v, fwd);
            if (t < 0) continue;

            const closest = Add(eyePos, Mul(fwd, t));
            const perpD2 = DistSq(center, closest);

            if (perpD2 < bestPerpD2) {
                bestPerpD2 = perpD2;
                bestKey = k;
            }
        }

        if (!bestKey) return null;
        if (Math.sqrt(bestPerpD2) > board.squareSpacing * CFG.PROMO.LOOK_PICK_RADIUS_FRACTION) return null;
        return bestKey;
    }

    tickHover(pawn) {
        if (!this.active) return;
        if (!this._spawnHover()) return;

        const k = this.getLookedOption(pawn);
        if (!k) {
            if (this.hoverLastKey !== null) {
                this._hide(this.hoverEnt);
                this.hoverLastKey = null;
            }
            return;
        }

        if (k === this.hoverLastKey) return;

        const o = this.options[k];
        if (!o) {
            this._hide(this.hoverEnt);
            this.hoverLastKey = null;
            return;
        }

        this.hoverEnt.Teleport({ position: o.hoverPos, angles: o.ang });
        this.hoverLastKey = k;
    }
}

const promoUI = new PromotionUI();

function _ArcHeightAt01(t, arcCfg) {
    if (!arcCfg) return 0;

    if (typeof arcCfg === "number") {
        const tt = Math.max(0, Math.min(1, t));
        return 4 * tt * (1 - tt) * arcCfg;
    }

    const tt = Math.max(0, Math.min(1, t));
    const h = Math.max(0, arcCfg.height ?? 0);
    if (h <= 0) return 0;

    const peak = Clamp(arcCfg.peakT ?? CFG.ANIM.KNIGHT_PEAK_T_FRAC, 0.05, 0.95);
    const risePow = Math.max(0.5, arcCfg.risePow ?? CFG.ANIM.KNIGHT_RISE_POW);
    const fallPow = Math.max(0.5, arcCfg.fallPow ?? CFG.ANIM.KNIGHT_FALL_POW);

    if (tt <= peak) {
        const u = tt / peak;
        const easeOut = 1 - Math.pow(1 - u, risePow);
        return h * easeOut;
    } else {
        const u = (tt - peak) / (1 - peak);
        return h * (1 - Math.pow(u, fallPow));
    }
}

async function SlidePieceWorld(piece, startPos, endPos, seconds, arc = 0) {
    const startTime = Instance.GetGameTime();
    const dx = endPos.x - startPos.x;
    const dy = endPos.y - startPos.y;
    const dz = endPos.z - startPos.z;

    while (true) {
        if (!piece || !piece.IsValid || !piece.IsValid()) return;

        const t = (Instance.GetGameTime() - startTime) / seconds;
        if (t >= 1) {
            piece.Teleport({ position: endPos });
            return;
        }

        const tt = Math.max(0, Math.min(1, t));
        const arcZ = _ArcHeightAt01(tt, arc);

        piece.Teleport({
            position: {
                x: startPos.x + dx * tt,
                y: startPos.y + dy * tt,
                z: startPos.z + dz * tt + arcZ,
            },
        });

        await Delay(0);
    }
}

async function SlidePiece(piece, from, to, seconds = CFG.ANIM.MOVE_SLIDE_SECONDS) {
    const startC = board.centers[from];
    const endC = board.centers[to];
    if (!startC || !endC) return;
    await SlidePieceWorld(piece, startC.origin, endC.origin, seconds);
}

function KnightJumpHeight() {
    const h = board.squareSpacing * CFG.ANIM.KNIGHT_JUMP_HEIGHT_FRAC;
    return Math.max(CFG.ANIM.KNIGHT_JUMP_HEIGHT_MIN, h);
}

async function SlideKnight(piece, from, to, seconds = CFG.ANIM.MOVE_SLIDE_SECONDS) {
    const startC = board.centers[from];
    const endC = board.centers[to];
    if (!startC || !endC) return;

    const arcCfg = {
        height: KnightJumpHeight(),
        peakT: CFG.ANIM.KNIGHT_PEAK_T_FRAC,
        risePow: CFG.ANIM.KNIGHT_RISE_POW,
        fallPow: CFG.ANIM.KNIGHT_FALL_POW,
    };

    await SlidePieceWorld(piece, startC.origin, endC.origin, seconds, arcCfg);
}

async function DiePiece(piece, seconds = CFG.ANIM.CAPTURE_DIE_SECONDS) {
    const startTime = Instance.GetGameTime();
    const startPos = piece.GetAbsOrigin();

    while (true) {
        if (!piece || !piece.IsValid || !piece.IsValid()) return;

        const t = (Instance.GetGameTime() - startTime) / seconds;
        if (t >= 1) {
            piece.Remove();
            return;
        }

        piece.Teleport({ position: { ...startPos, z: startPos.z - 10 * t } });
        await Delay(0);
    }
}

function CapturedSquare(move) {
    if (!move || !move.captured) return null;
    if (typeof move.flags === "string" && move.flags.indexOf("e") !== -1) {
        const file = move.to[0];
        const toRank = parseInt(move.to[1], 10);
        const capRank = move.color === WHITE ? toRank - 1 : toRank + 1;
        return `${file}${capRank}`;
    }
    return move.to;
}

function CastleRookSquares(move) {
    if (!move || typeof move.flags !== "string") return null;
    const rank = move.from[1];
    if (move.flags.indexOf("k") !== -1) return { rookFrom: `h${rank}`, rookTo: `f${rank}` };
    if (move.flags.indexOf("q") !== -1) return { rookFrom: `a${rank}`, rookTo: `d${rank}` };
    return null;
}

async function AnimateMoveEntities(move) {
    if (!move) return;

    const mover = FindPieceEntity(move.color, move.piece, move.from);
    const rookInfo = CastleRookSquares(move);
    const rook = rookInfo ? FindPieceEntity(move.color, ROOK, rookInfo.rookFrom) : null;

    const capSq = CapturedSquare(move);
    const capColor = move.captured ? (move.color === WHITE ? BLACK : WHITE) : null;
    const captured = move.captured && capSq ? FindPieceEntity(capColor, move.captured, capSq) : null;

    const tasks = [];

    if (captured) tasks.push(DiePiece(captured, CFG.ANIM.CAPTURE_DIE_SECONDS));

    if (rookInfo && rook) {
        rook.square = rookInfo.rookTo;
        tasks.push(
            SlidePieceWorld(
                rook,
                board.centers[rookInfo.rookFrom].origin,
                board.centers[rookInfo.rookTo].origin,
                CFG.ANIM.MOVE_SLIDE_SECONDS
            )
        );
    }

    if (mover) {
        mover.square = move.to;
        if (move.piece === KNIGHT) tasks.push(SlideKnight(mover, move.from, move.to, CFG.ANIM.MOVE_SLIDE_SECONDS));
        else tasks.push(SlidePiece(mover, move.from, move.to, CFG.ANIM.MOVE_SLIDE_SECONDS));
    }

    if (tasks.length) await Promise.all(tasks);
}


class ChessClock {
    baseSeconds = 300;
    incrementSeconds = 3;

    whiteRemaining = 300;
    blackRemaining = 300;

    runningColor = null;
    lastUpdateTime = 0;

    configure(baseSeconds, incrementSeconds) {
        this.baseSeconds = Math.max(0, baseSeconds);
        this.incrementSeconds = Math.max(0, incrementSeconds);
    }

    reset() {
        this.whiteRemaining = this.baseSeconds;
        this.blackRemaining = this.baseSeconds;
        this.runningColor = null;
        this.lastUpdateTime = Instance.GetGameTime();
    }

    _applyDelta() {
        if (!this.runningColor) return;

        const now = Instance.GetGameTime();
        const dt = now - this.lastUpdateTime;
        this.lastUpdateTime = now;

        if (dt <= 0) return;

        if (this.runningColor === WHITE) this.whiteRemaining = Math.max(0, this.whiteRemaining - dt);
        else this.blackRemaining = Math.max(0, this.blackRemaining - dt);
    }

    tick() {
        this._applyDelta();
    }

    pause() {
        this._applyDelta();
        this.runningColor = null;
    }

    start(color) {
        this.runningColor = color;
        this.lastUpdateTime = Instance.GetGameTime();
    }

    addIncrement(color) {
        const inc = this.incrementSeconds;
        if (!inc || inc <= 0) return;
        if (color === WHITE) this.whiteRemaining += inc;
        else this.blackRemaining += inc;
    }
}

class ComputerPlayer {
    busy = false;
    thinkToken = 0;

    p4 = new P4wnEngine();

    _rand01() { return Math.random(); }
    _clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }

    _stillShouldPlay(matchController, chessInstance, token) {
        if (token !== this.thinkToken) return false;
        if (!matchController || matchController.phase !== "playing") return false;
        if (!chessInstance) return false;
        if (chessInstance.isGameOver && chessInstance.isGameOver()) return false;
        if (!matchController.isComputerTurn || !matchController.isComputerTurn()) return false;
        if (promoState) return false;
        if (bIsAnimating) return false;
        return true;
    }

    _computeThinkDelaySeconds(matchController, colorToMove) {
        const botCfg = CFG.BOT || {};
        const minDelay = botCfg.MIN_THINK_SECONDS ?? 1.0;
        const maxDelay = botCfg.MAX_THINK_SECONDS ?? 2.5;
        const jitter = botCfg.THINK_JITTER_SECONDS ?? 0.3;

        if (!matchController.timeControlEnabled) {
            return this._clamp(
                minDelay + (maxDelay - minDelay) * this._rand01() + (this._rand01() - 0.5) * jitter,
                0.05,
                10
            );
        }

        const remaining =
            colorToMove === WHITE ? matchController.clock.whiteRemaining : matchController.clock.blackRemaining;

        const panicT = botCfg.PANIC_TIME_SECONDS ?? 6.0;
        const panicDelay = botCfg.PANIC_THINK_SECONDS ?? 0.15;

        if (remaining <= 0.25) return 0.01;
        if (remaining <= panicT) {
            return this._clamp(panicDelay + (this._rand01() - 0.5) * jitter, 0.01, 10);
        }

        const tNorm = this._clamp((remaining - panicT) / 60.0, 0, 1);
        const base = minDelay + (maxDelay - minDelay) * tNorm;
        return this._clamp(base + (this._rand01() - 0.5) * jitter, 0.05, 10);
    }

    _pickMoveWithP4wn(chessInstance) {
        const botCfg = CFG.BOT || {};
        const depth = Math.max(1, Math.floor(botCfg.SEARCH_DEPTH ?? 3));

        const fen = chessInstance.fen();

        const mv = this.p4.bestMoveFromFen(fen, depth);
        if (!mv) return null;

        const from = mv.from;
        const to = mv.to;

        const piece = chessInstance.get(from);
        const isPawn = piece && piece.type === "p";
        const toRank = to.charAt(1);
        const isPromoting = isPawn && (toRank === "8" || toRank === "1");

        if (isPromoting) return { from, to, promotion: "q" };
        return { from, to };
    }

    async tickMaybeMakeMove(matchController, chessInstance) {
        if (this.busy) return;
        if (!matchController || !chessInstance) return;
        if (!matchController.isComputerTurn || !matchController.isComputerTurn()) return;

        this.busy = true;
        const token = ++this.thinkToken;

        try {
            const color = chessInstance.turn();

            const delaySec = this._computeThinkDelaySeconds(matchController, color);


            let remaining = Math.max(0, delaySec);
            const step = 0.05;

            while (remaining > 0) {
                await Delay(Math.min(step, remaining));
                remaining -= step;

                if (!this._stillShouldPlay(matchController, chessInstance, token)) return;
            }

            if (!this._stillShouldPlay(matchController, chessInstance, token)) return;

            const mv = this._pickMoveWithP4wn(chessInstance);
            if (!mv) return;

            if (!this._stillShouldPlay(matchController, chessInstance, token)) return;

            let moveObj = null;
            try {
                moveObj = chessInstance.move(mv);
            } catch (e) {
                moveObj = null;
            }
            if (!moveObj) return;

            await matchController.onMoveAccepted(moveObj, color);

            bIsAnimating = true;
            try {
                await AnimateMoveEntities(moveObj);
            } finally {
                bIsAnimating = false;
            }

            RenderPieces();
            TryEndGameAndMatchEnd();
            if (matchController.phase === "playing") matchController.afterMoveAnimation();
            UpdateAllWallTexts(true);
        } finally {
            this.busy = false;
        }
    }
}

function StripPawnGunsKeepKnife(pawn) {
    if (!pawn || !pawn.IsValid || !pawn.IsValid()) return;

    const slotsToStrip = [0, 1, 3, 4, 5, 6];
    for (const s of slotsToStrip) {
        const w = SafeCall("pawn.FindWeaponBySlot", () => (pawn.FindWeaponBySlot ? pawn.FindWeaponBySlot(s) : null));
        if (!w) continue;
        SafeCall("pawn.DestroyWeapon", () => (pawn.DestroyWeapon ? pawn.DestroyWeapon(w) : undefined));
    }

    const knife = SafeCall("pawn.FindWeaponBySlot(2)", () => (pawn.FindWeaponBySlot ? pawn.FindWeaponBySlot(2) : null));
    if (!knife && pawn.GiveNamedItem)
        SafeCall("pawn.GiveNamedItem(weapon_knife)", () => pawn.GiveNamedItem("weapon_knife", true));
}

function StripAllPlayersGunsKeepKnife() {
    for (let slot = 0; slot < 64; slot++) {
        const c = Instance.GetPlayerController(slot);
        if (!c) continue;
        const pawn = GetPawnFromController(c);
        if (!pawn) continue;
        StripPawnGunsKeepKnife(pawn);
    }
}

const gSavedLoadoutsBySlot = new Map();

function _WeaponClassName(w) {
    if (!w || !w.IsValid || !w.IsValid()) return null;

    const c1 = SafeCall("weapon.GetClassname()", () => (w.GetClassname ? w.GetClassname() : undefined));
    if (c1) return String(c1);

    const c2 = SafeCall("weapon.GetClassName()", () => (w.GetClassName ? w.GetClassName() : undefined));
    if (c2) return String(c2);

    const c3 = SafeCall("weapon.GetClassname property", () => (typeof w.GetClassname === "string" ? w.GetClassname : undefined));
    if (c3) return String(c3);

    const c4 = SafeCall("weapon.GetClassName property", () => (typeof w.GetClassName === "string" ? w.GetClassName : undefined));
    if (c4) return String(c4);

    return null;
}

function ForceAllPlayersToKnife() {
    for (let slot = 0; slot < 64; slot++) {
        const c = Instance.GetPlayerController(slot);
        if (!c) continue;
        const pawn = GetPawnFromController(c);
        if (!pawn) continue;
        SafeCall("ForceAllPlayersToKnife", () => Instance.ClientCommand(slot, "slot3"));
    }
}

function SnapshotAllPlayersLoadouts() {
    gSavedLoadoutsBySlot.clear();

    for (let slot = 0; slot < 64; slot++) {
        const c = Instance.GetPlayerController(slot);
        if (!c) continue;
        const pawn = GetPawnFromController(c);
        if (!pawn || !pawn.IsValid || !pawn.IsValid()) continue;

        const seen = new Set();
        const weapons = [];

        for (let s = 0; s <= 6; s++) {
            const w = SafeCall("pawn.FindWeaponBySlot", () => (pawn.FindWeaponBySlot ? pawn.FindWeaponBySlot(s) : null));
            if (!w) continue;
            const cls = _WeaponClassName(w);
            if (!cls) continue;
            if (cls === "weapon_knife") continue;
            if (seen.has(cls)) continue;
            seen.add(cls);
            weapons.push(cls);
        }

        gSavedLoadoutsBySlot.set(slot, weapons);
    }
}

function RestoreAllPlayersLoadouts() {
    for (const [slot, weapons] of gSavedLoadoutsBySlot.entries()) {
        const c = Instance.GetPlayerController(slot);
        if (!c) continue;
        const pawn = GetPawnFromController(c);
        if (!pawn || !pawn.IsValid || !pawn.IsValid()) continue;

        StripPawnGunsKeepKnife(pawn);

        if (pawn.GiveNamedItem && Array.isArray(weapons)) {
            for (const cls of weapons) {
                if (!cls || cls === "weapon_knife") continue;
                SafeCall(`pawn.GiveNamedItem(${cls})`, () => pawn.GiveNamedItem(String(cls), true));
            }
        }
    }
}

function _ColorWord(c) {
    return c === WHITE ? "White" : c === BLACK ? "Black" : "--";
}

function _VerboseMoveLine(move) {
    if (!move) return "--";

    const rawSan = move.san ? String(move.san).trim() : "";
    const from = String(move.from ?? "");
    const to = String(move.to ?? "");

    if (!rawSan) return "--";

    let san = rawSan;

    san = san.replace(/^([KQRBN])/, (m) => m.toLowerCase());
    san = san.replace(/=([KQRBN])/g, (_, p1) => `=${String(p1).toLowerCase()}`);
    san = san.replace(/O-O-O|O-O/g, (m) => m.replace(/O/g, "o"));

    if (from && to) return `Last Move: ${san} (${from} -> ${to})`;
    return san;
}

function _BuildMoveLines() {
    const hist = SafeCall("chess.history()", () => (chess.history ? chess.history() : [])) || [];
    const plies = Array.isArray(hist) ? hist : [];
    const fullCount = Math.ceil(plies.length / 2);

    const startFull = Math.max(1, fullCount - 9);
    const lines = [];

    for (let i = 0; i < 10; i++) {
        const n = startFull + i;
        if (n > fullCount || n <= 0) {
            lines.push("");
            continue;
        }

        const w = plies[2 * (n - 1)] ? String(plies[2 * (n - 1)]) : "";
        const b = plies[2 * (n - 1) + 1] ? String(plies[2 * (n - 1) + 1]) : "";

        if (!w) {
            lines.push("");
            continue;
        }

        if (b) lines.push(`${n}. ${w} | ${b}`);
        else lines.push(`${n}. ${w}`);
    }

    return lines;
}


class MatchController {
    phase = "lobby";

    seatWhiteSlot = null;
    seatBlackSlot = null;

    settingsBaseSeconds = 300;
    settingsIncrementSeconds = 3;

    timeControlEnabled = true;

    showLegalMoves = true;
    showLastMove = true;

    clock = new ChessClock();

    lastMoveFrom = null;
    lastMoveTo = null;
    lastMoveObj = null;

    plyCount = 0;

    lastStatusRenderTime = 0;

    whiteGraceActive = false;
    whiteGraceStartTime = 0;

    computerEnabled = false;
    computer = new ComputerPlayer();

    endWinnerColor = null;
    endReason = "";

    init() {
        resultSpawner.clear();

        this.clock.configure(this.settingsBaseSeconds, this.settingsIncrementSeconds);
        this.clock.reset();

        this.lastMoveFrom = null;
        this.lastMoveTo = null;
        this.lastMoveObj = null;
        this.plyCount = 0;

        this.endWinnerColor = null;
        this.endReason = "";

        highlights.setLastMove(null, null, this.showLastMove);

        this.phase = "lobby";
        this.renderLobbyTexts(true);
        this.teleportEveryoneToTeamSpawns();

        UpdateAllWallTexts(true);
    }

    _EnginePresetKeyFromDepth(d) {
        if (d === 2) return "weak";
        if (d === 3) return "medium";
        if (d === 5) return "strong";
        return null;
    }

    _effectiveSeat(color) {
        if (!CFG.FLAGS.SOLO_TEST_MODE) return this.getSlotForColor(color);

        const w = this.seatWhiteSlot;
        const b = this.seatBlackSlot;
        if (w !== null && w !== undefined && (b === null || b === undefined)) return w;
        if (b !== null && b !== undefined && (w === null || w === undefined)) return b;
        return this.getSlotForColor(color);
    }

    getColorForSlot(slot) {
        if (slot === null || slot === undefined) return null;

        if (CFG.FLAGS.SOLO_TEST_MODE) {
            const w = this.seatWhiteSlot;
            const b = this.seatBlackSlot;
            if ((w !== null && w === slot) || (b !== null && b === slot)) {
                const effW = this._effectiveSeat(WHITE);
                const effB = this._effectiveSeat(BLACK);
                if (effW === slot && effB === slot) return chess.turn();
            }
        }

        if (this.seatWhiteSlot === slot) return WHITE;
        if (this.seatBlackSlot === slot) return BLACK;
        return null;
    }

    getSlotForColor(color) {
        return color === WHITE ? this.seatWhiteSlot : this.seatBlackSlot;
    }

    seatName(color) {
        return NameOfSlot(this._effectiveSeat(color));
    }

    adjustTimeBaseSeconds(deltaSeconds, inputNameForFlash) {
        if (this.phase !== "lobby") return;

        const d = Math.floor(deltaSeconds);
        const prev = Math.max(0, Math.floor(this.settingsBaseSeconds));
        const next = Math.max(0, prev + d);

        if (next === prev) {
            UIPress(inputNameForFlash, false, `Control: ${FmtControl(this.settingsBaseSeconds, this.settingsIncrementSeconds)}`);
            return;
        }

        this.settingsBaseSeconds = next;
        this.clock.configure(this.settingsBaseSeconds, this.settingsIncrementSeconds);
        this.clock.reset();

        UIPress(inputNameForFlash, true, `Control: ${FmtControl(this.settingsBaseSeconds, this.settingsIncrementSeconds)}`);
        UpdateAllWallTexts(true);
    }



    adjustIncrementSeconds(deltaSeconds, inputNameForFlash) {
        if (this.phase !== "lobby") return;

        const d = Math.floor(deltaSeconds);
        const prev = Math.max(0, Math.floor(this.settingsIncrementSeconds));
        const next = Math.max(0, prev + d);

        if (next === prev) {
            UIPress(inputNameForFlash, false, `Control: ${FmtControl(this.settingsBaseSeconds, this.settingsIncrementSeconds)}`);
            return;
        }

        this.settingsIncrementSeconds = next;
        this.clock.configure(this.settingsBaseSeconds, this.settingsIncrementSeconds);
        this.clock.reset();

        UIPress(inputNameForFlash, true, `Control: ${FmtControl(this.settingsBaseSeconds, this.settingsIncrementSeconds)}`);
        UpdateAllWallTexts(true);
    }

    assignSeat(color, activatorEnt) {
        if (this.phase !== "lobby") return;

        const slot = GetSlotFromEntity(activatorEnt);
        if (slot === null) return;

        if (color === WHITE) {
            if (this.seatWhiteSlot === slot) {
                this.seatWhiteSlot = null;
                UIPress("join_white", true, "Unseated WHITE");
                UpdateAllWallTexts(true);
                return;
            }
            if (this.seatBlackSlot === slot) this.seatBlackSlot = null;
            this.seatWhiteSlot = slot;
            UIPress("join_white", true, `Seated WHITE: ${NameOfSlot(slot)}`);
        } else {
            if (this.seatBlackSlot === slot) {
                this.seatBlackSlot = null;
                UIPress("join_black", true, "Unseated BLACK");
                UpdateAllWallTexts(true);
                return;
            }
            if (this.seatWhiteSlot === slot) this.seatWhiteSlot = null;
            this.seatBlackSlot = slot;
            UIPress("join_black", true, `Seated BLACK: ${NameOfSlot(slot)}`);
        }

        UpdateAllWallTexts(true);
    }

    joinSpec(activatorEnt) {
        if (this.phase !== "lobby") return;

        const slot = GetSlotFromEntity(activatorEnt);
        if (slot === null) return;

        if (this.seatWhiteSlot === slot) this.seatWhiteSlot = null;
        if (this.seatBlackSlot === slot) this.seatBlackSlot = null;

        const controller = Instance.GetPlayerController(slot);
        if (controller && controller.JoinTeam) controller.JoinTeam(CFG.MATCH.TEAM_SPEC);

        UIPress("join_spec", true, "Joined spectator");
        UpdateAllWallTexts(true);
    }

    swapSides() {
        if (this.phase !== "lobby") return;
        const w = this.seatWhiteSlot;
        const b = this.seatBlackSlot;
        this.seatWhiteSlot = b;
        this.seatBlackSlot = w;
        UIPress("swap_sides", true, "Swapped sides");
        UpdateAllWallTexts(true);
    }

    setEngineDepth(depth, inputNameForFlash) {
        if (this.phase !== "lobby") return;

        const d = Math.max(1, Math.floor(depth));

        CFG.BOT.SEARCH_DEPTH = d;

        UIPress(inputNameForFlash, true, `Engine depth: ${d}`);
        UpdateAllWallTexts(true);
    }

    toggleComputer() {
        if (this.phase !== "lobby") return;

        this.computerEnabled = !this.computerEnabled;

        UIPress("toggle_computer", true, `Computer: ${this.computerEnabled ? "ON" : "OFF"}`);
        UpdateAllWallTexts(true);
    }

    toggleLegalMoves() {
        if (this.phase !== "lobby") return;
        this.showLegalMoves = !this.showLegalMoves;
        UIPress("toggle_legal_moves", true, `Legal moves: ${this.showLegalMoves ? "ON" : "OFF"}`);
        if (selectedFrom) highlights.showSelection(selectedFrom, selectedLegalMovesVerbose || [], this.showLegalMoves);
        UpdateAllWallTexts(true);
    }

    toggleLastMove() {
        if (this.phase !== "lobby") return;
        this.showLastMove = !this.showLastMove;
        UIPress("toggle_last_move", true, `Last move highlight: ${this.showLastMove ? "ON" : "OFF"}`);
        highlights.setLastMove(this.lastMoveFrom, this.lastMoveTo, this.showLastMove);
        UpdateAllWallTexts(true);
    }

    toggleTimeControl() {
        if (this.phase !== "lobby") return;
        this.timeControlEnabled = !this.timeControlEnabled;
        UIPress("toggle_time_control", true, `Time control: ${this.timeControlEnabled ? "ON" : "OFF"}`);
        UpdateAllWallTexts(true);
    }

    applyTimePreset(baseSeconds, incSeconds, btnInputNameForFlash) {
        if (this.phase !== "lobby") return;
        this.settingsBaseSeconds = Math.max(0, Math.floor(baseSeconds));
        this.settingsIncrementSeconds = Math.max(0, Math.floor(incSeconds));
        this.clock.configure(this.settingsBaseSeconds, this.settingsIncrementSeconds);
        this.clock.reset();

        UIPress(btnInputNameForFlash, true, `Preset: ${FmtControl(this.settingsBaseSeconds, this.settingsIncrementSeconds)}`);
        UpdateAllWallTexts(true);
    }

    isComputerColor(color) {
        if (!this.computerEnabled) return false;

        const wHas = this.seatWhiteSlot !== null && this.seatWhiteSlot !== undefined;
        const bHas = this.seatBlackSlot !== null && this.seatBlackSlot !== undefined;

        if (wHas && bHas) return false;

        if (!wHas && !bHas) return (color === WHITE || color === BLACK);

        if (color === WHITE) return !wHas && bHas;
        if (color === BLACK) return !bHas && wHas;
        return false;
    }


    isComputerTurn() {
        if (this.phase !== "playing") return false;
        if (!chess || !(chess.turn && typeof chess.turn === "function")) return false;
        if (chess.isGameOver && chess.isGameOver()) return false;
        return this.isComputerColor(chess.turn());
    }

    canStart() {
        if (!board.boardReady) return false;

        const wHas = this.seatWhiteSlot !== null && this.seatWhiteSlot !== undefined;
        const bHas = this.seatBlackSlot !== null && this.seatBlackSlot !== undefined;

        if (CFG.FLAGS.SOLO_TEST_MODE) return wHas || bHas;

        if (wHas && bHas) return true;

        if (this.computerEnabled) {
            return true;
        }

        return false;
    }


    teleportSeatedPlayersToBoard() {
        const wSlot = this._effectiveSeat(WHITE);
        const bSlot = this._effectiveSeat(BLACK);

        const wCtrl = wSlot !== null ? Instance.GetPlayerController(wSlot) : undefined;
        const bCtrl = bSlot !== null ? Instance.GetPlayerController(bSlot) : undefined;

        const wPawn = wCtrl ? GetPawnFromController(wCtrl) : undefined;
        const bPawn = bCtrl ? GetPawnFromController(bCtrl) : undefined;

        if (wPawn) TeleportPawnToMarker(wPawn, CFG.ENT.SPAWNS.WHITE);
        if (bPawn) TeleportPawnToMarker(bPawn, CFG.ENT.SPAWNS.BLACK);
    }

    teleportEveryoneToTeamSpawns() {
        const fallback = FindMarker(CFG.ENT.SPAWNS.SPEC) ? CFG.ENT.SPAWNS.SPEC : CFG.ENT.SPAWNS.LOBBY;

        for (let slot = 0; slot < 64; slot++) {
            const c = Instance.GetPlayerController(slot);
            if (!c) continue;

            const pawn = GetPawnFromController(c);
            if (!pawn) continue;

            TeleportPawnToTeamSpawn(pawn, c, slot, fallback);
        }
    }

    teleportNonPlayersToSpecSpawnOnce() {
        const wSlot = this._effectiveSeat(WHITE);
        const bSlot = this._effectiveSeat(BLACK);

        for (let slot = 0; slot < 64; slot++) {
            if (slot === wSlot || slot === bSlot) continue;

            const c = Instance.GetPlayerController(slot);
            if (!c) continue;

            const pawn = GetPawnFromController(c);
            if (!pawn) continue;

            TeleportPawnToSpecSpawn(pawn, slot);
        }
    }

    async startMatch() {
        if (this.phase === "playing") return;

        const ok = this.canStart();
        if (!ok) {
            UIPress("start_match", false, "Cannot start: assign seats first");
            UpdateAllWallTexts(true);
            return;
        }

        resultSpawner.clear();

        UIPress("start_match", true, "Match starting...");
        chess = new Chess();
        ClearSelection();
        promoState = null;
        promoUI.close();

        this.lastMoveFrom = null;
        this.lastMoveTo = null;
        this.lastMoveObj = null;

        this.endWinnerColor = null;
        this.endReason = "";

        highlights.setLastMove(null, null, this.showLastMove);

        RenderPieces();

        this.clock.configure(this.settingsBaseSeconds, this.settingsIncrementSeconds);
        this.clock.reset();

        this.phase = "playing";
        this.plyCount = 0;

        this.whiteGraceActive = false;
        this.whiteGraceStartTime = 0;

        this.teleportEveryoneToTeamSpawns();
        await Delay(0.15);
        this.teleportNonPlayersToSpecSpawnOnce();
        await Delay(0.05);
        this.teleportSeatedPlayersToBoard();

        SnapshotAllPlayersLoadouts();
        StripAllPlayersGunsKeepKnife();

        ForceAllPlayersToKnife();
        QueueThink(Instance.GetGameTime() + 0.3, ForceAllPlayersToKnife);

        if (this.timeControlEnabled) {
            this.whiteGraceActive = true;
            this.whiteGraceStartTime = Instance.GetGameTime();
            this.clock.pause();
        } else {
            this.clock.pause();
        }

        UpdateAllWallTexts(true);
    }

    endMatch(winnerColor, reason) {
        if (this.phase === "ended") return;

        this.clock.pause();
        this.phase = "ended";

        this.endWinnerColor = winnerColor;
        this.endReason = reason || "";

        ClearSelection();
        promoState = null;
        promoUI.close();

        UpdateAllWallTexts(true);

        if (winnerColor === WHITE || winnerColor === BLACK) PlaySoundTarget(CFG.SND.WIN);
        else PlaySoundTarget(CFG.SND.DRAW);

        resultSpawner.spawnForWinner(winnerColor);

        const hist = SafeCall("chess.history()", () => (chess.history ? chess.history() : [])) || [];
        const pgn = SafeCall("chess.pgn()", () => (chess.pgn ? chess.pgn() : "")) || "";
        const fen = SafeCall("chess.fen()", () => (chess.fen ? chess.fen() : "")) || "";

        LOG(`Game ended: winner=${winnerColor === WHITE ? "WHITE" : winnerColor === BLACK ? "BLACK" : "DRAW"} reason="${reason || ""}" moves=${hist.length}`);
        LOG(`[PGN]`);
        LOG(pgn);
        LOG(`Final FEN: ${fen}`);
    }

    resetFull() {
        resultSpawner.clear();

        this.clock.pause();

        this.phase = "lobby";

        chess = new Chess();
        ClearSelection();
        promoState = null;
        promoUI.close();

        this.lastMoveFrom = null;
        this.lastMoveTo = null;
        this.lastMoveObj = null;

        this.endWinnerColor = null;
        this.endReason = "";

        highlights.setLastMove(null, null, this.showLastMove);

        RenderPieces();

        this.clock.configure(this.settingsBaseSeconds, this.settingsIncrementSeconds);
        this.clock.reset();

        this.plyCount = 0;
        this.whiteGraceActive = false;

        this.teleportEveryoneToTeamSpawns();
        RestoreAllPlayersLoadouts();
        UpdateAllWallTexts(true);
    }

    onRoundStart() {
        if (CFG.MATCH.CLEAR_SEATS_ON_ROUND_START) {
            this.seatWhiteSlot = null;
            this.seatBlackSlot = null;
        }
        this.resetFull();
    }

    _resolveInputPawn() {
        if (promoState && promoState.slot !== null) {
            const c = Instance.GetPlayerController(promoState.slot);
            const p = c ? GetPawnFromController(c) : undefined;
            if (p) return p;
        }

        if (selectedSlot !== null) {
            const c = Instance.GetPlayerController(selectedSlot);
            const p = c ? GetPawnFromController(c) : undefined;
            if (p) return p;
        }

        if (this.phase === "playing") {
            const slot = this._effectiveSeat(chess.turn());
            if (slot !== null && slot !== undefined) {
                const c = Instance.GetPlayerController(slot);
                const p = c ? GetPawnFromController(c) : undefined;
                if (p) return p;
            }
        }

        const wSlot = this._effectiveSeat(WHITE);
        if (wSlot !== null) {
            const c = Instance.GetPlayerController(wSlot);
            const p = c ? GetPawnFromController(c) : undefined;
            if (p) return p;
        }

        const bSlot = this._effectiveSeat(BLACK);
        if (bSlot !== null) {
            const c = Instance.GetPlayerController(bSlot);
            const p = c ? GetPawnFromController(c) : undefined;
            if (p) return p;
        }

        return null;
    }

    tick() {
        if (this.phase === "playing" && this.timeControlEnabled) {
            if (this.whiteGraceActive) {
                if (chess.turn() === WHITE) {
                    const now = Instance.GetGameTime();
                    if (now - this.whiteGraceStartTime >= CFG.MATCH.WHITE_FIRST_MOVE_GRACE_SECONDS) {
                        this.whiteGraceActive = false;
                        this.clock.start(WHITE);
                    }
                } else {
                    this.whiteGraceActive = false;
                }
            } else {
                this.clock.tick();
                if (this.clock.whiteRemaining <= 0) this.endMatch(BLACK, "White lost on time");
                else if (this.clock.blackRemaining <= 0) this.endMatch(WHITE, "Black lost on time");
            }
        }

        const pawn = this._resolveInputPawn();
        if (promoState) {
            highlights.setHoverSquare(null);
            promoUI.tickHover(pawn);
        } else if (this.phase === "playing") {
            promoUI.close();
            highlights.tickHover(pawn);
        } else {
            promoUI.close();
            highlights.setHoverSquare(null);
        }

        if (!bIsAnimating && !promoState && this.isComputerTurn()) {
            this.computer.tickMaybeMakeMove(this, chess).catch((e) => DBG(`[EXCEPTION] computer: ${e}`));
        }

        const now = Instance.GetGameTime();
        if (now - this.lastStatusRenderTime >= CFG.MATCH.STATUS_INTERVAL_SECONDS) {
            UpdateAllWallTexts(false);
            this.lastStatusRenderTime = now;
        }
    }

    async onMoveAccepted(move, moverColor) {
        if (this.timeControlEnabled) {
            this.clock.pause();
            this.clock.addIncrement(moverColor);
        }

        this.lastMoveFrom = move.from;
        this.lastMoveTo = move.to;
        this.lastMoveObj = move;

        highlights.setLastMove(this.lastMoveFrom, this.lastMoveTo, this.showLastMove);

        const hist = SafeCall("chess.history()", () => (chess.history ? chess.history() : []));
        this.plyCount = Array.isArray(hist) ? hist.length : Math.max(0, (this.plyCount ?? 0) + 1);

        if (move.captured) PlaySoundTarget(CFG.SND.CAPTURE);
        else PlaySoundTarget(CFG.SND.MOVE);

        UpdateAllWallTexts(true);
    }

    afterMoveAnimation() {
        if (this.phase !== "playing") return;
        if (chess.isGameOver && chess.isGameOver()) return;

        if (!this.timeControlEnabled) return;

        this.whiteGraceActive = false;
        this.clock.start(chess.turn());
    }

    renderLobbyTexts(force) {
        const wHas = this.seatWhiteSlot !== null && this.seatWhiteSlot !== undefined;
        const bHas = this.seatBlackSlot !== null && this.seatBlackSlot !== undefined;

        const wName = this.isComputerColor(WHITE)
            ? "ENGINE"
            : (wHas ? NameOfSlot(this.seatWhiteSlot) : "[EMPTY]");

        const bName = this.isComputerColor(BLACK)
            ? "ENGINE"
            : (bHas ? NameOfSlot(this.seatBlackSlot) : "[EMPTY]");

        WT.lobbySeatWhite.set(`White: ${wName}`, force);
        WT.lobbySeatBlack.set(`Black: ${bName}`, force);
    }
}

let chess = new Chess();
const match = new MatchController();

function UpdateButtonLabelTexts(force) {
    WT.btn.join_white.set("Join White", force);
    WT.btn.join_black.set("Join Black", force);
    WT.btn.join_spec.set("Spectate", force);
    WT.btn.swap_sides.set("Swap Sides", force);

    WT.btn.toggle_legal_moves.set(`Legal Moves: ${match.showLegalMoves ? "ON" : "OFF"}`, force);
    WT.btn.toggle_last_move.set(`Last Move: ${match.showLastMove ? "ON" : "OFF"}`, force);
    WT.btn.toggle_time_control.set(`Time Control: ${match.timeControlEnabled ? "ON" : "OFF"}`, force);

    WT.btn.toggle_computer.set(`Computer: ${match.computerEnabled ? "ON" : "OFF"}`, force);

    if (!match.computerEnabled) {
        WT.btn.engine_weak.set("", force);
        WT.btn.engine_medium.set("", force);
        WT.btn.engine_strong.set("", force);
    } else {
        const d = Math.max(1, Math.floor(CFG.BOT.SEARCH_DEPTH ?? 3));
        const preset = match._EnginePresetKeyFromDepth(d);

        WT.btn.engine_weak.set(`Engine Weak: ${preset === "weak" ? "ON" : "OFF"}`, force);
        WT.btn.engine_medium.set(`Engine Medium: ${preset === "medium" ? "ON" : "OFF"}`, force);
        WT.btn.engine_strong.set(`Engine Strong: ${preset === "strong" ? "ON" : "OFF"}`, force);
    }

    WT.btn.time_preset_5_3.set("Blitz | 5+3", force);
    WT.btn.time_preset_10_0.set("Rapid | 10+0", force);
    WT.btn.time_preset_15_10.set("Rapid | 15+10", force);

    WT.btn.start_match.set("START", force);
    WT.btn.reset.set("RESET", force);
}


function UpdateStatusTexts(force) {
    if (match.phase === "lobby") WT.statusPhase.set("STATE: LOBBY", force);
    else if (match.phase === "playing") WT.statusPhase.set("STATE: PLAYING", force);
    else WT.statusPhase.set("STATE: ENDED", force);

    WT.statusLegalMoves.set(`Legal Moves: ${match.showLegalMoves ? "ON" : "OFF"}`, force);
    WT.statusLastMove.set(`Last Move: ${match.showLastMove ? "ON" : "OFF"}`, force);

    WT.statusTimeControl.set(`Control: ${FmtControl(match.settingsBaseSeconds, match.settingsIncrementSeconds)}`, force);
    WT.clockIncrement.set(`Increment: +${Math.max(0, Math.floor(match.settingsIncrementSeconds))}s`, force);
    WT.statusTimeControlTime.set(FmtTimeBaseLabel(match.settingsBaseSeconds), force);

    WT.engineBool.set(`Engine: ${match.computerEnabled ? "ON" : "OFF"}`, force);

    const d = Math.max(1, Math.floor(CFG.BOT.SEARCH_DEPTH ?? 3));
    const label = (d === 2) ? "WEAK" : (d === 3) ? "MEDIUM" : (d === 5) ? "STRONG" : `D${d}`;

    WT.engineStatus.set(`Engine: ${match.computerEnabled ? label : "OFF"}`, force);

    if (!match.timeControlEnabled) {
        WT.clockWhite.set("--:--", force);
        WT.clockBlack.set("--:--", force);
        return;
    }

    if (match.phase === "playing") {
        WT.clockWhite.set(`${FmtClock(match.clock.whiteRemaining)}`, force);
        WT.clockBlack.set(`${FmtClock(match.clock.blackRemaining)}`, force);
        return;
    }

    WT.clockWhite.set(`${FmtClock(match.settingsBaseSeconds)}`, force);
    WT.clockBlack.set(`${FmtClock(match.settingsBaseSeconds)}`, force);
}

function UpdateGameInfoTexts(force) {
    let state = "Lobby";
    if (match.phase === "playing") {
        const isOver = chess.isGameOver && chess.isGameOver();
        const inCheck = chess.inCheck && chess.inCheck();
        state = isOver ? "Ended" : inCheck ? "Playing (Check)" : "Playing";
    } else if (match.phase === "ended") {
        if (match.endWinnerColor === WHITE || match.endWinnerColor === BLACK)
            state = `Ended (${_ColorWord(match.endWinnerColor)} wins${match.endReason ? `: ${match.endReason}` : ""})`;
        else state = `Ended (Draw${match.endReason ? `: ${match.endReason}` : ""})`;
    }

    WT.state.set(state, force);

    let turn = "--";
    if (match.phase === "playing" && !(chess.isGameOver && chess.isGameOver())) turn = _ColorWord(chess.turn());
    WT.turn.set(turn, force);

    WT.lastMoveVerbose.set(_VerboseMoveLine(match.lastMoveObj), force);

    const lines = _BuildMoveLines();
    for (let i = 0; i < 10; i++) WT.moves[i].set(lines[i] ?? "", force);
}

function UpdateAllWallTexts(force) {
    match.renderLobbyTexts(force);
    UpdateButtonLabelTexts(force);
    UpdateStatusTexts(force);
    UpdateGameInfoTexts(force);
}

let selectedSlot = null;
let selectedFrom = null;
let selectedLegalMovesVerbose = [];
let promoState = null;
let bIsAnimating = false;

function ClearSelection() {
    selectedSlot = null;
    selectedFrom = null;
    selectedLegalMovesVerbose = [];
    highlights.clearSelectionHighlights();
}

function SelectSquare(slot, sq) {
    selectedSlot = slot;
    selectedFrom = sq;

    selectedLegalMovesVerbose =
        SafeCall("chess.moves({square,verbose})", () => chess.moves({ square: sq, verbose: true })) || [];
    highlights.showSelection(sq, selectedLegalMovesVerbose, match.showLegalMoves);

    DBG(`[select] slot=${slot} sq=${sq} legal=${selectedLegalMovesVerbose.length}`);
}

function FindVerboseMove(fromSq, toSq) {
    const legal = selectedLegalMovesVerbose || [];
    return legal.find((m) => m && m.from === fromSq && m.to === toSq) || null;
}

function IsPromotionVerboseMove(m) {
    if (!m) return false;
    if (m.promotion) return true;
    if (typeof m.flags === "string" && m.flags.indexOf("p") !== -1) return true;

    if (m.piece !== PAWN) return false;
    const rank = parseInt(String(m.to)[1], 10);
    if (m.color === WHITE && rank === 8) return true;
    if (m.color === BLACK && rank === 1) return true;
    return false;
}

async function PreviewPromotionMove(moverColor, from, to, verboseMove) {
    if (verboseMove && verboseMove.captured) {
        const capType = verboseMove.captured;
        const capColor = moverColor === WHITE ? BLACK : WHITE;
        const capSq = CapturedSquare(verboseMove) || to;
        const captured = FindPieceEntity(capColor, capType, capSq);
        if (captured) await DiePiece(captured, CFG.ANIM.CAPTURE_DIE_SECONDS);
    }

    const pawnEnt = FindPieceEntity(moverColor, PAWN, from);
    if (!pawnEnt) return;

    pawnEnt.square = to;
    await SlidePieceWorld(
        pawnEnt,
        board.centers[from].origin,
        board.centers[to].origin,
        CFG.ANIM.MOVE_SLIDE_SECONDS * CFG.ANIM.PROMO_PAWN_PREVIEW_SPEED_MULT
    );

    if (pawnEnt && pawnEnt.IsValid && pawnEnt.IsValid()) pawnEnt.Remove();
}

async function BeginPromotion(pawn, slot, moverColor, from, to, verboseMove) {
    promoState = { slot, color: moverColor, from, to, captured: verboseMove ? verboseMove.captured : null };
    ClearSelection();

    DBG(`[promo] begin slot=${slot} ${moverColor === WHITE ? "WHITE" : "BLACK"} ${from}->${to}`);

    bIsAnimating = true;
    try {
        await PreviewPromotionMove(moverColor, from, to, verboseMove);
    } finally {
        bIsAnimating = false;
    }

    promoUI.open(to, moverColor);
    UpdateAllWallTexts(true);
}

function HandleCancelClick(pawn) {
    if (promoState) return;

    const controller = SafeCall("pawn.GetPlayerController", () => pawn.GetPlayerController());
    const slot = controller ? SafeCall("controller.GetPlayerSlot", () => controller.GetPlayerSlot()) : null;

    if (selectedSlot !== null && slot !== null && slot !== selectedSlot) return;
    DBG(`[select] cancel slot=${slot}`);
    ClearSelection();
}

function TryEndGameAndMatchEnd() {
    if (!chess.isGameOver || !chess.isGameOver()) return;

    if (chess.isCheckmate && chess.isCheckmate()) {
        const loser = chess.turn();
        match.endMatch(loser === WHITE ? BLACK : WHITE, "Checkmate");
        return;
    }
    if (chess.isStalemate && chess.isStalemate()) {
        match.endMatch(null, "Stalemate");
        return;
    }
    match.endMatch(null, "Draw");
}

async function HandlePrimaryClickFromPawn(pawn) {
    if (!pawn || !pawn.IsValid()) return;
    if (!board.boardReady) return;
    if (bIsAnimating) return;
    if (match.phase !== "playing") return;
    if (chess.isGameOver && chess.isGameOver()) return;

    const controller = SafeCall("pawn.GetPlayerController", () => pawn.GetPlayerController());
    if (!controller) return;

    const slot = SafeCall("controller.GetPlayerSlot", () => controller.GetPlayerSlot());

    if (promoState) {
        if (promoState.slot !== null && slot !== promoState.slot) return;

        const k = promoUI.getLookedOption(pawn);
        if (!k) return;

        const from = promoState.from;
        const to = promoState.to;
        const moverColor = promoState.color;

        let move = null;
        try {
            move = chess.move({ from, to, promotion: k });
        } catch (e) {
            move = null;
        }
        if (!move) return;

        promoState = null;
        promoUI.close();

        await match.onMoveAccepted(move, moverColor);

        RenderPieces();
        TryEndGameAndMatchEnd();
        if (match.phase === "playing") match.afterMoveAnimation();
        UpdateAllWallTexts(true);
        return;
    }

    const playerColor = match.getColorForSlot(slot);
    const turn = chess.turn();
    if (!playerColor) return;

    const lookedSq = board.getLookedAtSquare(pawn);
    if (!lookedSq) return;

    if (selectedFrom && lookedSq === selectedFrom) {
        ClearSelection();
        return;
    }

    if (!selectedFrom) {
        if (turn !== playerColor) return;
        const piece = GetPieceAtSquare(lookedSq);
        if (!piece) return;
        if (piece.color !== turn) return;
        SelectSquare(slot, lookedSq);
        return;
    }

    if (selectedSlot !== null && slot !== selectedSlot) return;
    if (turn !== playerColor) return;

    const from = selectedFrom;
    const to = lookedSq;

    const verboseMove = FindVerboseMove(from, to);
    if (verboseMove && IsPromotionVerboseMove(verboseMove)) {
        await BeginPromotion(pawn, slot, playerColor, from, to, verboseMove);
        return;
    }

    let move = null;
    try {
        move = chess.move({ from, to, promotion: QUEEN });
    } catch (e) {
        move = null;
    }
    if (!move) return;

    ClearSelection();
    await match.onMoveAccepted(move, playerColor);

    bIsAnimating = true;
    try {
        await AnimateMoveEntities(move);
    } finally {
        bIsAnimating = false;
    }

    RenderPieces();
    TryEndGameAndMatchEnd();
    if (match.phase === "playing") match.afterMoveAnimation();
    UpdateAllWallTexts(true);
}

function MatchTickLoop() {
    match.tick();
    QueueThink(Instance.GetGameTime() + CFG.MATCH.TICK_DT_SECONDS, MatchTickLoop);
}

function Init(memory) {
    if (memory && memory.rulesetAppliedOnce === true) gRulesetAppliedOnce = true;

    QueueThink(Instance.GetGameTime() + CFG.RULESET.APPLY_DELAY_SECONDS, () => ApplyServerRulesetOnce("init"));
    if (memory && memory.chess && !memory.chess.isGameOver()) chess = memory.chess;

    board.initAttempts = 0;
    board.boardReady = false;

    board.ensureReady(() => {
        highlights.cleanupOrphans();
        promoUI.cleanupOrphans();

        highlights.ensureHoverSpawned();
        EnsurePieceBaseModelScales();

        RenderPieces();
        match.init();

        QueueThink(Instance.GetGameTime() + 0.05, MatchTickLoop);
        Instance.SetNextThink(Instance.GetGameTime());
    });
}

Instance.OnActivate(() => Init(undefined));

Instance.OnScriptReload({
    before: () => ({ chess, rulesetAppliedOnce: gRulesetAppliedOnce }),
    after: (memory) => Init(memory),
});

Instance.OnScriptInput("join_white", (inputData) => match.assignSeat(WHITE, inputData.activator));
Instance.OnScriptInput("join_black", (inputData) => match.assignSeat(BLACK, inputData.activator));
Instance.OnScriptInput("join_spec", (inputData) => match.joinSpec(inputData.activator));
Instance.OnScriptInput("swap_sides", () => match.swapSides());

Instance.OnScriptInput("toggle_legal_moves", () => match.toggleLegalMoves());
Instance.OnScriptInput("toggle_last_move", () => match.toggleLastMove());
Instance.OnScriptInput("toggle_time_control", () => match.toggleTimeControl());
Instance.OnScriptInput("toggle_computer", () => match.toggleComputer());
Instance.OnScriptInput("engine_weak", () => match.setEngineDepth(CFG.BOT.WEAK, "engine_weak"));
Instance.OnScriptInput("engine_medium", () => match.setEngineDepth(CFG.BOT.MEDIUM, "engine_medium"));
Instance.OnScriptInput("engine_strong", () => match.setEngineDepth(CFG.BOT.HARD, "engine_strong"));

Instance.OnScriptInput("time_preset_5_3", () => match.applyTimePreset(5 * 60, 3, "time_preset_5_3"));
Instance.OnScriptInput("time_preset_10_0", () => match.applyTimePreset(10 * 60, 0, "time_preset_10_0"));
Instance.OnScriptInput("time_preset_15_10", () => match.applyTimePreset(15 * 60, 10, "time_preset_15_10"));

Instance.OnScriptInput("start_match", () => {
    match.startMatch().catch((e) => DBG(`[EXCEPTION] start_match: ${e}`));
});

Instance.OnScriptInput("reset", () => {
    UIPress("reset", true, "Reset to lobby");
    match.resetFull();
});

Instance.OnScriptInput("time_add_60", () => match.adjustTimeBaseSeconds(60, "time_add_60"));
Instance.OnScriptInput("time_sub_60", () => match.adjustTimeBaseSeconds(-60, "time_sub_60"));
Instance.OnScriptInput("time_add_300", () => match.adjustTimeBaseSeconds(300, "time_add_300"));
Instance.OnScriptInput("time_sub_300", () => match.adjustTimeBaseSeconds(-300, "time_sub_300"));

Instance.OnScriptInput("inc_add_1", () => match.adjustIncrementSeconds(1, "inc_add_1"));
Instance.OnScriptInput("inc_sub_1", () => match.adjustIncrementSeconds(-1, "inc_sub_1"));
Instance.OnScriptInput("inc_add_5", () => match.adjustIncrementSeconds(5, "inc_add_5"));
Instance.OnScriptInput("inc_sub_5", () => match.adjustIncrementSeconds(-5, "inc_sub_5"));

Instance.OnRoundStart(() => match.onRoundStart());

Instance.OnKnifeAttack((event) => {
    try {
        const weapon = event.weapon;
        const at = event.attackType;
        if (!weapon) return;

        const owner = weapon.GetOwner();
        if (!owner || !owner.IsValid()) return;

        if (at === CSWeaponAttackType.SECONDARY) {
            HandleCancelClick(owner);
            return;
        }
        if (at !== CSWeaponAttackType.PRIMARY) return;

        HandlePrimaryClickFromPawn(owner).catch((e) => DBG(`[EXCEPTION] click: ${e}`));
    } catch (e) {
        DBG(`[EXCEPTION] OnKnifeAttack handler: ${e}`);
    }
});

Instance.OnGunFire((event) => {
    try {
        const weapon = event.weapon;
        if (!weapon) return;

        const owner = weapon.GetOwner();
        if (!owner || !owner.IsValid()) return;

        HandlePrimaryClickFromPawn(owner).catch((e) => DBG(`[EXCEPTION] click(gun): ${e}`));
    } catch (e) {
        DBG(`[EXCEPTION] OnGunFire handler: ${e}`);
    }
});

Instance.OnBeforePlayerDamage(() => ({ abort: true }));
Instance.SetThink(() => RunThinkQueue());