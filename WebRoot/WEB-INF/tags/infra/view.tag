<%@ tag body-content="scriptless" %>
<%@ attribute name="selected" rtexprvalue="true" required="false" %>
<%@ attribute name="folders" rtexprvalue="true" required="false" %>
<%@ attribute name="searches" rtexprvalue="true" required="false" %>
<%@ attribute name="contacts" rtexprvalue="true" required="false" %>
<%@ attribute name="voice" rtexprvalue="true" required="false" %>
<%@ attribute name="calendars" rtexprvalue="true" required="false" %>
<%@ attribute name="tasks" rtexprvalue="true" required="false" %>
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
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN">
<!--bug: 21462 yui editor freezes in IE7 without without this header -->
<html>
<app:head mailbox="${mailbox}" title="${title}"/>
<c:set var="skin" value="${not empty sessionScope.skin ? sessionScope.skin : (not empty mailbox.prefs.skin ? mailbox.prefs.skin : 'beach')}" />
<!-- skin is ${skin} -->
<body <c:if test="${not empty onload}">onload="${onload}"</c:if>>
<c:choose>
<c:when test="${skin eq 'yahoo'}">
<c:set value="/skins/yahoo/img/icons" var="iconPath" scope="request"/>
<table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
        <td valign="top" align="center" width="1%" style="padding-right: 8px;">
            <a href="http://www.yahoo.com/" target="_new">
                <span style='cursor:pointer; display: block;' class='ImgAppBanner'></span>
            </a>
        </td>
        <td>
        <c:set var="max" value="${mailbox.attrs.zimbraMailQuota[0]}"/>
        <table cellpadding="2" cellspacing="0" width="100%">
            <tr>
                <td>
                    <b>${fn:escapeXml(empty mailbox.defaultIdentity.fromDisplay ? mailbox.name : mailbox.defaultIdentity.fromDisplay)}</b>
                </td>
            </tr>
        </table>
            <a href="<c:url value="/?loginOp=logout"/>"><fmt:message key="logOut"/></a>&nbsp;<a href='<c:url value="/"/>'><fmt:message key="switchToAdvancedClient" /></a>
        </td>
        
        <td valign="top" class="TopContent" align="right" width="25%">
            <app:appTop mailbox="${mailbox}" keys="${keys}" query="${empty context.query ? param.sq : context.query}" calendars="${calendars}" voice="${voice}" tasks="${tasks}"/>
        </td>
        <td align="right">
        </td>
    </tr>

    <!-- tr>
        <td class="Overview">
            &nbsp;
        </td>
        <td align="center" colspan="3">
            <app:appStatus/>
        </td>
    </tr -->

    <tr>
        <!-- td class="Overview">
        <%--  compose button
            <c:choose>
                <c:when test="${not empty context}">
                    <zm:currentResultUrl var="composeUrl" value="/h/search" context="${context}" paction="${param.action}" action="compose"/>
                </c:when>
                <c:otherwise>
                    <c:url var="composeUrl" value="/h/search?action=compose"/>
                </c:otherwise>
            </c:choose>
            <div class="SearchButton" style="padding:2px;" >
                <a  href="${fn:escapeXml(composeUrl)}" style="text-decoration:none;color:black;"><span id='tab_ikon_compose'><app:img src="startup/ImgNewMessage.gif" altkey='ALT_APP_COMPOSE'/></span> &nbsp; <span id='tab_ikon_compose'></span><span><fmt:message key="compose"/></span></a>
            </div
            --%>
        </td -->
        <td colspan="4">
	        <table cellpadding="0" cellspacing="0" border="0" width="100%">
	        <tr>
	        <td valign="bottom" nowrap="nowrap"><app:appTabs context="${context}" mailbox="${mailbox}" keys="${keys}" selected='${selected}'/></td>
	        <td><app:appStatus/></td>
	        <td align="right" nowrap="nowrap"><a target="_new" href="<c:url value="/bhelp/Zimbra_Basic_User_Help.htm"/>"><fmt:message key="help"/></a>&nbsp;</td>
		    </tr>
		    </table>
    	</td>
    </tr>
    <tr>
    
        <c:if test="${empty editmode}">
            <td valign="top" class="Overview">
				<table cellspacing="0" cellpadding="0" border="0" width="100%" class="IEFix">
			    <tr>
			    <td class="TbTop">
			    <%--  compose button
            <c:choose>
                <c:when test="${not empty context}">
                    <zm:currentResultUrl var="composeUrl" value="/h/search" context="${context}" paction="${param.action}" action="compose"/>
                </c:when>
                <c:otherwise>
                    <c:url var="composeUrl" value="/h/search?action=compose"/>
                </c:otherwise>
            </c:choose>
            <div class="SearchButton" style="padding:2px;" >
                <a  href="${fn:escapeXml(composeUrl)}" style="text-decoration:none;color:black;"><span id='tab_ikon_compose'><app:img src="startup/ImgNewMessage.gif" altkey='ALT_APP_COMPOSE'/></span> &nbsp; <span id='tab_ikon_compose'></span><span><fmt:message key="compose"/></span></a>
            </div>
            --%>
			    </td>
			    </tr>
			    <tr>
			    <td valign="top">
			    <table cellspacing="0" cellpadding="0" border="0" align="center" width="100%">
			    <tr>
			    <td style="background-color: white; padding: 0px 4px;" valign="top">
                <app:overviewTree mailbox="${mailbox}" keys="${keys}" minical="${minical}" calendars="${calendars}" contacts="${contacts}" voice="${voice}" tasks="${tasks}" tags="${tags}" searches="${searches}" folders="${folders}" editmode="${editmode}" date="${date}"/>
            	</td>
            	</tr>
            	</table>
            	</td>
                </tr>
                </table>
            </td>
        </c:if>
        <c:set var="adsOn" value="${!empty ads}"/>
