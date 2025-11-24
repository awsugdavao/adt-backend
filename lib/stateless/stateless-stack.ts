import { StackProps, Stack } from 'aws-cdk-lib/core';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import { Api } from './constructs/apigateway';

interface StatelessStackProps extends StackProps {
  dataTable: Table;
  cognitoUserPool: UserPool;
  cognitoUserPoolClient: UserPoolClient;
  stage: string;
}

export class StatelessStack extends Stack {
  constructor(scope: Construct, id: string, props: StatelessStackProps) {
    super(scope, id, props);

    new Api(this, 'Api', {
      dataTable: props.dataTable,
      cognitoUserPool: props.cognitoUserPool,
      cognitoUserPoolClient: props.cognitoUserPoolClient,
      stage: props.stage,
    });
  }
}
