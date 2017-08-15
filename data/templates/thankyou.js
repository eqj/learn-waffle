module.exports = ( name ) => {
    return `<!DOCTYPE html>
<html lang="en">

<head>

    <title>Email received</title>
</head>
<body>
   <h1>Thank you, ${name}</h1>
</body>
</html>
`;
}