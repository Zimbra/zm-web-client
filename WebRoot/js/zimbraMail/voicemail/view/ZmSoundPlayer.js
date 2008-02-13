/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */


/**
 * This class represents a widget that plays sounds.
 *
 * @param parent	{DwtControl} Parent widget (required)
 * @param voicemail	{ZmVoicemail} The voicemail this player is showing
 * @param className {string} CSS class. If not provided defaults to the class name (optional)
 * @param positionType {string} Positioning style (absolute, static, or relative). If
 * 		not provided defaults to DwtControl.STATIC_STYLE (optional)
 */
ZmSoundPlayer = function(parent, voicemail, className, posStyle) {
	if (arguments.length == 0) return;
	className = className || "ZmSoundPlayer";
	DwtComposite.call(this, {parent:parent, className:className, posStyle:posStyle});

	this.voicemail = voicemail;
	this._isCompact = false;
	this._playButton = null;
	this._pauseButton = null;
	this._timeSlider = null;

	this._pluginMissing = DwtSoundPlugin.isPluginMissing();
    this._isScriptable = !DwtSoundPlugin.isScriptingBroken();
	this._createHtml();
	
	this._pluginChangeListenerObj = new AjxListener(this, this._pluginChangeListener);
};

ZmSoundPlayer.prototype = new DwtComposite;
ZmSoundPlayer.prototype.constructor = ZmSoundPlayer;

ZmSoundPlayer.prototype.toString =
function() {
	return "ZmSoundPlayer";
};

ZmSoundPlayer.COMPACT_EVENT = "Compact"
ZmSoundPlayer.HELP_EVENT = "Help"

ZmSoundPlayer._PLAYING	= "Playing";
ZmSoundPlayer._PAUSED	= "Paused";
ZmSoundPlayer._NONE 	= "None";

/**
 * Plays the currently loaded sound.
 */
ZmSoundPlayer.prototype.play =
function() {
	if (this._pluginMissing) {
		// Fire help event.
		if (this.isListenerRegistered(ZmSoundPlayer.HELP_EVENT)) {
			if (!this._helpEvent) {
				this._helpEvent = new DwtEvent(true);
				this._helpEvent.dwtObj = this;
			}
		    this.notifyListeners(ZmSoundPlayer.HELP_EVENT, this._helpEvent);
		}
	} else if (this._isScriptable) {
		this.setCompact(false);
		if (this._soundPlugin) {
			this._soundPlugin.play();
		} else {
			// Will start playing automatically.
			this._getPlugin();
		}
		this._setPlayState(ZmSoundPlayer._PLAYING);
	} else {
		this.setCompact(!this._isCompact);
	}

	// Select this row in the parent view.
	if (this.parent instanceof DwtListView) {
		this.parent.setSelection(this.voicemail);
	}
};

/**
 * Pauses the currently loaded sound.
 */
ZmSoundPlayer.prototype.pause =
function() {
	if (this._soundPlugin && this._isScriptable) {
		this._soundPlugin.pause();
		this._setPlayState(ZmSoundPlayer._PAUSED);
	}
};


/**
 * Stops the currently loaded sound.
 */
ZmSoundPlayer.prototype.stop =
function() {
	if (this._soundPlugin) {
		if (this._isScriptable) {
			this._soundPlugin.pause();
			this._setPlayState(ZmSoundPlayer._NONE);
			this._soundPlugin.rewind();
			this._timeSlider.setValue(this._timeSlider.getMinimum());
		} else {
			this._soundPlugin.dispose();
			this._soundPlugin = null;
		}
	}
};

/**
 * Sets the compactness of the player.
 *
 * @param compact if true, then only the play button is displayed
 */
ZmSoundPlayer.prototype.setCompact =
function(compact) {
	if (compact != this._isCompact) {
		// Set visiblity.
		if (this._isScriptable) {
			this._timeSlider.setVisible(!compact);
			this._pauseButton.setVisible(!compact);
		} else {
			if (compact) {
				if (this._soundPlugin) {
					this._soundPlugin.dispose();
					this._soundPlugin = null;
				}
			} else {
				this._getPlugin();
			}
			this._playButton.setSelected(!compact);
		}
		this._isCompact = compact;

		// Update status.
		this._setStatus(0);

		// Fire event.
		if (this.isListenerRegistered(ZmSoundPlayer.COMPACT_EVENT)) {
			if (!this._compactEvent) {
				this._compactEvent = new DwtEvent(true);
				this._compactEvent.dwtObj = this;
			}
			this._compactEvent.isCompact = compact;
		    this.notifyListeners(ZmSoundPlayer.COMPACT_EVENT, this._compactEvent);
		}
	}
};

/**
 * Returns true if the sound plugin is missing.
 */
ZmSoundPlayer.prototype.isPluginMissing =
function() {
	return this._pluginMissing;
};

ZmSoundPlayer.prototype.addHelpListener =
function(listener) {
    this.addListener(ZmSoundPlayer.HELP_EVENT, listener);
};

