<%@ page buffer="8kb" autoFlush="true" %>
<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ page session="false" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<fmt:setLocale value='${pageContext.request.locale}' scope='request' />
<fmt:setBundle basename="/messages/ZmMsg" scope="request"/>
<fmt:setBundle basename="/messages/ZMsg" var="zmsg" scope="request"/>

<%-- query params to ignore when constructing form port url or redirect url --%>
<c:set var="ignoredQueryParams" value="loginOp,loginNewPassword,loginConfirmNewPassword,loginErrorCode,username,password,zrememberme,zlastserver,client"/>
<c:set var="prefsToFetch" value="zimbraPrefSkin,zimbraPrefClientType,zimbraPrefLocale,zimbraPrefMailItemsPerPage,zimbraPrefGroupMailBy"/>
<c:set var="attrsToFetch" value="zimbraFeatureMailEnabled,zimbraFeatureCalendarEnabled,zimbraFeatureContactsEnabled,zimbraFeatureIMEnabled,zimbraFeatureNotebookEnabled,zimbraFeatureOptionsEnabled,zimbraFeaturePortalEnabled,zimbraFeatureTasksEnabled,zimbraFeatureVoiceEnabled,zimbraFeatureBriefcasesEnabled,zimbraFeatureMailUpsellEnabled,zimbraFeatureContactsUpsellEnabled,zimbraFeatureCalendarUpsellEnabled,zimbraFeatureVoiceUpsellEnabled,zimbraFeatureConversationsEnabled"/>

<%-- this checks and redirects to admin if need be --%>
<zm:adminRedirect/>

<%-- get useragent --%>
<zm:getUserAgent var="ua" session="false"/>
<c:set var="useMobile" value="${ua.isiPhone}"/>

<c:catch var="loginException">
    <c:choose>
        <c:when test="${(not empty param.loginNewPassword or not empty param.loginConfirmNewPassword) and (param.loginNewPassword ne param.loginConfirmNewPassword)}">
            <c:set var="errorCode" value="errorPassChange"/>
            <fmt:message var="errorMessage" key="bothNewPasswordsMustMatch"/>
        </c:when>
        <c:when test="${param.loginOp eq 'relogin'}">
            <zm:logout/>
            <c:set var="errorCode" value="${param.loginErrorCode}"/>
            <fmt:message bundle="${zmsg}" var="errorMessage" key="${errorCode}"/>
        </c:when>
        <c:when test="${param.loginOp eq 'logout'}">
            <zm:logout/>
        </c:when>
        <c:when test="${(param.loginOp eq 'login') && !(empty param.username) && !(empty param.password)}">
            <zm:login username="${param.username}" password="${param.password}" varRedirectUrl="postLoginUrl" varAuthResult="authResult"
                      newpassword="${param.loginNewPassword}" rememberme="${param.zrememberme == '1'}"
                      prefs="${prefsToFetch}" attrs="${attrsToFetch}"
					  requestedSkin="${param.skin}"/>
            <%-- continue on at not empty authResult test --%>
	    </c:when>
	    <c:otherwise>
	        <%-- try and use existing cookie if possible --%>
	        <c:set var="authtoken" value="${not empty param.zauthtoken ? param.zauthtoken : cookie.ZM_AUTH_TOKEN.value}"/>
	        <c:if test="${not empty authtoken}">
	            <zm:login authtoken="${authtoken}" authtokenInUrl="${not empty param.zauthtoken}"
	                      varRedirectUrl="postLoginUrl" varAuthResult="authResult"
	                      rememberme="${param.zrememberme == '1'}"
                          prefs="${prefsToFetch}" attrs="${attrsToFetch}"
						  requestedSkin="${param.skin}"/>
	            <%-- continue on at not empty authResult test --%>
	        </c:if>
	    </c:otherwise>
    </c:choose>
</c:catch>

