import {
  Entity,
  ValidItem,
  Table,
  item,
  string,
  FormattedItem,
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

const userSchema = item({
  PK: string().key(),
  SK: string().key(),
  id: string().required(),
  role: string().enum('member', 'volunteer', 'admin').required(),
  firstName: string().required(),
  lastName: string().required(),
  email: string().required(),
  GSI1PK: string(),
  GSI1SK: string(),
  GSI2PK: string(),
  GSI2SK: string(),
  GSI3PK: string(),
  GSI3SK: string(),
  GSI4PK: string(),
  GSI4SK: string(),
  GSI5PK: string(),
  GSI5SK: string(),
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
