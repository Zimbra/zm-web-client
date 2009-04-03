/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
 *
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 *
 * ***** END LICENSE BLOCK *****
 */

/**
 * SpreadSheet formulae parser & interpreter.
 * @author Mihai Bazon, <mihai@zimbra.com>
 *
 * @param model - A ZmSpreadSheetModel to pick cell values from
 * @param formula - the formula string, without the preceding equal sign
 */
ZmSpreadSheetFormulae = function(model, formula) {
	this._model = model;
	if (formula) {
		this.compile(formula);
    }
}

// This defines parser tokens as regular expressions
// WARNING: the order of these tokens is important!
ZmSpreadSheetFormulae.TOKEN = {

        STRING     : {
                // This definition must look weird so that we mimic a
                // RegExp (essentially we need it to have the 'exec'
                // function... as always, because IE does not respect
                // the standards--in this case, the JS spec.)
                match   : { exec: function(txt) {
                        // strings are a little bit more complex to
                        // match with a RegExp because they can
                        // potentially contain \' or \" or even \\\"
                        if (!(/^([\x22\x27])/.test(txt))) {
                                return null;
                        }
                        var quote = RegExp.$1;
                        var esc = false;
                        var str = "";
                        for (var i = 1; i < txt.length; ++i) {
                                var c = txt.charAt(i);
                                if (!esc && c == "\\") {
                                        esc = true;
                                } else {
                                        if (c == quote && !esc) {
                                                return [ txt.substr(0, i + 1), str ];
                                        }
                                        if (esc) {
                                                switch (c) {
                                                    case "n": c = "\n"; break;
                                                    case "t": c = "\t"; break;
                                                }
                                        }
                                        str += c;
                                        esc = false;
                                }
                        }
                        throw "Unfinished string: " + txt;
                }},
                getVal  : function(a) { return a[1]; },
                isOpr   : true, // is this an operand?
                type    : "string"
        },

        NUMBER     : { match   : /^([0-9]*\.?[0-9]+)/,
                       getVal  : function(a) { return parseFloat(a[1]); },
                       isOpr   : true,
                       isNumber: true,
                       type    : "number"
        },

        CURRENCY   : { match   : /^\$\s*([0-9]*\.?[0-9]+)/,
                       getVal  : function(a) { return parseFloat(a[1]); },
                       isOpr   : true,
                       isNumber: true,
                       type    : "currency"
        },

        CELLRANGE  : { match   : /^([a-z]+[0-9]+:[a-z]+[0-9]+)/i,
                       getVal  : function(a) { return a[1].toUpperCase(); },
                       isOpr   : true,
                       type    : "cellrange"
        },

        CELL       : { match   : /^([a-z]+[0-9]+)/i,
                       getVal  : function(a) { return a[1].toUpperCase(); },
                       isOpr   : true,
                       type    : "cell"
        },

        OPERATOR   : { match   : /^(<=|>=|==|!=|lt|gt|eq|uc|lc|ne|&&|and|\|\||or|not|[-x*\/+%^.<>!])/,
                       getVal  : function(a) { return a[1]; },
                       isOpr   : false,
                       type    : "operator"
        },

        IDENTIFIER : { match   : /^([a-z_][a-z0-9_?]*)/i,
                       getVal  : function(a) { return a[1]; },
                       isOpr   : false,
                       type    : "identifier"
        },

        OPENPAREN  : { match   : new RegExp('^\\('),
                       getVal  : function(a) { return a[0]; },
                       isOpr   : false,
                       type    : "openparen"
        },

        CLOSEPAREN : { match   : /^\)/,
                       getVal  : function(a) { return a[0]; },
                       isOpr   : false,
                       type    : "closeparen"
        },

        COMMA      : { match   : new RegExp("^,"),
                       getVal  : function(a) { return a[0]; },
                       isOpr   : false,
                       type    : "comma"
        }

};

ZmSpreadSheetFormulae.parseFloat = function(n, defVal) {
        if (typeof n == "boolean") {
                return n ? 1 : 0;
    }
    n = parseFloat(n);
        if (isNaN(n)) {
                n = defVal ? defVal : 0;
    }
    return n;
};

