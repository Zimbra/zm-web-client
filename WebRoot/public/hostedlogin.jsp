<%@ page buffer="8kb" autoFlush="true" %>
<%@ page import="java.util.*,javax.naming.*,com.zimbra.client.ZAuthResult" %>
<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ page session="false" %>
<%@ page import="java.util.UUID" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%
    // Prevent IE from ever going into compatibility/quirks mode.
    response.setHeader("X-UA-Compatible", "IE=edge");
%><!DOCTYPE html>
<fmt:setLocale value='${pageContext.request.locale}' scope='request' />
<fmt:setBundle basename="/messages/ZmMsg" scope="request"/>
<fmt:setBundle basename="/messages/ZMsg" var="zmsg" scope="request"/>

<%-- query params to ignore when constructing form port url or redirect url --%>
<c:set var="ignoredQueryParams" value="loginOp,loginNewPassword,loginConfirmNewPassword,loginErrorCode,username,password,zrememberme,zlastserver,client,customerDomain,login_csrf"/>
<c:set var="prefsToFetch" value="zimbraPrefSkin,zimbraPrefClientType,zimbraPrefLocale,zimbraPrefMailItemsPerPage,zimbraPrefGroupMailBy,zimbraPrefAdvancedClientEnforceMinDisplay"/>
<c:set var="attrsToFetch" value="zimbraFeatureMailEnabled,zimbraFeatureCalendarEnabled,zimbraFeatureContactsEnabled,zimbraFeatureIMEnabled,zimbraFeatureOptionsEnabled,zimbraFeaturePortalEnabled,zimbraFeatureTasksEnabled,zimbraFeatureVoiceEnabled,zimbraFeatureBriefcasesEnabled,zimbraFeatureMailUpsellEnabled,zimbraFeatureContactsUpsellEnabled,zimbraFeatureCalendarUpsellEnabled,zimbraFeatureVoiceUpsellEnabled,zimbraFeatureConversationsEnabled"/>

<%-- this checks and redirects to admin if need be --%>
<zm:adminRedirect/>
<app:skinAndRedirect />

<%-- get useragent --%>
<zm:getUserAgent var="ua" session="false"/>
<c:set var="useMobile" value="${ua.isiPhone or ua.isiPod}"/>
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
        	 <c:choose>
	        	<c:when test="${fn:indexOf(param.username,'@') == -1}">
	        		<c:set var="fullUserName" value="${param.username}@${param.customerDomain}"/>
			    </c:when>
			    <c:otherwise>
			    	<c:set var="fullUserName" value="${param.username}"/>
			    </c:otherwise>
		    </c:choose>
			<c:choose>
				<c:when test="${!empty cookie.ZM_TEST}">
					<!-- CSRF check for login page -->
					<c:choose>
						<c:when test="${(not empty param.login_csrf) && (param.login_csrf eq cookie.ZM_LOGIN_CSRF.value)}">
							<zm:login username="${fullUserName}" password="${param.password}" varRedirectUrl="postLoginUrl"
								varAuthResult="authResult" newpassword="${param.loginNewPassword}" rememberme="${param.zrememberme == '1'}"
								prefs="${prefsToFetch}" attrs="${attrsToFetch}"
								requestedSkin="${param.skin}"/>

							<%
								// Delete cookie
								Cookie csrfCookie = new Cookie("ZM_LOGIN_CSRF", "");
								csrfCookie.setMaxAge(0);
								response.addCookie(csrfCookie);

								pageContext.setAttribute("login_csrf", "");
							%>
						</c:when>
						<c:otherwise>
							<!-- on failure of csrf show error to user -->
							<c:set var="errorCode" value="unknownError"/>
							<fmt:message var="errorMessage" key="unknownError"/>
						</c:otherwise>
					</c:choose>
		            <%-- continue on at not empty authResult test --%>
		    	</c:when>
		        <c:otherwise>
		            <c:set var="errorCode" value="noCookies"/>
		            <fmt:message var="errorMessage" key="errorCookiesDisabled"/>
		        </c:otherwise>
		    </c:choose>
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

				<%
					// Delete cookie
					Cookie csrfCookie = new Cookie("ZM_LOGIN_CSRF", "");
					csrfCookie.setMaxAge(0);
					response.addCookie(csrfCookie);

					pageContext.setAttribute("login_csrf", "");
				%>
				<%-- continue on at not empty authResult test --%>
			</c:if>
		</c:otherwise>
	</c:choose>
