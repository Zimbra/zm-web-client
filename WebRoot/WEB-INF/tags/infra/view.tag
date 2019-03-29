<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
--%>
<%@ tag body-content="scriptless" %>
<%@ attribute name="selected" rtexprvalue="true" required="false" %>
<%@ attribute name="folders" rtexprvalue="true" required="false" %>
<%@ attribute name="searches" rtexprvalue="true" required="false" %>
<%@ attribute name="contacts" rtexprvalue="true" required="false" %>
<%@ attribute name="voice" rtexprvalue="true" required="false" %>
<%@ attribute name="calendars" rtexprvalue="true" required="false" %>
<%@ attribute name="tasks" rtexprvalue="true" required="false" %>
<%@ attribute name="briefcases" rtexprvalue="true" required="false" %>
<%@ attribute name="notebook" rtexprvalue="true" required="false" %>
<%@ attribute name="minical" rtexprvalue="true" required="false" %>
<%@ attribute name="date" rtexprvalue="true" required="false" type="java.util.Calendar" %>
<%@ attribute name="editmode" rtexprvalue="true" required="false" %>
<%@ attribute name="title" rtexprvalue="true" required="true" %>
<%@ attribute name="ads" rtexprvalue="true" required="false" %>
<%@ attribute name="onload" rtexprvalue="true" required="false" %>
<%@ attribute name="tags" rtexprvalue="true" required="false" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean"%>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>

<html>
<app:skin mailbox="${mailbox}" />
<app:head mailbox="${mailbox}" title="${title}"/>
<!-- skin is ${zm:cook(skin)} -->
<body class="user_font_system" <c:if test="${not empty onload}">onload="${onload}"</c:if>>
<app:handleViewError>
<zm:getDomainInfo var="domainInfo" by="virtualHostname" value="${zm:getServerName(pageContext)}" authtoken="${mailbox.authToken}" csrftoken="${mailbox.csrfToken}"/>
<c:if test="${not empty domainInfo}">
	<c:set var="helpUrl" value="${domainInfo.attrs.zimbraHelpStandardURL}" scope='request' />
	<c:set var="adminReference" value="${domainInfo.attrs.zimbraWebClientAdminReference}" scope="request"/>
	<c:set var="logoUrl" value="${domainInfo.attrs.zimbraSkinLogoURL}" scope="request"/>
</c:if>
<c:if test="${empty helpUrl}">
	<%-- we use <c:url> below to add the locid param so don't need to do it here --%>
	<c:set var='helpUrl' value="/help/standard/zimbra_user_help.htm" scope="request" />
</c:if>
<c:choose>
    <c:when test="${not empty param.lang}">
            <c:set var="langId" value="${param.lang}" scope='request' />
        </c:when>
    <c:when test="${not empty mailbox.prefs.locale}">
            <c:set var="langId" value="${mailbox.prefs.locale}" scope='request' />
        </c:when>
        <c:otherwise>
            <c:set var="langId" value="${pageContext.request.locale}" scope='request' />
        </c:otherwise>
</c:choose>

<c:choose>

<c:when test="${skin eq 'velodrome2'}">
<c:if test="${zm:boolean(statusBlocking)}">
	<div id="app_st_block_div" class="VeilOverlay" style="z-index:99;"></div>