// describe some operator properties that are needed in order to compute
// formulas.  Associativity is (1) for right-associative, (2) for
// left-associative and (3) for associative.
ZmSpreadSheetFormulae.OPERATORS = {
        '+'   : { priority: 10, assoc: 3, n_args: 2 },
        '-'   : { priority: 10, assoc: 2, n_args: 2 }, // the special case "-5" is treated separately
        '*'   : { priority: 20, assoc: 3, n_args: 2 },
        '/'   : { priority: 20, assoc: 2, n_args: 2 },
        '%'   : { priority: 30, assoc: 2, n_args: 2 },
        '^'   : { priority: 30, assoc: 2, n_args: 2 },
        '.'   : { priority:  5, assoc: 2, n_args: 2 }, // String concatenation (Perl)
        'lc'  : { priority:  5, assoc: 1, n_args: 1 }, // String to lower case (Perl)
        'uc'  : { priority:  5, assoc: 1, n_args: 1 }, // String to UPPER case (Perl)
        'x'   : { priority: 35, assoc: 2, n_args: 2 }, // String multiplication (Perl)

        // conditional operators
        '<'   : { priority:  3, assoc: 2, n_args: 2 },
        '>'   : { priority:  3, assoc: 2, n_args: 2 },
        '<='  : { priority:  3, assoc: 2, n_args: 2 },
        '>='  : { priority:  3, assoc: 2, n_args: 2 },
        '=='  : { priority:  3, assoc: 2, n_args: 2 },
        '!='  : { priority:  3, assoc: 2, n_args: 2 },
        'lt'  : { priority:  3, assoc: 2, n_args: 2 },
        'gt'  : { priority:  3, assoc: 2, n_args: 2 },
        'eq'  : { priority:  3, assoc: 2, n_args: 2 },
        'ne'  : { priority:  3, assoc: 2, n_args: 2 },
        '&&'  : { priority:  2, assoc: 2, n_args: 2 },
        'and' : { priority:  2, assoc: 2, n_args: 2 },
        '||'  : { priority:  2, assoc: 2, n_args: 2 },
        'or'  : { priority:  2, assoc: 2, n_args: 2 },

        // the following may not work
        '!'   : { priority:  4, assoc: 1, n_args: 1 },
        'not' : { priority:  4, assoc: 1, n_args: 1 }

        // we're getting tight on priorities.. :)  perhaps I should multiply them all by 10?
};

ZmSpreadSheetFormulae.FUNCTIONS = {};

ZmSpreadSheetFormulae.getFunc = function(name) {
        return ZmSpreadSheetFormulae.FUNCTIONS[name.toLowerCase()];
};

ZmSpreadSheetFormulae.HELP = {};

ZmSpreadSheetFormulae.getHelp = function(funcname) {
        var help = ZmSpreadSheetFormulae.HELP[funcname];
        var txt = null;
        if (help) {
                txt = help.help;
                if (help.args) {
                        txt += "<br />" + help.args;
                }
        }
        return txt;
};

// DEF stands for "defineFunction".  Intuitive, right? :-p
//
// Call this to define a new function that will be supported by the
// ZmSpreadSheetFormulae parser.  n_args is the number of arguments accepted by
// the function.  If you pass null, the function will accept any number of
// arguments (even none).  If n_args < 0, then the function will require at
// least abs(n_args) arguments, but should process more if present.  If n_args
// > 0 then the function will receive exactly that many arguments.
//
// n_args is basically used for syntax validation.
//
// name is the function name, i.e. "sum".  And callback is a reference to a
// function that should process the given arguments and return some value.
//
// AS you can see in the default functions below, the callback need not bother
// to know how to fetch cell values or wether some (or all) of the arguments
// are CELL or CELLRANGE identifiers.  This operation will be left on the
// framework.  IF any function was passed a CELL(RANGE) identifier, this will
// be converted to respective cells' values before the function was called.
//
// Operators are functions as well, as we all know from the good old Lisp, so
// they are defined through the same means.
ZmSpreadSheetFormulae.DEF = function(name, n_args, callback, help) {
        if (name instanceof Array) {
                // let's make it easy to define aliases, shall we
                var alias = name[0];
                var i;
                ZmSpreadSheetFormulae.DEF(alias, n_args, callback, help);
                if (help && name.length > 1) {
                        var tmp = { alias: alias };
                        for (i in help) {
                                tmp[i] = help[i];
                        }
                        help = tmp;
                }
                for (i = 1; i < name.length; ++i) {
                        ZmSpreadSheetFormulae.DEF(name[i], n_args, callback, help);
                }
        } else {
                var funcdef = { name   : name,
                                n_args : n_args,
                                func   : callback };
                ZmSpreadSheetFormulae.FUNCTIONS[name.toLowerCase()] = funcdef;
                if (help) {
                        ZmSpreadSheetFormulae.HELP[name] = help;
                }
        }
};

