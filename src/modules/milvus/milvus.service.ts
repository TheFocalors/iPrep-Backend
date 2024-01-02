import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

import { ConfigName } from '@/common/constants/config-name.constant';
import { IMilvusConfig } from '@/lib/config/configs/milvus.config';

@Injectable()
export class MilvusService implements OnModuleDestroy {
  private readonly milvusClient: MilvusClient;
  constructor(private readonly configService: ConfigService) {
    const config = this.configService.get<IMilvusConfig>(ConfigName.MILVUS);

    if (!config) {
      throw new Error('MILVUS_CONFIG_NOT_FOUND');
    }

    this.milvusClient = new MilvusClient({
      address: config.address,
      token: config.token,
      database: config.database,
    });
  }

  public async searchVectors(input: {
    collectionName: string;
    queryVectors: number[][];
    limit: number;
    offset?: number;
  }) {
    return await this.milvusClient.search({
      collection_name: input.collectionName,
      vectors: input.queryVectors,
      offset: input.offset,
      metric_type: 'L2',
      search_params: {
        anns_field: 'vector',
        topk: input.limit.toString(),
        params: JSON.stringify({ level: '2' }),
        metric_type: 'L2',
      },
    });
  }

  onModuleDestroy() {
    this.milvusClient.closeConnection();
  }
}
