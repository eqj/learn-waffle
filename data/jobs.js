
module.exports = ( {queue} ) => {

    // Make-believe email thing, pretend this emails!
    const sendEmail = ({recipient, subject, body}) => {
        console.log('Starting to send an email...');

        // Boy this email sending sure is horribly inefficient and slow!
        function wait(ms) {
            let start = Date.now(),
                now = start;
            while (now - start < ms) {
                now = Date.now();
            }
        }

        // What could possibly be taking so long!?
        wait(5000);

        console.log(`I AM AN EMAIL!`);
        console.log(`address: ${recipient}`);
        console.log(`subject: ${subject}`);
        console.log(`message: ${body}`);
    };

    // Process the email queue
    queue.process('email', function(job, done){
        sendEmail({
            recipient: job.data.recipient,
            subject: job.data.subject,
            body: job.data.body
        });
        done();
    });

};