</c:if>
<div id="app_status_container" class='${requestScope.statusClass}' style="z-index:100;position:relative;"><app:appStatus/></div>
<table width="100%" height="100%">
	<tr>
		<td class='ImgSkin_Chrome_R1' colspan="2">
			<table width=99% align="center">
				<tr>
					<td class='R1Text'>hi,</td>
					<td><div id='skin_container_username' class='R1Text'><span style='white-space:nowrap'><b>${fn:escapeXml(mailbox.name)}</b></span></div></td>
					<td id='#skin_container_logoff_lite' class='R1Link'><span style='white-space:nowrap'><a href="<c:url value="/?loginOp=logout&lang=${langId != null ? langId : 'en'}"/>"><fmt:message key="logOut" /></a></span></td>
					<td class='R1Sep'>|</td>
					<td class='R1Link'><span style='white-space:nowrap'><a href="https://acctmgt.bbt1.cistest.att.net:9003/Comcast/AcctMgt/acctmgt.cmd?CM.src=top" target=_new >My Account</a></span></td>
					<td width=100%>&nbsp;</td>
					<td class='R1Link'><span style='white-space:nowrap'><a href="http://www.comcast.net">comcast.net</a></span></td>
					<td class='R1Sep'>|</td>
					<td><div class=ImgHelp></div></td>
					<td>&nbsp;</td>
					<td class='R1Link' id='skin_container_help_lite'> <a target=_new href="<c:url value="http://www.comcast.net/help/faq/index.jsp?cat=Email#SmartZone"/>"><fmt:message key="help"/></a></td>
					<td>&nbsp;&nbsp;</td>
					<td><div class=ImgPadlock></div></td>
					<td class='R1Link'><span style='white-space:nowrap'>&nbsp;<a href="http://www.comcast.net/security/" target=_new>Security</a></span></td>
					<td>&nbsp;&nbsp;</td>
					<td><div class=ImgSkin_Info></div></td>
					<td class='R1Link'><span style='white-space:nowrap'>&nbsp;<a href="http://www.comcast.net/providers/askcomcast/popup.html" target=_new >Ask comcast</a></span></td>
				</tr>
			</table>
		</td>
	</tr>
	<tr>
		<td width="100%" valign="top">
			<table id='skin_table_outer' width='100%' class='skin_table'>
				<tr id='skin_R2'>
					<td style="width:8px;"><div class='ImgSkin_Chrome_R2_L'></div></td>
					<td class='ImgSkin_Chrome_R2 Row2width' colspan=3>
						<table width="100%">
							<tr>
								<td align="left">
							<c:choose>
								<c:when test="${mailbox.features.portalEnabled}">
									<a href="/h/home" ><div class='ImgAppLogoLite'></div></a>
								</c:when>
								<c:otherwise>
									<a href="/h/search" ><div class='ImgAppLogoLite'></div></a>
								</c:otherwise>
							</c:choose>
								</td>
								<td id='skin_container_app_name'></td>
								<td width='100%'>&nbsp;</td>
								<td id='skin_td_search' align='right'>
									<!-- search box -->
									<app:appTop mailbox="${mailbox}" keys="${keys}" query="${empty context.query ? param.sq : context.query}" web="${mailbox.features.webSearchEnabled}" calendars="${calendars}" tasks="${tasks}" voice="${voice}" briefcases="${briefcases}"/>
								</td>
							</tr>
						</table>
					</td>
					<td><div class='ImgSkin_Chrome_R2_R'></div></td>
				</tr>
				<tr id='skin_R3'>
					<td style="width:8px;"><div class='ImgSkin_Chrome_R3_L'></div></td>
					<td class='ImgSkin_Chrome_R3'>
						<div id='skin_container_current_app' class='skin_container' style='width:170px;height:100%;'></div>
					</td>
					<td class='ImgSkin_Chrome_R3'>&nbsp;</td>
					<td class='ImgSkin_Chrome_R3' style='padding:0px;'>
						<table width='100%'>
							<tr>
								<td id='skin_td_app_chooser'>
									<div id='skin_container_app_chooser_lite' class='skin_container'>
										<app:appTabs context="${context}" mailbox="${mailbox}" keys="${keys}" selected='${selected}'/>
									</div>
								</td>
								<td id='skin_td_quota' style="vertical-align:middle;">
									<table class="BannerBar">
										<tr>
									<c:set var="max" value="${mailbox.attrs.zimbraMailQuota[0]}"/>
									<c:choose>
										<c:when test="${max gt 0}">
											<c:set var="usage" value="${zm:displaySizePercentage(mailbox.size,max)}" />
											<c:set var="usageNumeric" value="${fn:replace(usage, '%','')}"/>
											<td class="BannerTextQuota">Email:</td>
											<td class="BannerTextQuota">
												<div class="quotabar" align="left">
											<c:choose>
												<c:when test="${usageNumeric < 65 }">
													<div class="quotaUsed" style="width:${usage}"/>
												</c:when>
												<c:when test="${usageNumeric >= 65 && usageNumeric < 85}">
													<div class="quotaWarning" style="width:${usage}"/>
												</c:when>
												<c:when test="${usageNumeric >= 85}">
													<div class="quotaCritical" style="width:${usage}"/>
												</c:when>
											</c:choose>
												</div>
											</td>
										</c:when>
										<c:otherwise>
											<c:set var="usage" value="${zm:displaySizeFractions(pageContext, mailbox.size,1)}" />
										</c:otherwise>
									</c:choose>
											<td class="BannerTextQuota" style="white-space:nowrap;">
												<fmt:message var="unlimited" key="unlimited"/>
												<fmt:message  key="quotaUsage">
													<fmt:param value="${usage}"/>
													<fmt:param value="${max == null || max == '' || max==0 ? unlimited : zm:displaySizeFractions(pageContext, max,1)}"/>
												</fmt:message>
											</td>
										</tr>
									</table>
								</td>
							</tr>
						</table>
					</td>
					<td><div class='ImgSkin_Chrome_R3_R'></div></td>
				</tr>
				<tr id='skin_tr_main' style="background-color:fff;">
				<c:if test="${empty editmode}">
					<td id='skin_td_tree_outer' colspan=2 style="background-color:white;">
						<table id='skin_tree_table' class='skin_table fullSize'>
						<c:if test="${selected ne 'voice'}">
							<tr>
								<td id='skin_td_tree_header' valign=bottom>
									<div id='skin_tree_header_container' class='skin_container'>
										<table class='skin_table fullSize'>
											<tr>
												<td class='TbTop'>
													<c:if test="${selected != 'contacts'}">
														<c:set var="actionURL" value="/h/mfolders"/>
													</c:if>
													<c:if test="${selected eq 'contacts'}">
														<c:set var="actionURL" value="/h/maddrbooks"/>
													</c:if>
													<c:if test="${selected eq 'calendar'}">
														<c:set var="actionURL" value="/h/mcalendars"/>
													</c:if>
													<form method="post" action="${actionURL}" <c:if test="${selected eq 'contacts' or selected eq 'calendar'}">enctype="multipart/form-data" accept-charset="utf-8"</c:if> >
														<table width=100%>
															<tr>
																<td class='ImgSkin_Toolbar'>
																	<table class='Tb'>
																		<tr>
																		<c:if test="${selected != 'contacts' and selected != 'calendar' and mailbox.features.mail}">
																			<app:button name="actionNewFolder" src="startup/ImgNewFolder.png" tooltip="folderNew" text="folderNew"/>
																		</c:if>
																		<c:if test="${selected eq 'contacts' and mailbox.features.newAddrBookEnabled}">
																			<app:button id="OPNEWADDRBOOK" name="actionNewAddressBook" src="contacts/ImgNewContact.png" tooltip="addressBookNew" text="addressBookNew"/>
																		</c:if>
																		<c:if test="${selected eq 'calendar'}">
																			<app:button id="OPNEWCAL" name="actionNewCalendar" src="calendar/ImgNewAppointment.png" tooltip="calendarNew" text="calendarNew"/>
																		</c:if>
																		</tr>
																	</table>
																</td>
															</tr>
														</table>
														<input type="hidden" name="doAction" value="1"/>
														<input type="hidden" name="crumb" value="${fn:escapeXml(mailbox.accountInfo.crumb)}"/>
													</form>
												</td>
											</tr>
										</table>
									</div>
								</td>
							</tr>
						</c:if>
							<tr>
								<td height='100%' id='skin_td_tree' colspan=3 valign='top'>
									<div id='skin_container_tree' class='skin_container'>
									<c:if test="${empty editmode}">
										<app:overviewTree mailbox="${mailbox}" keys="${keys}" minical="${minical}" calendars="${calendars}" contacts="${contacts}" tasks="${tasks}" voice = "${voice}" notebook="${notebook}" briefcases="${briefcases}" tags="${tags}" searches="${searches}" folders="${folders}" editmode="${editmode}" date="${date}"/>
									</c:if>
									</div>
								</td>
							</tr>
							<tr>
								<td id='skin_td_tree_bottom_ad' style="padding-left:0px; overflow:hidden;" height=120>
									<iframe src="<c:url value='/h/overviewAds'/>" align="left" frameborder="0" marginheight="0" style="overflow:hidden;" scrolling="no" allowTransparency="true" marginwidth="0" height="130" width="100%" >
									</iframe>
								</td>
							</tr>
						</table>
					</td>
					<td id='skin_td_tree_app_sash'><div class='ZVerticalSash'></div></td>
				</c:if>
					<td id='skin_td_app_outer'  colspan='${empty editmode ? 2 : 5}' style='padding-left:${editmode ? 5 : 0}px; width:100%; background-color:white;'>
						<table id='skin_app_table' class='skin_table fullSize'>
							<tr>
								<td id='skin_td_app' valign="top"><div id='skin_container_app_main' class='skin_container' style='border-color:#C6C6C6; border-style:solid; border-width:0 0 0 1px;'>
									<jsp:doBody/></div>
								</td>
							</tr>
						</table>
					</td>
				</tr>
				<tr id='skin_tr_main_full' style='display:none'>
					<td id='skin_td_app_full_outer'  class='full_height' colspan='4' height='100%' style="background-color:white;">
						<table id='skin_app_full_table' class='skin_table fullSize'>
							<tr>
								<td id='skin_full_toolbar_container'>
									<!--div id='skin_container_app_top_toolbar' class='skin_container'></div-->
								</td>
							</tr>
							<tr>
								<td id='skin_td_app_full'>
									<div id='skin_container_app_main_full' class='skin_container' height='100%'>
										&nbsp; <!--Full screen app-->
									</div>
								</td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
		</td>
