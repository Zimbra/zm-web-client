/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 VMware, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * This class loads and stores templates. The templates are defined in a text file, and each
 * template is surrounded by a tag that identifies it:
 *
 * <template id='MyTemplate'>
 *     <div>Hello {firstName}!</div>
 * </template>
 *
 * The template above would then be available as ZCS.template.MyTemplate
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.common.ZtTemplate', {

	singleton: true,

	alternateClassName: 'ZCS.template',

	loadTemplates: function(callback) {
		Ext.Ajax.request({
			url: '/t/resources/templates/zcs.tpl',
			async: false,
			success: function(response){
				var text = response.responseText,
					lines = text.split('\n'),
					m, curId;

				Ext.each(lines, function(line) {
					line = Ext.String.trim(line);
					if (line && (line.indexOf('#') !== 0)) {
						if (line.indexOf('<template ') === 0) {
							m = line.match(/^<template id=['"](\w+)['"]/);
							if (m[1]) {
								curId = m[1];
								ZCS.template[curId] = '';
							}
						}
						else if (line === '</template>') {
							curId = null;
						}
						else if (curId) {
							ZCS.template[curId] += line + '\n';
						}
					}
				});

				if (callback) {
					callback();
				}
			}
		});
	}
});
