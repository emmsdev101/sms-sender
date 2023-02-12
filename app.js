require('dotenv').config()
const express = require('express');
const cors = require('cors');
const { default: axios } = require('axios');
const { con } = require('./config');
// Initialize the app;
const app = express();

const SHORT_CODE = "21664471" 
const SHORT_CODE_CROSS_TELCO = "225644471"
// Allows Cross-Origin Resource Sharing for this app.
app.use(cors());
app.use(express.json());

// Assign a port where the app is exposed.
const port = process.env.PORT || 8080;

app.get("/test",(req, res)=>{
    res.send("wellcome")
})
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

        con.query("select account_id from applicants where contact = ?",subscriber_number,(err, result)=>{
            if(err){
                console.log(err)
                return res.send("Something went wrong")
            }
            if(result[0]?.account_id){
                con.query("insert into tokens SET ?",{account_id:result[0].account_id, token:access_token},(err1, result1)=>{
                    if(err1){
                        console.log(err1)
                        return res.send("Something went wrong")
                    }
                    console.log(result1)
                })
            }
        })


        res.send(`Thank you for registering your phone number. To stop receiving SMS notifications, send STOP to ${SHORT_CODE} for Globe or ${SHORT_CODE_CROSS_TELCO} for other networks.`);
    })
    .catch((err) => {
        // If there was an error, we should log it.
        console.error(err);
        response.status(500).send({ message: 'Internal Server Error'});
    })

});

app.get('/send', (req, res) => {

    // Get the access token, the subscriber number and the message from the request.
    const access_token = req.query.access_token;
    const subscriber_number = req.query.subscriber_number;
    const message = req.query.message;

    // Next, we need our app short code's last 4 digits;
    const SHORT_CODE_SUFFIX = SHORT_CODE.substr(-4);

    // Then, we need to compose our payload that we will send to Globe Labs.
    const payload = {
        outboundSMSMessageRequest: {
            outboundSMSTextMessage: {
                message: message
            },
            senderAddress: SHORT_CODE_SUFFIX,
            address: `+63${subscriber_number}`
        }
    }

    // Compose our url
    const url = `https://devapi.globelabs.com.ph/smsmessaging/v1/outbound/${SHORT_CODE_SUFFIX}/requests?access_token=${access_token}`;

    // Send the request via Axios.
    axios.post(url, payload, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(() => {
        // Success!
        res.send(`Message sent!`);
    })
    .catch((err) => {
        // If there was an error, we should log it.
        console.error(err);
        res.sendStatus(500);
    })
});

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
})
con.connect(function (err) {
    if (err) {
      throw err;
    }
    console.log("Database connected");
  });
module.exports = app