<c:forEach var="zimlets" items="${mailbox.attrs.zimbraZimletAvailableZimlets}">
	<c:if test="${zimlets eq 'comcast_adsrvc'}">
		<c:set var="comcast_adsrvc" value="true"/>
	</c:if>
</c:forEach>
<c:if test="${(selected eq 'mail') and mailbox.features.portalEnabled and comcast_adsrvc}">
	<c:set var="action" value="${empty param.paction ? param.action : param.paction}"/>
		<c:choose>
			<c:when test="${not empty context and (context.isMessageSearch or context.isConversationSearch ) and action eq 'view'}">
				<c:set var="yahoo_ad_space_id" value="2142030098"/>
			</c:when>
			<c:otherwise>
				<c:set var="yahoo_ad_space_id" value="2142030097"/>                        
			</c:otherwise>
		</c:choose>
		<td id="_sidebarAd" colspan="1" width="160" valign="top" bgcolor="#f5f5f5" align="center">
			<iframe src="http://pn2.adserver.yahoo.com/a?f=${yahoo_ad_space_id}&pn=comcast&p=com-mail&l=SKY&c=sh&bg=f5f5f5&no_expandable=1"
						marginwidth="0"
						marginheight="0"
						width="160"
						height="600"
						border="0"
						frameborder="0"
						style="border:none;"
						scrolling="no" align="center"></iframe>
			<a style="color:black;text-decoration:none;" target="_blank" href="<fmt:message key="adSlugLink" />" ><fmt:message key="advertisement" /></a>
		</td>
