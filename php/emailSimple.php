<?php
# You should not use this in an open web environment as it can easily be used to send unsolicited mail
	if( isset( $_GET['eAddr'] ) && isset( $_GET['attach'] ) ) {
		require_once 'swiftMail/swift_required.php';
		
		$senderName = 'YOUR NAME HERE';
		$senderEmail =  'YOUR EMAIL ADDRESS HERE';
		$sendToEmail =  $_GET['eAddr'];
		$subject = 'Your Maker Faire Detroit 2013 Photo';
		$emailMessage = file_get_contents('emailHtmlContents.txt');
		if ($emailMessage === false) {
			$emailMessage = "We hope you enjoyed Maker Faire Detroit 2013!";
		}
		# A plus with swiftmail is we dont have to use the built in postfix / sendmail if we
		# dont want to
		#$mailTransport = Swift_SendmailTransport::newInstance('/usr/sbin/sendmail -bs');
		try {
			$mailTransport = Swift_SmtpTransport::newInstance('smtp.gmail.com', 465, 'ssl')
			->setUsername('YOUR_GMAIL_USERNAME')
			->setPassword('YOUR_GMAIL_PASSWORD');
			$swiftMailer = Swift_Mailer::newInstance($mailTransport);
			
			$swiftMessage = Swift_Message::newInstance()
				->setSubject($subject)
				->setFrom(array($senderEmail => $senderName))
				->setTo(array($sendToEmail))
				->setBody($emailMessage, 'text/html')
			;
			
			# An attachment
			#$swiftMessage-> attach( Swift_Attachment::fromPath('../assets/images/tmpGalleryPhotos/4.jpg') );
			$swiftMessage-> attach( Swift_Attachment::fromPath( $_GET['attach'] ) );
			# send the mail ignoring the number sent
			$swiftMailer -> send($swiftMessage);
			
			echo 'SUCESS';
		} catch (Exception $e) {
			echo $e;
		}
	}
?>