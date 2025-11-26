import { PostConfirmationConfirmSignUpTriggerEvent } from 'aws-lambda';
import { UserRepository } from '../../repositories/user';
import KSUID from 'ksuid';

exports.handler = async (event: PostConfirmationConfirmSignUpTriggerEvent) => {
  try {
    console.log('event', event);

    const id = await KSUID.random();

    const userRepository = new UserRepository();

    await userRepository.createUser({
      id: id.string,
      email: event.request.userAttributes.email,
      firstName: event.request.userAttributes['custom:firstName'],
      lastName: event.request.userAttributes['custom:lastName'],
      role: event.request.userAttributes['custom:role'],
    });

    return event;
  } catch (error) {
    console.error('Error in post confirmation trigger handler:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