</c:if>
	</tr>
	<tr id='skin_R4'>
		<td id='skin_td_R4' class='ImgSkin_Chrome_R4' colspan="2">
			<table width=100% id='skin_table_R4' class='skin_table fullSize'>
				<tr>
					<td style='text-align:left;padding-left:20px;'><fmt:message key="splashScreenCopyright" /></td>
					<td><a href="http://www.comcast.net/privacy/" target="_new">UPDATED: Privacy Statement</a></td>
					<td><a href="http://www.comcast.net/terms/" target="_new">UPDATED: Terms of Service</a></td>
					<td><a href="http://www.comcast.net/help/contact" target="_new">Contact Us</a></td>
					<td><a href="http://www.comcast.com/shop/buyflow/default.ashx" target="_new">Add Comcast Services</a></td>
					<td><a href="http://www.comcastsupport.com/sdcxuser/lachat/user/webmailfeedback.asp" target="_new">Tell Us What You Think</a></td>
					<td width=1 align=right><a href="http://www.comcast.net/"><div class='ImgSkin_Customer_Logo_Bottom'></div></a></td>
				</tr>
			</table>
		</td>
	</tr>
</table>
<app:footer title="${title}" selected="${selected}"/>
<script type="text/javascript">
if (screen.width<=800) {
	/*remove sidebar ad when resolution is less than eq 800 x 600*/
	var ad = document.getElementById("_sidebarAd");
	if (ad) {
		ad.style.display='none';
	}
}
</script>
</c:when>


<c:when test="${skin eq 'zmail'}">
<c:if test="${zm:boolean(statusBlocking)}">
	<div id="app_st_block_div" class="VeilOverlay" style="z-index:99;"></div>
