<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<fmt:setLocale value='${pageContext.request.locale}' scope='request' />
<fmt:setBundle basename="/messages/ZmMsg" scope="request"/>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<!--
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
 -->
<HTML>
<HEAD>
	<title><fmt:message key="skinDeletedErrorTitle" /></title>
</HEAD>
<BODY>
	<br>
	<br>
	<center>
		<fmt:message key='skinDeletedError'>
			<fmt:param value="${param.skin}" />
		</fmt:message>
	</center>
</BODY>
</HTML>