<%@ page buffer="8kb" autoFlush="true" %>
<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ page import="java.util.*,javax.naming.*,com.zimbra.client.ZAuthResult" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%

    ZAuthResult authResult = (ZAuthResult) request.getAttribute("authResult");
    pageContext.setAttribute("csrfToken", authResult.getCsrfToken());
%>
<%-- Inline scripts are blocked by CSP, so the token is passed as data and the logic lives in /public/js/modern.js --%>
<div id="zModernRedirect" hidden="hidden" data-csrf-token="${fn:escapeXml(csrfToken)}"></div>
<script src="/public/js/modern.js?v=${fn:escapeXml(initParam.zimbraCacheBusterVersion)}"></script>