</c:if>
<table style="border-bottom:1px solid #C9D7F1;">
	<tr>
		<td id='skin_container_app_chooser_lite'>
			<app:appTabs context="${context}" mailbox="${mailbox}" keys="${keys}" selected='${selected}'/>
		</td>
		<td width="90%"></td>
		<td nowrap="nowrap" class="Tab">
			<b>${fn:escapeXml(empty mailbox.defaultIdentity.fromDisplay ? mailbox.name : mailbox.defaultIdentity.fromDisplay)}</b> |
		</td>
		<!--td nowrap="nowrap" class="Tab">	<a href='<c:url value="/?client=advanced"/>'><fmt:message key="switchToAdvancedClient" /></a>  |
		</td-->
	<c:if test="${mailbox.attrs.zimbraIsDomainAdminAccount[0] eq 'TRUE' and not empty adminReference }">
		<td align="left" nowrap="nowrap" class="Tab">
			<a target="_new" href="${adminReference}"><fmt:message key="adminLinkLabel"/></a> |
		</td>
	</c:if>
		<td align="right" nowrap="nowrap" class="Tab">
			<a target="_new" href="<c:url value="${helpUrl}"><c:param name='locid'><fmt:getLocale /></c:param></c:url>"><fmt:message key="help"/></a> |
		</td>	
		<td align="right" nowrap="nowrap" class="Tab">
			<a href="<c:url value="/?loginOp=logout&lang=${langId != null ? langId : 'en'}"/>"><fmt:message key="logOut"/></a>
		</td>
	</tr>
</table>
<table>
	<tr>
		<td valign="top" align="center" class="Overview">
	<c:choose>
		<c:when test="${not empty logoUrl}">
			<a href="${logoUrl}" target="_new"> <span style='cursor:pointer; display:block;' class='ImgAppBanner'></span> </a>
		</c:when>
		<c:otherwise>
			<span style='display:block;' class='ImgAppBanner'></span>
		</c:otherwise>
	</c:choose>
		</td>
		<td valign="middle" class="TopContent" width="90%">
			<table width="50%">
				<tr>
					<td>
						<app:appTop mailbox="${mailbox}" keys="${keys}" query="${empty context.query ? param.sq : context.query}" calendars="${calendars}" voice="${voice}" tasks="${tasks}" briefcases="${briefcases}"/>
					</td>
				</tr>
			</table>
		</td>
		<td align="center" style="padding-right:5px;"></td>
	</tr>
</table>
<table width="100%" height="27" style="z-index:100;position:relative;">
	<tr>
		<td class="Overview"></td>
		<td id="app_status_container" align="center" colspan="3">
			<app:appStatus/>
		</td>
	</tr>
</table>
<table width="100%">
	<tr>
	<c:if test="${empty editmode}">
		<td valign="top" class="Overview">
				<app:overviewTree mailbox="${mailbox}" keys="${keys}" minical="${minical}" calendars="${calendars}" contacts="${contacts}" voice="${voice}" tasks="${tasks}" notebook="${notebook}" briefcases="${briefcases}" tags="${tags}" searches="${searches}" folders="${folders}" editmode="${editmode}" date="${date}"/>
		</td>
	</c:if>
	<c:set var="adsOn" value="${!empty ads}"/>
	<c:if test="${adsOn}" >
		<td valign="top" colspan="3">
			<table width="100%">
				<tr>
	</c:if>
	
					<td valign="top" colspan="${empty editmode ? 3 : 4}" style="padding-left:${editmode ? 10 : 0}px; border:7px solid #C3D9FF; -moz-border-radius:4px;">
						<jsp:doBody/>
					</td>
	
	<c:if test="${adsOn}" >
					<td valign="top" style="border-top:1px solid #98adbe; width:180px;">
						<app:ads content="${ads}"/>
					</td>
				</tr>
			</table>
		</td>
	</c:if>
		<td style="width:6px;">
			&nbsp; <%-- for IE's scrollbar, this should be CSS browser-specific --%>
		</td>
	</tr>
	<tr>
		<td colspan="4">&nbsp;</td>
	</tr>
</table>
</c:when>


<c:otherwise>
<c:if test="${zm:boolean(statusBlocking)}">
	<div id="app_st_block_div" class="VeilOverlay" style="z-index:99;"></div>
