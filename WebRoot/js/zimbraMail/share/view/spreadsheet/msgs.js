/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */
ZmMsg.SS = {
	func : {
		"sum"       : { help: "Computes the sum of given arguments" },
		"multiply"  : { help: "Multiplies the values of given arguments" },
		"modulo"    : { help: "Computes the remainder of division of arg1 to arg2" },
		"PI"        : { help: "Constant PI",
				helper: "=PI|" },
		"sin"       : { help: "Returns the sine of the argument" },
		"cos"       : { help: "Returns the cosine of the argument" },
		"tan"       : { help: "Returns the tangent of the argument" },
		"round"     : { help: "Rounds the argument to the nearest integer" },
		"ceil"      : { help: "Returns the smallest integer bigger than the argument" },
		"floor"     : { help: "Returns the biggest integer smaller than the argument" },
		"abs"       : { help: "Returns the absolute value of the argument" },
		"sqrt"      : { help: "Computes the square root of the argument" },
		"exp"       : { help: "Computes the exponential of the argument" },
		"log"       : { help: "Computes the natural logarithm of the argument" },
		"min"       : { help: "Returns the minimum of several values" },
		"max"       : { help: "Returns the maximum of several values" },
		"len"       : { help: "Returns the length of the given string argument" },
		"concat"    : { help: "Concatenates multiple strings" },
		"average"   : { help: "Computes the arithmetic average of several values" },
		"join"      : { help: "Joins multiple strings with a given separator",
				args: "join(separator, string1 [, string2...])",
				helper: "=join(\", \", |)" },
		"if"        : { help: "Returns one of 2 values depending on the condition",
				args: "if(condition, true_value, false_value)" }
	}
};
