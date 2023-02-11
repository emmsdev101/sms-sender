require('dotenv').config()
const express = require('express');
const cors = require('cors');

// Initialize the app;
const app = express();

// Allows Cross-Origin Resource Sharing for this app.
app.use(cors());
app.use(express.json());

// Assign a port where the app is exposed.
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
    const APP_ID = process.env.APP_ID;
    const APP_SECRET = process.env.APP_SECRET;
    const code = req.query.code;
    if (!code) {
        res.status(403).send({ message: 'Invalid request.'});
    };
// Construct our POST url.
    const globe_labs_url = `https://developer.globelabs.com.ph/oauth/access_token?app_id=${APP_ID}&app_secret=${APP_SECRET}&code=${code}`;
    axios.post(globe_labs_url, {})
    .then((response) => {
        const access_token = response.data.access_token;
        const subscriber_number = response.data.subscriber_number;

        // Store this to the database!
        console.log(access_token, subscriber_number);

        res.send(`Thank you for registering your phone number. To stop receiving SMS notifications, send STOP to ${SHORT_CODE} for Globe or ${SHORT_CODE_CROSS_TELCO} for other networks.`);
    })
    .catch((err) => {
        // If there was an error, we should log it.
        console.error(err);
        response.status(500).send({ message: 'Internal Server Error'});
    })

});
app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
})
module.exports = app