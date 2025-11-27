import { Entity, ValidItem, Table, item, string, number } from 'dynamodb-toolbox';
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
  role: string().required(),
  firstName: string().required(),
  lastName: string().required(),
  email: string().required(),
  totalPoints: number().required(),
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
  };
};
