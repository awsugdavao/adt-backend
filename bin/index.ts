#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { StatelessStack } from '../lib/stateless/stateless-stack';
import { StatefulStack } from '../lib/stateful/stateful-stack';
import devConfig from '../config/dev';
import remocalConfig from '../config/remocal';
import 'dotenv/config';

const app = new cdk.App();

// Local stacks
const localStatefulStack = new StatefulStack(
  app,
  `${process.env.STAGE}StatefulStack`,
  {
    ...remocalConfig.Stateful
  }
);

new StatelessStack(app, `${process.env.STAGE}StatelessStack`, {
  ...remocalConfig.Stateless,
  dataTable: localStatefulStack.dataTable,
  cognitoUserPool: localStatefulStack.adtCognitoUserPool,
  cognitoUserPoolClient: localStatefulStack.adtCognitoUserPoolClient,
});

// Dev stacks
const devStatefulStack = new StatefulStack(app, 'DevStatefulStack', {
  ...devConfig.Stateful,
});

new StatelessStack(app, 'DevStatelessStack', {
  ...devConfig.Stateless,
  dataTable: devStatefulStack.dataTable,
  cognitoUserPool: devStatefulStack.adtCognitoUserPool,
  cognitoUserPoolClient: devStatefulStack.adtCognitoUserPoolClient,
});