<c:if test="${not empty authResult}">
    <c:choose>
        <c:when test="${not empty postLoginUrl}">
            <c:redirect url="${postLoginUrl}"/>
        </c:when>
        <c:otherwise>
            <c:set var="client" value="${param.client}"/>
            <c:if test="${empty client and useMobile}"><c:set var="client" value="mobile"/></c:if> 
            <c:if test="${empty client or client eq 'preferred'}">
                <c:set var="client" value="${requestScope.authResult.prefs.zimbraPrefClientType[0]}"/>
            </c:if>
            <c:choose>
        		<c:when test="${client eq 'advanced'}">
		            <jsp:forward page="/public/launchZCS.jsp"/>
        		</c:when>
        		<c:when test="${client eq 'standard'}">
		            <c:redirect url="/h/search?mesg=welcome&initial=true">
                        <c:forEach var="p" items="${paramValues}">
                            <c:forEach var='value' items='${p.value}'>
                                <c:if test="${not fn:contains(ignoredQueryParams, p.key)}">
                                    <c:param name="${p.key}" value='${value}'/>
                                </c:if>
                            </c:forEach>
                        </c:forEach>
                    </c:redirect>
        		</c:when>
                <c:when test="${client eq 'mobile'}">
		            <c:redirect url="/m/main">
                            <c:forEach var="p" items="${paramValues}">
                                <c:forEach var='value' items='${p.value}'>
                                    <c:if test="${not fn:contains(ignoredQueryParams, p.key)}">
                                        <c:param name="${p.key}" value='${value}'/>
                                    </c:if>
                                </c:forEach>
                            </c:forEach>
                    </c:redirect>
                </c:when>
                <c:otherwise>
		            <jsp:forward page="/public/launchZCS.jsp"/>
		        </c:otherwise>
		    </c:choose>
        </c:otherwise>
    </c:choose>
</c:if>

<c:if test="${loginException != null}">
    <zm:getException var="error" exception="${loginException}"/>
    <c:set var="errorCode" value="${error.code}"/>
    <fmt:message bundle="${zmsg}" var="errorMessage" key="${errorCode}"/>
</c:if>

<%
if (application.getInitParameter("offlineMode") != null)  {
    request.getRequestDispatcher("/public/zdsetup.jsp").forward(request, response);
}
%>

<c:set var="loginRedirectUrl" value="${zm:getPreLoginRedirectUrl(pageContext, '/')}"/>
<c:if test="${not empty loginRedirectUrl}">
    <c:redirect url="${loginRedirectUrl}"/>
</c:if>

<c:url var="formActionUrl" value="/">
    <c:forEach var="p" items="${paramValues}">
        <c:forEach var='value' items='${p.value}'>
            <c:if test="${not fn:contains(ignoredQueryParams, p.key)}">
                <c:param name="${p.key}" value='${value}'/>
            </c:if>
        </c:forEach>
    </c:forEach>
</c:url>


<html>
<head>
<!--
 login.jsp
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
    <title><fmt:message key="zimbraLoginTitle"/></title>
    <c:set var="skin" value="${empty initParam.zimbraDefaultSkin ? 'sand' : initParam.zimbraDefaultSkin}"/>
    <c:set var="version" value="${initParam.zimbraCacheBusterVersion}"/>
    <meta name="viewport" content="width=320; initial-scale=1.0; maximum-scale=8.0; user-scalable=1;">
    <meta name="description" content="<fmt:message key="zimbraLoginMetaDesc"/>">
    <link href="<c:url value='/css/common,login,zhtml,skin.css?skin=${skin}&v=${version}'/>" rel="stylesheet" type="text/css" />
    <fmt:message key="favIconUrl" var="favIconUrl"/>
    <link rel="SHORTCUT ICON" href="<c:url value='${favIconUrl}'/>">
