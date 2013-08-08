/*
* sectionEmailInput
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
	
transcendingdigital.SectionEmailInput = function() {
	if(false === (this instanceof transcendingdigital.SectionEmailInput)) {
        return new transcendingdigital.SectionEmailInput();
    }
	
	// PRIVATE PROPERTIES
	var _bgLoader;
	var _utVisual = null;
	
	var _widthProviderContainer = null;
	var _inputFormContainer = null;
	var _inputTextField = null;
	var _btnBack = null;
	var _btnSend = null;
	
	var _instructions = null;
	var _instructionsContainer = null;
	
	var _playedErrorNarration = false;
	
	// METHODS
	this.init = function(_w,_h, _initCompleteCallback, _transitionOnCallback, _transitionOffCallback, _toMainCallback) {
		_utVisual = new transcendingdigital.UtilVisualHelper();
		_utVisual.init(_w,_h,0,0);
		 if(_initCompleteCallback != null) _utVisual.latchCustomEvent(transcendingdigital.ApplicationEventConsts.ConstEventInitComplete,_initCompleteCallback);
		 if(_transitionOnCallback != null) _utVisual.latchCustomEvent(transcendingdigital.ApplicationEventConsts.ConstEventTransitionOnComplete,_transitionOnCallback);
		 if(_transitionOffCallback != null) _utVisual.latchCustomEvent(transcendingdigital.ApplicationEventConsts.ConstEventTransitionOffComplete,_transitionOffCallback);
		 if(_toMainCallback != null) _utVisual.latchCustomEvent(transcendingdigital.ApplicationEventConsts.ConstSectionMain, _toMainCallback);

		_widthProviderContainer = document.createElement("div");
		_widthProviderContainer.setAttribute("name","widthProvider");
		_widthProviderContainer.setAttribute("style","width: " + _utVisual._currentWidth + "px;");
		_utVisual.addHTMLElement(_widthProviderContainer);
				
		 createInstructionText("TOUCH The Red Box Below<br/>to Enter Your E-mail Address");
		 createInputArea();
		
		// Swap positioning on instructionsContainer to relative instead of fixed due to IOS bug with keyboard and fixed position
		_instructionsContainer.style.position = "relative";
			
		 // Let the parent know we are ready
		 _utVisual.raiseCustomEvent(transcendingdigital.ApplicationEventConsts.ConstEventInitComplete,[{sectionId:transcendingdigital.ApplicationEventConsts.ConstSectionEmailInput,visualRef:_utVisual}]);
	};
	this.resizeSection = function(_w,_h) {
		
		_utVisual.resizeArea(_w,_h);
		
		if(_widthProviderContainer != null) {
			_widthProviderContainer.setAttribute("style","width: " + _utVisual._currentWidth + "px;");
		}
		if(_instructions != null) {
			// Rest the position to fixed for sizing
			_instructionsContainer.style.position = "fixed";
			// Reset the text size - force it to fit into the new size
			_instructions.style.fontSize = "80px";
			// Now we get to resize the text to fit the container YAY
			_utVisual.fitTextInField( _instructionsContainer, _instructions );
		}
		if(_inputTextField != null) {
			// Now we get to absolute position everything! Yes yes this can be done with html and css but across devices
			// this seems easier
			_inputTextField.style.width = (_utVisual._currentWidth * 0.7) + "px";
			var inputTop = (_instructionsContainer.offsetHeight + 40);
			_inputTextField.style.top = inputTop + "px";
			var inputTextLeft = (_utVisual._currentWidth * 0.5 - (_inputTextField.offsetWidth * 0.5) );
			_inputTextField.style.left = inputTextLeft + "px";

			var sendLeft = inputTextLeft + _inputTextField.offsetWidth - _btnSend.offsetWidth;
			
			if( (inputTextLeft + _btnBack.offsetWidth) >= sendLeft ) {
				var distanceToGo = (inputTextLeft + _btnBack.offsetWidth) - sendLeft;
				inputTextLeft -= (distanceToGo / 2) + 10;
				sendLeft += (distanceToGo / 2) + 10;
			}
			_btnBack.style.left = inputTextLeft + "px";
			_btnSend.style.left = sendLeft + "px";
			_btnBack.style.top = (inputTop + _inputTextField.offsetHeight + 20) + "px";
			_btnSend.style.top = (inputTop + _inputTextField.offsetHeight + 20) + "px";
		}
		
		// Swap positioning on instructionsContainer to relative instead of fixed due to IOS bug with keyboard and fixed position
		_instructionsContainer.style.position = "relative";
	};
	this.destroyInternals = function() {
		if(	_bgLoader != null) {
			_bgLoader.destroyInternals();
			_bgLoader = null;
		}
		
		destroyInstructionText();
		destroyKeyboardInputArea();
		
		if(_utVisual != null) {
			_utVisual.destroyInternals();
			_utVisual = null;
		}
	};
	/*
	This is very tricky its called externally as our code is executing on index
	*/
	this.doSubmit = function(e) {
		// Ensure the email is valid
		if( validateEmail( _inputTextField.value ) ) {
		
			// Valid - save - next section
			transcendingdigital.ApplicationEventConsts.usersEmailAddress = _inputTextField.value;
			
			// On to the privacy policy
			_utVisual.raiseCustomEvent(transcendingdigital.ApplicationEventConsts.ConstSectionMain,[{sectionId:transcendingdigital.ApplicationEventConsts.ConstSectionEmailInput,nextSection:transcendingdigital.ApplicationEventConsts.ConstSectionPrivacyPolicy,visualRef:_utVisual}]);
			// Play the narration for the next section in this click handler or ios wont do it
			transcendingdigital.globalSfxUtility.playSoundEffect( transcendingdigital.globalSfxUtility.sfxConstTERMS_SERVICE );
			} else {
			// Show warning to users
			if(	_instructions ) {

				destroyInstructionText();
				createInstructionText("Please enter a valid e-mail address<br/>containing a . and @ character");
				// Swap positioning on instructionsContainer to relative instead of fixed due to IOS bug with keyboard and fixed position
				_instructionsContainer.style.position = "relative";
				// Play narration
				if( _playedErrorNarration == false ) {
					_playedErrorNarration = true;
					transcendingdigital.globalSfxUtility.playSoundEffect( transcendingdigital.globalSfxUtility.sfxConstEMAIL_VALID );
				}
			}
		}
		return false;
	};
	// PRIVATE METHODS
	function createInputArea() {
		/*
		We can use some of the previous css over for this form
		This is essentially what we need here
			<div style="width:700px">
				<form>
					<input type="text" class="emailAddrInput" tabindex="1" style="top:200px;left:350px;" />
					<input class="featureSelectButton" type="button" value="Back" onclick="injectThumb();" tabindex="2"/>
					<input class="featureSelectButton" type="button" value="Send" onclick="injectThumb();" tabindex="3"/>
				</form>
			</div>
		*/
		_inputFormContainer = document.createElement("form");
		_inputFormContainer.setAttribute("action","#");
		// This is real tricky our code executes on index so thats where globalEmailInputSection reference to this 
		// object resides
		_inputFormContainer.setAttribute("onSubmit", "return globalEmailInputSection.doSubmit();");
		
		_inputTextField = document.createElement("input");
		_inputTextField.setAttribute("class","emailAddrInput");
		_inputTextField.setAttribute("type","email");
		
		_btnBack = document.createElement("input");
		_btnBack.setAttribute("class","featureSelectButton");
		_btnBack.setAttribute("type","button");
		_btnBack.setAttribute("value","Back");
		_btnBack.setAttribute("ontouchstart","");
		transcendingdigital.addEvent(_btnBack, "click", onSendBackButton);
								
		_btnSend = document.createElement("input");
		_btnSend.setAttribute("class","featureSelectButton");
		_btnSend.setAttribute("type","button");
		_btnSend.setAttribute("value","Send");
		_btnSend.setAttribute("ontouchstart","");
		transcendingdigital.addEvent(_btnSend, "click", onSendBackButton);
		

		_inputFormContainer.appendChild( _inputTextField );
		_inputFormContainer.appendChild( _btnBack );
		_inputFormContainer.appendChild( _btnSend );
		_widthProviderContainer.appendChild( _inputFormContainer );
		
		// Now we get to absolute position everything! Yes yes this can be done with html and css but across devices
		// this seems easier
		_inputTextField.style.width = (_utVisual._currentWidth * 0.7) + "px";
		var inputTop = (_instructionsContainer.offsetHeight + 40);
		_inputTextField.style.top = inputTop + "px";
		var inputTextLeft = (_utVisual._currentWidth * 0.5 - (_inputTextField.offsetWidth * 0.5) );
		_inputTextField.style.left = inputTextLeft + "px";

		var sendLeft = inputTextLeft + _inputTextField.offsetWidth - _btnSend.offsetWidth;
		
		if( (inputTextLeft + _btnBack.offsetWidth) >= sendLeft ) {
			var distanceToGo = (inputTextLeft + _btnBack.offsetWidth) - sendLeft;
			inputTextLeft -= (distanceToGo / 2) + 10;
			sendLeft += (distanceToGo / 2) + 10;
		}
		_btnBack.style.left = inputTextLeft + "px";
		_btnSend.style.left = sendLeft + "px";
		_btnBack.style.top = (inputTop + _inputTextField.offsetHeight + 20) + "px";
		_btnSend.style.top = (inputTop + _inputTextField.offsetHeight + 20) + "px";
		
		// Try and focus the text field
		_inputTextField.focus();
	};
	function destroyKeyboardInputArea() {
		if(_inputFormContainer != null) {
			
			transcendingdigital.removeEventHandler(_btnBack, "click", onSendBackButton);
			transcendingdigital.removeEventHandler(_btnSend, "click", onSendBackButton);
			
			_inputFormContainer.removeChild( _inputTextField );
			_inputFormContainer.removeChild( _btnBack );
			_inputFormContainer.removeChild( _btnSend );
			_widthProviderContainer.removeChild( _inputFormContainer );
			
			_utVisual.removeHTMLElement(_widthProviderContainer);
			
			_widthProviderContainer = null;
			_inputFormContainer = null;
			_inputTextField = null;
			_btnBack = null;
			_btnSend = null;
		}
	};
	function onSendBackButton(e) {
		transcendingdigital.globalSfxUtility.playSoundEffect( transcendingdigital.globalSfxUtility.sfxConstBTN );
		
		if(e.target.value == "Send") {
			
			globalEmailInputSection.doSubmit(e);
			
		} else {
			// Back to the grid section
			_utVisual.raiseCustomEvent(transcendingdigital.ApplicationEventConsts.ConstSectionMain,[{sectionId:transcendingdigital.ApplicationEventConsts.ConstSectionEmailInput,nextSection:transcendingdigital.ApplicationEventConsts.ConstSectionPhotoGrid,visualRef:_utVisual}]);
		}
	};
	// Simple validation - dont care if people input non valid email address
	// just checks for . and @ symbols
	function validateEmail(_InputEmail) {
		var isvalid = true;
		
		if( _InputEmail.indexOf('.') == -1 || _InputEmail.indexOf('@') == -1 ) {
			isvalid = false;
		}
		
		return isvalid;
	};
	function createInstructionText(_textString) {			
			_instructionsContainer = document.createElement("div");
			_instructionsContainer.setAttribute("class", "instructionBar");
			
			// We need to put the text inside a container so we can measure the container vs
			// the %sized parent and adjust the font to fit!			
			_instructions = document.createElement("div");
			_instructions.innerHTML = _textString;
			//_instructions.appendChild( document.createTextNode("TOUCH the Red Box Below") );
			//_instructions.appendChild( document.createElement("br") );
			//_instructions.appendChild( document.createTextNode("to Enter Your E-mail Address") );
			
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
}