///------------------- BEGIN FUNCTION DEFINITIONS -------------------
{
        // Math functions
        ZmSpreadSheetFormulae.DEF([ "sum", "+" ], -1, function() {
                var ret = 0;
                for (var i = arguments.length; --i >= 0;)
                        ret += ZmSpreadSheetFormulae.parseFloat(arguments[i]);
                return ret;
        }, ZmMsg.SS.func.sum);

        ZmSpreadSheetFormulae.DEF([ "multiply", "*" ], -1, function() {
                var ret = 1;
                for (var i = arguments.length; --i >= 0;)
                        ret *= ZmSpreadSheetFormulae.parseFloat(arguments[i], 1);
                return ret;
        }, ZmMsg.SS.func.multiply);

        ZmSpreadSheetFormulae.DEF([ "modulo", "%" ], 2, function(a, b) {
                return ZmSpreadSheetFormulae.parseFloat(a) % ZmSpreadSheetFormulae.parseFloat(b);
        }, ZmMsg.SS.func.modulo);

        ZmSpreadSheetFormulae.DEF([ "average", "avg" ], -1, function() {
                var cnt = arguments.length;
                var sum = 0;
                for (var i = cnt; --i >= 0;) {
                        var val = arguments[i];
                        if (!/\S/.test(val))
                                val = NaN;
                        if (!isNaN(val))
                                val = ZmSpreadSheetFormulae.parseFloat(val, NaN);
                        if (!isNaN(val))
                                sum += val;
                        else
                                --cnt;
                }
                return sum/cnt;
        }, ZmMsg.SS.func.average);

        ZmSpreadSheetFormulae.DEF("PI"    , 0, function()  { return Math.PI; }, ZmMsg.SS.func.PI);
        ZmSpreadSheetFormulae.DEF("sin"   , 1, function(a) { return Math.sin(a); }, ZmMsg.SS.func.sin);
        ZmSpreadSheetFormulae.DEF("cos"   , 1, function(a) { return Math.cos(a); }, ZmMsg.SS.func.cos);
        ZmSpreadSheetFormulae.DEF("tan"   , 1, function(a) { return Math.tan(a); }, ZmMsg.SS.func.tan);

        ZmSpreadSheetFormulae.DEF("round" , 1, function(a) { return Math.round(a); }, ZmMsg.SS.func.round);
        ZmSpreadSheetFormulae.DEF("ceil"  , 1, function(a) { return Math.ceil(a); }, ZmMsg.SS.func.ceil);
        ZmSpreadSheetFormulae.DEF("floor" , 1, function(a) { return Math.floor(a); }, ZmMsg.SS.func.floor);
        ZmSpreadSheetFormulae.DEF("abs"   , 1, function(a) { return Math.abs(a); }, ZmMsg.SS.func.abs);

        ZmSpreadSheetFormulae.DEF("sqrt"  , 1, function(a) { return Math.sqrt(a); }, ZmMsg.SS.func.sqrt);
        ZmSpreadSheetFormulae.DEF("exp"   , 1, function(a) { return Math.exp(a); }, ZmMsg.SS.func.exp);
        ZmSpreadSheetFormulae.DEF("log"   , 1, function(a) { return Math.log(a); }, ZmMsg.SS.func.log);

        // The default Math.min() and Math.max() implementations only take 2
        // arguments.  How Pascal-like!  :-\  Therefore we implement our own.

        ZmSpreadSheetFormulae.DEF("min", -1, function() {
                var min = arguments[0];
                for (var i = 1; i < arguments.length; ++i)
                        if (min > arguments[i])
                                min = arguments[i];
                return min;
        }, ZmMsg.SS.func.min);

        ZmSpreadSheetFormulae.DEF("max", -1, function() {
                var max = arguments[0];
                for (var i = 1; i < arguments.length; ++i)
                        if (max < arguments[i])
                                max = arguments[i];
                return max;
        }, ZmMsg.SS.func.max);


        // String functions
        ZmSpreadSheetFormulae.DEF("len", 1, function(str) {
                return str.toString().length;
        }, ZmMsg.SS.func.len);

        ZmSpreadSheetFormulae.DEF([ "concat", "." ], -1, function() {
                var ret = [ arguments[0] ];
                for (var i = 1; i < arguments.length; ++i) {
                        if (arguments[i] != "")
                                ret.push(arguments[i]);
                }
                return ret.join("");
        }, ZmMsg.SS.func.concat);

        ZmSpreadSheetFormulae.DEF("join", -2, function(sep) {
                var ret = [ arguments[1] ];
                for (var i = 2; i < arguments.length; ++i)
                        if (arguments[i] != "")
                                ret.push(arguments[i]);
                return ret.join(sep);
        }, ZmMsg.SS.func.join);

        ZmSpreadSheetFormulae.DEF("x", 2, function(str, times) {
                var ret = "";
                while (times-- > 0)
                        ret += str;
                return ret;
        });


        // conditionals
        ZmSpreadSheetFormulae.DEF("<", 2, function(a, b) {
                return ZmSpreadSheetFormulae.parseFloat(a) < ZmSpreadSheetFormulae.parseFloat(b);
        });
        ZmSpreadSheetFormulae.DEF(">", 2, function(a, b) {
                return ZmSpreadSheetFormulae.parseFloat(a) > ZmSpreadSheetFormulae.parseFloat(b);
        });
        ZmSpreadSheetFormulae.DEF("<=", 2, function(a, b) {
                return ZmSpreadSheetFormulae.parseFloat(a) <= ZmSpreadSheetFormulae.parseFloat(b);
        });
        ZmSpreadSheetFormulae.DEF(">=", 2, function(a, b) {
                return ZmSpreadSheetFormulae.parseFloat(a) >= ZmSpreadSheetFormulae.parseFloat(b);
        });
        ZmSpreadSheetFormulae.DEF("==", 2, function(a, b) {
                return a == b;
        });
        ZmSpreadSheetFormulae.DEF("!=", 2, function(a, b) {
                return a != b;
        });
        ZmSpreadSheetFormulae.DEF([ "&&", "and" ], 2, function(a, b) {
                return a && b;
        });
        ZmSpreadSheetFormulae.DEF([ "||", "or" ], 2, function(a, b) {
                return a || b;
        });
        ZmSpreadSheetFormulae.DEF([ "!", "not" ], 1, function(a) {
                return !a;
        });
        ZmSpreadSheetFormulae.DEF("lt", 2, function(a, b) {
                return a.toString() < b.toString();
        });
        ZmSpreadSheetFormulae.DEF("gt", 2, function(a, b) {
                return a.toString() > b.toString();
        });
        ZmSpreadSheetFormulae.DEF("eq", 2, function(a, b) {
                return a.toString() == b.toString();
        });
        ZmSpreadSheetFormulae.DEF("ne", 2, function(a, b) {
                return a.toString() != b.toString();
        });
        ZmSpreadSheetFormulae.DEF("lc", 1, function(a) {
                return a.toString().toLowerCase();
        });
        ZmSpreadSheetFormulae.DEF("uc", 1, function(a) {
                return a.toString().toUpperCase();
        });

        // Note a major downside with our "if" implementation: since this is a
        // plain function, it means that both exprTrue and exprFalse are
        // evaluated, regardless of the condition state.  Luckily, code written
        // in our simple spread-sheet language can't have side-effects (or can
        // it...?)
        ZmSpreadSheetFormulae.DEF("if", 3, function(cond, exprTrue, exprFalse) {
                return cond ? exprTrue : exprFalse;
        });


        // easter egg
        ZmSpreadSheetFormulae.DEF("WHO_are_YOU?", 0, function() {
                return "http://www.zimbra.com/";
        });
}