</head>
<body onload="document.loginForm.username.focus();">
<table width="100%" style="height:100%;">
    <tr>
        <td align="center" valign="middle">
            <div id="ZloginPanel">
                <table width="100%">
                    <tr>
                        <td>
                            <table width="100%">
                                <tr>
                                    <td align="center" valign="middle">
                                        <a href="http://www.zimbra.com/" target="_new"><span style='cursor:pointer;display:block;' class='ImgLoginBanner'></span></a>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div id='ZLoginAppName'><fmt:message key="splashScreenAppName"/></div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td id='ZloginBodyContainer'>
                            <c:if test="${errorCode != null}">
                                <!-- ${fn:escapeXml(error.stackStrace)} -->
                                <div id='ZloginErrorPanel'>
                                    <table width="100%">
                                        <tr>
                                            <td valign='top' width='40'>
                                                <img alt='<fmt:message key="ALT_ERROR"/>' src="<c:url value='/img/dwt/ImgCritical_32.gif'/>"/>
                                            </td>
                                            <td class='errorText'>
                                                <c:out value="${errorMessage}"/>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            </c:if>

                            <div id='ZloginFormPanel'>
                                <form method='post' name="loginForm" action="${formActionUrl}">
                                    <input type="hidden" name="loginOp" value="login"/>
                                    <table width="100%" cellpadding="4">
                                        <tr>
                                            <td class='zLoginLabelContainer'><label for="username"><fmt:message key="username"/>:</label></td>
                                            <td colspan="2" class='zLoginFieldContainer'>
                                                <input id="username" class='zLoginField' name='username' type='text' value='${fn:escapeXml(param.username)}' />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class='zLoginLabelContainer'><label for="password"><fmt:message key="password"/>:</label></td>
                                            <td colspan="2" class='zLoginFieldContainer'>
                                                <input id="password" class='zLoginField' name='password' type='password' value="${fn:escapeXml(param.password)}"/>
                                            </td>
                                        </tr>
                                        <c:if test="${errorCode eq 'account.CHANGE_PASSWORD' or !empty param.loginNewPassword }">
                                           <tr>
                                               <td class='zLoginLabelContainer'><label for="loginNewPassword"><fmt:message key="newPassword"/>:</label></td>
                                               <td colspan="2" class='zLoginFieldContainer'>
                                                   <input id="loginNewPassword" class='zLoginField' name='loginNewPassword' type='password' value="${fn:escapeXml(param.loginNewPassword)}"/>
                                               </td>
                                           </tr>
                                            <tr>
                                                <td class='zLoginLabelContainer'><label for="confirmNew"><fmt:message key="confirm"/>:</label></td>
                                                <td colspan="2" class='zLoginFieldContainer'>
                                                    <input id="confirmNew" class='zLoginField' name='loginConfirmNewPassword' type='password' value="${fn:escapeXml(param.loginConfirmNewPassword)}"/>
                                                </td>
                                            </tr>
                                        </c:if>
                                        <tr>
                                            <td class='zLoginLabelContainer'></td>
                                            <td>
                                                <table width="100%">
                                                    <tr>
                                                        <td><input id="remember" value="1" type="checkbox" name='zrememberme' /></td>
                                                        <td class='zLoginCheckboxLabelContainer'><label for="remember"><fmt:message
                                                                key="rememberMe"/></label></td>
                                                    </tr>
                                                </table>
                                            </td>
                                            <td><input type="submit" class='zLoginButton'
                                                       value="<fmt:message key="login"/>"/></td>
                                        </tr>
                                    </table>
                                    <table width="100%">
                                        <tr>
                                        	<td nowrap align='center'>
                                                <div class='ZLoginSeparator' style='margin-top:0px'></div>
												<fmt:message key="chooseClient"/>&nbsp;
												<c:set var="client" value="${param.client}"/>
                                                <c:set var="useStandard" value="${not (ua.isFirefox1_5up or ua.isIE6up or ua.isCamino)}"/>
                                                <c:if test="${empty client}">
													<%-- set client select default based on user agent. --%>
													<c:set var="client" value="${useMobile ? 'mobile' : useStandard ? 'standard' : 'preferred' }"/>
												</c:if>
												<select name="client" onchange='clientChange(this.options[this.selectedIndex].value)'>
													<option value="preferred" <c:if test="${client eq 'preferred'}">selected</c:if> > <fmt:message key="clientPreferred"/></option>
													<option value="advanced"  <c:if test="${client eq 'advanced'}">selected</c:if>> <fmt:message key="clientAdvanced"/></option>
													<option value="standard"  <c:if test="${client eq 'standard'}">selected</c:if>> <fmt:message key="clientStandard"/></option>
                                                    <option value="mobile"  <c:if test="${client eq 'mobile'}">selected</c:if>> <fmt:message key="clientMobile"/></option>
												</select>
												
												<script TYPE="text/javascript">
													// show a message if the should be using the 'standard' client, but have chosen 'advanced' instead
													function clientChange(selectValue) {
                                                        var useStandard = ${useStandard ? 'true' : 'false'};
                                                        var it = document.getElementById("ZLoginUnsupported");
														it.style.display = (("${client}" == 'standard' && selectValue == 'advanced' && useStandard) ? 'block' : 'none');
													}
												
													// if they have JS, write out a "what's this?" link that shows the message below
													function showWhatsThis() {
                                                        var it = document.getElementById("ZLoginWhatsThis");
														it.style.display = (it.style.display == "block" ? "none" : "block");
													}
													document.write("<a href='#' onclick='showWhatsThis()' id='ZLoginWhatsThisAnchor'><fmt:message key="whatsThis"/><"+"/a>");
												</script>
											</td>
										</tr>
										<tr>
											<td align='center'>
                                                <div id='ZLoginWhatsThis' class='ZLoginInfoMessage' style='display:none;text-align:left;width:90%;'><fmt:message key="clientWhatsThisMessage"/></div>
                                                <div id='ZLoginUnsupported' class='ZLoginInfoMessage' style='display:none'><fmt:message key="clientUnsupported"/></div>

                                                <div class='ZLoginSeparator'></div>
			                                </td>
                                        </tr>
										<tr>
                                            <td nowrap id='ZloginClientLevelContainer'>
                                                <fmt:message key="clientLoginNotice"/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td nowrap id='ZloginLicenseContainer'>
                                                <fmt:message key="splashScreenCopyright"/>
                                            </td>
                                        </tr>
                                    </table>
                                </form>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        </td>
    </tr>
</table>
</body>
</html>