<c:if test="${adsOn}" >
        <td valign="top" colspan="3">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
</c:if>
        <td valign="top" colspan="${empty editmode ? 3 : 4}" style="padding-left:${editmode ? 10 : 0}px">
        <jsp:doBody/>
    </td>
    <c:if test="${adsOn}" >
                        <td valign="top" style="border-top: 1px solid #98adbe; width: 180px;">
                           <app:ads content="${ads}"/>
                        </td>

                    </tr>
                </table>
            </td>
    </c:if>
    <!-- td style="width:10px;">
        &nbsp; <%-- for IE's scrollbar, this should be CSS browser-specific --%>
    </td -->
</tr>
</table>
</c:when>

<c:when test="${skin eq 'velodrome2'}">
	<c:set var="iconPath" value="/img" scope="request"/>
	<table width="100%" cellspacing="0" cellpadding="0" border="0" height="100%">
	<tr>
		<td class='ImgSkin_Chrome_R1' colspan="2">
			<table width=99% cellspacing=0 cellpadding=0 align="center">
				<tr>
					<td class='R1Text'>hi,</td>
					<td><div id='skin_container_username' class='R1Text'><nobr><b>${fn:escapeXml(empty mailbox.defaultIdentity.fromDisplay ? mailbox.name : mailbox.defaultIdentity.fromDisplay)}</b></nobr></div></td>
					<td id='#skin_container_logoff_lite' class='R1Link'><nobr><a href="<c:url value="/?loginOp=logout"/>"><fmt:message key="logOut" /></a></nobr></td>
					<td class='R1Sep'>|</td>
					<td class='R1Link'><nobr><a href="https://acctmgt.bbt1.cistest.att.net:9003/Comcast/AcctMgt/acctmgt.cmd?CM.src=top">My Account</a></nobr></td>
					<td width=100%>&nbsp;</td>
					<td class='R1Link'><nobr><a href="http://www.comcast.net" target=_new >comcast.net</a></nobr></td>
					<td class='R1Sep'>|</td>
					<td><div class=ImgHelp></div></td>
					<td>&nbsp;</td>
					<td class='R1Link' id='skin_container_help_lite'> <a target=_new href="<c:url value="http://www.comcast.net/help/"/>"><fmt:message key="help"/></a></td>
					<td>&nbsp;&nbsp;</td>
					<td><div class=ImgPadlock></div></td>
					<td class='R1Link'><nobr>&nbsp;<a href="http://www.comcast.net/security/" target=_new>Security</a></nobr></td>
					<td>&nbsp;&nbsp;</td>
					<td><div class=ImgSkin_Info></div></td>
					<td class='R1Link'><nobr>&nbsp;<a href="http://www.comcast.net/providers/askcomcast/popup.html" target=_new >Ask comcast</a></nobr></td>
				</tr>
			</table>
		</td>
	</tr>
	<tr>
	<td width="99%">
	<table id='skin_table_outer' width='100%' border=0 class='skin_table' cellspacing=0 cellpadding=0 >
			<colgroup>
				<col id='skin_col_L'>
				<col id='skin_col_tree'>
				<col id='skin_col_sash'>
				<col id='skin_col_main'>
				<col id='skin_col_R'>
			</colgroup>
			
			<tr id='skin_R2'>
				<td><div class='ImgSkin_Chrome_R2_L'></div></td>
				<td class='ImgSkin_Chrome_R2' colspan=3>
					
					<table width=100% cellspacing=0 cellpadding=0 border='0'>
					<tr>
						<td align="left">
							<c:choose>
								<c:when test="${mailbox.features.portalEnabled}">
									 <a href="/h/home" ><div class='ImgSkin_Chrome_Logo'></div></a>
								</c:when>
								<c:otherwise>
									 <a href="/h/search" ><div class='ImgSkin_Chrome_Logo'></div></a>
								</c:otherwise>
							</c:choose>
						</td>
						<td id='skin_container_app_name'></td>
						<td width='76%'><div class='float'> 
						<app:appStatus/>
						</div></td>
						<td id='skin_td_search' align='right' width='450'>						
								<!-- search box -->				
								<app:appTop mailbox="${mailbox}" keys="${keys}" query="${empty context.query ? param.sq : context.query}" calendars="${calendars}" tasks="${tasks}"/>					
						</td>
					</tr>
					</table>
				</td>
				<td><div class='ImgSkin_Chrome_R2_R'></div></td>
			</tr>
	
			<tr id='skin_R3'>
				<td><div class='ImgSkin_Chrome_R3_L'></div></td>
				<td class='ImgSkin_Chrome_R3'>
					<div style='position:relative;width:100%;height:100%;'>
						<div id='skin_container_current_app' class='skin_container'></div>
					</div>
				</td>
				<td class='ImgSkin_Chrome_R3'>&nbsp;</td>
				<td class='ImgSkin_Chrome_R3' style='padding:0px;'>
					<table width='100%' cellspacing=0 cellpadding=0>
					<tr>
						<td id='skin_td_app_chooser'>
							<div id='skin_container_app_chooser_lite' class='skin_container'>
							<app:appTabs context="${context}" mailbox="${mailbox}" keys="${keys}" selected='${selected}'/>
							</div>
						</td>
						<td id='skin_td_quota' style="vertical-align:middle;">
							<table class="BannerBar" cellspacing="0" cellpadding="0" border="0">
								<tbody>
									<tr>
										<c:set var="max" value="${mailbox.attrs.zimbraMailQuota[0]}"/>
										<c:choose>
											<c:when test="${max gt 0}">
												<c:set var="usage" value="${zm:displaySizePercentage(mailbox.size,max)}" />
												<td class="BannerTextQuota">Email:</td>
												<td class="BannerTextQuota">
													<div class="quotabar">
														<div class="quotaUsed" style="width:${usage}"/>
													</div>
												</td>
											</c:when>
											<c:otherwise>
												<c:set var="usage" value="${zm:displaySizeFractions(mailbox.size,2)}" />
											</c:otherwise>
										</c:choose>
										<td class="BannerTextQuota" style="white-space: nowrap;">
											<fmt:message var="unlimited" key="unlimited"/>
											<fmt:message key="quotaUsage">
												<fmt:param value="${usage}"/>
												<fmt:param value="${max==0 ? unlimited : zm:displaySizeFractions(max,2)}"/>
											</fmt:message>
										</td>
									</tr>
								</tbody>
							</table>
						</td>
					</tr>
					</table>
				</td>
				<td><div class='ImgSkin_Chrome_R3_R'></div></td>
			</tr>
	
			<tr id='skin_tr_main' style="background-color:fff;">
			
			<c:if test="${empty editmode}">
	
	
				<td id='skin_td_tree_outer' colspan=2>
					<table id='skin_tree_table' class='skin_table fullSize' cellspacing=0 cellpadding=0>
						<c:if test="${selected ne 'voice'}">
							<tr><td id='skin_td_tree_header' valign=bottom>
								<div id='skin_tree_header_container' class='skin_container'>
									<table class='skin_table fullSize' cellspacing=0 cellpadding=0>
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
													   <table width=100% cellspacing=0 >
															<tr>
																<td class='ImgSkin_Toolbar'>
																	<table cellspacing=0 cellpadding=0 class='Tb'>
																	<tr>
																	<c:if test="${selected != 'contacts' and selected != 'calendar'}">
																		<app:button name="actionNewFolder" src="startup/ImgNewFolder.gif" tooltip="folderNew" text="folderNew"/>
																	</c:if>
																	<c:if test="${selected eq 'contacts'}">
																		<app:button id="OPNEWADDRBOOK" name="actionNewAddressBook" src="contacts/ImgNewContact.gif" tooltip="addressBookNew" text="addressBookNew"/>
																	</c:if>
																	<c:if test="${selected eq 'calendar'}">
																		<app:button id="OPNEWCAL" name="actionNewCalendar" src="calendar/ImgNewAppointment.gif" tooltip="calendarNew" text="calendarNew"/>
																	</c:if>
																	</tr>
																   </table>
																</td>
															</tr>
														</table>
														<input type="hidden" name="doAction" value="1"/>
												</form>
											</td>
										</tr>
									</table>
								</div>
							</td></tr>
						</c:if>
						<tr>
							<td height='100%' id='skin_td_tree' colspan=3 valign='top'>
								<div id='skin_container_tree' class='skin_container'>
								<c:if test="${empty editmode}">
								<app:overviewTree mailbox="${mailbox}" keys="${keys}" minical="${minical}" calendars="${calendars}" contacts="${contacts}" tasks="${tasks}" voice = "${voice}" tags="${tags}" searches="${searches}" folders="${folders}" editmode="${editmode}" date="${date}"/>
								</c:if>
								</div>
							</td>
						</tr>
						<tr>
							<td id='skin_td_tree_bottom_ad' style="padding-left:0px;" height=120>
								<iframe src="<c:url value='/h/overviewAds'/>" align="left" frameborder="0" marginheight="0" style="overflow:hidden;" scrolling="false" marginwidth="0" height="120" width="100%" >
								</iframe>
							</td>
						</tr>
					</table>
				</td>
				
				<td id='skin_td_tree_app_sash'><div class='ZVerticalSash'></div></td>
				</c:if>
				<td id='skin_td_app_outer'  colspan='${empty editmode ? 2 : 5}' style='padding-left:${editmode ? 5 : 0}px;width:100%;'>
					<table id='skin_app_table' class='skin_table fullSize' cellspacing=0 cellpadding=0>
						<tr>
							<td id='skin_td_app' valign="top"><div id='skin_container_app_main' class='skin_container' style='border-color:#C6C6C6;border-style:solid;border-width:0px 0px 0px 1px;'>
									 <jsp:doBody/>
							</div></td>
						</tr>
					</table>
				</td>
			</tr>
	
			<tr id='skin_tr_main_full' style='display:none'>
				<td id='skin_td_app_full_outer'  class='full_height' colspan='5' height='100%'>
					<table id='skin_app_full_table' class='skin_table fullSize' cellspacing=0 cellpadding=0>
						<tr>
							<td id='skin_full_toolbar_container' >
							  <!--div id='skin_container_app_top_toolbar' class='skin_container'></div-->
							</td>
						</tr>
						<tr><td id='skin_td_app_full'>
							<div id='skin_container_app_main_full' class='skin_container' height='100%'>
								&nbsp; <!--Full screen app-->
							</div>
						</td></tr>
					</table>
				</td>
			</tr>
			</table>
			</td>
			<jsp:include page="/h/sidebarads">
				<jsp:param name="selected" value="${selected}"></jsp:param>
			</jsp:include>
			</tr>
	
			<tr id='skin_R4'>
				<td id='skin_td_R4' class='ImgSkin_Chrome_R4' colspan="2">
					<table width=100% id='skin_table_R4' class='skin_table fullSize' cellspacing=0 cellpadding=0>
						<tr>
							<td style='text-align:left;padding-left:20px;'>&copy; 2007 Comcast Cable Communications</td>
							<td><a href="http://www.comcast.net/privacy/" target="_new">Privacy Statement</a></td>
							<td><a href="http://www.comcast.net/terms/" target="_new">Terms of Service</a></td>
							<td><a href="http://www.comcast.net/help/contact" target="_new">Contact Us</a></td>
							<td><a href="http://www.comcast.com/shop/buyflow/default.ashx" target="_new">Add Comcast Services</a></td>
							<td><a href="http://www.comcastsupport.com/sdcxuser/lachat/user/webmailfeedback.asp" target="_new">Tell Us What You Think</a></td>
							<td width=1 align=right><a href="http://www.comcast.net/" target="_new"><div class='ImgSkin_Customer_Logo_Bottom'></div></a></td>
						</tr>
					</table>
				</td>
			</tr>
	</table>
	</c:when>
