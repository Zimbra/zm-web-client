<%@ page buffer="8kb" autoFlush="true" %>
<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ page session="false" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%-- this checks and redirects to admin if need be --%>
<zm:adminRedirect/>
<app:skinAndRedirect />

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<fmt:setLocale value='${pageContext.request.locale}' scope='request' />
<fmt:setBundle basename="/messages/ZmMsg" scope="request"/>
<fmt:setBundle basename="/messages/ZhMsg" var="zhmsg" scope="request"/>
<fmt:setBundle basename="/messages/ZMsg" var="zmsg" scope="request"/>

<%-- query params to ignore when constructing form port url or redirect url --%>
<c:set var="ignoredQueryParams" value="loginOp,loginNewPassword,loginConfirmNewPassword,loginErrorCode,username,password,zrememberme,zlastserver,client"/>

<%-- get useragent --%>
<zm:getUserAgent var="ua" session="false"/>
<c:set var="useMobile" value="${ua.isiPhone or ua.isiPod or ua.isOsAndroid}"/>
<c:set var="trimmedUserName" value="${fn:trim(param.username)}"/>

<c:if test="${param.loginOp eq 'relogin' and empty loginException}">
    <zm:logout/>
</c:if>
<c:if test="${param.loginOp eq 'relogin' and not empty loginException}">
    <zm:getException var="error" exception="${loginException}"/>
    <c:if test="${error.code eq 'service.AUTH_EXPIRED'}">
        <c:set var="errorCode" value="${error.code}"/>
        <fmt:message bundle="${zmsg}" var="errorMessage" key="${errorCode}"/>
        <zm:logout/>
    </c:if>
</c:if>

<c:catch var="loginException">
    <c:choose>
        <c:when test="${(not empty param.loginNewPassword or not empty param.loginConfirmNewPassword) and (param.loginNewPassword ne param.loginConfirmNewPassword)}">
            <c:set var="errorCode" value="errorPassChange"/>
            <fmt:message var="errorMessage" key="bothNewPasswordsMustMatch"/>
        </c:when>
        <c:when test="${param.loginOp eq 'relogin' and not empty param.loginErrorCode}">
            <zm:logout/>
            <c:set var="errorCode" value="${param.loginErrorCode}"/>
            <fmt:message bundle="${zmsg}" var="errorMessage" key="${errorCode}"/>
        </c:when>
        <c:when test="${param.loginOp eq 'logout'}">
            <zm:getDomainInfo var="domainInfo" by="virtualHostname" value="${zm:getServerName(pageContext)}"/>
            <c:set var="logoutRedirectUrl" value="${domainInfo.attrs.zimbraWebClientLogoutURL}" />
            <c:set var="isAllowedUA" value="${zm:isAllowedUA(ua, domainInfo.webClientLogoutURLAllowedUA)}"/>
            <zm:logout/>
            <c:if test="${not empty logoutRedirectUrl and (isAllowedUA eq true)}" >
            	<c:redirect url="${logoutRedirectUrl}"/>
            </c:if>
        </c:when>
        <c:when test="${(param.loginOp eq 'login') && !(empty trimmedUserName) && !(empty param.password) && (pageContext.request.method eq 'POST')}">
        	<c:choose>
	        	<c:when test="${(fn:indexOf(trimmedUserName,'@') == -1) and !(empty param.customerDomain)}">
	        		<c:set var="fullUserName" value="${trimmedUserName}@${param.customerDomain}"/>
			    </c:when>
			    <c:otherwise>
			    	<c:set var="fullUserName" value="${trimmedUserName}"/>
			    </c:otherwise>
		    </c:choose>        
		    <c:choose>
	        	<c:when test="${!empty cookie.ZM_TEST}">
		            <zm:login username="${fullUserName}" password="${param.password}" varRedirectUrl="postLoginUrl"
                              varAuthResult="authResult" varNeedRefer="needRefer"
		                      newpassword="${param.loginNewPassword}" rememberme="${param.zrememberme == '1'}"
							  requestedSkin="${param.skin}" importData="true"/>
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
	                      varRedirectUrl="postLoginUrl" varAuthResult="authResult" varNeedRefer="needRefer"
	                      rememberme="${param.zrememberme == '1'}"
						  requestedSkin="${param.skin}" adminPreAuth="${param.adminPreAuth == '1'}" importData="true"/>
	            <%-- continue on at not empty authResult test --%>
	        </c:if>
	    </c:otherwise>
    </c:choose>
