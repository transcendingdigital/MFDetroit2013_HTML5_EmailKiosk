/*
* sectionEnd
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
	
transcendingdigital.SectionEnd = function() {
	if(false === (this instanceof transcendingdigital.SectionEnd)) {
        return new transcendingdigital.SectionEnd();
    }
	
	// PRIVATE PROPERTIES
	var _bgLoader;
	var _utVisual = null;
	
	var _widthProviderContainer = null;
	
	var _actualImg = null;
	var _userTextArea = null;
	
	var _instructions = null;
	var _instructionsContainer = null;
	var _sendingDots = '.';
	var _uiDotDelayTimer = null;
	
	var _endTimer = null;
	
	var _xmlHttp = null;
	
	// METHODS
	this.init = function(_w,_h, _initCompleteCallback, _transitionOnCallback, _transitionOffCallback, _toMainCallback) {
		_utVisual = new transcendingdigital.UtilVisualHelper();
		_utVisual.init(_w,_h,0,0,0);
		 if(_initCompleteCallback != null) _utVisual.latchCustomEvent(transcendingdigital.ApplicationEventConsts.ConstEventInitComplete,_initCompleteCallback);
		 if(_transitionOnCallback != null) _utVisual.latchCustomEvent(transcendingdigital.ApplicationEventConsts.ConstEventTransitionOnComplete,_transitionOnCallback);
		 if(_transitionOffCallback != null) _utVisual.latchCustomEvent(transcendingdigital.ApplicationEventConsts.ConstEventTransitionOffComplete,_transitionOffCallback);
		 if(_toMainCallback != null) _utVisual.latchCustomEvent(transcendingdigital.ApplicationEventConsts.ConstSectionMain, _toMainCallback);

		createInstructionText("Sending Email Now" + _sendingDots);
		createUIDotTimer();
		createFeaturePhoto();
		doEmailSend();
		// Swap positioning on instructionsContainer to relative instead of fixed due to IOS bug with keyboard and fixed position
		_instructionsContainer.style.position = "relative";
		
		 // Let the parent know we are ready
		 _utVisual.raiseCustomEvent(transcendingdigital.ApplicationEventConsts.ConstEventInitComplete,[{sectionId:transcendingdigital.ApplicationEventConsts.ConstSectionEnd,visualRef:_utVisual}]);
	};
	this.resizeSection = function(_w,_h) {
		_utVisual.resizeArea(_w,_h);
		
		if(_widthProviderContainer != null) {
			_widthProviderContainer.setAttribute("style","width: " + _utVisual._currentWidth + "px;height: " + _utVisual._currentHeight + "px;");
		}
		if(_instructions != null) {
			// Rest the text size - force it to fit into the new size
			_instructions.style.fontSize = "100px";
			// Now we get to resize the text to fit the container YAY
			_utVisual.fitTextInField( _instructionsContainer, _instructions );
		}
		if(_actualImg != null) {
			_userTextArea.style.width = (_utVisual._currentWidth / 2) + "px";
			var privacyLeft = _utVisual._currentWidth / 2 - (_utVisual._currentWidth / 2) / 2;
			var privacyTop = (_utVisual._currentHeight - _userTextArea.offsetHeight - 20);
			
			_userTextArea.style.top = privacyTop + "px";
			_userTextArea.style.left = privacyLeft + "px";
			
			// We need to fit the image between the buttons and top bar then we can position the buttons left
			var spaceLeft = _utVisual._currentHeight - _userTextArea.offsetHeight - _instructionsContainer.offsetHeight - 60;
			
			// Scale the image by how much we have - with will auto scale
			_actualImg.style.height = spaceLeft + "px";
			// Position the image
			_actualImg.style.top = _instructionsContainer.offsetHeight + 20 + "px";
			var imgLeft = (_utVisual._currentWidth / 2 - _actualImg.offsetWidth / 2);
			_actualImg.style.left = imgLeft + "px";
		}
	};
	this.destroyInternals = function() {
		if(	_bgLoader != null) {
			_bgLoader.destroyInternals();
			_bgLoader = null;
		}
		
		destroyUIDotTimer();
		
		destroyEmailRequest();
		
		destroyTimer();
		
		destroyInstructionText();
		
		destroyFeaturePhoto();
		
		if(_utVisual != null) {
			_utVisual.destroyInternals();
			_utVisual = null;
		}
	};
	
	// PRIVATE METHODS
	function createFeaturePhoto() {
		
		// After a lot of fooling around doing absolute
		// positioning with JS to get the best look
		/*
			<img class="featureSelectedPhoto" src="assets/images/tmpGalleryPhotos/6.jpg" />
	    */
		_actualImg = document.createElement("img");
		_actualImg.setAttribute("class","featureSelectedPhoto");
		_actualImg.setAttribute("src",transcendingdigital.ApplicationEventConsts.userSelectedPhoto);

		// A user message
		_userTextArea = document.createElement("div");
		_userTextArea.setAttribute("class","privacyPolicyArea");
		_userTextArea.innerHTML = transcendingdigital.ApplicationEventConsts.finalUserMessage;
		_userTextArea.style.width = (_utVisual._currentWidth / 2) + "px";
		
		// add it so we can get a measured height
		_widthProviderContainer.appendChild( _userTextArea );
		
		var privacyLeft = _utVisual._currentWidth / 2 - (_utVisual._currentWidth / 2) / 2;
		var privacyTop = (_utVisual._currentHeight - _userTextArea.offsetHeight - 20);
		
		_userTextArea.style.top = privacyTop + "px";
		_userTextArea.style.left = privacyLeft + "px";

		// The child appending
		
		// Add it to the html
		_widthProviderContainer.insertBefore( _actualImg, _userTextArea );

		// Position all the absolute elements using javascript
		// First measure the size the top bar is taking up vs how much we have left
		
		// We need to fit the image between the buttons and top bar then we can position the buttons left
		var spaceLeft = _utVisual._currentHeight - _userTextArea.offsetHeight - _instructionsContainer.offsetHeight - 60;
		
		// Scale the image by how much we have - with will auto scale
		_actualImg.style.height = spaceLeft + "px";
		// Position the image
		_actualImg.style.top = _instructionsContainer.offsetHeight + 20 + "px";
		var imgLeft = (_utVisual._currentWidth / 2 - _actualImg.offsetWidth / 2);
		_actualImg.style.left = imgLeft + "px";

	};
	function destroyFeaturePhoto() {
		if(_actualImg != null) {
			_widthProviderContainer.removeChild( _userTextArea );
			_userTextArea = null;
			
			_widthProviderContainer.removeChild( _actualImg );
			_actualImg = null;
		}
	};
	function createInstructionText(_text) {
			if( _widthProviderContainer == null ) {
				_widthProviderContainer = document.createElement("div");
				_widthProviderContainer.setAttribute("name","widthProvider");
				_widthProviderContainer.setAttribute("style","width: " + _utVisual._currentWidth + "px;height: " + _utVisual._currentHeight + "px;");
				_utVisual.addHTMLElement(_widthProviderContainer);
			}
			
			_instructionsContainer = document.createElement("div");
			_instructionsContainer.setAttribute("class", "instructionBar");
			
			// We need to put the text inside a container so we can measure the container vs
			// the %sized parent and adjust the font to fit!
			_instructions = document.createElement("div");
			_instructions.appendChild( document.createTextNode(_text) );
			
			_instructionsContainer.appendChild(_instructions);
			

			_widthProviderContainer.appendChild(_instructionsContainer);

			
			// Now we get to resize the text to fit the container YAY
			_utVisual.fitTextInField( _instructionsContainer, _instructions );
		
	};
	function destroyInstructionText() {

		if(_instructionsContainer != null) {
			if(_widthProviderContainer != null) {
				_widthProviderContainer.removeChild( _instructionsContainer );
			}
			
			_instructionsContainer.removeChild( _instructions );
			_instructions = null;
			_instructionsContainer = null;
		}
	};
	function doEmailSend() {
		var _url = transcendingdigital.ApplicationEventConsts.constEmailURL;
		// Add GET parameters which are URL encoded
		_url = _url + '?eAddr=' + encodeURIComponent( transcendingdigital.ApplicationEventConsts.usersEmailAddress );
		_url = _url + '&attach=' + encodeURIComponent( transcendingdigital.ApplicationEventConsts.userSelectedPhoto );
		_url = _url + '&noCache=' + Math.random();
		_xmlHttp = new XMLHttpRequest();
		_xmlHttp.addEventListener("load", handleEmailSendComplete, false);
		_xmlHttp.addEventListener("error", handleEmailSendError, false);
		_xmlHttp.open( "GET", _url, true );
		_xmlHttp.send( null );
	};
	function handleEmailSendComplete(e) {
		destroyUIDotTimer();
		destroyInstructionText();
		if(_xmlHttp.responseText == 'SUCESS') {
			createInstructionText("E-mail Sent!");
		} else {
			createInstructionText("Oops! There was a problem sending your E-mail: " + _xmlHttp.responseText);
		}
		destroyUIDotTimer();
		destroyEmailRequest();
		// Swap positioning on instructionsContainer to relative instead of fixed due to IOS bug with keyboard and fixed position
		_instructionsContainer.style.position = "relative";
		createTimer();
	};
	function handleEmailSendError(e) {
		alert("SectionEnd ERROR: " + _xmlHttp.responseText);
		destroyUIDotTimer();
		destroyEmailRequest();
		createTimer();
	};
	function destroyEmailRequest() {
		if(_xmlHttp != null) {
			_xmlHttp.abort();
			_xmlHttp.removeEventListener("load",handleEmailSendComplete);
			_xmlHttp.removeEventListener("error", handleEmailSendError);
			_xmlHttp = null;
		}
	};
	function createTimer() {
		_endTimer = setInterval(handleTimer, transcendingdigital.ApplicationEventConsts.constEndHoldTimeMS );
	};
	function destroyTimer() {
		if(_endTimer != null) {
			clearInterval(_endTimer);
			_endTimer = null;
		}
	};
	function handleTimer(e) {
		destroyTimer();
		// Get us outta here
		_utVisual.raiseCustomEvent(transcendingdigital.ApplicationEventConsts.ConstSectionMain,[{sectionId:transcendingdigital.ApplicationEventConsts.ConstSectionEnd,nextSection:transcendingdigital.ApplicationEventConsts.ConstSectionAttract,visualRef:_utVisual}]);
	};
	function createUIDotTimer() {
		_uiDotDelayTimer = setInterval(handleUIDotTimer, 750 );
	};
	function destroyUIDotTimer() {
		if(_uiDotDelayTimer != null) {
			clearInterval(_uiDotDelayTimer);
			_uiDotDelayTimer = null;
		}
	};
	function handleUIDotTimer(e) {
		destroyUIDotTimer();
		
		if(_sendingDots == '...') {
			_sendingDots = '.';
		} else {
			_sendingDots = _sendingDots + '.';
		}
		
		destroyInstructionText();
		createInstructionText("Sending Email Now" + _sendingDots);
		createUIDotTimer();
		// Swap positioning on instructionsContainer to relative instead of fixed due to IOS bug with keyboard and fixed position
		_instructionsContainer.style.position = "relative";
	};
}