</c:if>
<fmt:setBundle basename="/messages/ZhMsg" scope="request"/>
<table width="100%">
	<tr>
		<td>
			<table width="100%">
				<tr>
					<td colspan="${empty editmode ? 4 : 3}" style="padding-bottom:6px;">
						<table width=100% id="skin_spacing_top_row">
							<tr>
								<td valign="middle" align="center" width="1%">
							<c:choose>
								<c:when test="${not empty logoUrl}">
									<a href="${logoUrl}" target="_new"> <span style='cursor:pointer; display:block;' class='ImgAppBanner'></span> </a>
								</c:when>
								<c:otherwise>
									<span style='display:block;' class='ImgAppBanner'></span>
								</c:otherwise>
							</c:choose>
								</td>
								<td style="white-space:nowrap;" width="33%">
									<%--<b>${fn:escapeXml(empty mailbox.defaultIdentity.fromDisplay ? mailbox.name : mailbox.defaultIdentity.fromDisplay)}</b>--%>
									<%--<br>--%>
									<!--a class='skin_yahoo_link' href='<c:url value="/?client=advanced"/>'><fmt:message key="switchToAdvancedClient" /></a-->
									<!--<a class='skin_yahoo_link' target="_new" href="http://www.zimbra.com/products/desktop.html">Offline version</a>-->
								</td>
								<td valign="top" class="TopContent" align="center">
									<app:appTop mailbox="${mailbox}" keys="${keys}" query="${empty context.query ? param.sq : context.query}" calendars="${calendars}" voice="${voice}" tasks="${tasks}" briefcases="${briefcases}"/>
								</td>
							</tr>
							<tr>
								<td colspan="4"><!-- App Tabs -->
									<table width="100%" id="skin_spacing_app_row"><tr>
										<td valign="bottom" nowrap="nowrap"><app:appTabs context="${context}" mailbox="${mailbox}" keys="${keys}" selected='${selected}' nofiller="${true}"/></td>
										<td class="GlobalActions">
										<c:if test="${mailbox.attrs.zimbraIsDomainAdminAccount[0] eq 'TRUE' and not empty adminReference }">
											<a class='skin_link' target="_new" href="${adminReference}"><fmt:message key="adminLinkLabel"/></a>&nbsp;<font color="gray">|</font>&nbsp;
										</c:if>
											<a class='skin_link' href="<c:url value="/?loginOp=logout&lang=${langId != null ? langId : 'en'}"/>"><fmt:message key="logOut"/></a>
										</td>
									</tr></table>
								</td>
							</tr>
						</table>
						<app:appStatus/>
					</td>
				</tr>
				<tr>
				<c:if test="${empty editmode}">
					<td valign="top" class="Overview" rowspan="2">
						<table width="100%" class="IEFix">
							<!--<tr><td class="TbTop"></td></tr>-->
							<tr>
								<td valign="top">
								<table align="center" width="100%">
									<tr>
										<td><app:appTopUser mailbox="${mailbox}" keys="${keys}" /></td>
									</tr>
									<tr>
										<td style="background-color:white;" valign="top">
											<app:overviewTree mailbox="${mailbox}" keys="${keys}" minical="${minical}" calendars="${calendars}" contacts="${contacts}" notebook="${notebook}" voice="${voice}" tasks="${tasks}" briefcases="${briefcases}" tags="${tags}" searches="${searches}" folders="${folders}" editmode="${editmode}" date="${date}"/>
										</td>
									</tr>
								</table>
								</td>
							</tr>
						</table>
					</td>
				</c:if>
					<td colspan="3" valign="top">
						<jsp:doBody/>
					</td>
				</tr>
				<tr>
				<c:set var="adsOn" value="${!empty ads}"/>
				<c:if test="${adsOn}" >
					<td valign="top" colspan="3">
						<table width="100%">
							<tr>
				</c:if>
								<td valign="top" colspan="3"></td>
				<c:if test="${adsOn}" >
								<td valign="top" style="border-top:1px solid #98ADBE; width:180px;">
									<app:ads content="${ads}"/>
								</td>
							</tr>
						</table>
					</td>
				</c:if>
				</tr>
			</table>
		</td>
	</tr>
</table>

</c:otherwise>
</c:choose>
</app:handleViewError>
</body>
</html>