</c:catch>

<c:if test="${not empty authResult}">
    <c:choose>
        <c:when test="${not empty postLoginUrl}">
            <c:choose>
                <c:when test="${needRefer}">
                    <%--
                    bug 63258: Need to redirect to a different server, avoid browser redirect to the post login URL.
                    Do a JSP redirect which will do a onload form submit with ZAuthToken as a hidden param.
                    In case of JS-disabled browser, make the user do a manual submit.
                    --%>
                    <jsp:forward page="/h/postLoginRedirect">
                       <jsp:param name="postLoginUrl" value="${postLoginUrl}"/>
                       <jsp:param name="zauthtoken" value="${authResult.authToken.value}"/>
                       <jsp:param name="client" value="${param.client}"/>
                    </jsp:forward>
                </c:when>
                <c:otherwise>
                    <c:choose>
                        <c:when test="${not empty param.client}">
                            <c:redirect url="${postLoginUrl}">
                                <c:param name="client" value="${param.client}"/>
                            </c:redirect>
                        </c:when>
                        <c:otherwise>
                            <c:redirect url="${postLoginUrl}"/>
                        </c:otherwise>
                    </c:choose>
                </c:otherwise>
            </c:choose>
        </c:when>
        <c:otherwise>
            <c:set var="client" value="${param.client}"/>
            <c:if test="${empty client and useMobile}"><c:set var="client" value="mobile"/></c:if> 
            <c:if test="${empty client or client eq 'preferred'}">
                <c:set var="client" value="${requestScope.authResult.prefs.zimbraPrefClientType[0]}"/>
            </c:if>
            <c:choose>
        		<c:when test="${client eq 'advanced'}">
                    <c:choose>
                        <c:when test="${(param.loginOp eq 'login') && !(empty param.username) && !(empty param.password)}">
                            <c:redirect url="/">
                                <c:forEach var="p" items="${paramValues}">
                                    <c:forEach var='value' items='${p.value}'>
                                        <c:if test="${not fn:contains(ignoredQueryParams, p.key)}">
                                            <c:param name="${p.key}" value='${value}'/>
                                        </c:if>
                                    </c:forEach>
                                </c:forEach>
                                <c:if test="${param.client eq 'advanced'}">
	                                <c:param name='client' value='advanced'/>
	                            </c:if>
                            </c:redirect>
                        </c:when>
                        <c:otherwise>
                            <jsp:forward page="/public/launchZCS.jsp"/>
                        </c:otherwise>
                    </c:choose>

        		</c:when>
        		<c:when test="${client eq 'standard'}">
		            <c:redirect url="/h/search">
                        <c:param name="mesg" value='welcome'/>
                        <c:param name="init" value='true'/>
                        <c:if test="${not empty param.app}">
                            <c:param name="app" value='${param.app}'/>
                        </c:if>
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
                        <c:set var="mobURL" value="/m/zmain"/>
                        <c:redirect url="${mobURL}">
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
    <c:forEach var="arg" items="${error.arguments}">
        <fmt:message bundle="${zhmsg}" var="errorMessage" key="${errorCode}.${arg.name}">
            <fmt:param value="${arg.val}"/>
        </fmt:message>
    </c:forEach>
</c:if>

<%
if (application.getInitParameter("offlineMode") != null)  {
    request.getRequestDispatcher("/").forward(request, response);
}
%>

<c:set var="loginRedirectUrl" value="${zm:getPreLoginRedirectUrl(pageContext, '/')}"/>
<c:if test="${not empty loginRedirectUrl}">
    <c:redirect url="${loginRedirectUrl}">
        <c:forEach var="p" items="${paramValues}">
            <c:forEach var='value' items='${p.value}'>
                <c:if test="${not fn:contains(ignoredQueryParams, p.key)}">
                    <c:param name="${p.key}" value='${value}'/>
                </c:if>
            </c:forEach>
        </c:forEach>
    </c:redirect>
</c:if>

