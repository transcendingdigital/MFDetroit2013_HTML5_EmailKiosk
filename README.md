Maker Faire Detroit 2013 HTML5 Email Kiosk
==============================

This kiosk application was created for Maker Faire Detroit 2013 to accompany a green screen Kinect experience. This project is in no way affiliated with the
Henry Ford or Maker Faire.  It was an independent project. The experience will be deployed in the exhibit space on an ipad1 and ipad2.

A html5 kiosk for emailing user photos taken in an exhibit space. Integrates with Drupal 7 or a local web server. Most development on this project
has been tested under ios5, ios6, Firefox, IE, and Chrome.

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

$_DrupalCMSurl - The root url of the drupal site.
$_DrupalCMSserviceEndpoint - The Drupal service endpoint name.
$_DrupalCMSuserName - A username that can log into Drupal.
$_DrupalCMSuserPassword - The password of the user above.
$_DrupalCMSViewName - The name of the view setup inside of drupal that provides a list of the submitted images.
$_UseCMS - Set to true to use the CMS or false to use the directory pull.
$_LocalCacheFiles - If set to true, it will copy images into the relative /assets/images/cachedLocalPhotos directory.
$_DirectoryPath - An absolute directory when not using the CMS that can be used to find images to email.
$_WebAcessiblePath - the relative path to where you want photos cached..you really should not change this.

### 4. Configure the Static Javascript Values
src/transcendingdigital/ApplicationEventConsts.js

Contains the configuration options that javascript uses client side to make everything work.  You should for the most part leave
everything alone in this file except for the following three values:
this.constDataRequestURL = "http://192.168.0.8/app/php/emailDataProvider.php";
this.constDataRequestTimeMS = 3000;
this.constEmailURL = "http://192.168.0.8/app/php/emailSimple.php";

These values specify where the JSON list of images comes from, the rate to poll that script, and the script used to send email.  You should set these
up to work in your own local environment.

External Libraries Used
--------------------------------------------------
[SwiftMailer](http://swiftmailer.org/)
	
[CreateJS](http://www.createjs.com/)
	
Licenses
--------------------------------------------------
This project is licensed under the freeBSD license.

SwiftMailer is licensed under the GNU Lesser General Public License V3.

CreateJS is licensed under the MIT license.
