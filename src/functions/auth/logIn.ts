import { APIGatewayProxyEventV2 } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
});

exports.handler = async (event: APIGatewayProxyEventV2) => {
  try {
    console.log('event', event);

    const { email, password } = JSON.parse(event.body ?? '{}');

    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields' }),
      };
    }

    const command = new InitiateAuthCommand({
      ClientId: process.env.COGNITO_USER_POOL_CLIENT_ID,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    const response = await cognitoClient.send(command);

    const authenticationResult = response.AuthenticationResult;
    const accessToken = authenticationResult
      ? authenticationResult.AccessToken
      : '';
    const refreshToken = authenticationResult
      ? authenticationResult.RefreshToken
      : '';
    const idToken = authenticationResult ? authenticationResult.IdToken : '';

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'User logged in successfully',
        data: {
          accessToken,
          refreshToken,
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
