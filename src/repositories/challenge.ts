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
  async createChallenge(input: CreateChallengeInput): Promise<ValidItem<typeof ChallengeEntity>> {
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

  async updateChallenge(id: string, input: UpdateChallengeInput): Promise<ValidItem<typeof ChallengeEntity>> {
    try {
      const updatedData = {
        PK: `CHALLENGE#${id}`,
        SK: 'METADATA',
        ...input,
      };
      const { ToolboxItem: challenge } = await challengeRepository.update(updatedData);
      const { parsedItem } = challengeRepository.parse(challenge);

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

  async getChallengesByCreatedBy(createdBy: string): Promise<ValidItem<typeof ChallengeEntity>[]> {
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

  async listActiveChallengesByDate(limit = 50, startKey?: string, sort = 'desc'): Promise<{
    challenges: ValidItem<typeof ChallengeEntity>[];
    lastEvaluatedKey?: Record<string, string>;
  }> {
    try {
      const result = await challengeRepository.query({
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

  async listChallenges(limit = 50, startKey?: string): Promise<{
    challenges: ValidItem<typeof ChallengeEntity>[];
    lastEvaluatedKey?: Record<string, string>;
  }> {
    try {
      const result = await challengeRepository.query({
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