ZmSoundPlayer.prototype.addChangeListener =
function(listener) {
    this.addListener(DwtEvent.ONCHANGE, listener);
};

ZmSoundPlayer.prototype.addCompactListener =
function(listener) {
    this.addListener(ZmSoundPlayer.COMPACT_EVENT, listener);
};

/**
* Sets the enabled/disabled state of the player.
*
* @param enabled	whether to enable the player
*
*/
ZmSoundPlayer.prototype.setEnabled =
function(enabled) {
	if (enabled != this.getEnabled()) {
		DwtComposite.prototype.setEnabled.call(this, enabled);
		if (!this._pluginMissing) {
			this._playButton.setEnabled(enabled);
			this._pauseButton.setEnabled(enabled);
			this._timeSlider.setEnabled(enabled);
		}
	}
};

ZmSoundPlayer.prototype.dispose =
function() {
	if (this._soundPlugin) {
		this._soundPlugin.dispose();
	}
	DwtControl.prototype.dispose.call(this);
};

ZmSoundPlayer.prototype._setPlayState =
function(state) {
	if (this._isScriptable) {
		this._playButton.setSelected(state == ZmSoundPlayer._PLAYING);
		this._pauseButton.setSelected(state == ZmSoundPlayer._PAUSED);
	}
};

ZmSoundPlayer.prototype._setStatus =
function(time) {
	if (!this._durationStr) {
		this._durationStr = AjxDateUtil.computeDuration(this.voicemail.duration, true);
	}
	var status;
	if (this._isCompact || !this._isScriptable) {
		status = this._durationStr;
	} else {
		status = AjxDateUtil.computeDuration(time, true) + " / " + this._durationStr;
	}
	document.getElementById(this._statusId).innerHTML = status;
};

ZmSoundPlayer.prototype._timeSliderListener =
function(event) {
	if (this._soundPlugin) {
		var value = this._timeSlider.getValue();
		if (!this._timeSlider.isDragging()) {
			this._soundPlugin.setTime(value);
		}
		this._setStatus(value);
	}
};

ZmSoundPlayer.prototype._pluginChangeListener =
function(event) {
	if (event.status != DwtSoundPlugin.ERROR) {
		if (this._timeSlider && !this._timeSlider.isDragging()) {
			if (event.duration != this._timeSlider.getMaximum()) {
				this._timeSlider.setRange(0, event.duration, event.time);
			} else if (event.status != DwtSoundPlugin.ERROR) {
				this._timeSlider.setValue(event.time);
			}
			this._setStatus(event.time);
		}
		if (event.finished) {
			this._setPlayState(ZmSoundPlayer._NONE);
		}
	}
	this.notifyListeners(DwtEvent.ONCHANGE, event);
};

ZmSoundPlayer.prototype._getPlugin =
function() {
	if (this._pluginMissing) {
		return;
	}
	if (!this._soundPlugin) {
		var args = {
			parent: this._isScriptable ? this.shell : this,
			width: 200,
			height: 16,
			offscreen: this._isScriptable, 
			positionType: DwtControl.RELATIVE_STYLE,
			url: this.voicemail.soundUrl,
			volume: DwtSoundPlugin.MAX_VOLUME
		};
		this._soundPlugin = DwtSoundPlugin.create(args);
		this._soundPlugin.addChangeListener(this._pluginChangeListenerObj);
		if (!this._isScriptable) {
			this._soundPlugin.reparentHtmlElement(this._htmlElId + "_player");
		}
	}
	return this._soundPlugin;
};

ZmSoundPlayer.prototype._createHtml =
function() {
	var element = this.getHtmlElement();
    var id = this._htmlElId;
    var template = this._isScriptable ? 
    	"voicemail.Voicemail#ZmSoundPlayer" : 
    	"voicemail.Voicemail#ZmSoundPlayerNoScript";

    element.innerHTML = AjxTemplate.expand(template, id);
	this._playButton = new DwtBorderlessButton({parent:this});
	this._playButton.replaceElement(id + "_play");
	this._playButton.setImage("Play");
	this._playButton.setToolTipContent(ZmMsg.play);
	this._playButton.addSelectionListener(new AjxListener(this, this.play));

    if (this._isScriptable) {
		this._pauseButton = new DwtBorderlessButton({parent:this});
		this._pauseButton.replaceElement(id + "_pause");
		this._pauseButton.setImage("Pause");
		this._pauseButton.setToolTipContent(ZmMsg.pause);
		this._pauseButton.addSelectionListener(new AjxListener(this, this.pause));
	
		this._statusId = id + "_status";
	
		this._timeSlider = new DwtSlider(this, null, null, Dwt.RELATIVE_STYLE);
		this._timeSlider.replaceElement(id + "_postition");
		this._timeSlider.addChangeListener(new AjxListener(this, this._timeSliderListener));
    } else {
		this._statusId = id + "_status";
    }
	this.setCompact(true);
	this.setSize(1, Dwt.DEFAULT); // Allows mouse events to go to parent control.
};


