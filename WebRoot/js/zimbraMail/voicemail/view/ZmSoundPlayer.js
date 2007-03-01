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
 * @param className {string} CSS class. If not provided defaults to the class name (optional)
 * @param positionType {string} Positioning style (absolute, static, or relative). If
 * 		not provided defaults to DwtControl.STATIC_STYLE (optional)
 */
function DwtSoundPlayer(parent, className, positionType) {
	if (arguments.length == 0) return;
	className = className || "DwtSoundPlayer";
	DwtComposite.call(this, parent, className, positionType);

	this._playButton = null;
	this._pauseButton = null;
	this._timeSlider = null;
	this._volumeButton = null;

	this._pluginMissing = DwtSoundPlugin.isPluginMissing();
	if (this._pluginMissing) {
		this._createMissingHtml();
	} else {
		this._createHtml();
		this.setEnabled(false);
	}
	this._volume = DwtSoundPlugin.MAX_VOLUME;
	
	this._pluginChangeListenerObj = new AjxListener(this, this._pluginChangeListener);
};

DwtSoundPlayer.prototype = new DwtComposite;
DwtSoundPlayer.prototype.constructor = DwtSoundPlayer;

DwtSoundPlayer.prototype.toString =
function() {
	return "DwtSoundPlayer";
};

/**
 * Loads a new sound into the sound player and plays it.
 *
 * @param url	{String} The path to the .wav or other supported sound file.
 */
DwtSoundPlayer.prototype.setUrl =
function(url) {
	if (this._pluginMissing) {
		return;
	}
	if (this._soundPlugin) {
		this._soundPlugin.pause();
		this._soundPlugin.dispose();
	}
	this.setEnabled(url != null);
	var args = {
		parent: this.shell,
		width: 200,
		height: 16,
		offscreen: true, 
		positionType: DwtControl.RELATIVE_STYLE,
		url: url,
		volume: this._volume
	};
	this._soundPlugin = DwtSoundPlugin.create(args);
	this._soundPlugin.addChangeListener(this._pluginChangeListenerObj);
};

/**
 * Plays the currently loaded sound.
 */
DwtSoundPlayer.prototype.play =
function() {
	if (this._soundPlugin) {
		this._soundPlugin.play();
	}
};

/**
 * Pauses the currently loaded sound.
 */
DwtSoundPlayer.prototype.pause =
function() {
	if (this._soundPlugin) {
		this._soundPlugin.pause();
	}
};

/**
 * Rewinds the currently loaded sound to the beginning.
 */
DwtSoundPlayer.prototype.rewind =
function() {
	if (this._soundPlugin) {
		this._soundPlugin.rewind();
	}
};

/**
 * Adjusts the volume of the player.
 *
 * @param volume the volume on a scale of 0 - DwtSoundPlugin.MAX_VOLUME.
 */
DwtSoundPlayer.prototype.setVolume =
function(volume) {
	if (this._soundPlugin) {
		this._soundPlugin.setVolume(volume);
	}
};

/**
 * Returns true if the sound plugin is missing.
 */
DwtSoundPlayer.prototype.isPluginMissing =
function() {
	return this._pluginMissing;
};

DwtSoundPlayer.prototype.addHelpListener =
function(listener) {
	if (this._soundPlugin && this._soundPlugin.addHelpListener) {
		this._soundPlugin.addHelpListener(listener);
	}
};

DwtSoundPlayer.prototype.addChangeListener =
function(listener) {
    this.addListener(DwtEvent.ONCHANGE, listener);
};


/**
* Sets the enabled/disabled state of the player.
*
* @param enabled	whether to enable the player
*
*/
DwtSoundPlayer.prototype.setEnabled =
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

DwtSoundPlayer.prototype._timeSliderListener =
function(event) {
	if (this._soundPlugin && !this._timeSlider.isDragging()) {
		this._soundPlugin.setTime(this._timeSlider.getValue());
	}
};

DwtSoundPlayer.prototype._pluginChangeListener =
function(event) {
	if (!this._timeSlider.isDragging()) {
		if (event.duration != this._timeSlider.getMaximum()) {
			this._timeSlider.setRange(0, event.duration, event.time);
		} else if (event.status != DwtSoundPlugin.ERROR) {
			this._timeSlider.setValue(event.time);
		}
	}
    this.notifyListeners(DwtEvent.ONCHANGE, event);
};

DwtSoundPlayer.prototype._volumeButtonListener =
function(event) {
	if (!this._volumeMenu) {
		this._volumeMenu = new DwtMenu(this._volumeButton, DwtMenu.GENERIC_WIDGET_STYLE);
		this._volumeSlider = new DwtSlider(this._volumeMenu, DwtSlider.VERTICAL, "DwtVerticalSlider DwtVolumeSlider");
		this._volumeSlider.setRange(0, this._volume, this._volume);
		this._volumeSlider.addChangeListener(new AjxListener(this, this._volumeSliderListener));
	}
	this._volumeButton.popup(this._volumeMenu);
};

DwtSoundPlayer.prototype._volumeSliderListener =
function(event) {
	if (this._soundPlugin) {
		this._volume = this._volumeSlider.getValue();
		this._soundPlugin.setVolume(this._volume);
	}
};

DwtSoundPlayer.prototype._createHtml =
function() {
	var element = this.getHtmlElement();
    var id = this._htmlElId;
    element.innerHTML = AjxTemplate.expand("ajax.dwt.templates.Widgets#DwtSoundPlayer", id);
//TODO: these ZmMsgs don't belong here...
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

	this._timeSlider = new DwtSlider(this);
	this._timeSlider.replaceElement(id + "_postition");
	this._timeSlider.addChangeListener(new AjxListener(this, this._timeSliderListener));

	this._volumeButton = new DwtButton(this);
	this._volumeButton.replaceElement(id + "_volume");
	this._volumeButton.setImage("PlayMessage");
	this._volumeButton.setToolTipContent(ZmMsg.volume);
	this._volumeButton.addSelectionListener(new AjxListener(this, this._volumeButtonListener));
};

DwtSoundPlayer.prototype._createMissingHtml =
function() {
	// This will create the plugin that displays a warning.
    this._soundPlugin = DwtSoundPlugin.create(this);
};

