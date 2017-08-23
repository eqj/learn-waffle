
const functionThatConvertsAlertIntoHtml = (alert) => {
    return `<h3 class="errors">${alert}</h3>`
};

module.exports = ({alerts}) => {
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
                <h1>Login</h1>
            </div>
            <form action="#" method="POST" enctype="application/x-www-form-urlencoded">
                <div class="row">
                    <label for="username">Username:</label><br />
                    <input id="username" class="input" name="username" type="text" value="" size="30" /><br />
                </div>
                <div class="row">
                    <label for="email">Email:</label><br />
                    <input id="email" class="input" name="email" type="text" value="" size="30" /><br />
                </div>
                <div class="row">
                    <label for="password">Password:</label><br />
                    <input id="password" class="input" name="password" type="password" value="" size="30" /><br />
                </div>
                <div class="errors">
                    ${ alerts.map(x => functionThatConvertsAlertIntoHtml(x)).join('\n') }
                </div>
                <input id="submit_button" type="submit" value="Register" />
                Already registered? Log in <a href="/login">here!</a>
            </form>
        </div>
    </body>
</html>
`;
};