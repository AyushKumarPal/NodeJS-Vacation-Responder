const { google } = require('googleapis'); // requiring the google API for the module
const credentials = require('./credentials.json'); 

const SCOPES = ['https://www.googleapis.com/auth/gmail.settings.basic', 
                'https://www.googleapis.com/auth/gmail.settings.sharing']; // here we are defining the scopes of the authorization.
const AUTH_TOKEN_PATH = 'token.json';
const VACATION_RES_BODY = {
    enableAutoReply: true,
    responseSubject: 'Vacation Responder',
    responseBodyHtml: 'Hi thank you for your message. I am currently out of the office, with no email access. I will be returning on 15 march. Apologies for the inconvienence. Kind Regards',
    restrictToContacts: false,
    restrictToDomain: false,
    startTime: new Date().getTime(),
    endTime: new Date().setDate(new Date().getDate() + 15),  // setting the time of the vacation 
};

async function main() {
    const auth = await authorize();
    const gmailService = google.gmail({ version: 'v1', auth });

    try {
        const settings = await gmailService.users.settings.getVacation({ userId: 'me' }); // fetching the vacation settings of user
        const vacationRes = settings.data;

        gmailService.users.labels.create({
            userId: 'me',
            labelListVisibility: 'labelShow',
            messageListVisibility: 'show',
            name: 'Vacation Label', // creating Vacation label for incoming mails.
            id: '10'
        }, (err) => {
            console.error(err);
        });

        await gmail.users.settings.updateVacation({   // updating the vacation responder settings
            userId: 'me',
            requestBody: { enableAutoReply: false }
        });

        console.log('Disabled existing vacation responder:', vacationRes.responseSubject);

    } catch (err) {
        console.log('No existing vacation responder found');
    }

    const res = await gmailService.users.settings.updateVacation({
        userId: 'me',
        requestBody: VACATION_RES_BODY,
    });

    console.log('Enabled new vacation responder:', res.data.responseSubject);
}

async function authorize() {
    const { client_secret, client_id, redirect_uris } = credentials.installed; // passing the objects from credentials.json file
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris);

    try {
        const token = require(AUTH_TOKEN_PATH);
        oAuth2Client.setCredentials(token);
        return oAuth2Client;

    } catch (err) {
        console.log('Authorization required');  
        const authUrl = oAuth2Client.generateAuthUrl({ // generating the authorization URL
            access_type: 'offline',
            scope: SCOPES,
        });

        console.log('Authorize this app by visiting this URL:', authUrl);
        const authCode = 'user authCode';   // code generated at google OAuth playground

        const { tokens } = await oAuth2Client.getToken(authCode); // passing the authCode tokens generated at OAuth playground
        oAuth2Client.setCredentials(tokens); 
        console.log('Token stored to', AUTH_TOKEN_PATH);
        return oAuth2Client;
    }
}

main();
