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
 * Class.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 * This utilitiy class is used for easier inheritage.
 *
 * Features:
 * * Exposed super functions: this._super();
 * * Mixins
 * * Dummy functions
 * * Property functions: var value = object.value(); and object.value(newValue);
 * * Static functions
 * * Defaults settings
 */
define("tinymce/util/Class", [
	"tinymce/util/Tools"
], function(Tools) {
	var each = Tools.each, extend = Tools.extend;

	var extendClass, initializing;

	function Class() {
	}

	// Provides classical inheritance, based on code made by John Resig
	Class.extend = extendClass = function(prop) {
		var self = this, _super = self.prototype, prototype, name, member;

		// The dummy class constructor
		function Class() {
			var i, mixins, mixin, self = this;

			// All construction is actually done in the init method
			if (!initializing) {
				// Run class constuctor
				if (self.init) {
					self.init.apply(self, arguments);
				}

				// Run mixin constructors
				mixins = self.Mixins;
				if (mixins) {
					i = mixins.length;
					while (i--) {
						mixin = mixins[i];
						if (mixin.init) {
							mixin.init.apply(self, arguments);
						}
					}
				}
			}
		}

		// Dummy function, needs to be extended in order to provide functionality
		function dummy() {
			return this;
		}

		// Creates a overloaded method for the class
		// this enables you to use this._super(); to call the super function
		function createMethod(name, fn) {
			return function(){
				var self = this, tmp = self._super, ret;

				self._super = _super[name];
				ret = fn.apply(self, arguments);
				self._super = tmp;

				return ret;
			};
		}

		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		
		/*eslint new-cap:0 */
		prototype = new self();
		initializing = false;

		// Add mixins
		if (prop.Mixins) {
			each(prop.Mixins, function(mixin) {
				mixin = mixin;

				for (var name in mixin) {
					if (name !== "init") {
						prop[name] = mixin[name];
					}
				}
			});

			if (_super.Mixins) {
				prop.Mixins = _super.Mixins.concat(prop.Mixins);
			}
		}

		// Generate dummy methods
		if (prop.Methods) {
			each(prop.Methods.split(','), function(name) {
				prop[name] = dummy;
			});
		}

		// Generate property methods
		if (prop.Properties) {
			each(prop.Properties.split(','), function(name) {
				var fieldName = '_' + name;

				prop[name] = function(value) {
					var self = this, undef;

					// Set value
					if (value !== undef) {
						self[fieldName] = value;

						return self;
					}

					// Get value
					return self[fieldName];
				};
			});
		}

		// Static functions
		if (prop.Statics) {
			each(prop.Statics, function(func, name) {
				Class[name] = func;
			});
		}

		// Default settings
		if (prop.Defaults && _super.Defaults) {
			prop.Defaults = extend({}, _super.Defaults, prop.Defaults);
		}

		// Copy the properties over onto the new prototype
		for (name in prop) {
			member = prop[name];

			if (typeof member == "function" && _super[name]) {
				prototype[name] = createMethod(name, member);
			} else {
				prototype[name] = member;
			}
		}

		// Populate our constructed prototype object
		Class.prototype = prototype;

		// Enforce the constructor to be what we expect
		Class.constructor = Class;

		// And make this class extendible
		Class.extend = extendClass;

		return Class;
	};

	return Class;
});