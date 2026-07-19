import { IsBoolean, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class ProgressUpsertDto {
  @IsString()
  @IsNotEmpty({ message: 'lessonId is required' })
  lessonId: string;

  @IsInt()
  @Min(0, { message: 'percentage must be between 0 and 100' })
  @Max(100, { message: 'percentage must be between 0 and 100' })
  percentage: number;

  @IsBoolean()
  completed: boolean;
}
