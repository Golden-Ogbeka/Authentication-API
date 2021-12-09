const axios = require('axios');
const queryString = require('query-string');

const stringifiedParams = queryString.stringify({
  client_id: process.env.FACEBOOK_APP_ID,
  redirect_uri: process.env.FACEBOOK_REDIRECT_URL,
  scope: ['email', 'user_friends'].join(','), // comma seperated string
  response_type: 'code',
  auth_type: 'rerequest',
  display: 'popup',
});

const getFacebookLoginUrl = () => {
  const facebookLoginUrl = `https://www.facebook.com/v4.0/dialog/oauth?${stringifiedParams}`;
  return facebookLoginUrl;
};

async function getFacebookUserData(code) {
  // Get token from code
  let accessToken = async function getAccessTokenFromCode() {
    const { data } = await axios({
      url: 'https://graph.facebook.com/v4.0/oauth/access_token',
      method: 'get',
      params: {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri: process.env.FACEBOOK_REDIRECT_URL,
        code,
      },
    });
    // console.log(data); // { access_token, token_type, expires_in }
    return data.access_token;
  };

  accessToken = await accessToken();

  //  Get user
  const { data } = await axios({
    url: 'https://graph.facebook.com/me',
    method: 'get',
    params: {
      fields: ['id', 'email', 'first_name', 'last_name'].join(','),
      access_token: accessToken,
    },
  });
  //   console.log(data); // { id, email, first_name, last_name }
  return data;
}
module.exports = { getFacebookLoginUrl, getFacebookUserData };
