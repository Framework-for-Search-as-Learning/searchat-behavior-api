/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import {PartialType} from '@nestjs/swagger';

import {CreateSurveyDto} from './create-survey.dto';
import type { QuestionDTO } from './question.dto';

export class UpdateSurveyDto extends PartialType(CreateSurveyDto) {
  questions?: QuestionDTO[];
}
