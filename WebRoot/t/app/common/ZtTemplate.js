/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
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

	requires: [
		'Ext.Ajax'
	],

	alternateClassName: 'ZCS.template',

	loadTemplates: function(callback) {
		Ext.Ajax.request({
			url: 'resources/templates/zcs.tpl',
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
	},

	/**
	 * Creates a template and adds a function to it that can be used to include another template.
	 *
	 * @param {String}  tplName     name of template
	 * @returns {Ext.XTemplate}
	 */
	createNestableTemplate: function(tplName) {
		return Ext.create('Ext.XTemplate', ZCS.template[tplName], {
			includeTpl: function(tpl, values) {
				tpl = Ext.isString(tpl) ? Ext.create('Ext.XTemplate', ZCS.template[tpl]) : tpl;
				return tpl.apply(values);
			}
		});
	}
}, function () {
	ZCS.common.ZtTemplate.loadTemplates();
});