ZmSpreadSheetFormulae.DEF("-", 2, function(a, b) {
        return ZmSpreadSheetFormulae.parseFloat(a) -
                ZmSpreadSheetFormulae.parseFloat(b);
});

ZmSpreadSheetFormulae.DEF("/", 2, function(a, b) {
        return ZmSpreadSheetFormulae.parseFloat(a) /
                ZmSpreadSheetFormulae.parseFloat(b);
});

ZmSpreadSheetFormulae.DEF("^", 2, function(a, b) {
        return Math.pow(a, b);
});

///------------------- END FUNCTION DEFINITIONS -------------------

ZmSpreadSheetFormulae.prototype.depends = function(ident) {
        return ident != null
                ? this._deps[ident]
                : this._deps;
};

ZmSpreadSheetFormulae.prototype.dependsArray = function() {
        return this._depsArray;
};

ZmSpreadSheetFormulae.prototype.callFunction = function(func, args) {
        var f = ZmSpreadSheetFormulae.getFunc(func);
        if (!f)
                throw "No such function: " + func;
        return f.func.apply(this, args);
};

ZmSpreadSheetFormulae.prototype._analyzeRange = function(tok) {
        var id = tok.val;

        var a = id.split(/:/);
        // now a[0] is the supposedly start cell and a[1] the end cell
        var c1 = ZmSpreadSheetModel.identifyCell(a[0]);
        var c2 = ZmSpreadSheetModel.identifyCell(a[1]);

        // note that we do need to check that (maybe it's a reverse range)
        var startRow = tok.startRow = Math.min(c1.row, c2.row);
        var startCol = tok.startCol = Math.min(c1.col, c2.col);
        var endRow   = tok.endRow   = Math.max(c1.row, c2.row);
        var endCol   = tok.endCol   = Math.max(c1.col, c2.col);

        // quick access to these is useful in update()
        tok.startCell = this._model.data[startRow][startCol];
        tok.endCell = this._model.data[endRow][endCol];

        var cells = tok.cells = [];

        for (var i = startRow; i <= endRow; ++i) {
                for (var j = startCol; j <= endCol; ++j) {
                        var c = this._model.data[i][j];
                        cells.push(c);
                        var name = ZmSpreadSheetModel.getCellName(i + 1, j + 1);
                        if (!this._deps[name]) {
                                this._deps[name] = c;
                                this._depsArray.push(c);
                        }
                }
        }
};

