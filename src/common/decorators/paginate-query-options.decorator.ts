import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  ApiQuery,
  getSchemaPath,
} from '@nestjs/swagger';

class PaginatedResponseMetaDto {
  @ApiProperty()
  itemsPerPage: number;
  @ApiProperty()
  totalItems: number;
  @ApiProperty()
  currentPage: number;
  @ApiProperty()
  totalPages: number;
  @ApiProperty()
  sortBy: string[][];
  @ApiProperty()
  searchBy: string[];
  @ApiProperty()
  search: string;
  @ApiProperty({ required: false })
  filter?: Record<string, string | string[]>;
}

class PaginatedResponseLinksDto {
  @ApiProperty({ required: false })
  first?: string;
  @ApiProperty({ required: false })
  previous?: string;
  @ApiProperty()
  current: string;
  @ApiProperty({ required: false })
  next?: string;
  @ApiProperty({ required: false })
  last?: string;
}

class PaginatedResponseDto<T> {
  data: T[];
  @ApiProperty()
  meta: PaginatedResponseMetaDto;
  @ApiProperty()
  links: PaginatedResponseLinksDto;
}

export function PaginateQueryOptions<DataDto extends Type<unknown>>(
  dataDto: DataDto,
  enableSearch = true,
  ...filterFields: string[]
) {
  return applyDecorators(
    ApiExtraModels(PaginatedResponseDto, dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedResponseDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(dataDto) },
              },
            },
          },
        ],
      },
    }),
    ApiQuery({
      name: 'page',
      required: false,
      description: 'Page number (starting from 1)',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      description: 'Number of records per page',
    }),
    ...(enableSearch
      ? [
          ApiQuery({
            name: 'searchBy',
            required: false,
            description: "Limit columns to which apply 'search' term",
            isArray: true,
            type: 'string',
          }),
          ApiQuery({
            name: 'search',
            required: false,
            description: 'Multicolumn search term',
          }),
        ]
      : []),
    ApiQuery({
      name: 'sortBy',
      required: false,
      description:
        'Format: _field_:_direction_ [direction may be ASC or DESC] e.g. id:DESC',
    }),
    ...filterFields.map((field) =>
      ApiQuery({
        name: 'filter.' + field,
        required: false,
        description:
          'Format: $_comp_:_value_ [comp may be $eq, $not, $null, $in, $gt, $gte, $lt, $lte, $btw, $ilike] e.g. $eq:1',
      }),
    ),
  );
}
