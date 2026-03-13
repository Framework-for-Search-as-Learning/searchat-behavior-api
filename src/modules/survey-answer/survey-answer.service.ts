/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { QuestionType } from '../survey/dto/question.dto';
import { SurveyService } from '../survey/survey.service';
import { UserService } from '../user/user.service';
import { UserTaskService } from '../user-task/user-task.service';
import { AnswerDTO } from './dto/answers.dto';
import { CreateSurveyAnswerDto } from './dto/create-surveyAnswer.dto';
import { UpdateSurveyAnswerDto } from './dto/update-surveyAnswer.dto';
import { SurveyAnswer } from './entity/survey-answer.entity';

@Injectable()
export class SurveyAnswerService {
  constructor(
    @InjectRepository(SurveyAnswer)
    private readonly surveyAnswerRepository: Repository<SurveyAnswer>,
    private readonly userService: UserService,
    @Inject(forwardRef(() => SurveyService))
    private readonly surveyService: SurveyService,
    private readonly userTaskService: UserTaskService,
  ) { }

  async create(
    createSurveyAnswerDto: CreateSurveyAnswerDto,
  ): Promise<SurveyAnswer> {
    const { userId, surveyId, answers } = createSurveyAnswerDto;
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('Usuario não encontrado.');
    }
    const survey = await this.surveyService.findOneWithExperiment(surveyId);
    if (!survey) {
      throw new NotFoundException('Survey não encontrado.');
    }

    const totalScore = this.calculateScore(answers);
    const newSurveyAnswer = await this.surveyAnswerRepository.save({
      user: user,
      survey: survey,
      answers: answers,
      score: totalScore,
    });
    const experiment = survey.experiment;
    if (experiment?.betweenExperimentType === 'rules_based') {
      await this.userTaskService.createBySurveyRule({
        userId,
        surveyId: newSurveyAnswer.survey_id,
        surveyAnswer: newSurveyAnswer,
      });
    }
    return newSurveyAnswer;
  }

  async findAll(): Promise<SurveyAnswer[]> {
    return await this.surveyAnswerRepository.find();
  }

  async findByUserId(userId: string): Promise<SurveyAnswer[]> {
    return await this.surveyAnswerRepository.find({
      where: {
        user_id: userId,
      },
    });
  }

  async findByUserIdAndSurveyId(
    userId: string,
    surveyId: string,
  ): Promise<SurveyAnswer> {
    return await this.surveyAnswerRepository.findOne({
      where: { user_id: userId, survey_id: surveyId },
    });
  }

  async removeByUserIdAndSurveyId(userId: string, surveyId: string) {
    return await this.surveyAnswerRepository.delete({
      user_id: userId,
      survey_id: surveyId,
    });
  }

  async remove(id: string) {
    return await this.surveyAnswerRepository.delete({ _id: id });
  }

  async update(
    id: string,
    updateSurveyAnswerDto: UpdateSurveyAnswerDto,
  ): Promise<SurveyAnswer> {
    try {
      if (updateSurveyAnswerDto.answers) {
        updateSurveyAnswerDto.score = this.calculateScore(
          updateSurveyAnswerDto.answers,
        );
      }
      await this.surveyAnswerRepository.update(
        { _id: id },
        updateSurveyAnswerDto,
      );
      return await this.surveyAnswerRepository.findOne({ where: { _id: id } });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private calculateScore(answers: AnswerDTO[]): number {
    let totalScore = 0;
    for (const answer of answers) {
      let questionScore = 0;
      if (
        answer.questionType === QuestionType.MULTIPLE_CHOICES ||
        answer.questionType === QuestionType.MULTIPLE_SELECTION
      ) {
        questionScore =
          answer.selectedOptions?.reduce(
            (acc, option) => acc + option.score,
            0,
          ) || 0;
      }

      answer.score = questionScore;
      totalScore += questionScore;
    }
    return totalScore;
  }

  async findBySurveyId(surveyId: string): Promise<SurveyAnswer[]> {
    return await this.surveyAnswerRepository.find({
      where: {
        survey_id: surveyId,
      },
    });
  }
}
