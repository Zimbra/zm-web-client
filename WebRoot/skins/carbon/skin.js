/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010 Zimbra, Inc.
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
//
// Skin class
//
function CarbonSkin() {
    BaseSkin.call(this);
    this.hints.toast = { location: "C", 
		transitions: [
				{ type: "fade-in", step: 5, duration: 50 },
                { type: "pause", duration: 5000 },
                { type: "fade-out", step: -10, duration: 500 }
			] 
		};
}
CarbonSkin.prototype = new BaseSkin;
CarbonSkin.prototype.constructor = CarbonSkin;

//
// Skin instance
//

window.skin = new CarbonSkin();
