/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { NotFoundException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import type { Experiment} from '../experiment/entity/experiment.entity';
import { ExperimentStatus } from '../experiment/entity/experiment.entity';
import { ExperimentService } from '../experiment/experiment.service';
import type { CreateIcfDto } from './dto/create-icf.dto';
import type { UpdateIcfDto } from './dto/update-icf.dto';
import { Icf } from './entity/icf.entity';
import { IcfService } from './icf.service';

describe('IcfService', () => {
  let service: IcfService;
  let icfRepository: {
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  let experimentService: ExperimentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IcfService,
        {
          provide: getRepositoryToken(Icf),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: ExperimentService,
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<IcfService>(IcfService);
    icfRepository = module.get(getRepositoryToken(Icf));
    experimentService = module.get<ExperimentService>(ExperimentService);
  });

  describe('create', () => {
    it('should create an ICF when experiment exists', async () => {
      const createIcfDto: CreateIcfDto = { title: 'Test', description: 'Desc', experimentId: '1' };
      const experiment = {
        _id: '1', 
        name: 'Test Experiment',
        owner_id: 'owner-1',
        owner: null,
        summary: 'Test Summary',
        typeExperiment: 'within-subject',
        betweenExperimentType: null,
        status: ExperimentStatus.NOT_STARTED,
        isActive: true,
        createdAt: new Date(),
        lastChangeAt: new Date(),
        tasks: [],
        userExperiments: [],
        surveys: [],
        icfs: [],
      } as Experiment;
      const savedIcf = { _id: 'icf-1', ...createIcfDto, experiment };

      jest.spyOn(experimentService, 'find').mockResolvedValue(experiment);
      jest.spyOn(icfRepository, 'save').mockResolvedValue(savedIcf);

      const result = await service.create(createIcfDto);
      expect(result).toEqual(savedIcf);
      expect(icfRepository.save).toHaveBeenCalledWith({ title: createIcfDto.title, description: createIcfDto.description, experiment });
    });

    it('should throw NotFoundException when experiment does not exist', async () => {
      const createIcfDto: CreateIcfDto = { title: 'Test', description: 'Desc', experimentId: '1' };
      jest.spyOn(experimentService, 'find').mockResolvedValue(null);

      await expect(service.create(createIcfDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all ICFs', async () => {
      const icfs = [{ _id: '1', title: 'ICF1' }, { _id: '2', title: 'ICF2' }];
      jest.spyOn(icfRepository, 'find').mockResolvedValue(icfs);

      const result = await service.findAll();
      expect(result).toEqual(icfs);
      expect(icfRepository.find).toHaveBeenCalled();
    });
  });

  describe('find', () => {
    it('should find an ICF by id', async () => {
      const icf = { _id: '1', title: 'Test ICF' };
      jest.spyOn(icfRepository, 'findOne').mockResolvedValue(icf);

      const result = await service.find('1');
      expect(result).toEqual(icf);
      expect(icfRepository.findOne).toHaveBeenCalledWith({ where: { _id: '1' } });
    });
  });

  describe('findOneByExperimentId', () => {
    it('should find an ICF by experiment id', async () => {
      const icf = { _id: '1', experiment_id: 'exp-1' };
      jest.spyOn(icfRepository, 'findOne').mockResolvedValue(icf);

      const result = await service.findOneByExperimentId('exp-1');
      expect(result).toEqual(icf);
      expect(icfRepository.findOne).toHaveBeenCalledWith({ where: { experiment_id: 'exp-1' } });
    });

    it('should return undefined when no ICF found for experiment id', async () => {
      jest.spyOn(icfRepository, 'findOne').mockResolvedValue(undefined);

      const result = await service.findOneByExperimentId('exp-nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update an ICF', async () => {
      const updateIcfDto: UpdateIcfDto = { title: 'Updated' };
      const updatedIcf = { _id: '1', title: 'Updated' };

      jest.spyOn(icfRepository, 'update').mockResolvedValue({ affected: 1 });
      jest.spyOn(icfRepository, 'findOne').mockResolvedValue(updatedIcf);

      const result = await service.update('1', updateIcfDto);
      expect(result).toEqual(updatedIcf);
      expect(icfRepository.update).toHaveBeenCalledWith({ _id: '1' }, updateIcfDto);
    });
  });

  describe('remove', () => {
    it('should remove an ICF and return it', async () => {
      const icf = { _id: '1', title: 'Test' };
      jest.spyOn(icfRepository, 'findOne').mockResolvedValue(icf);
      jest.spyOn(icfRepository, 'delete').mockResolvedValue({ affected: 1 });

      const result = await service.remove('1');
      expect(result).toEqual(icf);
      expect(icfRepository.delete).toHaveBeenCalledWith({ _id: '1' });
    });
  });
});
