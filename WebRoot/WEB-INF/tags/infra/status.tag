<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
--%>
<%@ tag body-content="scriptless" %>
<%@ attribute name="style" rtexprvalue="true" required="false" %>
<%@ attribute name="html" rtexprvalue="true" required="false" %>
<%@ attribute name="block" rtexprvalue="true" required="false" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<c:set var="statusMessage" scope="request"><jsp:doBody/></c:set>
<c:set var="statusClass" scope="request" value="Status${empty style ? 'Info' : style}"/>
<c:set var="statusHtml" scope="request" value="${empty html ? false : html}"/>
<c:set var="statusBlocking" scope="request" value="${empty block ? false : block}"/>
