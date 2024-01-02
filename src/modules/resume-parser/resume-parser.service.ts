import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { In, Repository } from 'typeorm';

import { ConfigName } from '@/common/constants/config-name.constant';
import { Skill } from '@/entities/skill.entity';
import { IAppEnvConfig } from '@/lib/config/configs/app.config';

import { MilvusService } from '../milvus/milvus.service';

@Injectable()
export class ResumeParserService {
  private readonly mlAPIUrl: string;
  constructor(
    private readonly milvusService: MilvusService,
    private readonly configService: ConfigService,
    @InjectRepository(Skill) private readonly skillRepo: Repository<Skill>,
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

    const response = await axios.post<{
      result: [{ skill: string; vector: number[] }];
    }>(`${this.mlAPIUrl}/predict`, formData);

    const data = response.data;

    const matchedVectors = data.result.map(async (item) => {
      const id = await this.milvusService.searchVectors({
        collectionName: 'skills',
        limit: 1,
        queryVectors: [item.vector],
      });

      return id.results[0];
    });

    const matchedIds = await Promise.all(matchedVectors);

    const ids = matchedIds
      .filter((item) => item.score < 0.4)
      .filter(
        (item, index, self) =>
          self.findIndex((t) => t.id === item.id) === index,
      )
      .map((item) => Number(item.id) + 1);

    const matchedSkills = await this.skillRepo.find({
      where: {
        id: In(ids),
      },
    });

    return matchedSkills;
  }
}