// This should be called for each formula after the geometry of the model
// rows/cols has changed.  Because we store direct references to cells rather
// than cell ID-s, note that it's very easy to update the formula. :-)
ZmSpreadSheetFormulae.prototype.update = function() {
        var formula       = this._formula,
                a         = this._cellTokens,
                TYPE      = ZmSpreadSheetFormulae.TOKEN;
        for (var i = a.length; --i >= 0;) {
                var t = a[i];
                // t is a cell token or a range token
                var name = null;
                if (t.type === TYPE.CELL) {
                        name = t.cell.getName();
                }
                if (t.type === TYPE.CELLRANGE) {
                        name = t.startCell.getName() + ":" + t.endCell.getName();
                }
                if (name && t.val != name) {
                        formula = [ formula.substr(0, t.strPos),
                                    name,
                                    formula.substr(t.strPos + t.strLen)
                        ].join("");
                }
        }
        if (formula != this._formula) {
                this.compile(formula);
                return formula;
        }
};

// somewhat similar but not the same as the above function, this one will
// return a new (string) formula where all cell or cellrange tokens will be
// shifted by the given number of rows and cols.
ZmSpreadSheetFormulae.prototype.shift = function(rows, cols) {
        var formula       = this._formula,
                a         = this._cellTokens,
                TYPE      = ZmSpreadSheetFormulae.TOKEN;
        for (var i = a.length; --i >= 0;) {
                var t = a[i];
                // t is a cell token or a range token
                var name = null;
                if (t.type === TYPE.CELL) {
                        name = ZmSpreadSheetModel.shiftCell(t.val, rows, cols);
                }
                if (t.type === TYPE.CELLRANGE) {
                        name = ZmSpreadSheetModel.shiftRange(t.val, rows, cols);
                }
                if (name && t.val != name) {
                        formula = [ formula.substr(0, t.strPos),
                                    name,
                                    formula.substr(t.strPos + t.strLen)
                        ].join("");
                }
        }
        return formula;
};

