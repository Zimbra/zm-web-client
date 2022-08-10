<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" class="js">

<head>
<meta content="text/html; charset=utf-8" http-equiv="Content-Type">
<link href="./images/favicon.ico" rel="shortcut icon">
<title>Zimlet JavaScript API : Change Log</title>
<link href="./master.css" media="all" rel="stylesheet" type="text/css">
</head>

<body>

<div class="super-nav">
	<div class="container">
		<ul>
			<li><a href="http://www.zimbra.com">zimbra.com</a></li>
			<li><a href="http://wiki.zimbra.com">wiki</a></li>
			<li><a href="http://www.zimbra.com/forums">forums</a></li>
			<li><a href="http://gallery.zimbra.com">gallery</a></li>
			<li class="last"><a href="http://www.zimbrablog.com">blog</a></li>
		</ul>
	</div>
</div>

<div class="wrap">

	<div class="container header">
		<img src="./images/logo.png" width="168" height="40" border="0" alt="Zimbra" title="Zimbra">
		<h2>ZCS ${comparison.buildVersion} : Zimlet JavaScript API : Change Log</h2>
	</div>

	<div class="content-wrap">
	<p>
	<b>Current:</b> ${comparison.buildVersion} (${comparison.buildDate})
	<br />
	<b>Baseline:</b> ${baseline.buildVersion} (${baseline.buildDate})
	</p>
		<h3>Classes Added</h3>
		<div style="padding-left:25px">
		<ul>
			<#if addedClasses?size == 0>
				<li>None</li>
			</#if>
			<#list addedClasses as class>
				<li><a href="http://files.zimbra.com/docs/zimlet/zcs/${comparison.buildVersion}/jsdocs/symbols/${class.name}.html">${class.fullName}</a></li>
			</#list>
		</ul>
		</div>
		<h3>Classes Removed</h3>	
		<div style="padding-left:25px">
		<ul>
			<#if removedClasses?size == 0>
				<li>None</li>
			</#if>
			<#list removedClasses as class>
				<li><a href="http://files.zimbra.com/docs/zimlet/zcs/${baseline.buildVersion}/jsdocs/symbols/${class.name}.html">${class.fullName}</a></li>
			</#list>
		</ul>
		</div>
		<h3>Classes Modified</h3>	
		<div style="padding-left:25px">
			<#if modifiedClasses?size == 0>
				<ul>
					<li>None</li>
				</ul>
			</#if>
			<#list modifiedClasses as modifiedClass>
				<ul>
					<li>
						<h4><a href="http://files.zimbra.com/docs/zimlet/zcs/${comparison.buildVersion}/jsdocs/symbols/${modifiedClass.name}.html">${modifiedClass.fullName}</a></h4>
						<div style="padding-left:25px">
						<ul>
							<li><b>PROPERTIES ADDED</b>
								<ul style="padding-left:15px">
								<#if modifiedClass.addedProperties?size == 0>
									<li>None</li>
								</#if>
								<#list modifiedClass.addedProperties as prop>
									<li>${prop.name}</li>
								</#list>
								</ul>
							</li>
							<li><b>PROPERTIES REMOVED</b>
								<ul style="padding-left:15px">
								<#if modifiedClass.removedProperties?size == 0>
									<li>None</li>
								</#if>
								<#list modifiedClass.removedProperties as prop>
									<li>${prop.name}</li>
								</#list>
								</ul>
							</li>
							<li><b>METHODS ADDED</b>
								<ul style="padding-left:15px">
								<#if modifiedClass.addedMethods?size == 0>
									<li>None</li>
								</#if>
								<#list modifiedClass.addedMethods as method>
									<li><i>${method.name}</i></li>
								</#list>
								</ul>
							</li>
							<li><b>METHODS REMOVED</b>
								<ul style="padding-left:15px">
								<#if modifiedClass.removedMethods?size == 0>
									<li>None</li>
								</#if>
								<#list modifiedClass.removedMethods as method>
									<li><i>${method.name}</i></li>
								</#list>
								</ul>
							</li>
							<li><b>METHODS CHANGED</b>
								<ul style="padding-left:15px">
								<#if modifiedClass.changedMethods?size == 0>
									<li>None</li>
								</#if>
								<#list modifiedClass.changedMethods as method>
									<li>
										<i>${method.name}</i>
										<ul style="padding-left:15px">
										<li>Baseline Signature: <i>${method.name}${method.previousSignature}</i></li>
										<li>New Signature: <i>${method.name}${method.newSignature}</i></li>
										</ul>
									</li>
								</#list>
								</ul>
							</li>
						</ul>
					</li>
				</ul>
			</#list>
		</div>
	</div>
</div>

<div class="container footer">
	<div class="span-12">
		<p>Copyright (C) 2010, 2014, 2016, 2017 Synacor, Inc. All rights reserved</p>
	</div>
	<div class="span-12 last right">
		<p><a href="http://www.zimbra.com/forums/">Forums</a> | <a href="http://www.zimbra.com/about/">About</a> | <a href="http://www.zimbra.com/legal.html#copyright">Copyright</a> | <a href="http://www.zimbra.com/privacy.html">Privacy</a> | <a href="http://www.zimbra.com/license/">License</a> | <a href="http://www.zimbra.com/legal.html">Trademarks</a></p>
	</div>
</div>
</body
></html>