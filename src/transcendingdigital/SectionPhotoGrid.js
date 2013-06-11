/*
* sectionPHoto
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
	
transcendingdigital.SectionPhotoGrid = function() {
	if(false === (this instanceof transcendingdigital.SectionPhotoGrid)) {
        return new transcendingdigital.SectionPhotoGrid();
    }
	
	// PRIVATE PROPERTIES
	var _bgLoader;
	var _sectionTitle;
	var _loadedPhotosArr = null;
	var _utVisual = null;

	var _bgCover = null;
	
	var _widthProviderContainer = null;
	var _gridContainer = null;
	
	var _featurePhoto = null;
	var _photoContainer = null;
	var _actualImg = null;
	var _btnContainer = null;
	var _btnYes = null;
	var _btnNo = null;
	
	var _instructions = null;
	var _instructionsContainer = null;
	
	var _photoQuestionNarrationPlayed = false;
	var _initialNarrationTimerID;
	
	// METHODS
	this.init = function(_w,_h, _initCompleteCallback, _transitionOnCallback, _transitionOffCallback, _toMainCallback) {
		_utVisual = new transcendingdigital.UtilVisualHelper();
		_utVisual.init(_w,_h,0,0,0);
		 if(_initCompleteCallback != null) _utVisual.latchCustomEvent(transcendingdigital.ApplicationEventConsts.ConstEventInitComplete,_initCompleteCallback);
		 if(_transitionOnCallback != null) _utVisual.latchCustomEvent(transcendingdigital.ApplicationEventConsts.ConstEventTransitionOnComplete,_transitionOnCallback);
		 if(_transitionOffCallback != null) _utVisual.latchCustomEvent(transcendingdigital.ApplicationEventConsts.ConstEventTransitionOffComplete,_transitionOffCallback);
		 if(_toMainCallback != null) _utVisual.latchCustomEvent(transcendingdigital.ApplicationEventConsts.ConstSectionMain, _toMainCallback);
		
		 initializeStartingPhotos();
		 createInstructionText("Touch Your Photo to Select");
		 // Let the parent know we are ready
		 _utVisual.raiseCustomEvent(transcendingdigital.ApplicationEventConsts.ConstEventInitComplete,[{sectionId:transcendingdigital.ApplicationEventConsts.ConstSectionPhotoGrid,visualRef:_utVisual}]);
	};
	this.resizeSection = function(_w,_h) {
		_utVisual.resizeArea(_w,_h);
		
		if(_widthProviderContainer != null) {
			_widthProviderContainer.setAttribute("style","width: " + _utVisual._currentWidth + "px;height: " + _utVisual._currentHeight + "px;");
		}
		if(_instructions != null) {
			// Rest the text size - force it to fit into the new size
			_instructions.style.fontSize = "80px";
			// Now we get to resize the text to fit the container YAY
			_utVisual.fitTextInField( _instructionsContainer, _instructions );
			// Now we need to update the position of the scrollable photos
			if(_gridContainer != null) {
				if(_gridContainer.style.display != "none") {
					_gridContainer.style.top = (_instructionsContainer.offsetHeight + 20) + "px";
					// OK this is a little tricky. The main width container is what allows _gridContainer to flow out in however many
					// columns based on the width, but when we dont have enough for a full photo there is an odd gap we need to
					// use the total width, fixed allowed width of the photos, and figure out whats left to shove this at a centered
					// absolute position.
					var photoKidWidthPlusMargin = 304;
					// How many photos can we fit in the current width?
					var totalPhotoWidth = ( Math.floor(_utVisual._currentWidth / photoKidWidthPlusMargin) * photoKidWidthPlusMargin );
					var gapLeft = _utVisual._currentWidth - totalPhotoWidth;
					
					_gridContainer.style.left = (gapLeft / 2) + "px";
				}
			}
			// Update the feature photo and buttons if they are there
			if(_actualImg != null) {
				_btnNo.style.top = (_utVisual._currentHeight - _btnNo.offsetHeight - 20) + "px";
				_btnYes.style.top = (_utVisual._currentHeight - _btnYes.offsetHeight - 20) + "px";
				
				// We need to fit the image between the buttons and top bar then we can position the buttons left
				var spaceLeft = _utVisual._currentHeight - _instructionsContainer.offsetHeight - _btnNo.offsetHeight - 60;
				
				// Scale the image by how much we have - with will auto scale
				_actualImg.style.height = spaceLeft + "px";
				// Position the image
				_actualImg.style.top = _instructionsContainer.offsetHeight + 20 + "px";
				var imgLeft = (_utVisual._currentWidth / 2 - _actualImg.offsetWidth / 2);
				_actualImg.style.left = imgLeft + "px";
				
				// Finally position the buttons left to right
				var imgRight = (imgLeft + _actualImg.offsetWidth - _btnYes.offsetWidth);
				
				// Before setting them, make sure they dont overlap. If they do just put 20px between them.
				if( (imgLeft + _btnNo.offsetWidth) >= imgRight ) {
					var distanceToGo = (imgLeft + _btnNo.offsetWidth) - imgRight;
					imgLeft -= (distanceToGo / 2) + 10;
					imgRight += (distanceToGo / 2) + 10;
				}
					_btnNo.style.left = imgLeft + "px";
					_btnYes.style.left = imgRight + "px";
			}
			
		}
	};
	this.incomingNewData = function (_dataArr) {
		if( _dataArr.newDataArr != null ) {
			if(_loadedPhotosArr != null) {
				if(_loadedPhotosArr.length == 0) {
					initializeStartingPhotos();
				} else {
					// Remove all current photos
					if(_loadedPhotosArr != null) {
						for( var i = _loadedPhotosArr.length - 1; i > -1; i-- ) {
							transcendingdigital.removeEventHandler(_loadedPhotosArr[i], "click", handleSelectFeatureImage);
							_gridContainer.removeChild(_loadedPhotosArr[i]);
							_loadedPhotosArr[i] = null;
							_loadedPhotosArr.splice(i,1);
						}
						_loadedPhotosArr = null;
					}
					// Re-add all the photos
					initializeStartingPhotos();
				}
			}
		}
	};
	this.destroyInternals = function() {
		if(	_bgLoader != null) {
			_bgLoader.destroyInternals();
			_bgLoader = null;
		}
		
		if( _initialNarrationTimerID != null ) {
			clearInterval(_initialNarrationTimerID);
			_initialNarrationTimerID = null;
		}
		
		destroyInstructionText();
		
		destroyFeaturePhoto();
		
		destroyBgShield();
		
		destroyAllGridPhotos();
		
		if(_utVisual != null) {
			_utVisual.destroyInternals();
			_utVisual = null;
		}
	};
	
	// PRIVATE METHODS
	
	function initializeStartingPhotos() {
		if(_loadedPhotosArr == null) {
			_loadedPhotosArr = new Array();
			if( _widthProviderContainer == null ) {
				_widthProviderContainer = document.createElement("div");
				_widthProviderContainer.setAttribute("name","widthProvider");
				_widthProviderContainer.setAttribute("style","width: " + _utVisual._currentWidth + "px;height: " + _utVisual._currentHeight + "px;");
				_utVisual.addHTMLElement(_widthProviderContainer);
				
				_gridContainer = document.createElement("div");
				_gridContainer.setAttribute("class","photoGridContainer");
				_widthProviderContainer.appendChild( _gridContainer );
			}
			
			if(transcendingdigital.ApplicationEventConsts.volitlePhotoData != null) {
				for(var pathIndex = 0; pathIndex < transcendingdigital.ApplicationEventConsts.volitlePhotoData.length; pathIndex++) {
					
					var thisPhotoContainer = document.createElement("div");
					thisPhotoContainer.setAttribute("class", "singleContainer");
					
					var thisThumb = document.createElement("img");
					thisThumb.setAttribute("class", "insideImg");
					thisThumb.setAttribute("src", transcendingdigital.ApplicationEventConsts.volitlePhotoData[pathIndex] );
					
					thisPhotoContainer.appendChild( thisThumb );
					
					// PROBLEMS - 1. How to remove dynamic children with our helper?
					//			  2. How to specify parameters with event listeners
					
					// Add a listener for clicking
					transcendingdigital.addEvent(thisPhotoContainer, "click", handleSelectFeatureImage);
					_gridContainer.appendChild(thisPhotoContainer);

					// Push it into the holding array
					_loadedPhotosArr.push( thisPhotoContainer );
				}
				
				// Force the width of the container and center it
				//_gridContainer.style.width = 500 + "px";
				console.log(" SectionPhotoGrid size: " + _gridContainer.offsetWidth);
			}
		}
	}
	function destroyAllGridPhotos() {
		if(_loadedPhotosArr != null) {
			
			for( var i = _loadedPhotosArr.length - 1; i > -1; i-- ) {
				transcendingdigital.removeEventHandler(_loadedPhotosArr[i], "click", handleSelectFeatureImage);
				_gridContainer.removeChild(_loadedPhotosArr[i]);
				_loadedPhotosArr[i] = null;
				_loadedPhotosArr.splice(i,1);
			}
			_loadedPhotosArr = null;
			_widthProviderContainer.removeChild(_gridContainer);
			_gridContainer = null;
			_utVisual.removeHTMLElement(_widthProviderContainer);
			_widthProviderContainer = null;
			
		}
	}
	function handleSelectFeatureImage(e) {
				
		// Could be the DIV or IMG that they touch/clicked on need a ref to the img if its the div
		var elemRef = e.target;
		if(e.target.nodeName == "DIV") {
			elemRef = e.target.children[0];
		}
		
		if(elemRef != null) {
			// Set this as the most recent user selected  photo in case they go with it
			transcendingdigital.ApplicationEventConsts.userSelectedPhoto = elemRef.src;
		
			createFeaturePhoto( elemRef.src );
			
			// Hide the background grid of photos
			_gridContainer.style.display = "none";
		}

	}
	function createFeaturePhoto(_PathStr) {
		
		// After a lot of fooling around doing absolute
		// positioning with JS to get the best look
		/*
			<img class="featureSelectedPhoto" src="assets/images/tmpGalleryPhotos/6.jpg" />
			<input class="featureSelectButton" type="button" value="no" style="position:absolute;top:500px;left:120px;" onclick="injectThumb();" />
			<input class="featureSelectButton" type="button" value="yes" style="position:absolute;top:500px;left:500px;" onclick="injectThumb();" />
	    */
		
		_actualImg = document.createElement("img");
		_actualImg.setAttribute("class","featureSelectedPhoto");
		_actualImg.setAttribute("src",_PathStr);
		
		_btnNo = document.createElement("input");
		_btnNo.setAttribute("class", "featureSelectButton");
		_btnNo.setAttribute("type","button");
		_btnNo.setAttribute("value","No");
		_btnNo.setAttribute("ontouchstart","");
		transcendingdigital.addEvent(_btnNo, "click", handleFeatureImageYesNo);
		
		_btnYes = document.createElement("input");
		_btnYes.setAttribute("class", "featureSelectButton");
		_btnYes.setAttribute("type","button");
		_btnYes.setAttribute("value","Yes");
		_btnYes.setAttribute("ontouchstart","");
		transcendingdigital.addEvent(_btnYes, "click", handleFeatureImageYesNo);
		
		
		// The child appending
		
		// Add it to the html
		_widthProviderContainer.appendChild( _actualImg );
		_widthProviderContainer.appendChild( _btnNo );
		_widthProviderContainer.appendChild( _btnYes );
		
		// Position all the absolute elements using javascript
		// First measure the size the top bar is taking up vs how much we have left
		
		_btnNo.style.top = (_utVisual._currentHeight - _btnNo.offsetHeight - 20) + "px";
		_btnYes.style.top = (_utVisual._currentHeight - _btnYes.offsetHeight - 20) + "px";
		
		// We need to fit the image between the buttons and top bar then we can position the buttons left
		var spaceLeft = _utVisual._currentHeight - _instructionsContainer.offsetHeight - _btnNo.offsetHeight - 60;
		
		// Scale the image by how much we have - with will auto scale
		_actualImg.style.height = spaceLeft + "px";
		// Position the image
		_actualImg.style.top = _instructionsContainer.offsetHeight + 20 + "px";
		var imgLeft = (_utVisual._currentWidth / 2 - _actualImg.offsetWidth / 2);
		_actualImg.style.left = imgLeft + "px";
		
		// Finally position the buttons left to right
		var imgRight = (imgLeft + _actualImg.offsetWidth - _btnYes.offsetWidth);
		
		// Before setting them, make sure they dont overlap. If they do just put 20px between them.
		if( (imgLeft + _btnNo.offsetWidth) >= imgRight ) {
			var distanceToGo = (imgLeft + _btnNo.offsetWidth) - imgRight;
			imgLeft -= (distanceToGo / 2) + 10;
			imgRight += (distanceToGo / 2) + 10;
		}
			_btnNo.style.left = imgLeft + "px";
			_btnYes.style.left = imgRight + "px";
		
		// Update the instructions
		destroyInstructionText();
		createInstructionText("Is This Your Photo?");
		// Play narration for the instructions - just play it once while this section is active otherwise it is very annoying
		if( _photoQuestionNarrationPlayed == false ) {
			_photoQuestionNarrationPlayed = true;
			transcendingdigital.globalSfxUtility.playSoundEffect( transcendingdigital.globalSfxUtility.sfxConstIS_PHOTO );
		} else {
			transcendingdigital.globalSfxUtility.playSoundEffect( transcendingdigital.globalSfxUtility.sfxConstBTN );
		}
	}
	function destroyFeaturePhoto() {
		if(_actualImg != null) {
			
			transcendingdigital.removeEventHandler(_btnNo, "click", handleFeatureImageYesNo);
			transcendingdigital.removeEventHandler(_btnYes, "click", handleFeatureImageYesNo);
			
			_widthProviderContainer.removeChild( _actualImg );
			_widthProviderContainer.removeChild( _btnYes );
			_widthProviderContainer.removeChild( _btnNo );
			
			_actualImg = null;
			_btnYes = null;
			_btnNo = null;
		}
	}
	function createBgShield() {
		_bgCover = document.createElement("div");
		_bgCover.setAttribute("class","blackCover");
		
		// NEEDS TWEEN ON
		
		_widthProviderContainer.appendChild(_bgCover);
		
	}
	function destroyBgShield() {
		if(_bgCover != null) {
			createjs.Tween.removeTweens( _bgCover );
			_widthProviderContainer.removeChild(_bgCover);
			_bgCover = null;
		}
	}
	function handleFeatureImageYesNo(e) {
		
		transcendingdigital.removeEventHandler(_btnNo, "click", handleFeatureImageYesNo);
		transcendingdigital.removeEventHandler(_btnYes, "click", handleFeatureImageYesNo);
		
		// No matter what the overlay needs to be destroyed
		destroyFeaturePhoto();
		
		if(e.target.value == 'Yes') {
			// GET US OUTTA HERE!
		_utVisual.raiseCustomEvent(transcendingdigital.ApplicationEventConsts.ConstSectionMain,[{sectionId:transcendingdigital.ApplicationEventConsts.ConstSectionPhotoGrid,nextSection:transcendingdigital.ApplicationEventConsts.ConstSectionEmailInput,visualRef:_utVisual}]);
		 // Play narration for the next section or else ios wont play it outside of a click handler
		 transcendingdigital.globalSfxUtility.playSoundEffect( transcendingdigital.globalSfxUtility.sfxConstENTER_EMAIL );
		} else {
		    transcendingdigital.globalSfxUtility.playSoundEffect( transcendingdigital.globalSfxUtility.sfxConstBTN );
			// Show the background grid of photos
			_gridContainer.style.display = "inline";
			
			destroyInstructionText();
			createInstructionText( "Touch Your Photo to Select" );
		
		}
	};
	
	function createInstructionText(_textString) {
			if( _widthProviderContainer == null ) {
				_widthProviderContainer = document.createElement("div");
				_widthProviderContainer.setAttribute("name","widthProvider");
				_widthProviderContainer.setAttribute("style","width: " + _utVisual._currentWidth + "px;height: " + _utVisual._currentHeight + "px;");
				_utVisual.addHTMLElement(_widthProviderContainer);
				
				_gridContainer = document.createElement("div");
				_gridContainer.setAttribute("class","photoGridContainer");
				_widthProviderContainer.appendChild( _gridContainer );
			}
			
			_instructionsContainer = document.createElement("div");
			_instructionsContainer.setAttribute("class", "instructionBar");
			
			// We need to put the text inside a container so we can measure the container vs
			// the %sized parent and adjust the font to fit!
			_instructions = document.createElement("div");
			_instructions.appendChild( document.createTextNode(_textString) );
			
			_instructionsContainer.appendChild(_instructions);
			

			_widthProviderContainer.insertBefore(_instructionsContainer, _gridContainer );

			
			// Now we get to resize the text to fit the container YAY
			_utVisual.fitTextInField( _instructionsContainer, _instructions );
			
			// Now we need to update the position of the scrollable photos
			if(_gridContainer != null) {
				_gridContainer.style.top = (_instructionsContainer.offsetHeight + 20) + "px";
					// OK this is a little tricky. The main width container is what allows _gridContainer to flow out in however many
					// columns based on the width, but when we dont have enough for a full photo there is an odd gap we need to
					// use the total width, fixed allowed width of the photos, and figure out whats left to shove this at a centered
					// absolute position.
					var photoKidWidthPlusMargin = 304;
					// How many photos can we fit in the current width?
					var totalPhotoWidth = ( Math.floor(_utVisual._currentWidth / photoKidWidthPlusMargin) * photoKidWidthPlusMargin );
					var gapLeft = _utVisual._currentWidth - totalPhotoWidth;
					
				_gridContainer.style.left = (gapLeft / 2) + "px";
			}
		
	};
	function destroyInstructionText() {

		if(_instructionsContainer != null) {
			if(_widthProviderContainer != null) {
				_widthProviderContainer.removeChild( _instructionsContainer );
			}
			
			while(_instructions.hasChildNodes()) {
				_instructions.removeChild(_instructions.lastChild);
			}
			
			_instructionsContainer.removeChild( _instructions );
			_instructions = null;
			_instructionsContainer = null;
		}
	};
}