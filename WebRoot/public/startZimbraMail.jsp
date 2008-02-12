<%@ page buffer="8kb" autoFlush="true" %>
<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ page session="true" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ page import="com.zimbra.cs.zclient.ZAuthResult"%>
<%
	// Set to expire far in the past.
	response.setHeader("Expires", "Tue, 24 Jan 2000 17:46:50 GMT");

	// Set standard HTTP/1.1 no-cache headers.
	response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");

	// Set standard HTTP/1.0 no-cache header.
	response.setHeader("Pragma", "no-cache");
%><!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<body>
<%

    ZAuthResult authResult = (ZAuthResult) request.getAttribute("authResult");
    if (authResult != null) {
        response.getWriter().println("my skin is "+ authResult.getPrefs().get("zimbraPrefSkin").get(0));
    }
%>

--------
<br>

prefs
<br>
${fn:escapeXml(requestScope.authResult.prefs)}
<br>
attrs
<br>
${fn:escapeXml(requestScope.authResult.attrs)}
<br>
<%
	// NOTE: This inserts raw HTML files from the user's skin
	//       into the JSP output. It's done *this* way so that
	//       the SkinResources servlet sees the request URI as
	//       "/html/skin.html" and not as "/public/launch...".
	out.flush();
	RequestDispatcher dispatcher = request.getRequestDispatcher("/html/");
	HttpServletRequest wrappedReq = new HttpServletRequestWrapper(request) {
    public String getServletPath() { return "/html"; }
    public String getPathInfo() { return "/skin.html"; }
    public String getRequestURI() { return getServletPath() + getPathInfo(); }
	};
	System.err.println("******************** calling dispatcher.include");
	dispatcher.include(wrappedReq, response);
	System.err.println("******************** called dispatcher.include");
%>
</body>
</html>