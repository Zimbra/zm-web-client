/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2011, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

UT.module("YouTube", ["Zimlet"]);

// Validate possible YouTube links
UT.test("YouTube link http://www.youtube.com/watch?v=ID", {

	teardown: function() {

	}},

	function() {
		UT.expect(1);
		var youTubeZimlet = new Com_Zimbra_Url();
		var url = "http://www.youtube.com/watch?v=WhwbxEfy7fg";
		var value = youTubeZimlet.getYouTubeId(url);
		UT.equal(value, "WhwbxEfy7fg", "YouTube ID is " + value);
	}
);

UT.test("YouTube link http://www.youtube.com/v/ID", {

	teardown: function() {

	}},

	function() {
		UT.expect(1);
		var youTubeZimlet = new Com_Zimbra_Url();
		var url = "http://www.youtube.com/v/WhwbxEfy7fg";
		var value = youTubeZimlet.getYouTubeId(url);
		UT.equal(value, "WhwbxEfy7fg", "YouTube ID is " + value);
	}
);

UT.test("YouTube link http://www.youtube.com/watch?feature=player_embedded&v=ID", {
	teardown: function() {

	}},

	function() {
		UT.expect(1);
		var youTubeZimlet = new Com_Zimbra_Url();
		var url = "http://www.youtube.com/watch?feature=player_embedded&v=tVwkUDRVmsA";
		var value = youTubeZimlet.getYouTubeId(url);
		UT.equal(value, "tVwkUDRVmsA", "YouTube ID is " + value);
	}
);

UT.test("YouTu.be link", {
	teardown: function() {

	}},

	function() {
		UT.expect(1);
		var youTubeZimlet = new Com_Zimbra_Url();
		var url = "http://youtu.be/WhwbxEfy7fg";
		var value = youTubeZimlet.getYouTubeId(url);
		UT.equal(value, "WhwbxEfy7fg", "YouTube ID is " + value);
	}
);

//Validate parsing of links from mail message
UT.test("YouTube Plain Text",  {
	teardown: function() {

	}},

	function() {
		UT.expect(4);
		var youTubeZimlet = new Com_Zimbra_Url();
		var txt = "Check out these videos on YouTube: " +
				   "B in the bath: http://www.youtube.com/watch?v=2vyEnQoG6q8 " +
				   "B doing the naked dance: http://www.youtube.com/watch?v=7-XYUlfBoFw " +
				   "B playing on the gymini: http://www.youtube.com/watch?v=TRRPNB4bgvM";
		var expected = ["2vyEnQoG6q8", "7-XYUlfBoFw", "TRRPNB4bgvM"];
		var hash = youTubeZimlet._getAllYouTubeLinks(txt);
		UT.notEqual(hash, null, "hash of links should not be null");
		if (hash) {
			var count = 0;
			for (var id in hash) {
				UT.equal(id, expected[count], "Found link with ID = " +id);
				count++;
			}
		}

	}
);