ZmSpreadSheetFormulae.prototype.getFormula = function() {
        return this._formula;
};

// Given a formula, returns an array of valid tokens if parsing was successful,
// or throws an exception otherwise.  Note this doesn't mean syntax checking.
ZmSpreadSheetFormulae.parseTokens = function(formula, nothrow) {
        var TYPE = ZmSpreadSheetFormulae.TOKEN; // we use this quite a lot

        var tokens = [];
        var pos = 0;

        // helper function.  Pass an array and it returns the last element.
        function peek(a) {
                return a[a.length - 1];
        };

        while (formula.length > 0) {
                // strip whitespace if any and update pos
                var a = /^\s+/.exec(formula);
                if (a) {
                        var len = a[0].length;
                        pos += len;
                        formula = formula.substr(len);
                }
                var found = false;
                for (var i in TYPE) {
                        var t = TYPE[i];
                        var a = t.match.exec(formula);
                        if (a) {

//                              if (tokens.length > 0) {
//                                      // if it looks like we have 2
//                                      // consecutive CELL or CELLRANGE
//                                      // tokens, let's try something else
//                                      if ( (t === TYPE.CELL      && peek(tokens).type === TYPE.CELL) ||
//                                           (t === TYPE.CELLRANGE && peek(tokens).type === TYPE.CELLRANGE))
//                                              continue;
//                              }

                                var val = t.getVal(a);
                                var len = a[0].length;
                                formula = formula.substr(len);
                                // alert("Found " + t.type + ": " + val + "\nRemaining: " + formula);
                                var tok = { type   : t,
                                            val    : val,
                                            isOpr  : t.isOpr,
                                            strPos : pos,
                                            strLen : len };
                                pos += len;

                                if (t === TYPE.OPERATOR) {
                                        var opdef = ZmSpreadSheetFormulae.OPERATORS[val];
                                        tok.priority = opdef.priority;
                                        tok.assoc = opdef.assoc;
                                        tok.n_args = opdef.n_args;
                                }

                                if (t === TYPE.IDENTIFIER) {
                                        // FIXME [1]: currently the only identifiers we allow are function calls
                                        var func = ZmSpreadSheetFormulae.getFunc(val);
                                        if (!func && !nothrow)
                                                throw "No such function: \"" + val + "\"";
                                        tok.priority = 100;
                                        if (func && func.n_args == 0) {
                                                tok.isOpr = true; // assumed to be a constant
                                                tok.val = func.func();
                                        }
                                }

                                tokens.push(tok);
                                found = true;
                                break;
                        }
                }
                if (!found) {
                        if (!nothrow)
                                throw "Parse error at: " + formula;
                        else {
                                // silently try to move forward
                                formula = formula.substr(1);
                                ++pos;
                        }
                }
        }

        return tokens;
};

ZmSpreadSheetFormulae.prototype.getTokens = function() {
        return this._tokens;
};

