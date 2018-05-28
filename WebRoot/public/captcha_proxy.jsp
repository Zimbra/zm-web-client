<%@ page buffer="8kb" autoFlush="true" %>
<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ page session="false" %>
<%@ page import="com.zimbra.cs.taglib.ZJspSession"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%-- get captcha api endpoint --%>
<zm:getCaptchaApiUrl varCaptchaApiUrl="varCaptchaApiUrl"/>
<c:import var = "captchaId" url = "${varCaptchaApiUrl}/getCaptchaId"/>
<%
     String resp = (String)pageContext.getAttribute("captchaId");
     out.println(resp);
%>
