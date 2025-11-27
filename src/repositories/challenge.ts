import { ChallengeEntity } from '../entities/challenge';
import { EntityRepository, ValidItem } from 'dynamodb-toolbox';

export interface CreateChallengeInput {
  id: string;
  title: string;
  description: string;
  pointsReward: number;
  createdBy: string;
  isActive: boolean;
}

export interface UpdateChallengeInput {
  title?: string;
  description?: string;
  pointsReward?: number;
  isActive?: boolean;
}

const challengeRepository = new EntityRepository(ChallengeEntity);

export class ChallengeRepository {
  async createChallenge(
    input: CreateChallengeInput
  ): Promise<ValidItem<typeof ChallengeEntity>> {
    try {
      const createdAt = new Date().toISOString();

      const { ToolboxItem: challenge } = await challengeRepository.put({
        PK: `CHALLENGE#${input.id}`,
        SK: 'METADATA',
        id: input.id,
        title: input.title,
        description: input.description,
        pointsReward: input.pointsReward,
        createdBy: input.createdBy,
        isActive: input.isActive,
        GSI1PK: `CREATED_BY#${input.createdBy}`,
        GSI1SK: input.id,
        GSI5PK: `CHALLENGE#COLLECTION`,
        GSI5SK: input.id,
        ...(input.isActive && {
          GSI2PK: `CHALLENGE#ACTIVE`,
          GSI2SK: `${createdAt}#${input.id}`,
        }),
      });

      return challenge;
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  }

  async getChallengeById(
    id: string
  ): Promise<ValidItem<typeof ChallengeEntity> | null> {
    try {
      const result = await challengeRepository.get({
        PK: `CHALLENGE#${id}`,
        SK: 'METADATA',
      });

      if (!result.Item) {
        return null;
      }

      const { parsedItem } = challengeRepository.parse(result.Item);
      return parsedItem;
    } catch (error) {
      console.error('Error getting challenge by id:', error);
      throw error;
    }
  }

  async updateChallenge(
    id: string,
    input: UpdateChallengeInput
  ): Promise<ValidItem<typeof ChallengeEntity>> {
    try {
      // Handle GSI2 index updates when isActive changes
      let gsi2Update: { GSI2PK?: string; GSI2SK?: string } = {};

      if (input.isActive !== undefined) {
        const challenge = await this.getChallengeById(id);
        if (!challenge) {
          throw new Error(`Challenge with id ${id} not found`);
        }

        if (input.isActive === true) {
          gsi2Update = {
            GSI2PK: `CHALLENGE#ACTIVE`,
            GSI2SK: `${challenge.created}#${id}`,
          };
        } else {
          // Remove GSI2PK and GSI2SK when deactivating
          gsi2Update = {
            GSI2PK: undefined,
            GSI2SK: undefined,
          };
        }
      }

      const updateData = {
        PK: `CHALLENGE#${id}`,
        SK: 'METADATA',
        ...input,
        ...gsi2Update,
      };

      const { ToolboxItem: updatedChallenge } =
        await challengeRepository.update(updateData);
      const { parsedItem } = challengeRepository.parse(updatedChallenge);

      return parsedItem;
    } catch (error) {
      console.error('Error updating challenge:', error);
      throw error;
    }
  }

  async deleteChallenge(id: string): Promise<boolean> {
    try {
      await challengeRepository.delete({
        PK: `CHALLENGE#${id}`,
        SK: 'CHALLENGE',
      });

      return true;
    } catch (error) {
      console.error('Error deleting challenge:', error);
      throw error;
    }
  }

  async getChallengesByCreatedBy(
    createdBy: string
  ): Promise<ValidItem<typeof ChallengeEntity>[]> {
    try {
      const result = await challengeRepository.query({
        partition: 'GSI1',
        range: { beginsWith: `CREATED_BY#${createdBy}` },
      });

      const parsedChallenges = (result.Items || []).map((item) => {
        const { parsedItem } = challengeRepository.parse(item);
        return parsedItem;
      });

      return parsedChallenges;
    } catch (error) {
      console.error('Error getting challenges by created by:', error);
      throw error;
    }
  }

  async listActiveChallengesByDate(
    limit = 50,
    startKey?: string,
    sort = 'desc'
  ): Promise<{
    challenges: ValidItem<typeof ChallengeEntity>[];
    lastEvaluatedKey?: Record<string, string>;
  }> {
    try {
      const result = await challengeRepository.query(
        {
          partition: 'GSI2',
          range: { beginsWith: 'CHALLENGE#ACTIVE' },
          sort: 'GSI2SK',
          direction: sort,
        },
        {
          limit,
          startKey,
        }
      );

      const parsedChallenges = (result.Items || []).map((item) => {
        const { parsedItem } = challengeRepository.parse(item);
        return parsedItem;
      });

      return {
        challenges: parsedChallenges,
        ...(result.LastEvaluatedKey && {
          lastEvaluatedKey: result.LastEvaluatedKey,
        }),
      };
    } catch (error) {
      console.error('Error listing active challenges:', error);
      throw error;
    }
  }

  async listChallenges(
    limit = 50,
    startKey?: string
  ): Promise<{
    challenges: ValidItem<typeof ChallengeEntity>[];
    lastEvaluatedKey?: Record<string, string>;
  }> {
    try {
      const result = await challengeRepository.query(
        {
          partition: 'GSI5',
          range: { beginsWith: 'CHALLENGE#COLLECTION' },
        },
        {
          limit,
          startKey,
        }
      );

      const parsedChallenges = (result.Items || []).map((item) => {
        const { parsedItem } = challengeRepository.parse(item);
        return parsedItem;
      });

      return {
        challenges: parsedChallenges,
        ...(result.LastEvaluatedKey && {
          lastEvaluatedKey: result.LastEvaluatedKey,
        }),
      };
    } catch (error) {
      console.error('Error listing challenges:', error);
      throw error;
    }
  }
}