// This function takes a string formulae and compiles it to an internal parse
// tree which is hopefully suitable for fast execution.  It throws a plain
// string exception upon parse errors.  These errors must be caught and
// displayed in an user friendly fashion.
ZmSpreadSheetFormulae.prototype.compile = function(formula) {
        // we modify the formula later, let's make sure we don't store a
        // reference to it but a copy of it
        this._formula = new String(formula);

        // initialize the dependencies table
        this._deps = {};
        this._depsArray = [];
        this._cellTokens = [];
        this._running = false;

        var TYPE = ZmSpreadSheetFormulae.TOKEN; // we use this quite a lot

        // helper function.  Pass an array and it returns the last element.
        function peek(a) {
                return a[a.length - 1];
        };

        // Step 1.  Parse all tokens from the given formula
        var tokens = this._tokens = ZmSpreadSheetFormulae.parseTokens(formula);


        // Step 2.  Basic syntax checking and throw appropriate errors.
        var last = null;
        var parens = 0;
        var wantoperand = false;
        for (var i = 0; i < tokens.length; ++i) {
                var t = tokens[i];
                var next = tokens[i+1];
                if (t.type === TYPE.OPERATOR && !next)
                        throw "Misplaced operator";
                if (last) {
//                      if (t.type === TYPE.OPERATOR &&
//                          last.type === TYPE.OPERATOR)
//                              throw "Consecutive operators not allowed";
                        if (t.type === TYPE.COMMA &&
                            ( last.type === TYPE.COMMA ||
                              last.type === TYPE.OPENPAREN ))
                                throw "Misplaced comma";
                }
                if (t.type === TYPE.CELL) {
                        t.val = t.val.toUpperCase();
                        var pos = ZmSpreadSheetModel.identifyCell(t.val);
                        this._model.checkBounds(pos.row, pos.col);
                        t.cell = this._deps[t.val];
                        if (!t.cell) {
                                t.cell = this._deps[t.val] = this._model.data[pos.row][pos.col];
                                this._depsArray.push(t.cell);
                        }
                        this._cellTokens.push(t);
                }
                if (t.type === TYPE.CELLRANGE) {
                        this._analyzeRange(t);
                        this._cellTokens.push(t);
                }
                if (t.type === TYPE.OPENPAREN) {
                        parens++;
                        if (last && last.isOpr)
                                throw "Paren after operand";
                }
                if (t.type === TYPE.CLOSEPAREN)
                        parens--;
                if (t.type === TYPE.OPERATOR &&
                    t.val == "-" &&
                    (!last || !last.isOpr) && next.type.isNumber) {
                        // this is kind of tricky..  we have a number following
                        // a minus sign that doesn't seem to act as an
                        // operator--thus we assume it's a negative number:
                        next.val = -next.val;
                        // remove the minus
                        tokens.splice(i, 1);
                        t = last; // thus to assign last correctly
                        --i; // because there's a ++i at the end of the loop
                }
                last = t;
        }
        if (parens != 0)
                throw "Mismatched parentheses";


        // Step 3.  Build a "reverse-polish-notation" stack.
        var stack = [];
        var output = [];        // this will hold the compiled expression stack
                                // and will later be assigned to this._stack
        //---
        // THOROUGH TESTING RECOMMENDED!
        //
        // This algorithm (by E. W. Dijkstra) is described here:
        //
        //   http://en.wikipedia.org/wiki/Reverse_Polish_Notation
        //
        // There is a small variation in our code, in that that I find it
        // necessary to remember how many arguments were passed to some
        // function (so that we can support functions that take an arbitrary
        // number of arguments, i.e. "sum").
        //
        // It seems to work quite well but I do recommend strong testing of
        // this code--that is, evaluation of expressions.
        //---
        for (var i = 0; i < tokens.length; ++i) {
                var t = tokens[i];
                if (t.isOpr) {

                        output.push(t);

                } else if (t.type === TYPE.IDENTIFIER) { // FIXME [1]: idents are functions for now

                        t.n_args = -1; // we keep the number of arguments here,
                                       // will be incremented each time a new
                                       // argument is found
                        stack.push(t);
                        if (ZmSpreadSheetFormulae.getFunc(t.val).n_args != 0) {
                                // the very next token must be OPENPAREN
                                if (!tokens[i + 1] || tokens[i + 1].type !== TYPE.OPENPAREN)
                                        throw "Function \"" + t.val + "\" expects arguments.";
                        }

                } else if (t.type === TYPE.COMMA) {

                        while (stack.length > 0 && peek(stack).type !== TYPE.OPENPAREN)
                                output.push(stack.pop());
                        if (stack.length == 0 ||
                            !tokens[i + 1]
                            || tokens[i + 1].type === TYPE.CLOSEPAREN) {
                                // misplaced comma or parens
                                throw "Syntax error: misplaced comma or parens";
                        }
                        // at this stage, we have an OPENPAREN at the stack
                        // top; the very previous token should be a function
                        // identifier.
                        var func = stack[stack.length - 2];
                        if (!func || func.type !== TYPE.IDENTIFIER)
                                throw "Syntax error: expecting a function identifier";
                        // let it know that it has one more argument
                        ++func.n_args;

                } else if (t.type === TYPE.OPERATOR) {

                        var o2;
                        while (((o2 = peek(stack)) != null) && o2.type === TYPE.OPERATOR &&
                               ((t.assoc >= 2 /* (left-)associative */ && t.priority <= o2.priority) ||
                                (t.assoc == 1 /* right-associative */ && t.priority > o2.priority))) {
                                output.push(stack.pop());
                        }
                        stack.push(t);

                } else if (t.type === TYPE.OPENPAREN) {

                        // this should speak for itself...
                        var func = peek(stack);
                        var next = tokens[i + 1];
                        if (func && func.type === TYPE.IDENTIFIER &&
                            next && next.type !== TYPE.CLOSEPAREN)
                                ++func.n_args;
                        stack.push(t);

                } else if (t.type === TYPE.CLOSEPAREN) {

                        while (stack.length > 0 && peek(stack).type !== TYPE.OPENPAREN)
                                output.push(stack.pop());
                        if (stack.length == 0)
                                // probably misplaced parens
                                throw "Syntax error: misplaced parens";
                        else
                                // left paren is dropped
                                stack.pop();
                        if (stack.length > 0 && peek(stack).type === TYPE.IDENTIFIER) {
                                // FIXME [1]: idents are functions for now
                                var func = stack.pop();
                                func.n_args++;
                                output.push(func);
                                // check number of arguments
                                var expected_args = ZmSpreadSheetFormulae.getFunc(func.val).n_args;
                                // console.log("function: %s, passed args: %d, expected: %d", func.val, func.n_args, expected_args);
                                if (expected_args != null) {
                                        if (expected_args >= 0 && func.n_args != expected_args)
                                                throw "Function " + func.val + " expects exactly " + expected_args + " arguments.";
                                        if (expected_args < 0 && func.n_args + expected_args < 0)
                                                throw "Function " + func.val + " expects at least " + (-expected_args) + " arguments.";
                                }
                        }

                }
        }
        while (stack.length > 0) {
                var t = stack.pop();
                if ((t.type !== TYPE.OPERATOR && t.type !== TYPE.IDENTIFIER) ||
                    (t.type === TYPE.IDENTIFIER && ZmSpreadSheetFormulae.getFunc(t.val).n_args > 0))
                        throw "Expecting only operators or constants at ZmSpreadSheetFormulae.compile";
                output.push(t);
        }

        this._stack = output;
};

