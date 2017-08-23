var escape = require('escape-html');

const functionThatConvertsAMessageIntoHtml = (post) => {
    return `
    <p class="messages">
    ${escape(post['message'])}<br>
    -- <i>${escape(post['name'])}, ${escape(post['createdAt'].toDateString())}</i>
    </p>
    `;
};

module.exports = ({posts, username}) => {

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
                <h1>${username}'s Last 10 Posts!</h1>
            </div>
            <img id="header" src="public/images/kilroy.jpg">
            <div id="content">
                ${ posts.map(x => functionThatConvertsAMessageIntoHtml(x)).join('\n') }
            </div>
        </div>
    </body>
</html>
`;
};