<zm:getDomainInfo var="domainInfo" by="virtualHostname" value="${zm:getServerName(pageContext)}"/>
<c:if test="${(empty pageContext.request.queryString) or (fn:indexOf(pageContext.request.queryString,'customerDomain') == -1)}">
	<c:set var="domainLoginRedirectUrl" value="${domainInfo.attrs.zimbraWebClientLoginURL}" />
    <c:set var="isAllowedUA" value="${zm:isAllowedUA(ua, domainInfo.webClientLoginURLAllowedUA)}"/>
</c:if>

<c:if test="${not empty domainLoginRedirectUrl and empty param.sso and empty param.ignoreLoginURL and (isAllowedUA eq true)}" >
    <c:redirect url="${domainLoginRedirectUrl}">
        <c:forEach var="p" items="${paramValues}">
            <c:forEach var='value' items='${p.value}'>
                <c:if test="${not fn:contains(ignoredQueryParams, p.key)}">
                    <c:param name="${p.key}" value='${value}'/>
                </c:if>
            </c:forEach>
        </c:forEach>
    </c:redirect>
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

<%
	Cookie testCookie = new Cookie("ZM_TEST", "true");
	testCookie.setSecure(com.zimbra.cs.taglib.ZJspSession.secureAuthTokenCookie(request));
	response.addCookie(testCookie);
%>


<html>
<head>
<!--
 login.jsp
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
-->
    <c:set var="client" value="${param.client}"/>
    <c:set var="useStandard" value="${not (ua.isFirefox3up or ua.isGecko1_9up or ua.isIE7up or ua.isSafari4Up or ua.isChrome)}"/>
    <c:if test="${empty client}">
        <%-- set client select default based on user agent. --%>
        <c:set var="client" value="${useMobile ? 'mobile' : useStandard ? 'standard' : 'preferred' }"/>
    </c:if>
    <c:set var="smallScreen" value="${client eq 'mobile'}"/>
    <meta http-equiv="X-UA-Compatible" content="IE=9" />
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8">
    <title><fmt:message key="zimbraLoginTitle"/></title>
    <c:set var="version" value="${initParam.zimbraCacheBusterVersion}"/>
    <meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=1;">
    <meta name="description" content="<fmt:message key="zimbraLoginMetaDesc"/>">
    <link  rel="stylesheet" type="text/css" href="<c:url value='/css/common,login,zhtml.css'>
		<c:param name="skin"	value="${skin}" />
		<c:param name="v"		value="${version}" />
		<c:if test="${not empty param.customerDomain}">
			<c:param name="customerDomain"	value="${param.customerDomain}" />
		</c:if>	
	</c:url>">
	<link  rel="stylesheet" type="text/css" href="<c:url value='/css/skin.css'>
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

	<div class="LoginScreen">
		<div class="${smallScreen?'center-small':'center'}">
			<h1><a href="http://www.zimbra.com/" id="bannerLink" target="_new">
				<span class="Img${smallScreen?'App':'Login'}Banner"></span>
			</a></h1>
			<!--div id="ZLoginAppName"><fmt:message key="splashScreenAppName"/></div-->
            <c:choose>
                <c:when test="${not empty domainLoginRedirectUrl && param.sso eq 1 && empty param.ignoreLoginURL && (isAllowedUA eq true)}">
                    <form method="post" name="loginForm" action="${domainLoginRedirectUrl}" accept-charset="UTF-8">
                </c:when>
                <c:otherwise>
			        <form method="post" name="loginForm" action="${formActionUrl}" accept-charset="UTF-8">
				    <input type="hidden" name="loginOp" value="login"/>
                </c:otherwise>
            </c:choose>

				<c:if test="${errorCode != null}">
				    <div id="ZLoginErrorPanel">
				        <table><tr>
				            <td><app:img id="ZLoginErrorIcon" altkey='ALT_ERROR' src="dwt/ImgCritical_32.png" /></td>
				            <td><c:out value="${errorMessage}"/></td>
				        </tr></table>
				    </div>
				</c:if>
            <table class="form">
                <c:choose>
                <c:when test="${not empty domainLoginRedirectUrl && param.sso eq 1 && empty param.ignoreLoginURL && (isAllowedUA eq true)}">
                    <tr>
                        <td colspan="2">
                            <div class="LaunchButton">
                                <input type="submit" value="<fmt:message key="launch"/>" >
                            </div>
                        </td>
                    </tr>
				</c:when>
                <c:otherwise>
                    <tr>
                        <td><label for="username"><fmt:message key="username"/>:</label></td>
                        <td><input id="username" class="zLoginField" name="username" type="text" value="${fn:escapeXml(param.username)}" size="40"/></td>
                    </tr>
                    <tr>
                        <td><label for="password"><fmt:message key="password"/>:</label></td>
                        <td><input id="password" class="zLoginField" name="password" type="password" value="" size="40"/></td>
                    </tr>
                    <c:if test="${errorCode eq 'account.CHANGE_PASSWORD' or !empty param.loginNewPassword }">
                    <tr>
                        <td><label for="loginNewPassword"><fmt:message key="newPassword"/>:</label></td>
                        <td><input id="loginNewPassword" class="zLoginField" name="loginNewPassword" type="password" value="${fn:escapeXml(param.loginNewPassword)}" size="40"/></td>
                    </tr>
                    <tr>
                        <td><label for="confirmNew"><fmt:message key="confirm"/>:</label></td>
                        <td><input id="confirmNew" class="zLoginField" name="loginConfirmNewPassword" type="password" value="${fn:escapeXml(param.loginConfirmNewPassword)}" size="40"/></td>
                    </tr>
                    </c:if>
                    <tr>
                        <td>&nbsp;</td>
                        <td style="text-align:right">
                            <input type="submit" class="zLoginButton" value="<fmt:message key="login"/>" style="float:left;"/>
                            <input id="remember" value="1" type="checkbox" name="zrememberme" />
                            <label for="remember"><fmt:message key="${smallScreen?'rememberMeMobile':'rememberMe'}"/></label></td>
                    </tr>
				</c:otherwise>
				</c:choose>
                    <tr>
                        <td colspan="2"><hr/></td>
                    </tr>
                    <tr>
                        <td>
                            <label for="client">
                                <fmt:message key="versionLabel"/>
                            </label>
                        </td>
                        <td>
							<div class="postioning">
							<select id="client" name="client" onchange="clientChange(this.options[this.selectedIndex].value)">
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
		div.style.display = (div.style.display == "block" ? "none" : "block");
	}

    function onLoad() {
        var loginForm = document.loginForm;
		if (loginForm.username) {
			if (loginForm.username.value != "") {
				loginForm.password.focus(); //if username set, focus on password
			}
			else {
				loginForm.username.focus();
			}
		}
        clientChange("${zm:cook(client)}");
    }

	document.write("<a href='#' onclick='showWhatsThis()' id='ZLoginWhatsThisAnchor'><fmt:message key="whatsThis"/><"+"/a>");