</c:catch>
<zm:getDomainInfo var="domainInfo" by="virtualHostname" value="${zm:getServerName(pageContext)}"/>
<c:set var="mailServiceURL" value="${protocolMode}:\/\/${domainInfo.attrs.zimbraPublicServiceHostname}"/>
<c:choose>
	<c:when  test="${empty domainInfo.attrs.zimbraPublicServiceHostname}">
		<c:set var="preauthHost" value="${zm:getServerName(pageContext)}"/>
	</c:when>
	<c:otherwise>
		<c:set var="preauthHost" value="${domainInfo.attrs.zimbraPublicServiceHostname}"/>
	</c:otherwise>
</c:choose>

<c:choose>
	<c:when  test="${empty domainInfo.attrs.zimbraPublicServiceProtocol}">
		<c:set var="preauthProtocol" value="http"/>
	</c:when>
	<c:otherwise>
		<c:set var="preauthProtocol" value="${domainInfo.attrs.zimbraPublicServiceProtocol}"/>
	</c:otherwise>
</c:choose>

<c:choose>
	<c:when  test="${empty domainInfo.attrs.zimbraPublicServicePort}">
		<c:set var="preauthPort" value=""/>
	</c:when>
	<c:otherwise>
		<c:set var="preauthPort" value=":${domainInfo.attrs.zimbraPublicServicePort}"/>
	</c:otherwise>
</c:choose>
<c:if test="${not empty requestScope.authResult.authToken.value}">
	<c:set var="preauthUrl" value="${preauthProtocol}://${preauthHost}${preauthPort}/service/preauth?isedirect=1&authtoken=${requestScope.authResult.authToken.value}"/>
	<c:redirect url="${preauthUrl}"/>
</c:if>
<c:if test="${loginException != null}">
    <zm:getException var="error" exception="${loginException}"/>
    <c:set var="errorCode" value="${error.code}"/>
    <fmt:message bundle="${zmsg}" var="errorMessage" key="${errorCode}"/>
</c:if>

<%
if (application.getInitParameter("offlineMode") != null)  {
    request.getRequestDispatcher("/").forward(request, response);
}
%>
<c:url var="formActionUrl" value="${domainInfo.attrs.zimbraWebClientLoginURL}">
    <c:forEach var="p" items="${paramValues}">
        <c:forEach var='value' items='${p.value}'>
            <c:if test="${not fn:contains(ignoredQueryParams, p.key)}">
                <c:param name="${p.key}" value='${value}'/>
            </c:if>
        </c:forEach>
    </c:forEach>
</c:url>

<%
	Cookie testCookie = new Cookie("ZM_TEST", "true");
	testCookie.setSecure(com.zimbra.cs.taglib.ZJspSession.secureAuthTokenCookie(request));
	response.addCookie(testCookie);

	String csrfToken = UUID.randomUUID().toString();
	Cookie csrfCookie = new Cookie("ZM_LOGIN_CSRF", csrfToken);
	csrfCookie.setSecure(com.zimbra.cs.taglib.ZJspSession.secureAuthTokenCookie(request));
	csrfCookie.setHttpOnly(true);
	response.addCookie(csrfCookie);

	pageContext.setAttribute("login_csrf", csrfToken);
%>


<html>
<head>
<!--
 login.jsp
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software Foundation,
 * version 2 of the License.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 * ***** END LICENSE BLOCK *****
