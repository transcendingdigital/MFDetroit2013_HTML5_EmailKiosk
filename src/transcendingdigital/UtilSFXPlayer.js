/*
* UtilSFXPlayer
* http://www.transcendingdigital.com
*
*
* Copyright (c) 2013 Transcending Digital LLC
* This series is intended as a state of HTML5 investigation into
* the viability of its use in touchscreen kiosk applications.
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/
// namespace:
this.transcendingdigital = this.transcendingdigital||{};

/**
* The purpose of this class is to attempt to globally play sound effects in the
* background.
*/
transcendingdigital.UtilSFXPlayer = function() {
	if(false === (this instanceof transcendingdigital.UtilSFXPlayer)) {
        return new transcendingdigital.UtilSFXPlayer();
    }
	
	// PRIVATE PROPERTIES
	var sfxManifest = null;
	var preloader = null;
	
	// Manual sound manipulation when soundjs wont work
	var canPlayMp3 = false;
	var canPlayOgg = false;
	var arrManualAudioElements = null;
	
	// PUB METHODS/Properties
	this.sfxConstBTN = "sfx.transcendingdigital.sfxConstBTN";
	this.sfxConstWHOOSH = "sfx.transcendingdigital.sfxConstWHOOSH";
	
	this.sfxConstIS_PHOTO = "sfx.transcendingdigital.sfxConstIS_PHOTO";
	this.sfxConstTOUCH_PHOTO_SELECT = "sfx.transcendingdigital.sfxConstTOUCH_PHOTO_SELECT";
	this.sfxConstTERMS_SERVICE = "sfx.transcendingdigital.sfxConstTERMS_SERVICE";
	this.sfxConstENTER_EMAIL = "sfx.transcendingdigital.sfxConstENTER_EMAIL";
	this.sfxConstEMAIL_VALID = "sfx.transcendingdigital.sfxConstEMAIL_VALID";
	this.sfxConstSENDING_EMAIL = "sfx.transcendingdigital.sfxConstSENDING_EMAIL";
	
	this.init = function() {
		// Uses a plugin for certain platforms. Has problems with
		// ios 5
		createjs.Sound.initializeDefaultPlugins();
		
		// Preloads all of our sound effects
		if( createjs.Sound.isReady() ) {
			
			sfxManifest =  [
				{src:"assets/sfx/ButtonPress.mp3|assets/sfx/ButtonPress.ogg", id:this.sfxConstBTN},
				{src:"assets/sfx/QuickWhoosh1.mp3|assets/sfx/QuickWhoosh1.ogg", id:this.sfxConstWHOOSH},
				{src:"assets/sfx/tmpNar_IsThisPhoto.mp3|assets/sfx/tmpNar_IsThisPhoto.ogg", id:this.sfxConstIS_PHOTO},
				{src:"assets/sfx/tmpNar_TouchPhotoToSelect.mp3|assets/sfx/tmpNar_TouchPhotoToSelect.ogg", id:this.sfxConstTOUCH_PHOTO_SELECT},
				{src:"assets/sfx/tmpNar_TermsOfService.mp3|assets/sfx/tmpNar_TermsOfService.ogg", id:this.sfxConstTERMS_SERVICE},
				{src:"assets/sfx/tmpNar_TouchToEnterEmail.mp3|assets/sfx/tmpNar_TouchToEnterEmail.ogg", id:this.sfxConstENTER_EMAIL},
				{src:"assets/sfx/tmpNar_ValidCharacters.mp3|assets/sfx/tmpNar_ValidCharacters.ogg", id:this.sfxConstEMAIL_VALID},
				{src:"assets/sfx/tmpNar_SendingEmail.mp3|assets/sfx/tmpNar_SendingEmail.ogg", id:this.sfxConstSENDING_EMAIL}
			];
			preloader = new createjs.PreloadJS();
			preloader.installPlugin(createjs.Sound);
			preloader.useXHR = false;  // XHR loading is not reliable when running locally.
			//preloader.onFileLoad = onSfxLoad;
			//preloader.onComplete = onSfxComplete;
			preloader.loadManifest(sfxManifest);

		} else {
			// IOS 5 - what sound can we play?
			var t = document.createElement("audio");
			canPlayMp3 = !!t.canPlayType && "" != t.canPlayType('audio/mpeg');
			canPlayOgg = !!t.canPlayType && "" != t.canPlayType('audio/ogg; codecs="vorbis"');
			t = null;
			var extension = ".mp3";
			if(!canPlayMp3) extension = ".ogg";
			// Manual sound elements - Im sloppy and dont track when they are
			// loaded when doing it this way..oh well
			arrManualAudioElements = new Array();
			arrManualAudioElements.push( new Audio() );
			arrManualAudioElements[0].src = "assets/sfx/ButtonPress" + extension;
			arrManualAudioElements.push( new Audio() );
			arrManualAudioElements[1].src = "assets/sfx/QuickWhoosh1" + extension;
			arrManualAudioElements.push( new Audio() );
			arrManualAudioElements[2].src = "assets/sfx/tmpNar_IsThisPhoto" + extension;
			arrManualAudioElements.push( new Audio() );
			arrManualAudioElements[3].src = "assets/sfx/tmpNar_TouchPhotoToSelect" + extension;
			arrManualAudioElements.push( new Audio() );
			arrManualAudioElements[4].src = "assets/sfx/tmpNar_TermsOfService" + extension;
			arrManualAudioElements.push( new Audio() );
			arrManualAudioElements[5].src = "assets/sfx/tmpNar_TouchToEnterEmail" + extension;
			arrManualAudioElements.push( new Audio() );
			arrManualAudioElements[6].src = "assets/sfx/tmpNar_ValidCharacters" + extension;
			arrManualAudioElements.push( new Audio() );
			arrManualAudioElements[7].src = "assets/sfx/tmpNar_SendingEmail" + extension;
			arrManualAudioElements[0].load();
			arrManualAudioElements[1].load();
			arrManualAudioElements[2].load();
			arrManualAudioElements[3].load();
			arrManualAudioElements[4].load();
			arrManualAudioElements[5].load();
			arrManualAudioElements[6].load();
			arrManualAudioElements[7].load();
		}
	};
	
	this.playSoundEffect = function(_sfxConst) {
		
		var playIndex = 0;
		
		switch(_sfxConst) {
			case this.sfxConstBTN:
				playIndex = 0;
				break;
			case this.sfxConstWHOOSH:
				playIndex = 1;
				break;
			case this.sfxConstIS_PHOTO:
				playIndex = 2;
				break;
			case this.sfxConstTOUCH_PHOTO_SELECT:
				playIndex = 3;
				break;
			case this.sfxConstTERMS_SERVICE:
				playIndex = 4;
				break;
			case this.sfxConstENTER_EMAIL:
				playIndex = 5;
				break;
			case this.sfxConstEMAIL_VALID:
				playIndex = 6;
				break;
			case this.sfxConstSENDING_EMAIL:
				playIndex = 7;
				break;
		}
		if(	arrManualAudioElements == null ) {
			createjs.Sound.play(_sfxConst, createjs.Sound.INTERUPT_LATE);
		} else {
			arrManualAudioElements[playIndex].play();
		}
	};

	// SUPPOSEDLY PRIVATE METHODS
	function onSfxLoad(event) {
		console.log("sfx load " + event);
	}
	function onSfxComplete() {
		console.log("sfx complete");
	}
}