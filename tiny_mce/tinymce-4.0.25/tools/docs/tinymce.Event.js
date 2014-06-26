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
/**
 * This is the base class for all TinyMCE events.
 *
 * @class tinymce.Event
 */

/**
 * Prevents the default action of an event to be executed.
 *
 * @method preventDefault
 */

/**
 * Prevents the default action of an event to be executed.
 *
 * @method preventDefault
 */

/**
 * Stops the event from propagating up to listeners on parent objects.
 *
 * @method stopPropagation
 */

/**
 * Prevents the event from propagating to listeners on the same object.
 *
 * @method stopImmediatePropagation
 */

/**
 * Returns true/false if the default action is to be prevented or not.
 *
 * @method isDefaultPrevented
 * @return {Boolean} True/false if the event is to be execured or not.
 */

/**
 * Returns true/false if the event propagation is stopped or not.
 *
 * @method isPropagationStopped
 * @return {Boolean} True/false if the event propagation is stopped or not.
 */

/**
 * Returns true/false if the event immediate propagation is stopped or not.
 *
 * @method isImmediatePropagationStopped
 * @return {Boolean} True/false if the event immediate propagation is stopped or not.
 */

/**
 * The event type name for example "click".
 *
 * @property {String} type
 */

/**
 * @include tinymce.ContentEvent.js
 * @include tinymce.CommandEvent.js
 * @include tinymce.ProgressStateEvent.js
 * @include tinymce.FocusEvent.js
 * @include tinymce.ResizeEvent.js
 */
