/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */


UT.module("String", ["Util"]);

UT.test("AjxStringUtil.buildAttribute()",
    function() {
        var val = " any <value> &   with '*! special <<characters>> ";
        UT.expect(4);

        UT.strictEqual(
            AjxStringUtil.buildAttribute("attrName", "attrValue", true),
            " attrName='attrValue'",
            'buildAttribute() method should prepend a space if param prependSpace=true'
        );

        UT.strictEqual(
            AjxStringUtil.buildAttribute("attrName", "attrValue", false, true),
            'attrName="attrValue"',
            'buildAttribute() method should enclose the value in doubleQuotes if param doubleQuotes=true'
        );

        UT.strictEqual(
            AjxStringUtil.buildAttribute("attrName", val, false, false, true),
            "attrName=" + AjxStringUtil.quoteString(escape(val)),
            'buildAttribute() method should javascript escape if param jsEscape=true'
        );

        UT.strictEqual(
            AjxStringUtil.buildAttribute("attrName", val, false, false, false, true),
            "attrName=" + AjxStringUtil.quoteString(AjxStringUtil.htmlEncode(val)),
            'buildAttribute() method should html escape if param htmlEscape=true'
        );

    }
);

UT.test("AjxStringUtil.quoteString()",
    function() {
        var val = " any <value> &   with '*! special <<characters>> ";
        UT.expect(2);

        UT.strictEqual(
            AjxStringUtil.quoteString(val),
            "'" + val + "'",
            'quoteString() method should enclose the string in single quotes by default'
        );

        UT.strictEqual(
            AjxStringUtil.quoteString(val, true),
            '"' + val + '"',
            'quoteString() method should enclose the string in double quotes if doubleQuotes=true'
        );
    }
);