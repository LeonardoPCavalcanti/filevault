import { plainToInstance } from 'class-transformer';
import { IsString, IsOptional, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  declare DATABASE_URL: string;

  @IsString()
  declare R2_ACCOUNT_ID: string;

  @IsString()
  declare R2_ACCESS_KEY_ID: string;

  @IsString()
  declare R2_SECRET_ACCESS_KEY: string;

  @IsString()
  declare R2_BUCKET_NAME: string;

  @IsString()
  declare R2_ENDPOINT: string;

  @IsOptional()
  @IsString()
  CORS_ORIGIN?: string;

  @IsOptional()
  @IsString()
  PORT?: string;
}

export function envValidation(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(`Config validation error: ${errors.toString()}`);
  }
  return validated;
}
