/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LlmSessionService } from 'src/modules/llm-session/llm-session.service';
import { In, Repository } from 'typeorm';

import { Task } from '../task/entities/task.entity';
import { TaskService } from '../task/task.service';
import { TaskQuestionMapService } from '../task-question-map/task-question-map.service';
import { User } from '../user/entity/user.entity';
import { UserService } from '../user/user.service';
import { UserTaskSessionService } from '../user-task-session/user-task-session.service';
import { CreateUserTaskDto } from './dto/create-userTask.dto';
import { CreateUserTaskAvgQuestScoreDto } from './dto/create-userTaskAvgQuestScore.dto';
import { CreateUserTaskByRule } from './dto/create-userTaskByRule.dto';
import { CreateUserTaskRandomDto } from './dto/create-userTaskRandom.dto';
import { CreateUserTaskScoreDto } from './dto/create-userTaskScore.dto';
import { TaskExecutionDetailsDto } from './dto/task-execution-details.dto';
import { TimeEditUserTaskDto } from './dto/timeEditUserTaskDTO';
import { UpdateUserTaskDto } from './dto/update-userTask.dto';
import { UserTask } from './entities/user-tasks.entity';

@Injectable()
export class UserTaskService {
  constructor(
    @InjectRepository(UserTask)
    private readonly userTaskRepository: Repository<UserTask>,

    private readonly userService: UserService,
    @Inject(forwardRef(() => TaskService))
    private readonly taskService: TaskService,
    private readonly taskQuestionMapService: TaskQuestionMapService,
    @Inject(forwardRef(() => UserTaskSessionService))
    private readonly userTaskSessionService: UserTaskSessionService,
    @Inject(forwardRef(() => LlmSessionService))
    private readonly llmSessionService: LlmSessionService,
  ) { }
  async findOne(id: string): Promise<UserTask> {
    try {
      return await this.userTaskRepository.findOne({
        where: {
          _id: id,
        },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async create(createUserTaskDto: CreateUserTaskDto): Promise<UserTask> {
    try {
      const { userId, taskId } = createUserTaskDto;
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new NotFoundException('Usuario nao foi encontrado');
      }
      const task = await this.taskService.findOne(taskId);
      if (!task) {
        throw new NotFoundException('Task nao foi encontrada');
      }
      const newUserTask = this.userTaskRepository.create({
        user,
        task,
      });
      return await this.userTaskRepository.save(newUserTask);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async createBySurveyScore(
    createUserTaskScoreDto: CreateUserTaskScoreDto,
  ): Promise<UserTask> {
    try {
      const { userId, taskIds, surveyAnswer } = createUserTaskScoreDto;
      const score = surveyAnswer.score;
      const taskList = await this.taskService.findMany(taskIds);
      let selectedTaskId;
      for (const task of taskList) {
        if (score >= task.min_score && score <= task.max_score) {
          selectedTaskId = task._id;
          break;
        }
      }
      if (!selectedTaskId) {
        throw new Error('Nenhua tarefa encontrada para o score desse usuario');
      }
      return this.create({ userId: userId, taskId: selectedTaskId });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async createByAverageQuestionsScore(
    createUserTaskAvgQuestScore: CreateUserTaskAvgQuestScoreDto,
  ): Promise<UserTask> {
    try {
      const { userId, taskIds, questionsIds, surveyAnswer } =
        createUserTaskAvgQuestScore;

      const selectedQuestion = surveyAnswer.answers.filter((answer) =>
        questionsIds.includes(answer.id),
      );
      if (selectedQuestion.length === 0) {
        throw new Error('Nenhuma das questoes foram encontradas.');
      }
      const totalScore = selectedQuestion.reduce(
        (acc, question) => acc + question.score,
        0,
      );
      const avgScore = totalScore / selectedQuestion.length;
      const taskList = await this.taskService.findMany(taskIds);
      let selectedTaskId;
      for (const task of taskList) {
        if (avgScore >= task.min_score && avgScore <= task.max_score) {
          selectedTaskId = task._id;
          break;
        }
      }
      if (!selectedTaskId) {
        throw new Error('Nenhuma task encontrada para o score do usuario');
      }

      return this.create({ userId: userId, taskId: selectedTaskId });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async createBySurveyRule(
    createUserTaskByRule: CreateUserTaskByRule,
  ): Promise<void> {
    const { userId, surveyId, surveyAnswer } = createUserTaskByRule;
    const tasks = await this.taskService.findBySurveyId(surveyId);
    const surveyScoreTasks = tasks.filter((task) => task.rule_type === 'score');
    const surveyScoreTasksIds = surveyScoreTasks.map((task) => task._id);
    const questionScoreTasks = tasks.filter(
      (task) => task.rule_type === 'question',
    );
    const questionScoreTasksIds = questionScoreTasks.map((task) => task._id);
    if (surveyScoreTasks.length > 0) {
      await this.createBySurveyScore({
        userId,
        surveyAnswer,
        taskIds: surveyScoreTasksIds,
      });
    }

    if (questionScoreTasks.length > 0) {
      const tasksGroupedByQuestions = new Map<
        string,
        { taskIds: string[]; questionIds: string[] }
      >();
      for (const taskId of questionScoreTasksIds) {
        const questionsId =
          await this.taskQuestionMapService.findQuestionsByTask(taskId);
        const questionKey = questionsId.sort().join(',');
        if (!tasksGroupedByQuestions.has(questionKey)) {
          tasksGroupedByQuestions.set(questionKey, {
            taskIds: [],
            questionIds: questionsId,
          });
        }
        tasksGroupedByQuestions.get(questionKey).taskIds.push(taskId);
      }
      const groupedTask = Array.from(tasksGroupedByQuestions.values());

      for (const group of groupedTask) {
        await this.createByAverageQuestionsScore({
          userId,
          surveyAnswer,
          questionsIds: group.questionIds,
          taskIds: group.taskIds,
        });
      }
    }
  }

  async createRandom(
    createUserTaksRandomDto: CreateUserTaskRandomDto,
  ): Promise<UserTask> {
    try {
      const { userId, tasks } = createUserTaksRandomDto;
      const taskIds = tasks.map((task) => task._id);
      const taskCounts = await this.getTaskCounts(taskIds);
      const minTaskCount = Math.min(...Object.values(taskCounts));
      const tasksWithMinCount = Object.keys(taskCounts).filter(
        (taskId) => taskCounts[taskId] === minTaskCount,
      );
      const randomIndex = Math.floor(Math.random() * tasksWithMinCount.length);
      const selectedTaskId = tasksWithMinCount[randomIndex];
      return await this.create({ userId: userId, taskId: selectedTaskId });
    } catch (error) {
      console.error('Error ao criar tarefa aleatória', error);
      throw error;
    }
  }

  async createMany(userTasks: UserTask[]): Promise<UserTask[]> {
    const savedUserTasks = await this.userTaskRepository.save(userTasks);
    return savedUserTasks;
  }

  async findAll(): Promise<UserTask[]> {
    return await this.userTaskRepository.find();
  }
  async findByUserId(userId: string): Promise<UserTask[]> {
    return await this.userTaskRepository.find({
      where: {
        user: { _id: userId },
      },
    });
  }

  async findByTaskId(taskId: string): Promise<UserTask[]> {
    return await this.userTaskRepository.find({
      where: {
        task: { _id: taskId },
      },
    });
  }

  async findByUserIdAndTaskId(
    userId: string,
    taskId: string,
  ): Promise<UserTask> {
    return await this.userTaskRepository.findOne({
      where: {
        user: { _id: userId },
        task: { _id: taskId },
      },
    });
  }

  async findByUserIdAndExperimentId(
    userId: string,
    experimentId: string,
  ): Promise<UserTask[]> {
    const userTasks = await this.userTaskRepository.find({
      where: { user_id: userId },
      relations: ['task'],
    });
    const userTaskByExperiment = userTasks.filter(
      (userTask) => userTask.task.experiment_id === experimentId,
    );
    return userTaskByExperiment;
  }

  async findUsersByTaskId(taskId: string): Promise<User[]> {
    const userTasks = await this.userTaskRepository.find({
      relations: ['user'],
      where: { task_id: taskId },
    });
    const users = userTasks.map((userTasks) => userTasks.user);
    return users;
  }

  async findTasksByUserId(userId: string): Promise<Task[]> {
    const userTasks = await this.userTaskRepository.find({
      where: { user_id: userId },
      relations: ['task'],
    });
    const tasks = userTasks.map((userTask) => userTask.task);
    return tasks;
  }

  async findTasksByUserIdAndExperimentId(
    userId: string,
    experimentId: string,
  ): Promise<Task[]> {
    const tasksFromUser = await this.findTasksByUserId(userId);
    const tasksFromUserByExperiment = tasksFromUser.filter(
      (task) => task.experiment_id === experimentId,
    );
    return await tasksFromUserByExperiment;
  }

  async removeByUserIdAndTaskId(
    userId: string,
    taskId: string,
  ): Promise<UserTask> {
    const result = this.findByUserIdAndTaskId(userId, taskId);
    await this.userTaskRepository.delete({
      user: { _id: userId },
      task: { _id: taskId },
    });
    return result;
  }

  async removeUsersFromTask(
    taskIds: string[],
    userIds: string[],
  ): Promise<void> {
    await this.userTaskRepository.delete({
      task_id: In(taskIds),
      user_id: In(userIds),
    });
  }

  async remove(id: string) {
    const result = this.userTaskRepository.findOne({
      where: {
        _id: id,
      },
    });
    await this.userTaskRepository.delete({ _id: id });
    return result;
  }

  async update(
    id: string,
    updateUserTaskDto: UpdateUserTaskDto,
  ): Promise<UserTask> {
    await this.userTaskRepository.update({ _id: id }, updateUserTaskDto);
    return await this.userTaskRepository.findOne({ where: { _id: id } });
  }

  async start(
    id: string,
    _timeEditUserTaskDTO: TimeEditUserTaskDto,
  ): Promise<UserTask> {
    const isPaused = false;
    const startTime = new Date();
    await this.update(id, { isPaused, startTime });
    return await this.userTaskRepository.findOne({ where: { _id: id } });
  }

  async pause(
    id: string,
    timeEditUserTaskDto: TimeEditUserTaskDto,
  ): Promise<UserTask> {
    let { pauseTime } = timeEditUserTaskDto;
    const isPaused = true;
    if (!pauseTime) {
      pauseTime = [];
    }
    pauseTime.push(new Date());
    return await this.update(id, { isPaused, pauseTime });
  }

  async resume(
    id: string,
    timeEditUserTaskDTO: TimeEditUserTaskDto,
  ): Promise<UserTask> {
    let { resumeTime } = timeEditUserTaskDTO;
    const isPaused = false;
    if (!resumeTime) {
      resumeTime = [];
    }
    resumeTime.push(new Date());
    return await this.update(id, { isPaused, resumeTime });
  }

  async finish(
    id: string,
    timeEditUserTaskDTO: TimeEditUserTaskDto,
  ): Promise<UserTask> {
    const { metadata } = timeEditUserTaskDTO;
    const endTime = new Date();
    const hasFinishedTask = true;
    await this.update(id, { hasFinishedTask, endTime, metadata });
    return await this.userTaskRepository.findOne({ where: { _id: id } });
  }

  public async getTaskCounts(
    taskIds: string[],
  ): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    for (const taskId of taskIds) {
      counts[taskId] = await this.getTaskAssignmentCount(taskId);
    }
    return counts;
  }

  private async getTaskAssignmentCount(taskId: string): Promise<number> {
    const tasks = await this.findByTaskId(taskId);
    return tasks.length;
  }

  async getExecutionDetails(userTaskId: string): Promise<TaskExecutionDetailsDto> {
    const userTask = await this.userTaskRepository.findOne({
      where: { _id: userTaskId },
      relations: ['task', 'user']
    });

    if (!userTask) {
      throw new NotFoundException('UserTask not found');
    }

    const { task, user } = userTask;
    let executionTime = 0;
    if (userTask.startTime && userTask.endTime) {
      executionTime = new Date(userTask.endTime).getTime() - new Date(userTask.startTime).getTime();
    }

    const details: TaskExecutionDetailsDto = {
      userTaskId: userTask._id,
      userName: user.name,
      userEmail: user.email,
      taskId: task._id,
      taskTitle: task.title,
      taskType: task.search_source,
      executionTime,
    };

    if (task.search_source === 'search-engine') {
      const sessions = await this.userTaskSessionService.finByUserIdAndTaskId(user._id, task._id);
      const sortedSessions = [...sessions].sort((a, b) => {
        const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return aTime - bTime;
      });

      let totalDepth = 0;

      const queries = sortedSessions.map((session) => {
        const resources = (session.pages || []).map((page) => {
          totalDepth++;

          let timeSpent = 0;
          if (page.startTime && page.endTime) {
            timeSpent = new Date(page.endTime).getTime() - new Date(page.startTime).getTime();
          }

          return {
            title: page.title,
            url: page.url,
            timeSpent,
            visitTime: page.startTime
          };
        });

        return {
          query: session.query,
          timestamp: session.timestamp,
          serpNumber: session.serpNumber,
          resourcesAccessedCount: resources.length,
          resources
        };
      });

      details.searchDetails = {
        resourcesAccessedTotal: totalDepth,
        queriesCount: sessions.length,
        queries
      };

    } else if (task.search_source === 'llm') {
      const llmSession = await this.llmSessionService.findByUserIdAndTaskId(user._id, task._id);

      const messages = llmSession ? llmSession.messages : [];
      details.llmDetails = {
        messages: messages.map(m => ({
          content: m.content,
          role: m.role,
          createdAt: m.createdAt
        })),  
        totalMessages: messages.length,
        promptsCount: messages.filter(m => m.role === 'user').length
      };
    }

    return details;
  }

  async findByExperimentId(experimentId: string): Promise<UserTask[]> {
    return await this.userTaskRepository.find({
      relations: ['task', 'user'],
      where: {
        task: {
          experiment_id: experimentId
        }
      }
    });
  }

  async getExecutionDetailsFromEntity(userTask: UserTask): Promise<TaskExecutionDetailsDto> {
    const { task, user } = userTask;
    let executionTime = 0;
    if (userTask.startTime && userTask.endTime) {
      executionTime = new Date(userTask.endTime).getTime() - new Date(userTask.startTime).getTime();
    }

    const details: TaskExecutionDetailsDto = {
      userTaskId: userTask._id,
      userName: user.name,
      userEmail: user.email,
      taskId: task._id,
      taskTitle: task.title,
      taskType: task.search_source,
      executionTime,
    };

    if (task.search_source === 'search-engine') {
      const sessions = await this.userTaskSessionService.finByUserIdAndTaskId(user._id, task._id);
      const sortedSessions = [...sessions].sort((a, b) => {
        const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return aTime - bTime;
      });

      let totalDepth = 0;

      const queries = sortedSessions.map((session) => {
        const resources = (session.pages || []).map((page) => {
          totalDepth++;

          let timeSpent = 0;
          if (page.startTime && page.endTime) {
            timeSpent = new Date(page.endTime).getTime() - new Date(page.startTime).getTime();
          }

          return {
            title: page.title,
            url: page.url,
            timeSpent,
            visitTime: page.startTime
          };
        });

        return {
          query: session.query,
          timestamp: session.timestamp,
          serpNumber: session.serpNumber,
          resourcesAccessedCount: resources.length,
          resources
        };
      });

      details.searchDetails = {
        resourcesAccessedTotal: totalDepth,
        queriesCount: sessions.length,
        queries
      };

    } else if (task.search_source === 'llm') {
      const llmSession = await this.llmSessionService.findByUserIdAndTaskId(user._id, task._id);

      const messages = llmSession ? llmSession.messages : [];
      details.llmDetails = {
        messages: messages.map(m => ({
          content: m.content,
          role: m.role,
          createdAt: m.createdAt
        })),
        totalMessages: messages.length,
        promptsCount: messages.filter(m => m.role === 'user').length
      };
    }

    return details;
  }

  async findByUserAndTask(userId: string, taskId: string): Promise<UserTask[]> {
    return await this.userTaskRepository.find({
      relations: ['task', 'user'],
      where: {
        user: { _id: userId },
        task: { _id: taskId }
      }
    });
  }
}