<c:otherwise>
	<c:set value="/img" var="iconPath" scope="request"/>
	<table width="100%" cellpadding="0" cellspacing="0">
		<tr>
			<td class='TopContent' colspan="3"  align="right" valign="top"><div style='height:6px'></div></td>
		</tr>
	
		<tr>
			<td valign="top" align="center" class="Overview">
				<a href="<fmt:message key="logoURL"/>" target="_new">
					<span style='cursor:pointer; display: block;' class='ImgAppBanner'></span>
	
				</a>
			</td>
			<td valign="top" class="TopContent" style='width:70%'>
                <table cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td width="66%">
                            <app:appTop mailbox="${mailbox}" keys="${keys}" query="${empty context.query ? param.sq : context.query}" calendars="${calendars}" voice="${voice}" tasks="${tasks}"/>
                        </td>
                        <td width="33%">
                            <app:appTopYSearch keys="${keys}" />               
                        </td>
                    </tr>
                </table>
			</td>
			<td align="right" style="padding-right:5px;">
				<table cellpadding="2" cellspacing="0" >
					<tr>
						<td colspan=3 align='center' class='ZhAppSwitchLink'>
							<a href='<c:url value="/?client=advanced"/>'><fmt:message key="switchToAdvancedClient" /></a>
						</td>
					</tr>
					<tr>
						<td align="left" class="ZhAppLinks">
							<a target="_new" href="<c:url value="/bhelp/Zimbra_Basic_User_Help.htm"/>"><app:img altkey="ALT_APP_LINK_HELP" src="startup/ImgHelp.gif"  border="0"/>&nbsp;<fmt:message key="help"/></a>
						</td>
						<td>
							&nbsp;
						</td>
						<td align="right" class="ZhAppLinks">
							<a href="<c:url value="/?loginOp=logout"/>"><app:img altkey="ALT_APP_LINK_LOGOFF" src="startup/ImgLogoff.gif" border="0"/>&nbsp;<fmt:message key="logOut"/></a>
						</td>
					</tr>
				</table>
			</td>
		</tr>
		<tr>
			<td class="Overview">
				&nbsp;
			</td>
			<td align="center" colspan="3">
				<app:appStatus/>
			</td>
		</tr>
		<tr>
			<td class="Overview" style='padding-right:5px'>
				<app:appTopUser mailbox="${mailbox}" keys="${keys}" />
			</td>
			<%--  compose button
				<c:choose>
					<c:when test="${not empty context}">
						<zm:currentResultUrl var="composeUrl" value="/h/search" context="${context}" paction="${param.action}" action="compose"/>
					</c:when>
					<c:otherwise>
						<c:url var="composeUrl" value="/h/search?action=compose"/>
					</c:otherwise>
				</c:choose>
				<div class="SearchButton" style="padding:2px;" >
					<a  href="${fn:escapeXml(composeUrl)}" style="text-decoration:none;color:black;"><span id='tab_ikon_compose'><app:img src="startup/ImgNewMessage.gif" altkey='ALT_APP_COMPOSE'/></span> &nbsp; <span id='tab_ikon_compose'></span><span><fmt:message key="compose"/></span></a>
				</div
				--%>
			</td>
			<td id='skin_container_app_chooser_lite' colspan=2 valign="bottom" style='padding:0px'>
				<app:appTabs context="${context}" mailbox="${mailbox}" keys="${keys}" selected='${selected}'/>
			</td>
		</tr>
		<tr>
			<c:if test="${empty editmode}">
				<td valign="top" class="Overview">
					<app:overviewTree mailbox="${mailbox}" keys="${keys}" minical="${minical}" calendars="${calendars}" contacts="${contacts}" voice="${voice}" tasks="${tasks}" tags="${tags}" searches="${searches}" folders="${folders}" editmode="${editmode}" date="${date}"/>
				</td>
			</c:if>
			<c:set var="adsOn" value="${!empty ads}"/>
	<c:if test="${adsOn}" >
			<td valign="top" colspan="3">
				<table width="100%" cellpadding="0" cellspacing="0">
					<tr>
	</c:if>
			<td valign="top" colspan="${empty editmode ? 3 : 4}" style="padding-left:${editmode ? 10 : 0}px">
			<jsp:doBody/>
		</td>
		<c:if test="${adsOn}" >
							<td valign="top" style="border-top: 1px solid #98adbe; width: 180px;">
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
	
</c:otherwise>
</c:choose>
</body>
</html>
