/*
 * Copyright (C) 2006, The Apache Software Foundation.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
function ZmSoundPlayer(parent, voicemail, className, positionType) {
	if (arguments.length == 0) return;
	className = className || "ZmSoundPlayer";
	DwtComposite.call(this, parent, className, positionType);

	this.voicemail = voicemail;
	this._isCompact = false;
	this._playButton = null;
	this._pauseButton = null;
	this._timeSlider = null;
	this._volumeButton = null;

	this._pluginMissing = DwtSoundPlugin.isPluginMissing();
	if (this._pluginMissing) {
		this._createMissingHtml();
	} else {
		this._createHtml();
	}
	this._volume = DwtSoundPlugin.MAX_VOLUME;
	
	this._pluginChangeListenerObj = new AjxListener(this, this._pluginChangeListener);
};

ZmSoundPlayer.prototype = new DwtComposite;
ZmSoundPlayer.prototype.constructor = ZmSoundPlayer;

ZmSoundPlayer.prototype.toString =
function() {
	return "ZmSoundPlayer";
};

ZmSoundPlayer.COMPACT_EVENT = "Compact"

/**
 * Plays the currently loaded sound.
 */
ZmSoundPlayer.prototype.play =
function() {
	this.setCompact(false);
	if (this._soundPlugin) {
		this._soundPlugin.play();
	} else {
		// Will start playing automatically.
		this._getPlugin();
	}
};

/**
 * Pauses the currently loaded sound.
 */
ZmSoundPlayer.prototype.pause =
function() {
	if (this._soundPlugin) {
		this._soundPlugin.pause();
	}
};

/**
 * Rewinds the currently loaded sound to the beginning.
 */
ZmSoundPlayer.prototype.rewind =
function() {
	if (this._soundPlugin) {
		this._soundPlugin.rewind();
		this._timeSlider.setValue(this._timeSlider.getMinimum());
	}
};

/**
 * Adjusts the volume of the player.
 *
 * @param volume the volume on a scale of 0 - DwtSoundPlugin.MAX_VOLUME.
 */
ZmSoundPlayer.prototype.setVolume =
function(volume) {
	if (this._soundPlugin) {
		this._soundPlugin.setVolume(volume);
	}
};

/**
 * Sets the compactness pf the player.
 *
 * @param compact if true, then only the play button is displayed
 */
ZmSoundPlayer.prototype.setCompact =
function(compact) {
	if (compact != this._isCompact) {
		// Set visiblity.
		this._timeSlider.setVisible(!compact);
		this._pauseButton.setVisible(!compact);
		this._volumeButton.setVisible(!compact);
		this._isCompact = compact;
		this._setStatus(0);

		// Fire event.
		if (this.isListenerRegistered(ZmSoundPlayer.COMPACT_EVENT)) {
			if (!this._changeEvent) {
				this._changeEvent = new DwtEvent(true);
				this._changeEvent.dwtObj = this;
				this._changeEvent.isCompact = compact;
			}
		    this.notifyListeners(ZmSoundPlayer.COMPACT_EVENT, this._changeEvent);
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
	if (this._soundPlugin && this._soundPlugin.addHelpListener) {
		this._soundPlugin.addHelpListener(listener);
	}
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

ZmSoundPlayer.prototype._setStatus =
function(time) {
	if (!this._durationStr) {
		this._durationStr = AjxDateUtil.computeDuration(this.voicemail.duration, true);
	}
	var status;
	if (this._isCompact) {
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
	if (!this._timeSlider.isDragging()) {
		if (event.duration != this._timeSlider.getMaximum()) {
			this._timeSlider.setRange(0, event.duration, event.time);
		} else if (event.status != DwtSoundPlugin.ERROR) {
			this._timeSlider.setValue(event.time);
		}
		this._setStatus(event.time);
	}
	this.notifyListeners(DwtEvent.ONCHANGE, event);
};

ZmSoundPlayer.prototype._volumeButtonListener =
function(event) {
	if (!this._volumeMenu) {
		this._volumeMenu = new DwtMenu(this._volumeButton, DwtMenu.GENERIC_WIDGET_STYLE);
		this._volumeSlider = new DwtSlider(this._volumeMenu, DwtSlider.VERTICAL, "DwtVerticalSlider DwtVolumeSlider");
		this._volumeSlider.setRange(0, this._volume, this._volume);
		this._volumeSlider.addChangeListener(new AjxListener(this, this._volumeSliderListener));
	}
	this._volumeButton.popup(this._volumeMenu);
};

ZmSoundPlayer.prototype._volumeSliderListener =
function(event) {
	if (this._soundPlugin) {
		this._volume = this._volumeSlider.getValue();
		this._soundPlugin.setVolume(this._volume);
	}
};

ZmSoundPlayer.prototype._getPlugin =
function(url) {
	if (this._pluginMissing) {
		return;
	}
	if (!this._soundPlugin) {
		var args = {
			parent: this.shell,
			width: 200,
			height: 16,
			offscreen: true, 
			positionType: DwtControl.RELATIVE_STYLE,
			url: this.voicemail.soundUrl,
			volume: this._volume
		};
		this._soundPlugin = DwtSoundPlugin.create(args);
		this._soundPlugin.addChangeListener(this._pluginChangeListenerObj);
	}
	return this._soundPlugin;
};

ZmSoundPlayer.prototype._createHtml =
function() {
	var element = this.getHtmlElement();
    var id = this._htmlElId;
    element.innerHTML = AjxTemplate.expand("zimbraMail.voicemail.templates.Voicemail#ZmSoundPlayer", id);
	this._playButton = new DwtButton(this);
	this._playButton.replaceElement(id + "_play");
	this._playButton.setImage("Play");
	this._playButton.setToolTipContent(ZmMsg.play);
	this._playButton.addSelectionListener(new AjxListener(this, this.play));

	this._pauseButton = new DwtButton(this);
	this._pauseButton.replaceElement(id + "_pause");
	this._pauseButton.setImage("Pause");
	this._pauseButton.setToolTipContent(ZmMsg.pause);
	this._pauseButton.addSelectionListener(new AjxListener(this, this.pause));

	this._statusId = id + "_status";

	this._timeSlider = new DwtSlider(this);
	this._timeSlider.replaceElement(id + "_postition");
	this._timeSlider.addChangeListener(new AjxListener(this, this._timeSliderListener));

	this._volumeButton = new DwtButton(this);
	this._volumeButton.replaceElement(id + "_volume");
	this._volumeButton.setImage("PlayMessage");
	this._volumeButton.setToolTipContent(ZmMsg.volume);
	this._volumeButton.addSelectionListener(new AjxListener(this, this._volumeButtonListener));
	
	this.setCompact(true);
};

ZmSoundPlayer.prototype._createMissingHtml =
function() {
	// This will create the plugin that displays a warning.
    this._soundPlugin = DwtSoundPlugin.create(this);
};

