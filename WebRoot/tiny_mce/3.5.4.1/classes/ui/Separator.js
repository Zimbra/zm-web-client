/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2012, 2013 Zimbra Software, LLC.
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
 * Separator.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class is used to create vertical separator between other controls.
 *
 * @class tinymce.ui.Separator
 * @extends tinymce.ui.Control
 */
tinymce.create('tinymce.ui.Separator:tinymce.ui.Control', {
	/**
	 * Separator constructor.
	 *
	 * @constructor
	 * @method Separator
	 * @param {String} id Control id to use for the Separator.
	 * @param {Object} s Optional name/value settings object.
	 */
	Separator : function(id, s) {
		this.parent(id, s);
		this.classPrefix = 'mceSeparator';
		this.setDisabled(true);
	},

	/**
	 * Renders the separator as a HTML string. This method is much faster than using the DOM and when
	 * creating a whole toolbar with buttons it does make a lot of difference.
	 *
	 * @method renderHTML
	 * @return {String} HTML for the separator control element.
	 */
	renderHTML : function() {
		return tinymce.DOM.createHTML('span', {'class' : this.classPrefix, role : 'separator', 'aria-orientation' : 'vertical', tabindex : '-1'});
	}
});
