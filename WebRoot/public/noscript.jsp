<%@ page buffer="8kb" session="false" autoFlush="true" pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ page import="java.util.*,javax.naming.*,com.zimbra.cs.zclient.ZAuthResult" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%
	// Set to expire far in the past.
	response.setHeader("Expires", "Tue, 24 Jan 2000 17:46:50 GMT");

	// Set standard HTTP/1.1 no-cache headers.
	response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");

	// Set standard HTTP/1.0 no-cache header.
	response.setHeader("Pragma", "no-cache");
%><!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<fmt:setBundle basename="/messages/ZmMsg" scope="request"/>
<html>
<head>
<!--
 noscript.jsp
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
-->
<meta http-equiv="Content-Type" content="text/html;charset=utf-8">
<title><fmt:message key="zimbraTitle"/></title>
<link href="/zimbra/css/images,common,dwt,msgview,login,zm,spellcheck,wiki,skin" rel="stylesheet" type="text/css" />
<fmt:message key="favIconUrl" var="favIconUrl"/>
</head>
<body>

<!-- BEGIN SPLASH SCREEN -->
<div id='skin_container_splash_screen'>
	<table style='width:100%;height:100%'>
		<tr>
			<td align=center valign=middle>
				<div id='ZSplashPanel'>
					<table class='zLoginTable' width='100%' cellpadding=0 cellspacing=0>
						<tr>
							<td id='ZLoginHeaderContainer'>
								<center>
									<table class='zLoginTable'>
										<tr>
											<td id='ZLoginBannerContainer'>
												<div id='ZLoginBannerPanel'>
													<table class='zLoginTable'>
														<tr>
															<td>
																<div style='cursor:pointer' id='ZLoginBannerImage' class='ImgLoginBanner'></div>
															</td>
															<td valign=top id='ZLoginShortVersion'>
															</td>
														</tr>
													</table>
													<div id='ZLoginAppName'>
														<fmt:message key="splashScreenAppName" />
													</div>
												</div>
											</td>
										</tr>
									</table>
								</center>
							</td>
						</tr>
						<tr>
							<td id='ZSplashBodyContainer'>
								<div id='ZLoginLoadingPanel'>
									<table>
										<tr>
											<td>
												<fmt:message key="errorJavaScriptRequired">
													<fmt:param>
														<c:url value='/'></c:url>
													</fmt:param>
													<fmt:param>
														<c:url value='/h/'></c:url>
													</fmt:param>
												</fmt:message>
											</td>
										</tr>
									</table>
								</div>
								<table class='zLoginTable' width='100%' cellpadding=0 cellspacing=0>
									<tr>
										<td id='ZLoginLicenseContainer'>
											<fmt:message key="splashScreenCopyright" />
										</td>
									</tr>
								</table>
							</td>
						</tr>
					</table>
				</div>
			</td>
		</tr>
	</table>
</div>
<!-- END SPLASH SCREEN -->

</body>
</html>
