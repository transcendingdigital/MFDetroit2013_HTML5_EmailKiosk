/*
* ApplicationEventConsts
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
transcendingdigital.ApplicationEventConsts = function() {
	
	// PUB METHODS/Properties
	this.ConstEventTransitionOnComplete = "ApplicationEventConsts.transcendingdigital.ConstEventTransitionOnComplete";
	this.ConstEventTransitionOffComplete = "ApplicationEventConsts.transcendingdigital.ConstEventTransitionOffComplete";
	this.ConstEventInitComplete = "ApplicationEventConsts.transcendingdigital.ConstEventInitComplete";
	this.ConstEventMenuSelection = "ApplicationEventConsts.transcendingdigital.ConstEventMenuSelection";
	
	this.ConstSectionEnd = "ApplicationEventConsts.transcendingdigital.ConstSectionEnd";
	this.ConstSectionPrivacyPolicy = "ApplicationEventConsts.transcendingdigital.ConstSectionPrivacyPolicy";
	this.ConstSectionEmailInput = "ApplicationEventConsts.transcendingdigital.ConstSectionEmailInput";
	this.ConstSectionPhotoGrid = "ApplicationEventConsts.transcendingdigital.ConstSectionPhotoGrid";
	this.ConstSectionPhoto = "ApplicationEventConsts.transcendingdigital.ConstSectionPhoto";
	this.ConstSectionMain =  "ApplicationEventConsts.transcendingdigital.ConstSectionMain";
	this.ConstSectionAudio = "ApplicationEventConsts.transcendingdigital.ConstSectionAudio";
	this.ConstSectionVideo = "ApplicationEventConsts.transcendingdigital.ConstSectionVideo";
	this.ConstSectionAttract = "ApplicationEventConsts.transcendingdigital.ConstSectionAttract";
	
	this.constDataRequestURL = "http://192.168.0.8/app/php/emailDataProvider.php";
	this.constDataRequestTimeMS = 3000;
	this.constEmailURL = "http://192.168.0.8/app/php/emailSimple.php";
	
	// Time we go in MS without a touch to return to the attract loop
	this.constTimeoutTimeMS = 30000;
	
	// Time we hold the end screen in MS before returning to the attract loop
	this.constEndHoldTimeMS = 10000;
	
	// This variable actually holds the volitle data thats continually updated that drives the app
	//this.volitlePhotoData = ["http:\/\/192.168.0.8\/app\/assets\/images\/tmpGalleryPhotos\/5.jpg","http:\/\/192.168.0.8\/app\/assets\/images\/tmpGalleryPhotos\/6.jpg","http:\/\/192.168.0.8\/app\/assets\/images\/tmpGalleryPhotos\/7.jpg","http:\/\/192.168.0.8\/app\/assets\/images\/tmpGalleryPhotos\/8.jpg","http:\/\/192.168.0.8\/app\/assets\/images\/tmpGalleryPhotos\/9.jpg"];
	this.volitlePhotoData = null;
	this.maxPhotosInMemory = 100;
	// This variable holds the most recent user selected image to email
	this.userSelectedPhoto = "";
	// This variable holds the users email address
	this.usersEmailAddress = "";
	// The privacy policy
	this.privacyPolicy = "To comply with the Children's Online Privacy Protection Act (COPPA), you must be 13 years old or have a parents permission to use this e-mail kiosk.<br/><br/>" +
	"We will not retain these e-mail addresses except in application log files which will be deleted 30 days following this event. E-mail addresses will not be used for any further " +
	"solicitation other than sending this media.  Actual photos will be retained 30 days following the event for user retrieval or additional copies.  After 30 days, media generated " + 
	"using these exhibits will be deleted.";
	// The end user message
	this.finalUserMessage = "Your e-mail has been sent.  Please check your inbox for an e-mail from greenscreen@makerfairemosaic.com with the subject \"Your Maker Faire Detroit 2013 Photo\". ";
}