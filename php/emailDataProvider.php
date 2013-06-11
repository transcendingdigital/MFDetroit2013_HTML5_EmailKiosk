<?php
# This script provides JSON data to the HTML5 e-mail kiosks.
# Nothing too complex here. If a Drupal 7 CMS is present it pulls data from that,
# If no CMS is present it attempts to pull the data from a directory listing.
# If the files are not available in a web server acessible context, the script
# copies them to an acessible directory.
#
# This should not be deployed on the open internet. It should be run over HTTPS only if that's
# the case and may require additional security precautions.
#
# FOR DRUPAL 7.x Service
# The main .NET application uses XML format in services - this uses JSON so you need JSON set in 
# your available formats in the service "server" settings.
## Set no cache in the headers
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
header("Cache-Control:no-cache, must-revalidate");
header("Pragma:no-cache");

## CONFIGURATION ###########
$_DrupalCMSurl = 'http://192.168.0.21/drupal-7.8/';
$_DrupalCMSserviceEndpoint = 'greenscreen';
$_DrupalCMSuserName = 'YOUR DRUPAL USERNAME WITH PERMISSIONS HERE';
$_DrupalCMSuserPassword = 'YOUR DRUPAL PASSWORD FOR THE ABOVE USER HERE';
$_DrupalCMSViewName = 'submitted_green_screen_images';
$_UseCMS = true;
# Set to true if you want these operations to copy any new files into the local relative ./assets/images / cachedLocalPhotos directory
# When using the cms if they are on the same domain it wont copy anyway.
$_LocalCacheFiles = true;
$_DirectoryPath = 'D:/TranscendingDigital/InternalProjects/2013/kinectGreenScreen/application/KinectGreenScreen/KinectGreenScreen/bin/Debug/localFiles/submittedPhotos/';
$_WebAcessiblePath = '/app/assets/images/cachedLocalPhotos/';
############################

if( $_UseCMS == false ) {
	initiateDirectoryDataPull($_DirectoryPath, $_WebAcessiblePath, $_LocalCacheFiles);
} else {
	initiateDrupalDataPull($_DrupalCMSurl, $_DrupalCMSserviceEndpoint, $_DrupalCMSuserName, $_DrupalCMSuserPassword, $_DrupalCMSViewName, $_WebAcessiblePath, $_LocalCacheFiles);
}


