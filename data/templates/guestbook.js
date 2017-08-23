var escape = require('escape-html');

const functionThatConvertsAMessageIntoHtml = (post) => {
    return `
    <p class="messages">
    ${escape(post['message'])}<br>
    -- <i><a href="/user/${escape(post['name'])}">${escape(post['name'])}</a>, ${escape(post['createdAt'].toDateString())}</i>
    </p>
    `;
};

const functionThatConvertsAlertIntoHtml = (alert) => {
    return `<h3 class="errors">${alert}</h3>`
};

module.exports = ({posts, visits, alerts, username, email}) => {
    return `<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Learn dem boops</title>
        <link rel="stylesheet" type="text/css" href="/public/style.css">
        <link rel="icon" type="image/png" href="/public/favicon.ico" />
    </head>
    <body>
        <div id="main">
            <div id="bar">
                <h1>Guestbook like it's 1999!</h1>
            </div>
            <form action="#" method="POST" enctype="application/x-www-form-urlencoded">
                <div class="row">
                    <label for="name">Your name:</label><br />
                    <input id="name" class="input" name="name" type="text" value='${username}' size="30" /><br />
                </div>
                <div class="row">
                    <label for="email">Your email:</label><br />
                    <input id="email" class="input" name="email" type="text" value='${email}' size="30" /><br />
                </div>
                <div class="row">
                    <label for="message">Your message:</label><br />
                    <textarea id="message" class="input" name="message" rows="7" cols="30"></textarea><br />
                </div>
                <div class="errors">
                    ${ alerts.map(x => functionThatConvertsAlertIntoHtml(x)).join('\n') }
                </div>
                <input id="submit_button" type="submit" value="Post message" />
                <a href="/login">Log in</a>
            </form>
            <img id="header" src="public/images/kilroy.jpg">
            <div id="content">
                ${ posts.map(x => functionThatConvertsAMessageIntoHtml(x)).join('\n') }
            </div>
            <div id="bar">
                <h2>Visitors: ${visits}</h2>
            </div>
        </div>
    </body>
</html>
`;
};