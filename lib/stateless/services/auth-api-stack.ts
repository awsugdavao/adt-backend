import { StackProps, Stack } from 'aws-cdk-lib/core';
import * as path from 'path';
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import { Function } from 'aws-cdk-lib/aws-lambda';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import { Runtime, Code } from 'aws-cdk-lib/aws-lambda';

interface AuthApiStackProps extends StackProps {
  restApi: RestApi;
  cognitoUserPool: UserPool;
  cognitoUserPoolClient: UserPoolClient;
}

export class AuthApiStack extends Stack {
  private signUpFunction: Function;
  private loginFunction: Function;
  private signUpIntegration: LambdaIntegration;
  private loginIntegration: LambdaIntegration;
  constructor(scope: Construct, id: string, props: AuthApiStackProps) {
    super(scope, id, props);

    this.createLambdaFunctions(props);
    this.createLambdaIntegrations(props);
    this.assignPermissions(props);
    this.createResources(props);
  }

  private createLambdaFunctions(props: AuthApiStackProps) {
    this.signUpFunction = this.createLambdaFunction('signup');
    this.signUpFunction.addEnvironment(
      'COGNITO_USER_POOL_CLIENT_ID',
      props.cognitoUserPoolClient.userPoolClientId
    );

    this.loginFunction = this.createLambdaFunction('login');
    this.loginFunction.addEnvironment(
      'COGNITO_USER_POOL_CLIENT_ID',
      props.cognitoUserPoolClient.userPoolClientId
    );
  }

  private createLambdaIntegrations(props: AuthApiStackProps) {
    this.signUpIntegration = new LambdaIntegration(this.signUpFunction);
    this.loginIntegration = new LambdaIntegration(this.loginFunction);
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
  }

  private createResources(props: AuthApiStackProps): void {
    const signupResource = props.restApi.root.addResource('signup');
    signupResource.addMethod('POST', this.signUpIntegration);

    const loginResource = props.restApi.root.addResource('login');
    loginResource.addMethod('POST', this.loginIntegration);
  }

  private createLambdaFunction(id: string) {
    return new Function(this, id, {
      runtime: Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: Code.fromAsset(path.resolve(__dirname, '../../../src/auth', id)),
    });
  }
}
