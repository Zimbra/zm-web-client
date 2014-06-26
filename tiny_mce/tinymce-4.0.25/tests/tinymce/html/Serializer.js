/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an "AS IS" basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2014 Zimbra, Inc. All Rights Reserved. 
 * ***** END LICENSE BLOCK *****
 */
module("tinymce.html.Serializer");

test('Basic serialization', function() {
	var serializer = new tinymce.html.Serializer();

	expect(6);

	equal(serializer.serialize(new tinymce.html.DomParser().parse('text<text&')), 'text&lt;text&amp;');
	equal(serializer.serialize(new tinymce.html.DomParser().parse('<B>text</B><IMG src="1.gif">')), '<strong>text</strong><img src="1.gif" alt="" />');
	equal(serializer.serialize(new tinymce.html.DomParser().parse('<!-- comment -->')), '<!-- comment -->');
	equal(serializer.serialize(new tinymce.html.DomParser().parse('<![CDATA[cdata]]>')), '<![CDATA[cdata]]>');
	equal(serializer.serialize(new tinymce.html.DomParser().parse('<?xml attr="value" ?>')), '<?xml attr="value" ?>');
	equal(serializer.serialize(new tinymce.html.DomParser().parse('<!DOCTYPE html>')), '<!DOCTYPE html>');
});

test('Sorting of attributes', function() {
	var serializer = new tinymce.html.Serializer();

	expect(1);

	equal(serializer.serialize(new tinymce.html.DomParser().parse('<b class="class" id="id">x</b>')), '<strong id="id" class="class">x</strong>');
});
