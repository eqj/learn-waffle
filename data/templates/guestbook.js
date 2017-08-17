var escape = require('escape-html');

const functionThatConvertsAMessageIntoHtml = (post) => {
    return `
    <p>
    ${escape(post['message'])}<br>
    -- <i>${escape(post['name'])}, ${escape(post['createdAt'])}</i>
    </p>
    `;
};

const functionThatConvertsAlertIntoHtml = (alert) => {
    return `<script> alert("${alert}"); </script>`
};

module.exports = (posts, visits, alerts) => {
    if(alerts == null) {
        alerts = [];
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <title>Leave a message</title>
    <link rel="stylesheet" type="text/css" href="public/style.css">
    ${ alerts.map(x => functionThatConvertsAlertIntoHtml(x)).join("") }
</head>
<body>
    <div id="main">
       <h1>Guestbook like it's 1999</h1>
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
        <input id="submit_button" type="submit" value="Post message" />
        </form>
        
        <img id="header" src="public/kilroy.jpg">
        <div id="content">
            ${ posts.map(x => functionThatConvertsAMessageIntoHtml(x)).join("") }
        </div>
        <div id="footer">
            <h2>Visitors: ${visits}</h2>
        </div>
    </div>
</body>
</html>
`;
};