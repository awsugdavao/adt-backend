import { Entity, ValidItem, Table, item, string } from 'dynamodb-toolbox';
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

const userSchema = item({
  PK: string().key(),
  SK: string().key(),
  id: string().required(),
  role: string().enum('member', 'volunteer', 'admin').required(),
  firstName: string().required(),
  lastName: string().required(),
  email: string().required(),
  createdAt: string().default(new Date().toISOString()).required(),
  updatedAt: string().default(new Date().toISOString()).required(),
  GSI1PK: string(),
  GSI1SK: string(),
});

export const UserEntity = new Entity({
  name: 'User',
  table,
  schema: userSchema,
});

export const toResponseDto = (user: ValidItem<typeof UserEntity>) => {
  return {
    id: user.id,
    role: user.role,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
