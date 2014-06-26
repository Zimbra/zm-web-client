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
 * EventDispatcher.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class lets you add/remove and fire events by name on the specified scope. This makes
 * it easy to add event listener logic to any class.
 *
 * @class tinymce.util.EventDispatcher
 * @example
 *  var eventDispatcher = new EventDispatcher();
 *
 *  eventDispatcher.on('click', function() {console.log('data');});
 *  eventDispatcher.fire('click', {data: 123});
 */
define("tinymce/util/EventDispatcher", [
	"tinymce/util/Tools"
], function(Tools) {
	var nativeEvents = Tools.makeMap(
		"focus blur focusin focusout click dblclick mousedown mouseup mousemove mouseover beforepaste paste cut copy selectionchange " +
		"mouseout mouseenter mouseleave wheel keydown keypress keyup input contextmenu dragstart dragend dragover " +
		"draggesture dragdrop drop drag submit",
		' '
	);

	function Dispatcher(settings) {
		var self = this, scope, bindings = {}, toggleEvent;

		function returnFalse() {
			return false;
		}

		function returnTrue() {
			return true;
		}

		settings = settings || {};
		scope = settings.scope || self;
		toggleEvent = settings.toggleEvent || returnFalse;

		/**
		 * Fires the specified event by name.
		 *
		 * @method fire
		 * @param {String} name Name of the event to fire.
		 * @param {Object?} args Event arguments.
		 * @return {Object} Event args instance passed in.
		 * @example
		 * instance.fire('event', {...});
		 */
		function fire(name, args) {
			var handlers, i, l, callback;

			name = name.toLowerCase();
			args = args || {};
			args.type = name;

			// Setup target is there isn't one
			if (!args.target) {
				args.target = scope;
			}

			// Add event delegation methods if they are missing
			if (!args.preventDefault) {
				// Add preventDefault method
				args.preventDefault = function() {
					args.isDefaultPrevented = returnTrue;
				};

				// Add stopPropagation
				args.stopPropagation = function() {
					args.isPropagationStopped = returnTrue;
				};

				// Add stopImmediatePropagation
				args.stopImmediatePropagation = function() {
					args.isImmediatePropagationStopped = returnTrue;
				};

				// Add event delegation states
				args.isDefaultPrevented = returnFalse;
				args.isPropagationStopped = returnFalse;
				args.isImmediatePropagationStopped = returnFalse;
			}

			if (settings.beforeFire) {
				settings.beforeFire(args);
			}

			handlers = bindings[name];
			if (handlers) {
				for (i = 0, l = handlers.length; i < l; i++) {
					handlers[i] = callback = handlers[i];

					// Stop immediate propagation if needed
					if (args.isImmediatePropagationStopped()) {
						args.stopPropagation();
						return args;
					}

					// If callback returns false then prevent default and stop all propagation
					if (callback.call(scope, args) === false) {
						args.preventDefault();
						return args;
					}
				}
			}

			return args;
		}

		/**
		 * Binds an event listener to a specific event by name.
		 *
		 * @method on
		 * @param {String} name Event name or space separated list of events to bind.
		 * @param {callback} callback Callback to be executed when the event occurs.
		 * @param {Boolean} first Optional flag if the event should be prepended. Use this with care.
		 * @return {Object} Current class instance.
		 * @example
		 * instance.on('event', function(e) {
		 *     // Callback logic
		 * });
		 */
		function on(name, callback, prepend) {
			var handlers, names, i;

			if (callback === false) {
				callback = returnFalse;
			}

			if (callback) {
				names = name.toLowerCase().split(' ');
				i = names.length;
				while (i--) {
					name = names[i];
					handlers = bindings[name];
					if (!handlers) {
						handlers = bindings[name] = [];
						toggleEvent(name, true);
					}

					if (prepend) {
						handlers.unshift(callback);
					} else {
						handlers.push(callback);
					}
				}
			}

			return self;
		}

		/**
		 * Unbinds an event listener to a specific event by name.
		 *
		 * @method off
		 * @param {String?} name Name of the event to unbind.
		 * @param {callback?} callback Callback to unbind.
		 * @return {Object} Current class instance.
		 * @example
		 * // Unbind specific callback
		 * instance.off('event', handler);
		 *
		 * // Unbind all listeners by name
		 * instance.off('event');
		 *
		 * // Unbind all events
		 * instance.off();
		 */
		function off(name, callback) {
			var i, handlers, bindingName, names, hi;

			if (name) {
				names = name.toLowerCase().split(' ');
				i = names.length;
				while (i--) {
					name = names[i];
					handlers = bindings[name];

					// Unbind all handlers
					if (!name) {
						for (bindingName in bindings) {
							toggleEvent(bindingName, false);
							delete bindings[bindingName];
						}

						return self;
					}

					if (handlers) {
						// Unbind all by name
						if (!callback) {
							handlers.length = 0;
						} else {
							// Unbind specific ones
							hi = handlers.length;
							while (hi--) {
								if (handlers[hi] === callback) {
									handlers.splice(hi, 1);
								}
							}
						}

						if (!handlers.length) {
							toggleEvent(name, false);
							delete bindings[name];
						}
					}
				}
			} else {
				for (name in bindings) {
					toggleEvent(name, false);
				}

				bindings = {};
			}

			return self;
		}

		/**
		 * Returns true/false if the dispatcher has a event of the specified name.
		 *
		 * @method has
		 * @param {String} name Name of the event to check for.
		 * @return {Boolean} true/false if the event exists or not.
		 */
		function has(name) {
			name = name.toLowerCase();
			return !(!bindings[name] || bindings[name].length === 0);
		}

		// Expose
		self.fire = fire;
		self.on = on;
		self.off = off;
		self.has = has;
	}

	/**
	 * Returns true/false if the specified event name is a native browser event or not.
	 *
	 * @method isNative
	 * @param {String} name Name to check if it's native.
	 * @return {Boolean} true/false if the event is native or not.
	 * @static
	 */
	Dispatcher.isNative = function(name) {
		return !!nativeEvents[name.toLowerCase()];
	};

	return Dispatcher;
});