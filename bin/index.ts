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
  `${remocalConfig.Stateful.projectName}-${process.env.STAGE}StatefulStack`,
  {
    ...remocalConfig.Stateful,
  }
);

new StatelessStack(
  app,
  `${remocalConfig.Stateless.projectName}-${process.env.STAGE}StatelessStack`,
  {
    ...remocalConfig.Stateless,
    dataTable: localStatefulStack.dataTable,
    cognitoUserPool: localStatefulStack.adtCognitoUserPool,
    cognitoUserPoolClient: localStatefulStack.adtCognitoUserPoolClient,
  }
);

// Dev stacks
const devStatefulStack = new StatefulStack(
  app,
  `${devConfig.Stateful.projectName}-devStatefulStack`,
  {
    ...devConfig.Stateful,
  }
);

new StatelessStack(
  app,
  `${devConfig.Stateless.projectName}-devStatelessStack`,
  {
    ...devConfig.Stateless,
    dataTable: devStatefulStack.dataTable,
    cognitoUserPool: devStatefulStack.adtCognitoUserPool,
    cognitoUserPoolClient: devStatefulStack.adtCognitoUserPoolClient,
  }
);
