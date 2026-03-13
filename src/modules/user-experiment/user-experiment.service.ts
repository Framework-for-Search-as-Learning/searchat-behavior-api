/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { ExperimentParticipantDto } from '../experiment/dto/experiment-participant.dto';
import { ExperimentStatsDto } from '../experiment/dto/experiment-stats.dto';
import { ExperimentService } from '../experiment/experiment.service';
import { TaskService } from '../task/task.service';
import { User } from '../user/entity/user.entity';
import { UserService } from '../user/user.service';
import { UserTaskService } from '../user-task/user-task.service';
import { CreateUserExperimentDto } from './dto/create-userExperiment.dto';
import { UpdateUserExperimentDto } from './dto/update-userExperiment.dto';
import { UserExperiment, UserExperimentStatus } from './entities/user-experiments.entity';

@Injectable()
export class UserExperimentService {
  constructor(
    @InjectRepository(UserExperiment)
    private readonly userExperimentRepository: Repository<UserExperiment>,
    private readonly userService: UserService,
    @Inject(forwardRef(() => ExperimentService))
    private readonly experimentService: ExperimentService,
    private readonly userTaskService: UserTaskService,
    @Inject(forwardRef(() => TaskService))
    private readonly taskService: TaskService,
  ) { }

  async create(
    createUserExperimentDto: CreateUserExperimentDto,
  ): Promise<UserExperiment> {
    try {
      const { userId, experimentId } = createUserExperimentDto;
      const user = await this.userService.findOne(userId);
      const experiment =
        await this.experimentService.findWithTasks(experimentId);
      const newUserExperiment = this.userExperimentRepository.create({
        user,
        experiment,
      });
      newUserExperiment.stepsCompleted = {
        icf: false,
        pre: false,
        post: false,
        task: false,
      };
      const savedUserExperiment =
        await this.userExperimentRepository.save(newUserExperiment);

      if (experiment.typeExperiment === 'within-subject') {
        const tasks = experiment.tasks;
        await Promise.all(
          tasks.map((task) => {
            this.userTaskService.create({ taskId: task._id, userId: userId });
          }),
        );
      } else if (experiment.betweenExperimentType === 'random') {
        await this.userTaskService.createRandom({
          userId,
          tasks: experiment.tasks,
        });

      }
      return savedUserExperiment;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async createMany(
    userExperiments: UserExperiment[],
  ): Promise<UserExperiment[]> {
    try {
      const savedUserExperiments =
        await this.userExperimentRepository.save(userExperiments);
      return savedUserExperiments;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findAll(): Promise<UserExperiment[]> {
    return await this.userExperimentRepository.find();
  }

  async findByUserId(userId: string): Promise<UserExperiment[]> {
    return await this.userExperimentRepository.find({
      where: {
        user: { _id: userId },
        hasFinished: false
      },
    });
  }

  async findUsersByExperimentId(experimentId: string): Promise<User[]> {
    const userExperiments = await this.userExperimentRepository.find({
      where: { experiment: { _id: experimentId } },
      relations: ['user'],
    });
    return userExperiments.map((userExperiments) => userExperiments.user);
  }

  async findExperimentsByUserId(userId: string): Promise<UserExperiment[]> {
    const userExperiments = await this.userExperimentRepository.find({
      where: {
        user: { _id: userId },
        hasFinished: false
      },
      relations: ['experiment'],
    });
    return userExperiments
  }

  async findByUserAndExperimentId(
    userId: string,
    experimentId: string,
  ): Promise<UserExperiment> {
    return await this.userExperimentRepository.findOne({
      where: {
        user: { _id: userId },
        experiment: { _id: experimentId },
      },
    });
  }

  async update(
    id: string,
    updateUserExperimentDto: UpdateUserExperimentDto,
  ): Promise<UserExperiment> {
    const { userId, experimentId } = updateUserExperimentDto;
    let user, experiment;
    if (userId) {
      user = await this.userService.findOne(userId);
      if (!user) throw new Error('User not found');
    }

    if (experimentId) {
      experiment = await this.experimentService.find(experimentId);
      if (!experiment) throw new Error('Experiment not found');
    }
    await this.userExperimentRepository.update(
      { _id: id },
      updateUserExperimentDto
    );
    return await this.userExperimentRepository.findOne({
      where: {
        _id: id,
      },
    });
  }

  async finish(id: string): Promise<UserExperiment> {
    await this.userExperimentRepository.update(
      { _id: id },
      {
        hasFinished: true,
        status: UserExperimentStatus.FINISHED,
        completionDate: new Date(),
      },
    );
    return await this.userExperimentRepository.findOne({
      where: {
        _id: id,
      },
    });
  }

  async updateExperimentUsers(
    experimentId: string,
    newUsersId: string[],
  ): Promise<User[]> {
    const currentUsersInExperiment =
      await this.findUsersByExperimentId(experimentId);
    const currentUsersId = currentUsersInExperiment.map((user) => user._id);
    const usersToRemove = currentUsersId.filter(
      (user) => !newUsersId.includes(user),
    );
    const userToAdd = newUsersId.filter(
      (user) => !currentUsersId.includes(user),
    );

    if (usersToRemove.length !== 0) {
      await this.removeUsersFromExperiment(experimentId, usersToRemove);
    }

    if (userToAdd.length !== 0) {
      const newUserExperiments = userToAdd.map((userId) => ({
        userId,
        experimentId,
      }));
      await Promise.all(
        newUserExperiments.map((newUserExperiment) => {
          this.create(newUserExperiment);
        }),
      );
    }

    return currentUsersInExperiment.filter((user) =>
      newUsersId.includes(user._id),
    );
  }

  async removeUsersFromExperiment(
    experimentId: string,
    userIds: string[],
  ): Promise<void> {
    try {
      const tasksFromExperiment =
        await this.taskService.findByExperimentId(experimentId);
      const taskIds = tasksFromExperiment.map((task) => task._id);
      await this.userTaskService.removeUsersFromTask(taskIds, userIds);
      await this.userExperimentRepository.delete({
        experiment_id: experimentId,
        user_id: In(userIds),
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async removeByUserIdAndExperimentId(userId: string, experimentId: string) {
    const result = await this.findByUserAndExperimentId(userId, experimentId);
    await this.userExperimentRepository.delete({
      user: { _id: userId },
      experiment: { _id: experimentId },
    });
    return result;
  }

  async remove(id: string) {
    const result = await this.userExperimentRepository.findOne({
      where: {
        _id: id,
      },
    });
    await this.userExperimentRepository.delete({ _id: id });
    return result;
  }

  async countUsersByExperimentId(experimentId: string): Promise<{ totalUsers: number, completedResponses: number }> {
    const totalUsers = await this.userExperimentRepository.count({
      where: {
        experiment_id: experimentId,
      },
    });

    const completedResponses = await this.userExperimentRepository.count({
      where: {
        experiment_id: experimentId,
        hasFinished: true
      }
    })

    return { totalUsers, completedResponses }
  }

  async getDetailedStats(experimentId: string): Promise<ExperimentStatsDto> {
    const totalParticipants = await this.userExperimentRepository.count({
      where: { experiment: { _id: experimentId } },
    });

    const finishedParticipants = await this.userExperimentRepository.count({
      where: {
        experiment: { _id: experimentId },
        hasFinished: true
      }
    });

    const inProgressParticipants = totalParticipants - finishedParticipants;

    const completionPercentage = totalParticipants > 0 ? (finishedParticipants / totalParticipants) * 100 : 0;

    return {
      totalParticipants,
      finishedParticipants,
      inProgressParticipants,
      completionPercentage: parseFloat(completionPercentage.toFixed(2))
    };
  }

  async getParticipantsDetails(experimentId: string): Promise<ExperimentParticipantDto[]> {
    const userExperiments = await this.userExperimentRepository.find({
      where: { experiment: { _id: experimentId } },
      relations: ['user'],
    });

    return userExperiments.map(ue => {
      const steps = ue.stepsCompleted || {};
      const totalSteps = Object.keys(steps).length || 4;
      const completedSteps = Object.values(steps).filter(v => v).length;

      const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

      let timeTaken = 0;
      if (ue.startDate && ue.completionDate) {
        timeTaken = new Date(ue.completionDate).getTime() - new Date(ue.startDate).getTime();
      }

      return {
        id: ue.user?._id,
        name: ue.user ? `${ue.user.name} ${ue.user.lastName}` : 'Unknown',
        email: ue.user?.email || '',
        status: ue.status,
        startDate: ue.startDate,
        completionDate: ue.completionDate,
        timeTaken,
        progress: parseFloat(progress.toFixed(2))
      };
    });
  }
}
