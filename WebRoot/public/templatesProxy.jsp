<%@ page buffer="8kb" autoFlush="true" %>
<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ page language="java" import="com.zimbra.cs.account.Provisioning" %>

<%
	String templateIds    = request.getParameter("id");
	String templateApiUrl = Provisioning.getInstance().getConfig().getAttr(Provisioning.A_zimbraEmailTemplateApiUrl, "");
	templateApiUrl += templateIds;
%>
<c:import var="data" url="<%=templateApiUrl%>"/>

<%
     String resp = (String)pageContext.getAttribute("data");
     out.println(resp);
%>
