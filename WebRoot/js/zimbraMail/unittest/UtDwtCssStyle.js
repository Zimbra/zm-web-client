/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

UT.module("DwtCssStyle");

UtDwtCssStyle = function() {};

UtDwtCssStyle.testAsPixelCount = function() {
    ZmUnitTestUtil.log("starting DwtCssStyle.asPixelCount test");
    UT.expect(27 + AjxEnv.supportsCSS3RemUnits);

    // test passing a given value through DwtCssStyle.asPixelCount
    function test(actual, expected) {
        var msg =
            AjxMessageFormat.format('test {0} against known reference value',
                                    actual);

        UT.strictEqual(DwtCssStyle.asPixelCount(actual), expected, actual);
    }

    // verify that our calcuation agrees with the DOM
    function verify(value) {
        var msg = AjxMessageFormat.format('verify calculation for {0}', value);

        // this one varies depending on the browser text zoom
        div = document.createElement('div');
        div.style.width = value;
        document.body.appendChild(div);
        var expected = Dwt.getSize(div).x;
        document.body.removeChild(div);

        var actual = Math.floor(DwtCssStyle.asPixelCount(value));

        UT.strictEqual(actual, expected, msg);
    }

    // verify that we fail loudly and noisily
    function raises(value) {
        var msg = AjxMessageFormat.format('ensure that {0} raises', value);

        UT.raises(function() { DwtCssStyle.asPixelCount(value); }, Error, msg);
    }

    // first, test the parser
    test(42, 42);
    test('37', 37);
    test('-5px', -5);
    test('-3.14', -3.14);
    test('-3.14px', -3.14);

    // now, test and verify the units we support
    test('1337px', 1337);
    verify('1337px');

    test('150pt', 200);
    verify('150pt');

    test('8.75pc', 140);
    verify('8.75pc');

    test('1in', 96);
    verify('1in');

    test('37in', 3552);
    verify('37in');

    test('2.54cm', 96);
    verify('2.54cm');

    test('254mm', 960);
    verify('254mm');

    // disabled due to rounding issues
    if (false) {
        test('2.54mm', 9.6);
        verify('2.54mm');
    }

    test('1016mm', 3840);
    verify('1016mm');

    // this one varies depending on the browser text zoom and doesn't
    // work on all browsers
    if (AjxEnv.supportsCSS3RemUnits)
        verify('1rem');

    // test failure scenarios
    raises('oi');
    raises('0cake');
    raises('100%');
    raises('1ch');
    raises('1em');
    raises('1ex');
};

UT.test("DwtCssStyle.testConversions", UtDwtCssStyle.testAsPixelCount);
