/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite, Network Edition.
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.  All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */
//
// Skin class
//
function CarbonSkin() {
    BaseSkin.call(this);
    this.hints.toast = { location: "N", 
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