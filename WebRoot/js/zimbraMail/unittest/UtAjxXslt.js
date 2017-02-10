/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

UT.module("AjxXslt");

UtAjxXslt = function() {};

UtAjxXslt.transformToDom = function() {
	ZmUnitTestUtil.log("starting AjxXslt.transformToDom test");

	UT.expect(1);
	var xslStr =  '<?xml version="1.0" encoding="ISO-8859-1"?>' +
	'<xsl:stylesheet version="1.0" ' +
	'xmlns:xsl="http://www.w3.org/1999/XSL/Transform">'   +
	'<xsl:template match="/">' +
	'<html>' +
	'<body>' +
	'<h2>My CD Collection</h2>' +
	'<table border="1">'         +
	'<tr bgcolor="#9acd32">'     +
	'<th>Title</th>'             +
	'<th>Artist</th>'            +
	'</tr>'                      +
	'<xsl:for-each select="catalog/cd">'  +
	'<tr>'                                 +
	'<td><xsl:value-of select="title"/></td>' +
	'<td><xsl:value-of select="artist"/></td>' +
	'</tr>'                                   +
	'</xsl:for-each>'                         +
	'</table>'                                +
	'</body>'                                 +
	'</html>'                                 +
	'</xsl:template>'                         +
	'</xsl:stylesheet>';  
	
	var xml = '<?xml version="1.0" encoding="ISO-8859-1"?>' +
		'<catalog><cd><title>Empire Burlesque</title><artist>Bob Dylan</artist><country>USA</country>' + 
		'<company>Columbia</company><price>10.90</price><year>1985</year></cd></catalog>';
	if (window.DOMParser)
	{
		parser=new DOMParser();
		xmlDoc=parser.parseFromString(xml,"text/xml");
	}
	else // Internet Explorer
	{
		xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async=false;
		xmlDoc.loadXML(xml);
	}
	var xslt = AjxXslt.createFromString(xslStr);
	var dom = xslt.transformToDom(xmlDoc);
	if (dom) {
		var h2Value = AjxEnv.isIE ? dom.getElementsByTagName("H2")[0].text : dom.getElementsByTagName("H2")[0].textContent;
		UT.equal(h2Value, "My CD Collection", "XSLT transform to DOM successful");
	}
	else {
		UT.equal(1,2, "dom failed");
	}
	
};

UT.test("AjxXslt.transformToDom", UtAjxXslt.transformToDom);

