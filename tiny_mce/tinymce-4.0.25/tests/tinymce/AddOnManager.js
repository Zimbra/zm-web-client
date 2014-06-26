/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an "AS IS" basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2014 Zimbra, Inc. All Rights Reserved. 
 * ***** END LICENSE BLOCK *****
 */
module("tinymce.AddOnManager", {
	teardown: function() {
		Utils.unpatch(tinymce.dom.ScriptLoader.ScriptLoader);
		tinymce.AddOnManager.languageLoad = true;
		tinymce.AddOnManager.language = 'en';
	}
});

test('requireLangPack', function() {
	var languagePackUrl;

	Utils.patch(tinymce.dom.ScriptLoader.ScriptLoader, 'add', function(origFunc, url) {
		languagePackUrl = url;
	});

	function getLanguagePackUrl(language, languages) {
		languagePackUrl = null;
		tinymce.AddOnManager.language = language;
		tinymce.AddOnManager.PluginManager.requireLangPack('plugin', languages);
		return languagePackUrl;
	}

	tinymce.AddOnManager.PluginManager.urls.plugin = '/root';

	equal(getLanguagePackUrl('sv_SE'), '/root/langs/sv_SE.js');
	equal(getLanguagePackUrl('sv_SE', 'sv,en,us'), '/root/langs/sv.js');
	equal(getLanguagePackUrl('sv_SE', 'sv_SE,en_US'), '/root/langs/sv_SE.js');
	equal(getLanguagePackUrl('sv'), '/root/langs/sv.js');
	equal(getLanguagePackUrl('sv', 'sv'), '/root/langs/sv.js');
	equal(getLanguagePackUrl('sv', 'sv,en,us'), '/root/langs/sv.js');
	equal(getLanguagePackUrl('sv', 'en,sv,us'), '/root/langs/sv.js');
	equal(getLanguagePackUrl('sv', 'en,us,sv'), '/root/langs/sv.js');
	strictEqual(getLanguagePackUrl('sv', 'en,us'), null);
	strictEqual(getLanguagePackUrl(null, 'en,us'), null);
	strictEqual(getLanguagePackUrl(null), null);

	tinymce.AddOnManager.languageLoad = false;
	strictEqual(getLanguagePackUrl('sv', 'sv'), null);
});
