import { APIGatewayProxyEventV2 } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  GetTokensFromRefreshTokenCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
});

exports.handler = async (event: APIGatewayProxyEventV2) => {
  try {
    console.log('event', event);

    const { refreshToken } = JSON.parse(event.body ?? '{}');

    if (!refreshToken) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields' }),
      };
    }

    const command = new GetTokensFromRefreshTokenCommand({
      ClientId: process.env.COGNITO_USER_POOL_CLIENT_ID,
      RefreshToken: refreshToken,
    });

    const response = await cognitoClient.send(command);

    const accessToken = response.AuthenticationResult?.AccessToken;
    const newRefreshToken = response.AuthenticationResult?.RefreshToken;
    const idToken = response.AuthenticationResult?.IdToken;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: JSON.stringify({
        message: 'Tokens refreshed successfully',
        data: {
          accessToken,
          refreshToken: newRefreshToken,
          idToken,
        },
      }),
    };
  } catch (error) {
    console.error('Error in signup handler:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
