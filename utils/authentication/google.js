const { google } = require('googleapis');
const axios = require('axios');

const googleConfig = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_AUTH_REDIRECT
);

function getGoogleAuthURL() {
  /*
   * Generate a url that asks permissions to the user's email and profile
   */
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ];

  return googleConfig.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes, // If you only need one scope you can pass it as string
  });
}

async function getGoogleUser({ code }) {
  const { tokens } = await googleConfig.getToken(code);

  // Fetch the user's profile with the access token and bearer
  const googleUser = await axios
    .get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`,
      {
        headers: {
          Authorization: `Bearer ${tokens.id_token}`,
        },
      }
    )
    .then((res) => res.data)
    .catch((error) => {
      throw new Error(error.message);
    });

  return googleUser;
}

module.exports = { getGoogleAuthURL, getGoogleUser };
