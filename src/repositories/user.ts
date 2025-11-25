import { UserEntity } from '../entities/user';
import { EntityRepository, ValidItem } from 'dynamodb-toolbox';

export interface CreateUserInput {
  id: string;
  role: 'member' | 'volunteer' | 'admin';
  email: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUserInput {
  role?: 'member' | 'volunteer' | 'admin';
  firstName?: string;
  lastName?: string;
}

const userRepository = new EntityRepository(UserEntity);

export class UserRepository {
  async createUser(
    input: CreateUserInput
  ): Promise<ValidItem<typeof UserEntity>> {
    try {
      const normalizedEmail = input.email.toLowerCase();
      const normalizedFirstName = input.firstName.toLowerCase();
      const normalizedLastName = input.lastName.toLowerCase();

      const { ToolboxItem: user } = await userRepository.put({
        PK: `USER#${input.id}`,
        SK: 'PROFILE',
        id: input.id,
        role: input.role,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        GSI1PK: `ROLE#${input.role}`,
        GSI1SK: input.id,
        GSI2PK: `EMAIL#${normalizedEmail}`,
        GSI2SK: input.id,
        GSI3PK: `FIRST_NAME#${normalizedFirstName}`,
        GSI3SK: input.id,
        GSI4PK: `LAST_NAME#${normalizedLastName}`,
        GSI4SK: input.id,
        GSI5PK: `USER#COLLECTION`,
        GSI5SK: input.id,
      });

      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<ValidItem<typeof UserEntity> | null> {
    try {
      const result = await userRepository.get({
        PK: `USER#${id}`,
        SK: 'PROFILE',
      });

      if (!result.Item) {
        return null;
      }

      const { parsedItem } = userRepository.parse(result.Item);
      return parsedItem;
    } catch (error) {
      console.error('Error getting user by id:', error);
      throw error;
    }
  }

  async updateUser(
    id: string,
    input: UpdateUserInput
  ): Promise<ValidItem<typeof UserEntity>> {
    try {
      const updatedData = {
        PK: `USER#${id}`,
        SK: 'PROFILE',
        ...input,
      };

      const { ToolboxItem: user } = await userRepository.update(updatedData);
      const { parsedItem } = userRepository.parse(user);

      return parsedItem;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      await userRepository.delete({
        PK: `USER#${id}`,
        SK: 'PROFILE',
      });

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async getUsersByRole(
    role: 'member' | 'volunteer' | 'admin'
  ): Promise<ValidItem<typeof UserEntity>[]> {
    try {
      const result = await userRepository.query({
        partition: 'GSI1',
        range: { beginsWith: `ROLE#${role}` },
      });

      const parsedUsers = (result.Items || []).map((item) => {
        const { parsedItem } = userRepository.parse(item);
        return parsedItem;
      });

      return parsedUsers;
    } catch (error) {
      console.error('Error getting users by role:', error);
      throw error;
    }
  }

  async getUsersByEmail(
    email: string
  ): Promise<ValidItem<typeof UserEntity>[]> {
    try {
      const result = await userRepository.query({
        partition: 'GSI2',
        range: { beginsWith: `EMAIL#${email}` },
      });

      const parsedUsers = (result.Items || []).map((item) => {
        const { parsedItem } = userRepository.parse(item);
        return parsedItem;
      });

      return parsedUsers;
    } catch (error) {
      console.error('Error getting users by email:', error);
      throw error;
    }
  }

  async getUsersByFirstName(
    firstName: string
  ): Promise<ValidItem<typeof UserEntity>[]> {
    try {
      const result = await userRepository.query({
        partition: 'GSI3',
        range: { beginsWith: `FIRST_NAME#${firstName}` },
      });

      const parsedUsers = (result.Items || []).map((item) => {
        const { parsedItem } = userRepository.parse(item);
        return parsedItem;
      });

      return parsedUsers;
    } catch (error) {
      console.error('Error getting users by first name:', error);
      throw error;
    }
  }

  async getUsersByLastName(
    lastName: string
  ): Promise<ValidItem<typeof UserEntity>[]> {
    try {
      const result = await userRepository.query({
        partition: 'GSI4',
        range: { beginsWith: `LAST_NAME#${lastName}` },
      });

      const parsedUsers = (result.Items || []).map((item) => {
        const { parsedItem } = userRepository.parse(item);
        return parsedItem;
      });

      return parsedUsers;
    } catch (error) {
      console.error('Error getting users by last name:', error);
      throw error;
    }
  }

  async listUsers(
    limit = 50,
    startKey?: string
  ): Promise<{
    users: ValidItem<typeof UserEntity>[];
    lastEvaluatedKey?: Record<string, string>;
  }> {
    try {
      const result = await userRepository.query(
        {
          partition: 'GSI5',
          range: { beginsWith: 'USER#COLLECTION' },
        },
        {
          limit,
          startKey,
        }
      );

      const parsedUsers = (result.Items || []).map((item) => {
        const { parsedItem } = userRepository.parse(item);
        return parsedItem;
      });

      return {
        users: parsedUsers,
        ...(result.LastEvaluatedKey && {
          lastEvaluatedKey: result.LastEvaluatedKey,
        }),
      };
    } catch (error) {
      console.error('Error listing users:', error);
      throw error;
    }
  }
}
