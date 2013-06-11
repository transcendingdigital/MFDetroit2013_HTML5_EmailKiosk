/*
* UtilBGImgLoader
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
* The purpose of this class is to attempt to load an image
*/
transcendingdigital.UtilBGImgLoader = function() {
	if(false === (this instanceof transcendingdigital.UtilBGImgLoader)) {
        return new transcendingdigital.UtilBGImgLoader();
    }
	
	// PRIVATE PROPERTIES
	var _cjsPreloader = null;
	var _loadedAssets = null;
	var _loadedManifest = null;
	
	// PUB METHODS
	this.initImageLoad = function(_imgPath, _callbackFunction) {
		createPreloader(_imgPath, _callbackFunction);
	}
	this.getLoadedAssets = function() {
		return _loadedAssets;
	}
	this.destroyInternals = function() {
		destroyPreloader();
	}
	// SUPPOSEDLY PRIVATE METHODS
	function createPreloader(_imgPath, _callbackFunction) {
		destroyPreloader();
		
		_loadedAssets = new Array();
		_loadedManifest = [
			{src:_imgPath, id:"loadedImage"}
		];
		
		_cjsPreloader = new createjs.PreloadJS();
		_cjsPreloader.useXHR = false;  // XHR loading is not reliable when running locally.
		_cjsPreloader.onComplete = _callbackFunction;
		_cjsPreloader.onFileLoad = onImageLoad;
		_cjsPreloader.onError = onImageError;
		_cjsPreloader.loadManifest(_loadedManifest);
	}
	function destroyPreloader() {
		if(_cjsPreloader != null) {
			_loadedManifest = null;
			_loadedAssets = null;
			_cjsPreloader.onFileLoad = null;
			_cjsPreloader.onComplete = null;
			_cjsPreloader = null;
		}
	}
	function onImageError(event) {
		if(console.log)console.log("UtilBGImgLoader error " + event);
		for(var i = 0; i < event.length; i++) {
			if(console.log)console.log( "UtilBGImgLoader error " + msg[i]);
		}
	}
	function onImageLoad(event) {
		//if(console.log)console.log("UtilBGImgLoader loaded " + event);
		_loadedAssets.push(event);
	}

}