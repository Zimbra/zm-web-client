<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<!--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2013 Zimbra, Inc.
 * 
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software Foundation,
 * version 2 of the License.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
 * ***** END LICENSE BLOCK *****
-->
<%
	// no caching
	response.setHeader("Expires", "Tue, 24 Jan 2000 17:46:50 GMT");
	response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
	response.setHeader("Pragma", "no-cache");

	// information
	String path = request.getContextPath();

	// parameters
	String controller = request.getParameter("controller");
	String template = request.getParameter("template");
	String skin = request.getParameter("skin");
	if (skin == null) skin = application.getInitParameter("zimbraDefaultSkin");

    pageContext.setAttribute("template", template);
    pageContext.setAttribute("controller", controller);

%><html>
<head>
<link rel='stylesheet' type="text/css"
	  href='<%=path%>/css/common,dwt,msgview,login,zm,spellcheck,wiki,images,skin.css?debug=true'
>
<script src='<%=path%>/messages/I18nMsg,AjxMsg,ZMsg,ZaMsg,ZmMsg.js?debug=true'></script>
<script src='<%=path%>/js/ajax/boot/AjxEnv.js'></script>
<script src='<%=path%>/js/ajax/boot/AjxLoader.js'></script>
<script src='<%=path%>/js/ajax/boot/AjxPackage.js'></script>
<script src='<%=path%>/js/ajax/boot/AjxTemplate.js'></script>
<script src='<%=path%>/js/ajax/util/AjxCookie.js'></script>
<script src='<%=path%>/js/ajax/util/AjxUtil.js'></script>
<script src='<%=path%>/js/ajax/core/AjxCore.js'></script>
<script src='<%=path%>/js/ajax/core/AjxImg.js'></script>
<script src='<%=path%>/js/ajax/dwt/core/Dwt.js'></script>
<script src='<%=path%>/js/ajax/dwt/graphics/DwtCssStyle.js'></script>

<!-- load the "common" scripts for all controllers:  creates an "util" object w/convenience methods -->
<script src='common.js'></script>

<script language='JavaScript'>
if (window.data == null) window.data = {};
function onLoad() {
	var body = document.getElementsByTagName("BODY")[0];


	var templateId = window.templateId = "${not empty template ? zm:cook(template) : ""}" || AjxCookie.getCookie(document,"template");
	if (templateId == null) {
		body.innerHTML = "No template -- specify as ?template=app.Name%23foo";
		return;
	}
	AjxCookie.setCookie(document, "template", templateId);
	document.title = templateId;
	
	var controllerId = "${not empty controller ? zm:cook(controller) : ""}" || templateId.replace(/#.*$/,"")+"_test";

	AjxPackage.setBasePath("<%=path%>/js");
	AjxPackage.setQueryString("ts="+(new Date().getTime()));
	AjxPackage.require(controllerId);
	AjxPackage.require(templateId);
	
	var controller = window.controller;
	if (controller && typeof controller.init == "function") {
		controller.init(templateId);
	} else {
		AjxTemplate.setContent(body, templateId, window.data);
	}
	if (controller && typeof controller.afterInit == "function") {
		controller.afterInit(templateId);
	}
}
</script>
</head>
<body onload='onLoad()'></body>
</html>