// Now look how plain simple is the evaluation code..
// FIXME: this should be possible to optimize by walking the stack in
// left-to-right with an iterative algorithm rather than a recursive one.
ZmSpreadSheetFormulae.prototype.eval = function() {

        // let's make sure we avoid infinite recursion, though it shouldn't be
        // allowed by design (all dependencies are already computed when an
        // expression is evaluated).
        if (this._running)
                return "";

        this._running = true;

        var
                TYPE  = ZmSpreadSheetFormulae.TOKEN,
                stack = this._stack,
                index = stack.length - 1,
                self  = this;

        var autoType = {};
        var decimals = null;

        function encountered(cell) {
                autoType[cell.getType()] = true;
                if (cell.getDecimals() != null) {
                        if (decimals == null)
                                decimals = 0;
                        if (decimals < cell.getDecimals())
                                decimals = cell.getDecimals();
                }
                return cell.getValue();
        };

        function doit() {
                var tok = stack[index--];
                if (tok.type === TYPE.CELL)
                        return encountered(tok.cell);
                if (tok.type === TYPE.CELLRANGE) {
                        var a = new Array(tok.cells.length);
                        for (var i = a.length; --i >= 0;)
                                a[i] = encountered(tok.cells[i]);
                        return a;
                }
                if (tok.isOpr)
                        return tok.val;
		var args = [], n_args = tok.n_args;
		while (n_args-- > 0) {
			var nextval = doit();
			// we have to do this trick since a CELLRANCE is
			// counted as a single argument
			if (nextval instanceof Array)
				args.unshift.apply(args, nextval);
			else
				args.unshift(nextval);
		}
		return self.callFunction(tok.val, args);
	};

	var ret = doit();

	if (autoType.percentage && !autoType.currency)
		autoType = "percentage";
	else if (autoType.currency)
		autoType = "currency";
	else
		autoType = null;
	this.autoType = autoType;
	this.decimals = decimals;

	this._running = false;
	return ret;
};

ZmSpreadSheetFormulae.prototype.toString = function() {
	return this._formula;
};
