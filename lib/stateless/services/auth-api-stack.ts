import * as path from 'path';
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import { Function } from 'aws-cdk-lib/aws-lambda';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import { Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Stack } from 'aws-cdk-lib/core';

interface AuthApiStackProps {
  restApi: RestApi;
  cognitoUserPool: UserPool;
  cognitoUserPoolClient: UserPoolClient;
}

export class AuthApiStack extends Construct {
  private signUpFunction: Function;
  private loginFunction: Function;
  private otpValidateFunction: Function;
  private refreshTokenFunction: Function;
  private signUpIntegration: LambdaIntegration;
  private loginIntegration: LambdaIntegration;
  private otpValidateIntegration: LambdaIntegration;
  private refreshTokenIntegration: LambdaIntegration;
  constructor(scope: Construct, id: string, props: AuthApiStackProps) {
    super(scope, id);

    this.createLambdaFunctions(props);
    this.createLambdaIntegrations();
    this.assignPermissions(props);
    this.createResources(props);
  }

  private createLambdaFunctions(props: AuthApiStackProps) {
    this.signUpFunction = this.createLambdaFunction('signUp');
    this.signUpFunction.addEnvironment(
      'COGNITO_USER_POOL_CLIENT_ID',
      props.cognitoUserPoolClient.userPoolClientId
    );

    this.loginFunction = this.createLambdaFunction('logIn');
    this.loginFunction.addEnvironment(
      'COGNITO_USER_POOL_CLIENT_ID',
      props.cognitoUserPoolClient.userPoolClientId
    );

    this.otpValidateFunction = this.createLambdaFunction('otpValidate');
    this.otpValidateFunction.addEnvironment(
      'COGNITO_USER_POOL_CLIENT_ID',
      props.cognitoUserPoolClient.userPoolClientId
    );

    this.refreshTokenFunction = this.createLambdaFunction('refreshToken');
    this.refreshTokenFunction.addEnvironment(
      'COGNITO_USER_POOL_CLIENT_ID',
      props.cognitoUserPoolClient.userPoolClientId
    );
  }

  private createLambdaIntegrations() {
    this.signUpIntegration = new LambdaIntegration(this.signUpFunction);
    this.loginIntegration = new LambdaIntegration(this.loginFunction);
    this.otpValidateIntegration = new LambdaIntegration(
      this.otpValidateFunction
    );
    this.refreshTokenIntegration = new LambdaIntegration(this.refreshTokenFunction);
  }

  private assignPermissions(props: AuthApiStackProps) {
    this.signUpFunction.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['cognito-idp:SignUp'],
        resources: [props.cognitoUserPool.userPoolArn],
      })
    );

    this.loginFunction.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['cognito-idp:InitiateAuth'],
        resources: [props.cognitoUserPool.userPoolArn],
      })
    );

    this.otpValidateFunction.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['cognito-idp:ConfirmSignUp'],
        resources: [props.cognitoUserPool.userPoolArn],
      })
    );

    this.refreshTokenFunction.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['cognito-idp:RefreshToken'],
        resources: [props.cognitoUserPool.userPoolArn],
      })
    );
  }

  private createResources(props: AuthApiStackProps): void {
    const signupResource = props.restApi.root.addResource('signup');
    signupResource.addMethod('POST', this.signUpIntegration);

    const loginResource = props.restApi.root.addResource('login');
    loginResource.addMethod('POST', this.loginIntegration);

    const otpValidateResource = props.restApi.root.addResource('otp-validate');
    otpValidateResource.addMethod('POST', this.otpValidateIntegration);

    const refreshTokenResource = props.restApi.root.addResource('refresh-token');
    refreshTokenResource.addMethod('POST', this.refreshTokenIntegration);
  }

  private createLambdaFunction(id: string) {
    const stack = Stack.of(this);
    return new Function(this, id, {
      runtime: Runtime.NODEJS_22_X,
      handler: 'index.handler',
      functionName: `${stack.stackName}-${id}`,
      code: Code.fromAsset(path.resolve(__dirname, '../../../src/dist', id)),
    });
  }
}
