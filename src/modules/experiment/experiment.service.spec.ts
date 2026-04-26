/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import {BadRequestException} from '@nestjs/common';
import type {TestingModule} from '@nestjs/testing';
import {Test} from '@nestjs/testing';
import {getRepositoryToken} from '@nestjs/typeorm';

import {IcfService} from '../icf/icf.service';
import {SurveyType} from '../survey/entity/survey.entity';
import {SurveyService} from '../survey/survey.service';
import {TaskService} from '../task/task.service';
import {UserService} from '../user/user.service';
import {UserExperimentService} from '../user-experiment/user-experiment.service';
import {UserTaskService} from '../user-task/user-task.service';
import type {CreateExperimentDto} from './dto/create-experiment.dto';
import {
  Experiment,
  ExperimentStatus,
  StepsType,
} from './entity/experiment.entity';
import {ExperimentService} from './experiment.service';

describe('ExperimentService', () => {
  let service: ExperimentService;
  let mockExperimentRepository: {
    find: jest.Mock;
    findOneBy: jest.Mock;
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    manager: {
      transaction: jest.Mock;
    };
  };
  let mockExperimentQueryBuilder: {
    leftJoinAndSelect: jest.Mock;
    addSelect: jest.Mock;
    where: jest.Mock;
    getOne: jest.Mock;
  };
  let mockUserExperimentService: {
    getDetailedStats: jest.Mock;
    getParticipantsDetails: jest.Mock;
    countUsersByExperimentId: jest.Mock;
  };
  let mockUserTaskService: {
    findByExperimentId: jest.Mock;
    getExecutionDetailsFromEntity: jest.Mock;
  };
  let mockUserService: {
    findOne: jest.Mock;
  };
  let mockTaskService: {
    create: jest.Mock;
  };
  let mockSurveyService: {
    create: jest.Mock;
    findByExperimentId: jest.Mock;
    getStats: jest.Mock;
  };
  let mockIcfService: {
    create: jest.Mock;
  };
  let mockTransactionManager: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let mockTaskSurveyInsertBuilder: {
    insert: jest.Mock;
    into: jest.Mock;
    values: jest.Mock;
    orIgnore: jest.Mock;
    execute: jest.Mock;
  };

  beforeEach(async () => {
    mockExperimentRepository = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      manager: {
        transaction: jest.fn(),
      },
    };

    mockTaskSurveyInsertBuilder = {
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      orIgnore: jest.fn().mockReturnThis(),
      execute: jest.fn(),
    };

    mockTransactionManager = {
      create: jest.fn((_, entity) => entity),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(() => mockTaskSurveyInsertBuilder),
    };

    mockExperimentRepository.manager.transaction.mockImplementation(
      async (callback) => callback(mockTransactionManager),
    );
    mockExperimentQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };
    mockExperimentRepository.createQueryBuilder.mockReturnValue(
      mockExperimentQueryBuilder,
    );

    mockUserExperimentService = {
      getDetailedStats: jest.fn(),
      getParticipantsDetails: jest.fn(),
      countUsersByExperimentId: jest.fn(),
    };

    mockUserTaskService = {
      findByExperimentId: jest.fn(),
      getExecutionDetailsFromEntity: jest.fn(),
    };

    mockUserService = {
      findOne: jest.fn(),
    };

    mockTaskService = {
      create: jest.fn(),
    };

    mockSurveyService = {
      create: jest.fn(),
      findByExperimentId: jest.fn(),
      getStats: jest.fn(),
    };

    mockIcfService = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExperimentService,
        {
          provide: getRepositoryToken(Experiment),
          useValue: mockExperimentRepository,
        },
        {
          provide: UserExperimentService,
          useValue: mockUserExperimentService,
        },
        {
          provide: UserTaskService,
          useValue: mockUserTaskService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: TaskService,
          useValue: mockTaskService,
        },
        {
          provide: SurveyService,
          useValue: mockSurveyService,
        },
        {
          provide: IcfService,
          useValue: mockIcfService,
        },
      ],
    }).compile();

    service = module.get<ExperimentService>(ExperimentService);
  });

  describe('create', () => {
    it('should create an experiment with surveys, tasks, linked task-survey rows, and icf', async () => {
      const createExperimentDto: CreateExperimentDto = {
        name: 'Test Experiment',
        ownerId: 'owner-1',
        summary: 'Test Summary',
        tasksProps: [
          {
            uuid: 'task-temp-1',
            title: 'Task 1',
            summary: 'Task Summary',
            description: 'Task Description',
            search_source: 'search-engine',
            SelectedSurvey: 'survey-1',
            RulesExperiment: 'score',
            ScoreThreshold: 0,
            ScoreThresholdmx: 100,
            selectedQuestionIds: [],
            provider_config: {},
            linkedSurveyRefs: ['survey-1', 'survey-1'],
          },
        ],
        surveysProps: [
          {
            name: 'Survey 1',
            title: 'Survey Title',
            description: 'Survey Description',
            questions: [],
            type: SurveyType.PRE,
            uuid: 'uuid-1',
            uniqueAnswer: false,
            experimentId: 'exp-1',
          },
        ],
        typeExperiment: 'within-subject',
        betweenExperimentType: null,
        icf: {title: 'ICF Title', description: 'ICF Description'},
      };

      const mockUser = {_id: 'owner-1', name: 'Owner'};
      const savedExperiment = {_id: 'exp-1', name: 'Test Experiment'};
      const savedSurvey = {_id: 'survey-1'};
      const savedTask = {_id: 'task-1'};

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockTransactionManager.findOne.mockResolvedValue(savedSurvey);
      mockTransactionManager.save.mockImplementation(async (entity, payload) => {
        if (entity === Experiment) {
          return savedExperiment;
        }
        if (payload?.title === 'Task 1') {
          return savedTask;
        }
        if (payload?.name === 'Survey 1') {
          return savedSurvey;
        }
        return payload;
      });
      mockTaskSurveyInsertBuilder.execute.mockResolvedValue({});

      const result = await service.create(createExperimentDto);

      expect(mockUserService.findOne).toHaveBeenCalledWith('owner-1');
      expect(mockExperimentRepository.manager.transaction).toHaveBeenCalled();
      expect(mockTaskSurveyInsertBuilder.values).toHaveBeenCalled();
      expect(mockTaskSurveyInsertBuilder.orIgnore).toHaveBeenCalled();
      expect(result).toEqual(savedExperiment);
    });

    it('should keep backward compatibility when linkedSurveyRefs is not provided', async () => {
      const createExperimentDto: CreateExperimentDto = {
        name: 'Test Experiment',
        ownerId: 'owner-1',
        summary: 'Test Summary',
        tasksProps: [
          {
            title: 'Task 1',
            summary: 'Task Summary',
            description: 'Task Description',
            search_source: 'search-engine',
            SelectedSurvey: 'survey-1',
            RulesExperiment: 'score',
            ScoreThreshold: 0,
            ScoreThresholdmx: 100,
            selectedQuestionIds: [],
            provider_config: {},
          },
        ],
        surveysProps: [
          {
            name: 'Survey 1',
            title: 'Survey Title',
            description: 'Survey Description',
            questions: [],
            type: SurveyType.PRE,
            uuid: 'survey-1',
            uniqueAnswer: false,
            experimentId: 'exp-1',
          },
        ],
        typeExperiment: 'within-subject',
        betweenExperimentType: null,
        icf: {title: 'ICF Title', description: 'ICF Description'},
      };

      const savedExperiment = {_id: 'exp-1', name: 'Test Experiment'};
      const savedSurvey = {_id: 'survey-1'};

      mockUserService.findOne.mockResolvedValue({_id: 'owner-1'});
      mockTransactionManager.findOne.mockResolvedValue(savedSurvey);
      mockTransactionManager.save.mockImplementation(async (entity, payload) => {
        if (entity === Experiment) {
          return savedExperiment;
        }
        if (payload?.name === 'Survey 1') {
          return savedSurvey;
        }
        return payload;
      });

      const result = await service.create(createExperimentDto);

      expect(mockTaskSurveyInsertBuilder.execute).not.toHaveBeenCalled();
      expect(result).toEqual(savedExperiment);
    });

    it('should throw 400 when linkedSurveyRefs contains invalid refs', async () => {
      const createExperimentDto: CreateExperimentDto = {
        name: 'Test Experiment',
        ownerId: 'owner-1',
        summary: 'Test Summary',
        tasksProps: [
          {
            uuid: 'task-temp-1',
            title: 'Task 1',
            summary: 'Task Summary',
            description: 'Task Description',
            search_source: 'search-engine',
            RulesExperiment: 'score',
            ScoreThreshold: 0,
            ScoreThresholdmx: 100,
            selectedQuestionIds: [],
            provider_config: {},
            linkedSurveyRefs: ['missing-ref'],
          },
        ],
        surveysProps: [
          {
            name: 'Survey 1',
            title: 'Survey Title',
            description: 'Survey Description',
            questions: [],
            type: SurveyType.PRE,
            uuid: 'survey-1',
            uniqueAnswer: false,
            experimentId: 'exp-1',
          },
        ],
        typeExperiment: 'within-subject',
        betweenExperimentType: null,
        icf: {title: 'ICF Title', description: 'ICF Description'},
      };

      mockUserService.findOne.mockResolvedValue({_id: 'owner-1'});
      mockTransactionManager.save.mockImplementation(async (entity, payload) => {
        if (entity === Experiment) {
          return {_id: 'exp-1'};
        }
        if (payload?.name === 'Survey 1') {
          return {_id: 'survey-1'};
        }
        if (payload?.title === 'Task 1') {
          return {_id: 'task-1'};
        }
        return payload;
      });

      await expect(service.create(createExperimentDto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(mockTaskSurveyInsertBuilder.execute).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all experiments', async () => {
      const experiments = [
        {_id: 'exp-1', name: 'Experiment 1'},
        {_id: 'exp-2', name: 'Experiment 2'},
      ];

      mockExperimentRepository.find.mockResolvedValue(experiments);

      const result = await service.findAll();

      expect(mockExperimentRepository.find).toHaveBeenCalled();
      expect(result).toEqual(experiments);
    });
  });

  describe('find', () => {
    it('should find an experiment by id', async () => {
      const experiment = {_id: 'exp-1', name: 'Experiment 1'};
      mockExperimentRepository.findOneBy.mockResolvedValue(experiment);

      const result = await service.find('exp-1');

      expect(mockExperimentRepository.findOneBy).toHaveBeenCalledWith({
        _id: 'exp-1',
      });
      expect(result).toEqual(experiment);
    });
  });

  describe('getStats', () => {
    it('should return experiment stats', async () => {
      const stats = {totalParticipants: 10, completedTasks: 8};
      mockUserExperimentService.getDetailedStats.mockResolvedValue(stats);

      const result = await service.getStats('exp-1');

      expect(mockUserExperimentService.getDetailedStats).toHaveBeenCalledWith(
        'exp-1',
      );
      expect(result).toEqual(stats);
    });
  });

  describe('getParticipants', () => {
    it('should return experiment participants', async () => {
      const participants = [
        {userId: 'user-1', status: 'completed'},
        {userId: 'user-2', status: 'pending'},
      ];
      mockUserExperimentService.getParticipantsDetails.mockResolvedValue(
        participants,
      );

      const result = await service.getParticipants('exp-1');

      expect(
        mockUserExperimentService.getParticipantsDetails,
      ).toHaveBeenCalledWith('exp-1');
      expect(result).toEqual(participants);
    });
  });

  describe('findWithTasks', () => {
    it('should find an experiment with its tasks', async () => {
      const experiment = {
        _id: 'exp-1',
        name: 'Experiment 1',
        tasks: [{_id: 'task-1', title: 'Task 1'}],
      };
      mockExperimentRepository.findOne.mockResolvedValue(experiment);

      const result = await service.findWithTasks('exp-1');

      expect(mockExperimentRepository.findOne).toHaveBeenCalledWith({
        where: {_id: 'exp-1'},
        relations: ['tasks'],
      });
      expect(result).toEqual(experiment);
    });
  });

  describe('getTasksExecutionDetails', () => {
    it('should return tasks execution details grouped by task', async () => {
      const userTasks = [
        {task_id: 'task-1', task: {title: 'Task 1'}, execution: 'data-1'},
        {task_id: 'task-1', task: {title: 'Task 1'}, execution: 'data-2'},
      ];

      mockUserTaskService.findByExperimentId.mockResolvedValue(userTasks);
      mockUserTaskService.getExecutionDetailsFromEntity
        .mockResolvedValueOnce({details: 'execution-1'})
        .mockResolvedValueOnce({details: 'execution-2'});

      const result = await service.getTasksExecutionDetails('exp-1');

      expect(mockUserTaskService.findByExperimentId).toHaveBeenCalledWith(
        'exp-1',
      );
      expect(result).toHaveLength(1);
      expect(result[0].taskId).toBe('task-1');
      expect(result[0].executions).toHaveLength(2);
    });
  });

  describe('getSurveysStats', () => {
    it('should return surveys statistics', async () => {
      const surveys = [
        {_id: 'survey-1', title: 'Survey 1'},
        {_id: 'survey-2', title: 'Survey 2'},
      ];

      mockSurveyService.findByExperimentId.mockResolvedValue(surveys);
      mockSurveyService.getStats
        .mockResolvedValueOnce({responses: 10})
        .mockResolvedValueOnce({responses: 8});

      const result = await service.getSurveysStats('exp-1');

      expect(mockSurveyService.findByExperimentId).toHaveBeenCalledWith(
        'exp-1',
      );
      expect(result.surveys).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('should update an experiment', async () => {
      const updateDto = {
        name: 'Updated Experiment',
        status: ExperimentStatus.IN_PROGRESS,
      };
      const updatedExperiment = {_id: 'exp-1', ...updateDto};

      mockExperimentRepository.update.mockResolvedValue({affected: 1});
      mockExperimentRepository.findOneBy.mockResolvedValue(updatedExperiment);

      const result = await service.update('exp-1', updateDto);

      expect(mockExperimentRepository.update).toHaveBeenCalledWith(
        {_id: 'exp-1'},
        updateDto,
      );
      expect(result).toEqual(updatedExperiment);
    });
  });

  describe('remove', () => {
    it('should remove an experiment', async () => {
      const experiment = {_id: 'exp-1', name: 'Experiment 1'};
      mockExperimentRepository.findOneBy.mockResolvedValue(experiment);
      mockExperimentRepository.delete.mockResolvedValue({affected: 1});

      const result = await service.remove('exp-1');

      expect(mockExperimentRepository.delete).toHaveBeenCalledWith({
        _id: 'exp-1',
      });
      expect(result).toEqual(experiment);
    });
  });

  describe('buildStep', () => {
    it('should build experiment steps correctly', async () => {
      const experiment = {
        _id: 'exp-1',
        icfs: [{_id: 'icf-1'}],
        tasks: [{_id: 'task-1'}],
        surveys: [
          {_id: 'survey-1', type: SurveyType.PRE},
          {_id: 'survey-2', type: SurveyType.POST},
        ],
      };

      mockExperimentRepository.findOne.mockResolvedValue(experiment);

      const result = await service.buildStep('exp-1');

      expect(result[StepsType.ICF]).toBeDefined();
      expect(result[StepsType.PRE]).toBeDefined();
      expect(result[StepsType.TASK]).toBeDefined();
      expect(result[StepsType.POST]).toBeDefined();
    });
  });

  describe('exportToYaml', () => {
    it('should export experiment to YAML format', async () => {
      const experiment = {
        _id: 'exp-1',
        name: 'Test Experiment',
        summary: 'Test Summary',
        typeExperiment: 'within-subject',
        betweenExperimentType: null,
        icfs: [{title: 'ICF Title', description: 'ICF Description'}],
        surveys: [
          {
            name: 'Survey 1',
            title: 'Survey Title',
            description: 'Description',
            questions: [],
            type: 'pre',
            uniqueAnswer: false,
            required: true,
          },
        ],
        tasks: [
          {
            title: 'Task 1',
            summary: 'Summary',
            description: 'Description',
            rule_type: 'score',
            max_score: 100,
            min_score: 0,
            search_source: 'llm',
            provider_config: {
              modelProvider: 'google',
              model: 'gemini-2.5-flash',
              systemInstruction: 'Answer as a research assistant.',
              apiKey: 'secret-api-key',
            },
            survey_id: 'survey-1',
          },
        ],
      };

      mockExperimentQueryBuilder.getOne.mockResolvedValue(experiment);

      const result = await service.exportToYaml('exp-1');

      expect(typeof result).toBe('string');
      expect(result).toContain('Test Experiment');
      expect(result).toContain(
        'systemInstruction: Answer as a research assistant.',
      );
      expect(result).toContain('search_model: gemini-2.5-flash');
      expect(result).not.toContain('secret-api-key');
    });

    it('should throw error if experiment not found', async () => {
      mockExperimentQueryBuilder.getOne.mockResolvedValue(null);

      await expect(service.exportToYaml('exp-1')).rejects.toThrow(
        'Experiment not found',
      );
    });
  });

  describe('importFromYaml', () => {
    it('should import experiment from YAML', async () => {
      const yamlContent = `
        experiment:
          name: Test Import
          summary: Test Summary
          typeExperiment: within-subject
          betweenExperimentType: null
          icf:
            title: ICF Title
            description: ICF Description
          surveys:
            - name: Survey 1
              title: Survey Title
              description: Survey Description
              type: pre
              uniqueAnswer: false
              required: true
              questions:
                - statement: Question 1
                  type: open
                  required: true
          tasks:
            - title: Task 1
              summary: Task Summary
              description: Task Description
              search_source: llm
              search_model: gemini-2.5-flash
              systemInstruction: Answer as a research assistant.
              rule_type: score
              min_score: 0
              max_score: 100
      `;

      const mockUser = {_id: 'owner-1'};
      const savedExperiment = {_id: 'exp-1', name: 'Test Import'};

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockExperimentRepository.create.mockReturnValue(savedExperiment);
      mockExperimentRepository.save.mockResolvedValue(savedExperiment);
      mockIcfService.create.mockResolvedValue({});
      mockSurveyService.create.mockResolvedValue({});
      mockTaskService.create.mockResolvedValue({});

      const result = await service.importFromYaml(yamlContent, 'owner-1');

      expect(result).toEqual([]);
      expect(mockExperimentRepository.save).toHaveBeenCalled();
      expect(mockTaskService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          provider_config: expect.objectContaining({
            modelProvider: 'google',
            model: 'gemini-2.5-flash',
            systemInstruction: 'Answer as a research assistant.',
          }),
        }),
      );
    });

    it('should return validation errors for invalid YAML', async () => {
      const invalidYaml = `
        experiment:
          name: Test
      `;

      const result = await service.importFromYaml(invalidYaml, 'owner-1');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getGeneralExpirementInfos', () => {
    it('should return general experiment information', async () => {
      const experiment = {_id: 'exp-1', status: 'active'};
      const userInfos = {total: 10, completed: 8};

      mockExperimentRepository.findOneBy.mockResolvedValue(experiment);
      mockUserExperimentService.countUsersByExperimentId.mockResolvedValue(
        userInfos,
      );

      const result = await service.getGeneralExpirementInfos('exp-1');

      expect(result.experimentStatus).toBe('active');
      expect(result.userExperimentInfos).toEqual(userInfos);
    });
  });

  describe('findOneByName', () => {
    it('should find experiment by name', async () => {
      const experiment = {_id: 'exp-1', name: 'Test Experiment'};
      mockExperimentRepository.findOneBy.mockResolvedValue(experiment);

      const result = await service.findOneByName('Test Experiment');

      expect(mockExperimentRepository.findOneBy).toHaveBeenCalledWith({
        name: 'Test Experiment',
      });
      expect(result).toEqual(experiment);
    });
  });

  describe('findByOwnerId', () => {
    it('should find experiments by owner id', async () => {
      const experiments = [{_id: 'exp-1', owner_id: 'owner-1'}];
      mockExperimentRepository.find.mockResolvedValue(experiments);

      const result = await service.findByOwnerId('owner-1');

      expect(mockExperimentRepository.find).toHaveBeenCalledWith({
        where: {owner_id: 'owner-1'},
      });
      expect(result).toEqual(experiments);
    });
  });
});