-->
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8">
    <title><fmt:message key="zimbraLoginTitle"/></title>
    <c:set var="version" value="${initParam.zimbraCacheBusterVersion}"/>
    <meta name="viewport" content="width=320; initial-scale=1.0; maximum-scale=8.0; user-scalable=1;">
    <meta name="description" content="<fmt:message key="zimbraLoginMetaDesc"/>">
    <link  rel="stylesheet" type="text/css" href="<c:url value='/css/common,login,zhtml,skin.css'>
		<c:param name="skin"	value="${skin}" />
		<c:param name="v"		value="${version}" />
		<c:if test="${not empty param.customerDomain}">
			<c:param name="customerDomain"	value="${param.customerDomain}" />
		</c:if>	
	</c:url>">
	<zm:getFavIcon request="${pageContext.request}" var="favIconUrl" />
	<c:if test="${empty favIconUrl}">
	    <fmt:message key="favIconUrl" var="favIconUrl"/>
	</c:if>
    <link rel="SHORTCUT ICON" href="<c:url value='${favIconUrl}'/>">
</head>
<c:set value="/img" var="iconPath" scope="request"/>
<body onload="onLoad();">
<table width="100%" style="height:100%;">
    <tr>
        <td align="center" valign="middle">
            <div id="ZLoginPanel">
                <table width="100%">
                    <tr>
                        <td>
                            <table width="100%">
                                <tr>
                                    <td align="center" valign="middle">
                                        <a href="https://www.zimbra.com/" id="bannerLink" target="_new"><span style="cursor:pointer;display:block;" class="ImgLoginBanner"></span></a>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div id="ZLoginAppName"><fmt:message key="splashScreenAppName"/></div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td id="ZLoginBodyContainer">
                            <c:if test="${errorCode != null}">
                                <div id="ZLoginErrorPanel">
                                    <table width="100%">
                                        <tr>
                                            <td valign="top" width="40">
                                                <img alt='<fmt:message key="ALT_ERROR"/>' src="<app:imgurl value='dwt/ImgCritical_32.png?v=${version}'/>"/>
                                            </td>
                                            <td class="errorText">
                                                <c:out value="${errorMessage}"/>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            </c:if>

                            <div id="ZLoginFormPanel">
                                <form method="post" name="loginForm" action="${formActionUrl}">
                                    <input type="hidden" name="loginOp" value="login"/>
                                    <input type="hidden" name="login_csrf" value="${login_csrf}"/>

                                    <table width="100%" cellpadding="4">
                                        <tr>
                                            <td class="zLoginLabelContainer"><label for="username"><fmt:message key="username"/>:</label></td>
                                            <td colspan="2" class="zLoginFieldContainer">
                                                <input id="username" class="zLoginField" name="username" type="text" value="${fn:escapeXml(param.username)}" />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="zLoginLabelContainer"><label for="password"><fmt:message key="password"/>:</label></td>
                                            <td colspan="2" class="zLoginFieldContainer">
                                                <input id="password" class="zLoginField" name="password" type="password" value="${fn:escapeXml(param.password)}"/>
                                            </td>
                                        </tr>
                                        <c:if test="${errorCode eq 'account.CHANGE_PASSWORD' or !empty param.loginNewPassword }">
                                           <tr>
                                               <td class="zLoginLabelContainer"><label for="loginNewPassword"><fmt:message key="newPassword"/>:</label></td>
                                               <td colspan="2" class="zLoginFieldContainer">
                                                   <input id="loginNewPassword" class="zLoginField" name="loginNewPassword" type="password" value="${fn:escapeXml(param.loginNewPassword)}"/>
                                               </td>
                                           </tr>
                                            <tr>
                                                <td class="zLoginLabelContainer"><label for="confirmNew"><fmt:message key="confirm"/>:</label></td>
                                                <td colspan="2" class="zLoginFieldContainer">
                                                    <input id="confirmNew" class="zLoginField" name="loginConfirmNewPassword" type="password" value="${fn:escapeXml(param.loginConfirmNewPassword)}"/>
                                                </td>
                                            </tr>
                                        </c:if>
                                        <tr>
                                            <td class="zLoginLabelContainer"></td>
                                            <td>
                                                <table width="100%">
                                                    <tr>
                                                        <td><input id="remember" value="1" type="checkbox" name="zrememberme" /></td>
                                                        <td class="zLoginCheckboxLabelContainer"><label for="remember"><fmt:message
                                                                key="rememberMe"/></label></td>
                                                    </tr>
                                                </table>
                                            </td>
                                            <td><input type="submit" class="zLoginButton"
                                                       value="<fmt:message key="login"/>"/></td>
                                        </tr>
                                    </table>
                                    <table width="100%">
                                        <tr>
                                        	<td nowrap align="center">
                                                <div class="ZLoginSeparator" style="margin-top:0px"></div>
												<fmt:message key="chooseClient"/>&nbsp;
												<c:set var="client" value="${param.client}"/>
                                                <c:set var="useStandard" value="${not (ua.isFirefox1_5up or ua.isGecko1_8up or ua.isIE6up or ua.isSafari3Up)}"/>
                                                <c:if test="${empty client}">
													<%-- set client select default based on user agent. --%>
													<c:set var="client" value="${useMobile ? 'mobile' : useStandard ? 'standard' : 'preferred' }"/>
												</c:if>
												<select name="client" onchange="clientChange(this.options[this.selectedIndex].value)">
													<option value="preferred" <c:if test="${client eq 'preferred'}">selected</c:if> > <fmt:message key="clientPreferred"/></option>
													<option value="advanced"  <c:if test="${client eq 'advanced'}">selected</c:if>> <fmt:message key="clientAdvanced"/></option>
													<option value="standard"  <c:if test="${client eq 'standard'}">selected</c:if>> <fmt:message key="clientStandard"/></option>
                                                    <option value="mobile"  <c:if test="${client eq 'mobile'}">selected</c:if>> <fmt:message key="clientMobile"/></option>
												</select>
												
												<script TYPE="text/javascript">
													// show a message if they should be using the 'standard' client, but have chosen 'advanced' instead
													function clientChange(selectValue) {
														var useStandard = ${useStandard ? 'true' : 'false'};
														useStandard = useStandard || (screen && (screen.width <= 800 && screen.height <= 600));
                                                        var div = document.getElementById("ZLoginUnsupported");
														div.style.display = ((selectValue == 'advanced') && useStandard) ? 'block' : 'none';
													}
												
													// if they have JS, write out a "what's this?" link that shows the message below
													function showWhatsThis() {
                                                        var div = document.getElementById("ZLoginWhatsThis");
														div.style.display = (it.style.display == "block" ? "none" : "block");
													}
													
													function onLoad() {
														document.loginForm.username.focus();
														clientChange("${zm:cook(client)}");
													}
													document.write("<a href='#' onclick='showWhatsThis()' id='ZLoginWhatsThisAnchor'><fmt:message key="whatsThis"/><"+"/a>");
												</script>
											</td>
										</tr>
										<tr>
											<td align="center">
                                                <div id="ZLoginWhatsThis" class="ZLoginInfoMessage" style="display:none;text-align:left;width:90%;"><fmt:message key="clientWhatsThisMessage"/></div>
                                                <div id="ZLoginUnsupported" class="ZLoginInfoMessage" style="display:none"><fmt:message key="clientUnsupported"/></div>

                                                <div class="ZLoginSeparator"></div>
			                                </td>
                                        </tr>
										<tr>
                                            <td id="ZLoginClientLevelContainer">
                                                <fmt:message key="clientLoginNotice"/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td id="ZLoginLicenseContainer">
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
<script>
  <jsp:include page="/js/skin.js">
    <jsp:param name="templates" value="false" />
    <jsp:param name="client" value="advanced" />
    <jsp:param name='servlet-path' value='/js/skin.js' />
  </jsp:include>
  var link = document.getElementById("bannerLink");
  if (link) {
    link.href = skin.hints.banner.url;
  }
</script>
</body>
</html>
