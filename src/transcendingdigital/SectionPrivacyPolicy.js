/*
* sectionPrivacyPolicy
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
	
transcendingdigital.SectionPrivacyPolicy = function() {
	if(false === (this instanceof transcendingdigital.SectionPrivacyPolicy)) {
        return new transcendingdigital.SectionPrivacyPolicy();
    }
	
	// PRIVATE PROPERTIES
	var _bgLoader;
	var _utVisual = null;
	
	var _widthProviderContainer = null;
	var _privacyTextArea = null;
	var _btnBack = null;
	var _btnSend = null;
	
	var _instructionsContainer = null;
    var _instructions = null;
	
	// METHODS
	this.init = function(_w,_h, _initCompleteCallback, _transitionOnCallback, _transitionOffCallback, _toMainCallback) {
		_utVisual = new transcendingdigital.UtilVisualHelper();
		_utVisual.init(_w,_h,0,0);
		 if(_initCompleteCallback != null) _utVisual.latchCustomEvent(transcendingdigital.ApplicationEventConsts.ConstEventInitComplete,_initCompleteCallback);
		 if(_transitionOnCallback != null) _utVisual.latchCustomEvent(transcendingdigital.ApplicationEventConsts.ConstEventTransitionOnComplete,_transitionOnCallback);
		 if(_transitionOffCallback != null) _utVisual.latchCustomEvent(transcendingdigital.ApplicationEventConsts.ConstEventTransitionOffComplete,_transitionOffCallback);
		 if(_toMainCallback != null) _utVisual.latchCustomEvent(transcendingdigital.ApplicationEventConsts.ConstSectionMain, _toMainCallback);

		// In order to give this shape, we need help of javascript to know the current width of the
		// screen
			_widthProviderContainer = document.createElement("div");
			_widthProviderContainer.setAttribute("name","widthProvider");
			_widthProviderContainer.setAttribute("style","width: " + _utVisual._currentWidth + "px;");
			_utVisual.addHTMLElement(_widthProviderContainer);
				
			createInstructionText();
			createPrivacyArea();
			// Swap positioning on instructionsContainer to relative instead of fixed due to IOS bug with keyboard and fixed position
			_instructionsContainer.style.position = "relative";
				
		 // Let the parent know we are ready
		 _utVisual.raiseCustomEvent(transcendingdigital.ApplicationEventConsts.ConstEventInitComplete,[{sectionId:transcendingdigital.ApplicationEventConsts.ConstSectionPrivacyPolicy,visualRef:_utVisual}]);
	};
	this.resizeSection = function(_w,_h) {
		_utVisual.resizeArea(_w,_h);
		
		if(_widthProviderContainer != null) {
			_widthProviderContainer.setAttribute("style","width: " + _utVisual._currentWidth + "px;");
		}
		if(_instructions != null) {
			// Rest the text size - force it to fit into the new size
			_instructions.style.fontSize = "80px";
			// Now we get to resize the text to fit the container YAY
			_utVisual.fitTextInField( _instructionsContainer, _instructions );
		}
		if(_privacyTextArea != null) {
			_privacyTextArea.style.width = (_utVisual._currentWidth / 2) + "px";
					
			var privacyLeft = _utVisual._currentWidth / 2 - (_utVisual._currentWidth / 2) / 2;
			var privacyTop = (_instructionsContainer.offsetHeight + 40);
			
			_privacyTextArea.style.top = privacyTop + "px";
			_privacyTextArea.style.left = privacyLeft + "px";
		
			var sendLeft = privacyLeft + _privacyTextArea.offsetWidth - _btnSend.offsetWidth;
			
			if( (privacyLeft + _btnBack.offsetWidth) >= sendLeft ) {
				var distanceToGo = (privacyLeft + _btnBack.offsetWidth) - sendLeft;
				privacyLeft -= (distanceToGo / 2) + 10;
				sendLeft += (distanceToGo / 2) + 10;
			}
			
			_btnBack.style.top = (privacyTop + _privacyTextArea.offsetHeight + 40) + "px";
			_btnBack.style.left = privacyLeft + "px";
			
			_btnSend.style.top = (privacyTop + _privacyTextArea.offsetHeight + 40) + "px";
			_btnSend.style.left = sendLeft + "px";
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
		destroyPrivacyArea();
		
		if(_utVisual != null) {
			_utVisual.destroyInternals();
			_utVisual = null;
		}
	};
	
	// PRIVATE METHODS
	function createPrivacyArea() {
		/*
		We can use some of the previous css over for this form
		This is essentially what we need here
		<div id="IDsoleMainHtmlContainer" name="soleMainHtmlContainer" style="position: absolute; top: 0px; left: 0px;">
			<div style="width:700px">
						<div style="height:400px;border:1px solid #ccc;font:16px/26px Georgia, Garamond, Serif;overflow:auto;color:#FFFFFF;">
						This is the privacy policy. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
						</div>
						<input class="featureSelectButton" type="button" value="Back" onclick="injectThumb();" />
						<input class="featureSelectButton" type="button" value="Agree" onclick="injectThumb();" />
			</div>
		</div>
		*/
		
		_privacyTextArea = document.createElement("div");
		_privacyTextArea.setAttribute("class","privacyPolicyArea");
		_privacyTextArea.innerHTML = transcendingdigital.ApplicationEventConsts.privacyPolicy;
		_privacyTextArea.style.width = (_utVisual._currentWidth / 2) + "px";
		
		var privacyLeft = _utVisual._currentWidth / 2 - (_utVisual._currentWidth / 2) / 2;
		var privacyTop = (_instructionsContainer.offsetHeight + 40);
		
		_privacyTextArea.style.top = privacyTop + "px";
		_privacyTextArea.style.left = privacyLeft + "px";
		
		_btnBack = document.createElement("input");
		_btnBack.setAttribute("class","featureSelectButton");
		_btnBack.setAttribute("type","button");
		_btnBack.setAttribute("value","Back");
		_btnBack.setAttribute("ontouchstart","");
		transcendingdigital.addEvent(_btnBack, "click", onAgreeBack);
								
		_btnSend = document.createElement("input");
		_btnSend.setAttribute("class","featureSelectButton");
		_btnSend.setAttribute("type","button");
		_btnSend.setAttribute("value","Accept");
		_btnSend.setAttribute("ontouchstart","");
		transcendingdigital.addEvent(_btnSend, "click", onAgreeBack);
		
		_widthProviderContainer.appendChild( _privacyTextArea );
		_widthProviderContainer.appendChild( _btnBack );
		_widthProviderContainer.appendChild( _btnSend );
		
		var sendLeft = privacyLeft + _privacyTextArea.offsetWidth - _btnSend.offsetWidth;
		
		if( (privacyLeft + _btnBack.offsetWidth) >= sendLeft ) {
			var distanceToGo = (privacyLeft + _btnBack.offsetWidth) - sendLeft;
			privacyLeft -= (distanceToGo / 2) + 10;
			sendLeft += (distanceToGo / 2) + 10;
		}
		
		_btnBack.style.top = (privacyTop + _privacyTextArea.offsetHeight + 40) + "px";
		_btnBack.style.left = privacyLeft + "px";
		
		_btnSend.style.top = (privacyTop + _privacyTextArea.offsetHeight + 40) + "px";
		_btnSend.style.left = sendLeft + "px";
		
	};
	function destroyPrivacyArea() {
		if(_privacyTextArea != null) {
			
			transcendingdigital.removeEventHandler(_btnBack, "click", onAgreeBack);
			transcendingdigital.removeEventHandler(_btnSend, "click", onAgreeBack);
			
			_widthProviderContainer.removeChild( _privacyTextArea );
			_widthProviderContainer.removeChild( _btnBack );
			_widthProviderContainer.removeChild( _btnSend );
			
			_utVisual.removeHTMLElement(_widthProviderContainer);
			
			_widthProviderContainer = null;
			_privacyTextArea = null;
			_btnBack = null;
			_btnSend = null;
		}
	};
	function onAgreeBack(e) {
		// Remove the listeners right away
		transcendingdigital.removeEventHandler(_btnBack, "click", onAgreeBack);
		transcendingdigital.removeEventHandler(_btnSend, "click", onAgreeBack);
			
		transcendingdigital.globalSfxUtility.playSoundEffect( transcendingdigital.globalSfxUtility.sfxConstBTN );
				
		if(e.target.value == "Accept") {
			// Show confirmation
			_utVisual.raiseCustomEvent(transcendingdigital.ApplicationEventConsts.ConstSectionMain,[{sectionId:transcendingdigital.ApplicationEventConsts.ConstSectionPrivacyPolicy,nextSection:transcendingdigital.ApplicationEventConsts.ConstSectionEnd,visualRef:_utVisual}]);
			// Play narration for the next section in a click handler or ios wont play it
			transcendingdigital.globalSfxUtility.playSoundEffect( transcendingdigital.globalSfxUtility.sfxConstSENDING_EMAIL );
			} else {
			// Back to the grid section
			_utVisual.raiseCustomEvent(transcendingdigital.ApplicationEventConsts.ConstSectionMain,[{sectionId:transcendingdigital.ApplicationEventConsts.ConstSectionPrivacyPolicy,nextSection:transcendingdigital.ApplicationEventConsts.ConstSectionPhotoGrid,visualRef:_utVisual}]);
		}
	};
	function createInstructionText() {			
			_instructionsContainer = document.createElement("div");
			_instructionsContainer.setAttribute("class", "instructionBar");
			
			// We need to put the text inside a container so we can measure the container vs
			// the %sized parent and adjust the font to fit!			
			_instructions = document.createElement("div");
			_instructions.appendChild( document.createTextNode("Do You Agree With The Terms of Service?") );
			
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