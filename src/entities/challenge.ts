import {
  Entity,
  ValidItem,
  Table,
  item,
  string,
  number,
  boolean,
} from 'dynamodb-toolbox';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const table = new Table({
  name: process.env.TABLE_NAME,
  partitionKey: { name: 'PK', type: 'string' },
  sortKey: { name: 'SK', type: 'string' },
  documentClient: DynamoDBDocumentClient.from(
    new DynamoDBClient({
      region: process.env.AWS_REGION,
    })
  ),
});

const challengeSchema = item({
  PK: string().key(),
  SK: string().key(),
  id: string().required(),
  title: string().required(),
  description: string().required(),
  pointsReward: number().required(),
  createdBy: string().required(),
  isActive: boolean().required(),
  GSI1PK: string().optional(),
  GSI1SK: string().optional(),
  GSI2PK: string().optional(),
  GSI2SK: string().optional(),
  GSI3PK: string().optional(),
  GSI3SK: string().optional(),
  GSI4PK: string().optional(),
  GSI4SK: string().optional(),
  GSI5PK: string().optional(),
  GSI5SK: string().optional(),
});

export const ChallengeEntity = new Entity({
  name: 'Challenge',
  table,
  schema: challengeSchema,
  timestamps: true, // Enables created and modified timestamps
});

export const toResponseDto = (challenge: ValidItem<typeof ChallengeEntity>) => {
  return {
    id: challenge.id,
    title: challenge.title,
    description: challenge.description,
    pointsReward: challenge.pointsReward,
    createdBy: challenge.createdBy,
    isActive: challenge.isActive,
    // Access the created timestamp (automatically added by dynamodb-toolbox)
    created: challenge.created,
    // Also available: challenge.modified for last modified timestamp
  };
};
