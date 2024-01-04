import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import dayjs from 'dayjs';
import { In, Repository } from 'typeorm';

import { ConfigName } from '@/common/constants/config-name.constant';
import { Degree } from '@/entities/degree.entity';
import { Institution } from '@/entities/institution.entity';
import { Major } from '@/entities/major.entity';
import { Skill } from '@/entities/skill.entity';
import { IAppEnvConfig } from '@/lib/config/configs/app.config';

import { ResumeParsingResult } from './resume-result.interface';
import { MilvusService } from '../milvus/milvus.service';

@Injectable()
export class ResumeParserService {
  private readonly mlAPIUrl: string;
  constructor(
    private readonly milvusService: MilvusService,
    private readonly configService: ConfigService,
    @InjectRepository(Skill) private readonly skillRepo: Repository<Skill>,
    @InjectRepository(Major) private readonly majorRepo: Repository<Major>,
    @InjectRepository(Degree) private readonly degreeRepo: Repository<Degree>,
    @InjectRepository(Institution)
    private readonly institutionRepo: Repository<Institution>,
  ) {
    const config = this.configService.get<IAppEnvConfig>(ConfigName.APP);

    if (!config) {
      throw new Error('APP_CONFIG_NOT_FOUND');
    }

    this.mlAPIUrl = config.mlApiUrl;
  }

  public async parseResume(file: Express.Multer.File) {
    const formData = new FormData();
    formData.append('file', new Blob([file.buffer]));
    formData.append('filename', file.originalname);
    formData.append('filetype', file.mimetype);

    const response = await axios.post<ResumeParsingResult>(
      `${this.mlAPIUrl}/predict`,
      formData,
    );

    const data = response.data;

    const matchedSkillsVectors = data.result.skills.map(async (item) => {
      const id = await this.milvusService.searchVectors({
        collectionName: 'skills',
        limit: 1,
        queryVectors: [item.vector],
      });

      return id.results[0];
    });

    const matchedSkillsIds = await Promise.all(matchedSkillsVectors);

    const skillsIds = matchedSkillsIds
      .filter((item) => item.score < 0.4)
      .filter(
        (item, index, self) =>
          self.findIndex((t) => t.id === item.id) === index,
      )
      .map((item) => Number(item.id));

    const matchedSkills = await this.skillRepo.find({
      where: {
        id: In(skillsIds),
      },
    });

    let major = null;
    if (data.result.lastEducationMajor) {
      const matchedMajorVectors = await this.milvusService.searchVectors({
        collectionName: 'majors',
        limit: 1,
        queryVectors: [data.result.lastEducationMajor.vector],
      });

      const matchedMajorId = matchedMajorVectors.results[0];

      major = await this.majorRepo.findOne({
        where: { id: Number(matchedMajorId.id) },
      });
    }

    let institution = null;
    if (data.result.lastEducationInstitution) {
      const matchedInstitutionVectors = await this.milvusService.searchVectors({
        collectionName: 'institutions',
        limit: 1,
        queryVectors: [data.result.lastEducationInstitution.vector],
      });

      const matchedInstitutionId = matchedInstitutionVectors.results[0];

      institution = await this.institutionRepo.findOne({
        where: { id: Number(matchedInstitutionId.id) },
      });
    }

    let degree = null;
    if (data.result.lastEducationDegree) {
      const matchedDegreeVectors = await this.milvusService.searchVectors({
        collectionName: 'degrees',
        limit: 1,
        queryVectors: [data.result.lastEducationDegree.vector],
      });

      const matchedDegreeId = matchedDegreeVectors.results[0];

      degree = await this.degreeRepo.findOne({
        where: { id: Number(matchedDegreeId.id) },
      });
    }

    return {
      name: data.result.name,
      birthday:
        data.result.birthday && dayjs(data.result.birthday).toISOString(),
      lastEducationStartDate:
        data.result.lastEducationStartDate &&
        dayjs(data.result.lastEducationStartDate).toISOString(),
      lastEducationEndDate:
        data.result.lastEducationEndDate &&
        dayjs(data.result.lastEducationEndDate).toISOString(),
      lastEducationMajor: major,
      lastEducationInstitution: institution,
      lastEducationDegree: degree,
      skills: matchedSkills,
    };
  }
}