UT.test("YouTube HTML Text", {
	teardown: function() {

	}},

	function() {
		UT.expect(4);
		var txt = '------=_Part_37824_2551618.1163013234262' +
				   'Content-Type: text/html; charset=ISO-8859-1' +
				   'Content-Transfer-Encoding: 7bit' +
				   'Content-Disposition: inline' +
'You rock!&nbsp; Now, when you get your blog you can just embed them there.<br><br><div><span class="gmail_quote">On 11/8/06, <b class="gmail_sendername">Jessica </b> &lt;<a href="mailto:Jessica_@domain.com">Jessica_@domain.com ' +
'</a>&gt; wrote:</span><blockquote class="gmail_quote" style="border-left: 1px solid rgb(204, 204, 204); margin: 0pt 0pt 0pt 0.8ex; padding-left: 1ex;"> ' +
'<div link="blue" vlink="#FF8000" lang="EN-US"> ' +
'<div> ' +
'<p><font face="Arial" size="2"><span style="font-size: 10pt; font-family: Arial;">We\'ve loaded a couple of short videos on YouTube for ' +
'your viewing pleasure. I\'m new to YouTube, but I believe that you just ' +
'need to click on the URL and you should be able to see the video (without ' +
'logging in or creating an account). I\'m not sure though, so let me know ' +
'how this work for you.</span></font></p> ' +
'<p><font face="Arial" size="2"><span style="font-size: 10pt; font-family: Arial;">&nbsp;</span></font></p> ' +
'<p><font face="Arial" size="2"><span style="font-size: 10pt; font-family: Arial;">Bennett in the bath: <a href="http://www.youtube.com/watch?v=2vyEnQoG6q8" target="_blank" onclick="return top.js.OpenExtLink(window,event,this)"> ' +
'http://www.youtube.com/watch?v=2vyEnQoG6q8</a></span></font></p> ' +
'<p><font face="Arial" size="2"><span style="font-size: 10pt; font-family: Arial;">Bennett doing the naked dance: <a href="http://www.youtube.com/watch?v=7-XYUlfBoFw" target="_blank" onclick="return top.js.OpenExtLink(window,event,this)"> ' +
'http://www.youtube.com/watch?v=7-XYUlfBoFw</a></span></font></p> ' +
'<p><font face="Arial" size="2"><span style="font-size: 10pt; font-family: Arial;">Bennett playing on the gymini: <a href="http://www.youtube.com/watch?v=TRRPNB4bgvM" target="_blank" onclick="return top.js.OpenExtLink(window,event,this)"> ' +
'http://www.youtube.com/watch?v=TRRPNB4bgvM</a></span></font></p> ' +
'<p><font face="Arial" size="2"><span style="font-size: 10pt; font-family: Arial;">&nbsp;</span></font></p> ' +
'<p><font face="Arial" size="2"><span style="font-size: 10pt; font-family: Arial;">Also attached is a picture from Sunday when we took a walk. </span></font></p> ' +
'<p><font face="Arial" size="2"><span style="font-size: 10pt; font-family: Arial;">&nbsp;</span></font></p> ';
		var youTubeZimlet = new Com_Zimbra_Url();
		var expected = ["2vyEnQoG6q8", "7-XYUlfBoFw", "TRRPNB4bgvM"];
		var hash = youTubeZimlet._getAllYouTubeLinks(txt);
		UT.notEqual(hash, null, "hash of links should not be null");
		if (hash) {
			var count = 0;
			for (var id in hash) {
				UT.equal(id, expected[count], "Found link with ID = " +id);
				count++;
			}
		}
	}

);

UT.test("YouTube Max Links", {
	teardown: function() {

	}},

	function() {
		UT.expect(6);
		var youTubeZimlet = new Com_Zimbra_Url();
		var txt = "Check out these videos: " +
				  "JT Put a Ring on It: http://youtu.be/uycrNZEWRsk " +
				  "Dear Persian: http://www.youtube.com/watch?v=MLyzscHXtWM&feature=grec_index " +
				  "Spongebob: http://www.youtube.com/watch?feature=grec_index&v=NEuJAkTcJ8c " +
				  "Will Ferrell as Bush on YouTube.com http://youtu.be/EkqrI3IibYI " +
				  "Will Ferrell on CNBC http://www.youtube.com/v/dT2DxkEHnJc " +
				  "The Decision: http://www.youtube.com/watch?v=0f7AtdF6B_0 " +
				  "More JT: http://www.youtube.com/watch?v=rWnSSEBroHk" +
				  "Gingerbread man -- http://youtu.be/uX4NT3iDuRE";
		var expected = ["uycrNZEWRsk", "MLyzscHXtWM", "NEuJAkTcJ8c", "EkqrI3IibYI", "dT2DxkEHnJc"];
		var hash = youTubeZimlet._getAllYouTubeLinks(txt);
		UT.notEqual(hash, null, "hash of links should not be null");
		if (hash) {
			var count = 0;
			for (var id in hash) {
				UT.equal(id, expected[count], "Found link with ID = " +id);
				count++;
			}
		}

	}

);

UT.test("YouTube handle duplicates", {
	teardown: function() {

	}},

	function() {
		UT.expect(2);
		var youTubeZimlet = new Com_Zimbra_Url();
		var txt = "Same video three different ways. " +
				   "Spongebob: https://www.youtube.com/watch?feature=grec_index&v=NEuJAkTcJ8c " +
				   "Spongebob: http://youtube.com/v/NEuJAkTcJ8c " +
				   "Spongebob: http://www.youtu.be/NEuJAkTcJ8c ";
		var expected = "NEuJAkTcJ8c";
		var hash = youTubeZimlet._getAllYouTubeLinks(txt);
		UT.notEqual(hash, null, "hash of all links should not be null");
		if (hash) {
			for (var id in hash) {
				UT.equal(id, expected, "Found link with ID = " +id);
			}
		}
	}

);
