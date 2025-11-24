import { Duration, Stack, StackProps } from 'aws-cdk-lib/core';
import { Table, AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import {
  StringAttribute,
  UserPool,
  UserPoolClient,
  UserPoolOperation,
} from 'aws-cdk-lib/aws-cognito';
import path from 'path';
import { Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Function } from 'aws-cdk-lib/aws-lambda';

interface StatefulStackProps extends StackProps {
  stage: string;
}

export class StatefulStack extends Stack {
  public readonly dataTable: Table;
  public readonly adtCognitoUserPool: UserPool;
  public readonly adtCognitoUserPoolClient: UserPoolClient;
  constructor(scope: Construct, id: string, props: StatefulStackProps) {
    super(scope, id, props);

    this.dataTable = this.createDynamoDbTable();
    this.adtCognitoUserPool = this.createCognitoUserPool();
    this.adtCognitoUserPoolClient = this.createCognitoUserPoolClient();
    this.createLambdaTriggers();
  }

  private createDynamoDbTable(): Table {
    const table = new Table(this, 'DataTable', {
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    table.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK1', type: AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: AttributeType.STRING },
    });

    return table;
  }

  private createCognitoUserPool(): UserPool {
    return new UserPool(this, 'AdtCognitoUserPool', {
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      passwordPolicy: {
        minLength: 8,
        requireDigits: true,
        requireLowercase: true,
        requireSymbols: false,
        requireUppercase: true,
      },
      customAttributes: {
        role: new StringAttribute({}),
        firstName: new StringAttribute({}),
        lastName: new StringAttribute({}),
        email: new StringAttribute({}),
      },
    });
  }

  private createCognitoUserPoolClient(): UserPoolClient {
    return new UserPoolClient(this, 'AdtCognitoUserPoolClient', {
      userPool: this.adtCognitoUserPool,
      authFlows: {
        userPassword: true,
      },
      idTokenValidity: Duration.hours(4),
      accessTokenValidity: Duration.hours(4),
      refreshTokenValidity: Duration.days(30),
    });
  }

  private createLambdaTriggers(): void {
    const preSignUpTrigger = new Function(this, 'PreSignUpTrigger', {
      runtime: Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: Code.fromAsset(
        path.resolve(__dirname, '../../../src/auth', 'preSignUpTrigger')
      ),
      environment: {
        TABLE_NAME: this.dataTable.tableName,
      },
    });

    preSignUpTrigger.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['dynamodb:PutItem'],
        resources: [this.dataTable.tableArn],
      })
    );

    this.adtCognitoUserPool.addTrigger(
      UserPoolOperation.PRE_SIGN_UP,
      preSignUpTrigger
    );
  }
}
