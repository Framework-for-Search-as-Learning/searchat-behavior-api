/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';

import {ExperimentService} from '../experiment/experiment.service';
import {SurveyAnswerService} from '../survey-answer/survey-answer.service';
import {CreateSurveyDto} from './dto/create-survey.dto';
import {QuestionType} from './dto/question.dto';
import {SurveyQuestionStatDto,SurveyStatsDto} from './dto/survey-stats.dto';
import {UpdateSurveyDto} from './dto/update-survey.dto';
import {Survey} from './entity/survey.entity';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private readonly surveyRepository: Repository<Survey>,
    @Inject(forwardRef(() => ExperimentService))
    private readonly experimentService: ExperimentService,
    @Inject(forwardRef(() => SurveyAnswerService))
    private readonly surveyAnswerService: SurveyAnswerService,
  ) {}

  async create(createSurveyDto: CreateSurveyDto): Promise<Survey> {
    try {
      const {
        name,
        title,
        description,
        type,
        questions,
        experimentId,
        uuid,
        uniqueAnswer,
      } = createSurveyDto;
      const experiment = await this.experimentService.find(experimentId);
      if (!experiment) {
        throw new NotFoundException('Experimento não encontrado');
      }
      let newSurvey: Survey;
      if (uuid) {
        newSurvey = this.surveyRepository.create({
          _id: uuid,
          name,
          title,
          description,
          type,
          questions,
          experiment,
          uniqueAnswer,
        });
      } else {
        newSurvey = this.surveyRepository.create({
          name,
          title,
          description,
          type,
          questions,
          experiment,
          uniqueAnswer,
        });
      }
      return await this.surveyRepository.save(newSurvey);
    } catch (error) {
      console.error('Erro ao criar survey:', error);
      throw new InternalServerErrorException('Erro ao criar survey');
    }
  }

  async findAll(): Promise<Survey[]> {
    return await this.surveyRepository.find();
  }
  async findOne(id: string): Promise<Survey> {
    return await this.surveyRepository.findOne({
      where: {_id: id},
    });
  }

  async findOneWithExperiment(id: string): Promise<Survey> {
    return await this.surveyRepository.findOne({
      where: {_id: id},
      relations: ['experiment'],
    });
  }

  async findByExperimentId(experimentId: string): Promise<Survey[]> {
    return await this.surveyRepository.find({
      where: {
        experiment: {_id: experimentId},
      },
      relations: ['experiment'],
    });
  }
  async update(id: string, updateSurveyDto: UpdateSurveyDto): Promise<Survey> {
    try {
      await this.surveyRepository.update({_id: id}, updateSurveyDto);
      return await this.findOne(id);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async remove(id: string) {
    const survey = await this.findOne(id);
    await this.surveyRepository.delete({_id: id});
    return survey;
  }

  async getStats(surveyId: string): Promise<SurveyStatsDto> {
    const survey = await this.findOne(surveyId);
    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    const answers = await this.surveyAnswerService.findBySurveyId(surveyId);

    const questionStats: SurveyQuestionStatDto[] = [];

    const validQuestions = survey.questions.filter(
      (q) => q.type !== QuestionType.OPEN,
    );

    for (const question of validQuestions) {
      const qStat: SurveyQuestionStatDto = {
        statement: question.statement,
        type: question.type,
        totalAnswers: 0,
        options: [],
      };

      if (question.options) {
        qStat.options = question.options.map((opt) => ({
          statement: opt.statement,
          count: 0,
          percentage: 0,
        }));
      }

      let answeredCount = 0;
      answers.forEach((ans) => {
        const qAnswer = ans.answers.find(
          (a) => a.questionStatement === question.statement,
        );

        if (qAnswer) {
          answeredCount++;

          if (qAnswer.selectedOptions) {
            qAnswer.selectedOptions.forEach((selOpt) => {
              const statOpt = qStat.options.find(
                (o) => o.statement === selOpt.statement,
              );
              if (statOpt) {
                statOpt.count++;
              }
            });
          }
        }
      });

      qStat.totalAnswers = answeredCount;

      if (answeredCount > 0) {
        qStat.options.forEach((opt) => {
          opt.percentage = parseFloat(
            ((opt.count / answeredCount) * 100).toFixed(2),
          );
        });
      }

      questionStats.push(qStat);
    }

    return {
      surveyId: survey._id,
      name: survey.name,
      title: survey.title,
      description: survey.description,
      type: survey.type,
      questions: questionStats,
    };
  }
}
