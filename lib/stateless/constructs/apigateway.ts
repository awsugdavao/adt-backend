import { StackProps } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { Deployment, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { AuthApiStack } from '../services/auth-api-stack';
import { Stage } from 'aws-cdk-lib/aws-apigateway';
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { Table } from 'aws-cdk-lib/aws-dynamodb';

interface ApiGatewayConstructProps extends StackProps {
  dataTable: Table;
  cognitoUserPool: UserPool;
  cognitoUserPoolClient: UserPoolClient;
  stage: string;
}

export class Api extends Construct {
  public restApi: RestApi;

  constructor(scope: Construct, id: string, props: ApiGatewayConstructProps) {
    super(scope, id);

    this.createApiGateway();
    this.createNestedStacks(props);
  }

  private createApiGateway(): void {
    this.restApi = new RestApi(this, 'ApiGateway', {
      deploy: false,
      defaultCorsPreflightOptions: {
        allowOrigins: ['*'],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });
  }

  private createNestedStacks(props: ApiGatewayConstructProps): void {
    const authApiStack = new AuthApiStack(this, 'AuthApiStack', {
      restApi: this.restApi,
      cognitoUserPool: props.cognitoUserPool,
      cognitoUserPoolClient: props.cognitoUserPoolClient,
    });

    const deployment = new Deployment(
      this,
      `ApiDeployment${Date.now().toString()}`,
      {
        api: this.restApi,
      }
    );

    deployment.node.addDependency(authApiStack);

    new Stage(this, 'ApiStage', {
      deployment,
      stageName: props.stage,
    });
  }
}
