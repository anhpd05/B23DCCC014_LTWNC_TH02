import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { CreateAssignmentDto } from './create-assignment.dto';

export class SeedAssignmentDto extends CreateAssignmentDto {
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}

export class BulkCreateAssignmentsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10_000)
  @ValidateNested({ each: true })
  @Type(() => SeedAssignmentDto)
  items!: SeedAssignmentDto[];
}
