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
 * Factory.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

/**
 * This class is a factory for control instances. This enables you
 * to create instances of controls without having to require the UI controls directly.
 *
 * It also allow you to override or add new control types.
 *
 * @class tinymce.ui.Factory
 */
define("tinymce/ui/Factory", [], function() {
	"use strict";

	var types = {}, namespaceInit;

	return {
		/**
		 * Adds a new control instance type to the factory.
		 *
		 * @method add
		 * @param {String} type Type name for example "button".
		 * @param {function} typeClass Class type function.
		 */
		add: function(type, typeClass) {
			types[type.toLowerCase()] = typeClass;
		},

		/**
		 * Returns true/false if the specified type exists or not.
		 *
		 * @method has
		 * @param {String} type Type to look for.
		 * @return {Boolean} true/false if the control by name exists.
		 */
		has: function(type) {
			return !!types[type.toLowerCase()];
		},

		/**
		 * Creates a new control instance based on the settings provided. The instance created will be
		 * based on the specified type property it can also create whole structures of components out of
		 * the specified JSON object.
		 *
		 * @example
		 * tinymce.ui.Factory.create({
		 *     type: 'button',
		 *     text: 'Hello world!'
		 * });
		 *
		 * @method create
		 * @param {Object/String} settings Name/Value object with items used to create the type.
		 * @return {tinymce.ui.Control} Control instance based on the specified type.
		 */
		create: function(type, settings) {
			var ControlType, name, namespace;

			// Build type lookup
			if (!namespaceInit) {
				namespace = tinymce.ui;

				for (name in namespace) {
					types[name.toLowerCase()] = namespace[name];
				}

				namespaceInit = true;
			}

			// If string is specified then use it as the type
			if (typeof(type) == 'string') {
				settings = settings || {};
				settings.type = type;
			} else {
				settings = type;
				type = settings.type;
			}

			// Find control type
			type = type.toLowerCase();
			ControlType = types[type];

			// #if debug

			if (!ControlType) {
				throw new Error("Could not find control by type: " + type);
			}

			// #endif

			ControlType = new ControlType(settings);
			ControlType.type = type; // Set the type on the instance, this will be used by the Selector engine

			return ControlType;
		}
	};
});