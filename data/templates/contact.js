const functionThatConvertsAMessageIntoHtml = (post) => {
    return `
    <p>Name: ${post['name']}<br>
    Message: ${post['message']}</p>
    `;
};

module.exports = (posts, visitCounter) => {
    return `<!DOCTYPE html>
<html lang="en">

<head>

    <title>Guestbook Like It's The 90s</title>
    <link rel="stylesheet" type="text/css" href="public/style.css"> 
</head>
<body>
   <h1>Leave a message!</h1>
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
    
    <h1>See who piddled on the kitchen floor:</h1>
    ${ posts.map(x => functionThatConvertsAMessageIntoHtml(x)).join("\n") }
    
    <img src="public/under-construct.gif">
    
    <h2>Visits: ${visitCounter}</h2>
    
</body>
</html>
`;
};