import { APIGatewayProxyEventV2 } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
});

exports.handler = async (event: APIGatewayProxyEventV2) => {
  try {
    console.log('event', event);

    const { email, password, firstName, lastName, role } = JSON.parse(
      event.body ?? '{}'
    );

    if (!email || !password || !firstName || !lastName || !role) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields' }),
      };
    }

    const command = new SignUpCommand({
      ClientId: process.env.COGNITO_USER_POOL_CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
        {
          Name: 'custom:firstName',
          Value: firstName,
        },
        {
          Name: 'custom:lastName',
          Value: lastName,
        },
        {
          Name: 'custom:role',
          Value: role,
        },
      ],
    });

    const response = await cognitoClient.send(command);

    console.log('response', response);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: JSON.stringify({
        message: 'User signed up successfully',
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
