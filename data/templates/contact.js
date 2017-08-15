module.exports = () => {
    return `<!DOCTYPE html>
<html lang="en">

<head>

    <title>Contact Form</title>
</head>
<body>
   <h1>Enter yo contact info, yo</h1>
   <form id="contact_form" action="#" method="POST" enctype="application/x-www-form-urlencoded">
	<div class="row">
		<label for="name">Your name:</label><br />
		<input id="name" class="input" name="name" type="text" value="" size="30" /><br />
	</div>
	<div class="row">
		<label for="email">Your email:</label><br />
		<input id="email" class="input" name="email" type="text" value="" size="30" /><br />
	</div>
	<div class="row">
		<label for="message">Your message:</label><br />
		<textarea id="message" class="input" name="message" rows="7" cols="30"></textarea><br />
	</div>
	<input id="submit_button" type="submit" value="Send email" />
    </form>	
</body>
</html>
`;
}