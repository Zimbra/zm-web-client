/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is: Zimbra Collaboration Suite Web Client
 *
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */
ZmMsg.SS = {
	func : {
		"sum"       : { help: ZmMsg.spreadSheet_func_sum },
		"multiply"  : { help: ZmMsg.spreadSheet_func_multiply },
		"modulo"    : { help: ZmMsg.spreadSheet_func_modulo },
		"PI"        : { help: ZmMsg.spreadSheet_func_PI, helper: "=PI|" },
		"sin"       : { help: ZmMsg.spreadSheet_func_sin },
		"cos"       : { help: ZmMsg.spreadSheet_func_cos },
		"tan"       : { help: ZmMsg.spreadSheet_func_tan },
		"round"     : { help: ZmMsg.spreadSheet_func_round },
		"ceil"      : { help: ZmMsg.spreadSheet_func_ceil },
		"floor"     : { help: ZmMsg.spreadSheet_func_floor },
		"abs"       : { help: ZmMsg.spreadSheet_func_abs },
		"sqrt"      : { help: ZmMsg.spreadSheet_func_sqrt },
		"exp"       : { help: ZmMsg.spreadSheet_func_exp },
		"log"       : { help: ZmMsg.spreadSheet_func_log },
		"min"       : { help: ZmMsg.spreadSheet_func_min },
		"max"       : { help: ZmMsg.spreadSheet_func_max },
		"len"       : { help: ZmMsg.spreadSheet_func_len },
		"concat"    : { help: ZmMsg.spreadSheet_func_concat },
		"average"   : { help: ZmMsg.spreadSheet_func_average },
		"join"      : { help: ZmMsg.spreadSheet_func_join, args: "join(separator, string1 [, string2...])", helper: "=join(\", \", |)" },
		"if"        : { help: ZmMsg.spreadSheet_func_if, args: "if(condition, true_value, false_value)" }
	}
};
