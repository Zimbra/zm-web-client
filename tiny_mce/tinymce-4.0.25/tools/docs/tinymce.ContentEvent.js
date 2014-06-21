/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the “License”);
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an “AS IS” basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2014 Zimbra, Inc. All Rights Reserved. 
 * 
 * ***** END LICENSE BLOCK *****
 */
/**
 * This class is the event object send when the content events occurs such as GetContent/SetContent.
 *
 * @class tinymce.ContentEvent
 * @extends tinymce.Event
 * @example
 * tinymce.activeEditor.on('GetContent', function(e) {
 *     console.log(e.content);
 * });
 */

/**
 * Optional state gets added for the load event then it's set to true.
 *
 * @property {Boolean} load
 */

/**
 * Optional state gets added for the save event then it's set to true.
 *
 * @property {Boolean} save
 */

/**
 * Optional state gets added for the getContent event then it's set to true.
 *
 * @property {Boolean} set
 */

/**
 * Optional state gets added for the setContent event then it's set to true.
 *
 * @property {Boolean} get
 */

/**
 * Optional element that the load/save event is for. This element is the textarea/div element that the
 * contents gets parsed from or serialized to.
 *
 * @property {DOMElement} element
 */

/**
 * Editor contents to be set or the content that was returned from the editor.
 *
 * @property {String} content HTML contents from the editor or to be put into the editor.
 */

/**
 * Format of the contents normally "html".
 *
 * @property {String} format Format of the contents normally "html".
 */