</script>
							<div id="ZLoginWhatsThis" class="ZLoginInfoMessage" style="display:none;"><fmt:message key="clientWhatsThisMessage"/></div>
							<div id="ZLoginUnsupported" class="ZLoginInfoMessage" style="display:none;"><fmt:message key="clientUnsupported"/></div>
						</div>
						</td>
					</tr>
					<tr>
                        <td colspan="2"><hr/></td>
                    </tr>
                    
			</table>
			<div class="offline"><fmt:message key="switchToOfflineClientEx"/></div>
			<div class="decor1"></div>
		</div>

		<div class="${smallScreen?'Footer-small':'Footer'}">
		<div id="ZLoginNotice" class="legalNotice-small"><fmt:message key="clientLoginNotice"/></div>
        
        <div class="copyright">
            <c:choose>
                <c:when test="${useMobile}">
                    <fmt:message bundle="${zhmsg}" key="splashScreenCopyright"/>
                </c:when>
                <c:otherwise>
                    <fmt:message key="splashScreenCopyright"/>
                </c:otherwise>
            </c:choose>
            </div>
        </div>
	</div>                                 
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
  <c:if test="${smallScreen && ua.isIE}">       /*HACK FOR IE*/
  var resizeLoginPanel = function(){
      var panelElem = document.getElementById('ZLoginPanel');
      if(panelElem && !panelElem.style.maxWidth) { if(document.body.clientWidth >= 500) { panelElem.style.width="500px";}else{panelElem.style.width="90%";} }
  }
  resizeLoginPanel();
  if(window.attachEvent){ window.attachEvent("onresize",resizeLoginPanel);}
  </c:if>
</script>
</body>
</html>
