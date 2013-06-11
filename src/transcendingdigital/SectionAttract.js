/*
* sectionAttract
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

transcendingdigital.SectionAttract = function() {
	if(false === (this instanceof transcendingdigital.SectionAttract)) {
        return new transcendingdigital.SectionAttract();
    }
	
	
	// PROPERTIES
	var _utVisual = null;
	var _timerID = null;
	var _featurePhoto = null;
	var _touchOverlay = null;
	var _lastIndex = -1;
	var _instructions = null;
	var _instructionsContainer = null;
	
	// METHODS
	this.init = function(_w,_h,_initCompleteCallback, _transitionOnCallback, _transitionOffCallback, _toMainCallback) {
		_utVisual = new transcendingdigital.UtilVisualHelper();
		_utVisual.init(_w,_h,0,0,0);
		 if(_initCompleteCallback != null) _utVisual.latchCustomEvent(transcendingdigital.ApplicationEventConsts.ConstEventInitComplete,_initCompleteCallback);
		 if(_transitionOnCallback != null) _utVisual.latchCustomEvent(transcendingdigital.ApplicationEventConsts.ConstEventTransitionOnComplete,_transitionOnCallback);
		 if(_transitionOffCallback != null) _utVisual.latchCustomEvent(transcendingdigital.ApplicationEventConsts.ConstEventTransitionOffComplete,_transitionOffCallback);
		 if(_toMainCallback != null) _utVisual.latchCustomEvent(transcendingdigital.ApplicationEventConsts.ConstSectionMain, _toMainCallback);
		 
		 createTouchOverlay();
		 createTimer();
		 createInstructionText();
		 // Raise the init complete event
		 _utVisual.raiseCustomEvent(transcendingdigital.ApplicationEventConsts.ConstEventInitComplete,[{sectionId:transcendingdigital.ApplicationEventConsts.ConstSectionAttract,visualRef:_utVisual}]);
	};
	this.resizeSection = function(_w,_h) {
		_utVisual.resizeArea(_w,_h);
		
		if(_featurePhoto != null) {
			_featurePhoto.scaleX = _utVisual._currentWidth / _featurePhoto.naturalWidth;
			_featurePhoto.scaleY = _utVisual._currentHeight / _featurePhoto.naturalHeight;
		}
	};
	this.destroyInternals = function() {
		destroyTimer();
		destroyInstructionText();
		
		if(_featurePhoto != null) {
			if(_utVisual != null) {
				createjs.Tween.removeTweens( _featurePhoto );
				_utVisual.removeCanvasElement(_featurePhoto);
				_featurePhoto = null;
			}
		}
		destroyTouchOverlay();
		if(_utVisual != null) {
			_utVisual.destroyInternals();
			_utVisual = null;
		}
		
	};
	// PRIVATE METHODS
	function createTimer() {
		_timerID = setInterval(handleTimer, 5000);
	};
	function destroyTimer() {
		if(_timerID != null) {
			clearInterval(_timerID);
			_timerID = null;
		}
	};
	function handleTimer(e) {
		if(_featurePhoto != null) {
			// Stop the timer
			destroyTimer();
			// Transition it off
			createjs.Tween.get(_featurePhoto,{override:true}).to({alpha:0}, 500, createjs.Ease.quadIn).call(featureTransitionedOff);
		} else {
			
			// Pick a random index if we can
			if( transcendingdigital.ApplicationEventConsts.volitlePhotoData != null ) {
				if( transcendingdigital.ApplicationEventConsts.volitlePhotoData.length > 0) {
					var randInt = getRandomInt(0,transcendingdigital.ApplicationEventConsts.volitlePhotoData.length - 1);
					if( transcendingdigital.ApplicationEventConsts.volitlePhotoData.length > 1) {
						while( randInt == _lastIndex ) {
							randInt = getRandomInt(0,transcendingdigital.ApplicationEventConsts.volitlePhotoData.length - 1);
						}
					}
					_lastIndex = randInt;
					
					_bgLoader = new transcendingdigital.UtilBGImgLoader();
					_bgLoader.initImageLoad( transcendingdigital.ApplicationEventConsts.volitlePhotoData[randInt] ,featureLoaded);
				}
			}
		}
	};
	function featureTransitionedOff() {
		if(_featurePhoto != null) {
			if(_utVisual != null) {
				_utVisual.removeCanvasElement(_featurePhoto);
				_featurePhoto = null;
			}
		}
		
		// Pick a random index
		if( transcendingdigital.ApplicationEventConsts.volitlePhotoData != null ) {
			if( transcendingdigital.ApplicationEventConsts.volitlePhotoData.length > 0) {
				var randInt = getRandomInt(0,transcendingdigital.ApplicationEventConsts.volitlePhotoData.length - 1);
				if( transcendingdigital.ApplicationEventConsts.volitlePhotoData.length > 1) {
					while( randInt == _lastIndex ) {
							randInt = getRandomInt(0,transcendingdigital.ApplicationEventConsts.volitlePhotoData.length - 1);
					}
				}
				_lastIndex = randInt;
					
				_bgLoader = new transcendingdigital.UtilBGImgLoader();
				_bgLoader.initImageLoad( transcendingdigital.ApplicationEventConsts.volitlePhotoData[randInt] ,featureLoaded);
				}
					}
		createTimer();
	};
	function featureLoaded() {
		var assets = _bgLoader.getLoadedAssets();
		var targetImage = assets[0].result;

		_featurePhoto = new createjs.Bitmap(assets[0].result);
		
		// Store the naturalWidth and height for later resizing
		_featurePhoto.naturalWidth = assets[0].result.width;
		_featurePhoto.naturalHeight = assets[0].result.height;
		
		// Scale the image so it will fit on the UI beneath the instructions with
		// some space on the edges
		_featurePhoto.scaleX = (_utVisual._currentWidth - 20) / assets[0].result.width;
		_featurePhoto.scaleY = (_utVisual._currentHeight - _instructionsContainer.offsetHeight - 20) / assets[0].result.height;
		_featurePhoto.alpha = 0;
		_featurePhoto.x = 10;
		_featurePhoto.y = _instructionsContainer.offsetHeight + 10;
		_utVisual.addCanvasElement(_featurePhoto, 0);
		
		createjs.Tween.get(_featurePhoto,{override:true}).to({alpha:1}, 500, createjs.Ease.quadIn);
		
		_bgLoader.destroyInternals();
		_bgLoader = null;
		
		//console.log("Yatta image loaded w:" + assets[0].result.width + " h:" + assets[0].result.height );
	};
	function createInstructionText() {
		if(_touchOverlay != null) {
			
			_instructionsContainer = document.createElement("div");
			_instructionsContainer.setAttribute("class", "instructionBar");
			
			// We need to put the text inside a container so we can measure the container vs
			// the %sized parent and adjust the font to fit!
			_instructions = document.createElement("div");
			_instructions.innerHTML = "Touch to E-mail Your Photo";
			
			_instructionsContainer.appendChild(_instructions);
			
			_touchOverlay.appendChild(_instructionsContainer);
			
			// Now we get to resize the text to fit the container YAY
			_utVisual.fitTextInField( _instructionsContainer, _instructions );
		}
		
	};
	function destroyInstructionText() {
		if( _touchOverlay != null ) {
			_touchOverlay.removeChild(_instructionsContainer);
			
			_instructionsContainer.removeChild( _instructions );
			_instructions = null;
			_instructionsContainer = null;
		}
	};
	/**
	 * Returns a random integer between min and max
	 * Using Math.round() will give you a non-uniform distribution!
	 */
	function getRandomInt (min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};
	function createTouchOverlay() {
		if(_touchOverlay == null) {
			_touchOverlay = document.createElement("div");
			_touchOverlay.setAttribute("style", "width:" + _utVisual._currentWidth + "px;height:" + _utVisual._currentHeight + "px;");
			transcendingdigital.addEvent(_touchOverlay, "click", handleSectionClick);
			_utVisual.addHTMLElement(_touchOverlay);
		}
	};
	function destroyTouchOverlay() {
		if(_touchOverlay != null) {
			transcendingdigital.removeEventHandler(_touchOverlay, "click", handleSectionClick);
			_utVisual.removeHTMLElement(_touchOverlay);
			_touchOverlay = null;
		}
	};
	function handleSectionClick(e) {
		destroyTimer();
		destroyTouchOverlay();
		// Raise the exit section event telling it we should be sent to the photo grid next
		_utVisual.raiseCustomEvent(transcendingdigital.ApplicationEventConsts.ConstSectionMain,[{sectionId:transcendingdigital.ApplicationEventConsts.ConstSectionAttract,nextSection:transcendingdigital.ApplicationEventConsts.ConstSectionPhotoGrid,visualRef:_utVisual}]);
		// Play the loveley narration for the next section now in the click handler or else mobile safari wont play it
		transcendingdigital.globalSfxUtility.playSoundEffect( transcendingdigital.globalSfxUtility.sfxConstTOUCH_PHOTO_SELECT );
	};
}