function initiateDrupalDataPull($_DrupalURL, $_ServiceEndpointName, $_DrupalUserName, $_DrupalPassword, $_DrupalViewName, $_localCachePath, $_LocalCacheFiles) {
 $_loggedIn = false;
 $_FinalOutput = array();
 # Save the absolute directory path to the base of the app for later
 chdir('../../');
 $_BaseCacheImgDirectory = getcwd() . $_localCachePath;
	
 # We are going to use good old CURL here
 ############### DRUAL LOGIN USING SERVICES 3.x #############
 ## http://drupal.org/node/1491754
	 $user_data = array(
	  'username' => $_DrupalUserName,
	  'password' => $_DrupalPassword,
	 );

	# specifies user/login the .json lets drupal know we want json back
	$drupal_service_login_url = $_DrupalURL . $_ServiceEndpointName . '/user/login.json';
	$curl = curl_init();
	curl_setopt($curl, CURLOPT_URL, $drupal_service_login_url );
	curl_setopt($curl, CURLOPT_POST, 1); // Do a regular HTTP POST
	curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
	curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($user_data)); // Set POST data
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);
	$response = curl_exec($curl);
	# echo $response;
	
	$http_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
	// Check if login was successful
	if ($http_code == 200) {
	  $_loggedIn = true;
	  // Convert json response as array
	  // The logged_user is a pretty complex object
	  $logged_user = json_decode($response);
	  #print_r($logged_user);
	  
	}
	################ END DRUPAL LOGIN ########################
	##########################################################
	
	################ DRUAL VIEW REQUEST ######################
	### Settings in the view determine how many max results will be
	### returned, sorting, formatting, etc. Views are awesome!
	if ( $_loggedIn == true ) {
		
		$drupal_service_view_url = $_DrupalURL . $_ServiceEndpointName . '/views/' . $_DrupalViewName . '.json';
		
		// Define cookie session
		$cookie_session = $logged_user->session_name . '=' . $logged_user->sessid;

		$curl = curl_init();
		curl_setopt($curl, CURLOPT_URL, $drupal_service_view_url );
		curl_setopt($curl, CURLOPT_POST, 0); // Do a HTTP GET oddly for the views they dont 
		// require any post data except the cookie in the header
		curl_setopt($curl, CURLOPT_HEADER, FALSE);  // Ask to not return Header
		curl_setopt($curl, CURLOPT_COOKIE, "$cookie_session"); // use the previously saved session
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);
		curl_setopt($curl, CURLOPT_FAILONERROR, TRUE);
		$response = curl_exec($curl);
		$http_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		
		// Check if login was successful
		if ($http_code == 200) {
		  // Convert json response as array
		  $viewData = json_decode($response);
		  # Check if the CMS is on a different IP / Domain from this script. If so, we need to
		  # copy content from the CMS local for the javascript email apps.
		  $LocalFileCopyRequired = false;
		  if ( strpos($_DrupalURL, $_SERVER["SERVER_NAME"]) === false ) {
			$LocalFileCopyRequired = true;
			# Also check our configuration setting...
			$LocalFileCopyRequired = $_LocalCacheFiles;
		  }

		  // At the highest level these are arrays of 0 or more elements
		  // The second level will depend on your custom content type names
		  // in my case they are "field_submitted_image"
		  for ($i = 0; $i < count($viewData); $i++) {
			$ThisFileNameOnly = $viewData[$i] -> field_submitted_image -> und[0] -> filename;
			
			if( $LocalFileCopyRequired == true ) {
				# Check for the file in the local cache - if not on the same server - we do this
				# due to awesome AJAX XML / HTTP requests not working across different domains
				if( ! file_exists(($_BaseCacheImgDirectory . $ThisFileNameOnly)) ){
					# Copy the file to local cache
					if ( copy($_DrupalURL . 'sites/default/files/' . $ThisFileNameOnly, ($_BaseCacheImgDirectory . $ThisFileNameOnly) ) ) {
						# Copy suceeded - add the file to the final output
						array_push($_FinalOutput, "http://" . $_SERVER["SERVER_NAME"] . $_localCachePath . $ThisFileNameOnly );
					}
				} else {
					array_push($_FinalOutput, "http://" . $_SERVER["SERVER_NAME"] . $_localCachePath . $ThisFileNameOnly );
				}
			} else {
				array_push( $_FinalOutput, $_DrupalURL . 'sites/default/files/' . $ThisFileNameOnly );
			}
		  }
		  //echo('<br/><br/>');
		  //print_r($viewData);
		}
		##########################################################
		#### REGUARDLESS IF SUCESSFUL LOGIN TRY LOGOUT ###########
		$drupal_service_logout_url = $_DrupalURL . $_ServiceEndpointName . '/user/logout.json';
		# We can use our cookies defined previously
		$curl = curl_init();
		curl_setopt($curl, CURLOPT_URL, $drupal_service_logout_url );
		curl_setopt($curl, CURLOPT_POST, 1); // Do a HTTP GET oddly for the views they dont 
		// require any post data except the cookie in the header
		curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json')); // Ask for the header back in JSON
		curl_setopt($curl, CURLOPT_COOKIE, "$cookie_session"); // use the previously saved session
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);
		curl_setopt($curl, CURLOPT_FAILONERROR, TRUE);
		$response = curl_exec($curl);
		$http_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		if ($http_code == 200) {
		  // Convert json response as array
		  $logged_out = json_decode($response);
		  # It usually just returns 0 if we werent logged in anyway or 1 if we were and logged out
		  #echo('<br/><br/>');
		  #print_r($logged_out);
		}
	}
	
	if ( count($_FinalOutput) > 0 ) {
		echo json_encode($_FinalOutput);
	}
}
function initiateDirectoryDataPull($_absDirPath, $_localCachePath, $_LocalCacheFiles) {

	$_FinalOutput = array();

	# Save the absolute directory path to the base of the app for later
	chdir('../../');
	$_BaseCacheImgDirectory = getcwd() . $_localCachePath;
	
	$non_cache_files = glob($_absDirPath . '*.jpg');
	usort($non_cache_files, function($a, $b) {
		return filemtime($a) < filemtime($b);
	});
	
	// iterate over up to fifty most recent files outputting them, copying them to local cache first if needed
	$maxIndex = count($non_cache_files);
	if ( $maxIndex > 50 ) $maxIndex = 50;
	
	for ($i = 0; $i < $maxIndex; $i++) {
		if ( $_LocalCacheFiles == false) {
			array_push($_FinalOutput, $non_cache_files[$i] );
		} else {
			$lastSlashIndex = strrpos($non_cache_files[$i], '/');
			$fileNameOnly = '';
			if ( $lastSlashIndex === false ) {
				$fileNameOnly = $non_cache_files[$i];
			} else {
				$fileNameOnly = substr( $non_cache_files[$i] , $lastSlashIndex + 1 );
			}
			
			# OK check if the remote file exhists in our local cache
			if ( $fileNameOnly != '' ) {
			# I think we need an abs path reference
				if( ! file_exists(($_BaseCacheImgDirectory . $fileNameOnly)) ){
					# Copy the file to local cache
					if ( copy($non_cache_files[$i], ($_BaseCacheImgDirectory . $fileNameOnly) ) ) {
						# Copy suceeded - add the file to the final output
						array_push($_FinalOutput, "http://" . $_SERVER["SERVER_NAME"] . $_localCachePath . $fileNameOnly );
					}
				} else {
				# No need to copy add the file to the final list
				array_push($_FinalOutput, "http://" . $_SERVER["SERVER_NAME"] . $_localCachePath . $fileNameOnly );
				}
			}
		}
	}
	
	if ( count($_FinalOutput) > 0 ) {
		echo json_encode($_FinalOutput);
	}
}
?>