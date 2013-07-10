Maker Faire Detroit 2013 HTML5 Email Kiosk
==============================

This kiosk application was created for Maker Faire Detroit 2013 to accompany a green screen Kinect experience. This project is in no way affiliated with the
Henry Ford or Maker Faire.  It was an independent project. The experience will be deployed in the exhibit space on an ipad1 and ipad2.

A device independent html5 kiosk for emailing user photos taken in an exhibit space. Integrates with Drupal 7 or a local web server. Most development on this project
has been tested under ios5, ios6, Firefox, IE, and Chrome. This is a reactive application, so it resizes itself to fit the screen area available on the device.

##### Motivation
In an age of social media and smart phones, as professionals in the museum and visitor center industry it is important to keep an ever vigilant eye on accessibility for all visitors.  The one unencumbered technology that pretty much everyone has access to from grandma to foreign dignitaries is E-mail.  Although in this experience, the kiosk e-mails personal photos; it can easily be adapted to e-mail other interpretive content.

Why open source this project? It is the right thing to do for this venue. We hope that institutions and individuals can dig in, tailor the project to meet their needs, and have fun learning the technology.

UI Screen Shots
--------------------------------------------------
![The attract UI on an iPad](https://github.com/transcendingdigital/MFDetroit2013_HTML5_EmailKiosk/raw/master/githubImages/MFDetHtml5App2.PNG "The attract UI on an ipad1")
![Photo Selection UI on an ipad1](https://github.com/transcendingdigital/MFDetroit2013_HTML5_EmailKiosk/raw/master/githubImages/MFDetHtml5App3.PNG "Photo selection UI on an ipad1")
![Terms of service page](https://github.com/transcendingdigital/MFDetroit2013_HTML5_EmailKiosk/raw/master/githubImages/MFDetHtml5App4.PNG "Terms of service page")
![The attract UI on an iPhone](https://github.com/transcendingdigital/MFDetroit2013_HTML5_EmailKiosk/raw/master/githubImages/ios6IPhone.jpg "The attract UI on an iPhone")
![Image selection on an Android 4 Device](https://github.com/transcendingdigital/MFDetroit2013_HTML5_EmailKiosk/raw/master/githubImages/Android4PhoneVert.jpg "Image selection on an Android 4 Device")
	
Configuration Options
--------------------------------------------------
There are a few important configuration items that you will need to set to get this experience to work for your situation.

### 1. Configure the PHP Email Script
In order to send e-mail this experience uses a server-side php script that uses the [SwiftMailer](http://swiftmailer.org/) library.  Swiftmailer is pretty easy
to use, but you have to configure it with your credentials. For testing, I used a gmail account; but the deployment version will use Amazon SES.

Dive into /php/emailSimple.php

1. Set your human readable e-mail address name where the script says YOUR NAME HERE
2. Set your actual e-mail address where the script says YOUR EMAIL ADDRESS HERE
3. Optionally change the subject of the email
4. Set a gmail account username where it says YOUR_GMAIL_USERNAME
5. Set the password for the gmail account where it says YOUR_GMAIL_PASSWORD

### 2. Configure the contents of the e-mail
Asside from the image attachment, the body of the e-mail is set from an external text file.  You can edit the
contents of /php/emailHtmlContents.txt to match your desired body message.

### 3. Configure the PHP Data Provider Script
In order to provide the list of images that this kiosk should display, it takes in a JSON encoded list of images that
is constantly polled every few seconds.  The server side script that provides this functionality can be found at:

/php/emailDataProvider.php

##### Using a local directory of images
The most simple way to use this script is to provide it the absolute path to a directory where you have images that you
would like this kiosk to e-mail.  In order to do this, you should:

1. Set $_UseCMS to false
2. Change $_DirectoryPath to an absolute directory on your computer or the server where images to email are stored.
3. If the absolute path in 2 is not in a web acessible directory, set $_LocalCacheFiles to true if it is not already.

This will cause the script to organize the files in the directory specified in 2 by most recently modified and pull the top 
50. If $_LocalCacheFiles is set to true, this will copy those files into the relative /assets/images/cachedLocalPhotos directory.

##### Using the Drupal 7 CMS
For users not familiar with Drupal 7 services, this will be very confusing.  The real deployment uses Drupal, because we want the
flexibility to quickly delete users images within the space. A CMS is good practice for deployments anyway so non technical users
can take a step back from the exhibit technology and just administrate it. This script requires CURL in php.

This script can log into a Drupal 7 instance using a JSON service endpoint. This uses the "Services" module and also the "Views" module within Drupal.
In this script, I have my core Drupal 7 site at the location set by: $_DrupalCMSurl.  The endpoint name is set by: $_DrupalCMSserviceEndpoint.
You will have to set a username and password that can log into your Drupal deployment and has permissions to access the view you are trying to pull.
A recap of all the config variables:

``` $_DrupalCMSurl ```- The root url of the drupal site.

``` $_DrupalCMSserviceEndpoint ```- The Drupal service endpoint name.

``` $_DrupalCMSuserName ```- A username that can log into Drupal.

``` $_DrupalCMSuserPassword ```- The password of the user above.

``` $_DrupalCMSViewName ```- The name of the view setup inside of drupal that provides a list of the submitted images.

``` $_UseCMS ```- Set to true to use the CMS or false to use the directory pull.

``` $_LocalCacheFiles ```- If set to true, it will copy images into the relative /assets/images/cachedLocalPhotos directory.

``` $_DirectoryPath ```- An absolute directory when not using the CMS that can be used to find images to email.

``` $_WebAcessiblePath ```- the relative path to where you want photos cached..you really should not change this.

### 4. Configure the Static Javascript Values
src/transcendingdigital/ApplicationEventConsts.js

Contains the configuration options that javascript uses client side to make everything work.  You should for the most part leave
everything alone in this file except for the following three values:
	
``` this.constDataRequestURL = "http://192.168.0.8/app/php/emailDataProvider.php"; ```

``` this.constDataRequestTimeMS = 3000; ```

``` this.constEmailURL = "http://192.168.0.8/app/php/emailSimple.php"; ```

These values specify where the JSON list of images comes from, the rate to poll that script, and the script used to send email.  You should set these
up to work in your own local environment.

### 5. Setup an Ipad as a Kiosk
An iPad can be easily configured as a kiosk so users cannot exit the application.  The steps differ on an iPad1 vs 2 and above.
	
##### Using an iPad1
The last version of ios for an iPad1 is 5.x this version requires the home button to be physically covered in a kiosk deployment.
The iPad1 does not have the ability to close apps using a five finger pinch motion.

1. Physically cover the home button using an external enclosure.
2. In Settings -> General set Auto-Lock to Never.
3. Open mobile Safari and navigate to the URL where this application is being run from.
4. Press the button to add the page as a bookmark and select "Add to Home Screen".
5. Launch the application from the new icon on your home screen.

##### Using an iPad2 or above
ios6 and up have the ability to close applications using a five finger claw like gesture this makes covering the home button
a potential problem.  Thankfully ios6 also introduced Guided Access.

1. Optionally physically cover the home button.
2. In Settings -> General set Auto-Lock to Never.
3. Open mobile Safari and navigate to the URL where this application is being run from.
4. Press the button to add the page as a bookmark and select "Add to Home Screen".
5. In Settings -> General enable Guided Access and Set a Passcode.
6. Navigate to the icon for this app and launch it.
7. Press the home button three times to launch the guided access options and start guided access mode.

![ios6 add the app icon to your home screen](https://github.com/transcendingdigital/MFDetroit2013_HTML5_EmailKiosk/raw/master/githubImages/ios6iPadAddHome.jpg "ios6 add the app icon to your home screen")
![ipad home screen showing the application icon](https://github.com/transcendingdigital/MFDetroit2013_HTML5_EmailKiosk/raw/master/githubImages/ios6iPadAddHome.jpg "ipad home screen showing the application icon")
	
External Libraries Used
--------------------------------------------------
[SwiftMailer](http://swiftmailer.org/)
	
[CreateJS](http://www.createjs.com/)
	
Licenses
--------------------------------------------------
This project is licensed under the freeBSD license.

SwiftMailer is licensed under the GNU Lesser General Public License V3.

CreateJS is licensed under the MIT license.
