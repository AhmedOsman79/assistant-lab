import { PrismaService } from '@/database/prisma.service';
import { ErrorResponse } from '../response';
import { PERMISSION_ERROR, RESOURCE_NOT_FOUND } from '@/constants';

export class BaseService<T, SelectType, IncludeType> {
  private readonly modelName: string;
  constructor(private readonly db: PrismaService, modelName: string) {
    this.modelName = modelName;
  }

  async findById(
    id: string,
    select: SelectType = null,
    throwErr = true,
  ): Promise<T & IncludeType> {
    const idField = 'id' as keyof T;
    return await this.findByField(idField, id, select, throwErr);
  }

  async findByField(
    field: keyof T,
    value: string,
    select: SelectType = null,
    throwErr = true,
    permissionCheck: {
      userIdField?: keyof T;
      userId: string;
    } = null,
  ): Promise<T & IncludeType> {
    const data = await this.db[this.modelName].findFirst({
      where: { [field]: value },
      select,
    });
    if (!data && throwErr)
      throw new ErrorResponse({
        statusCode: 404,
        code: RESOURCE_NOT_FOUND,
        formmatingKeywords: [this.getModelName()],
      });
    if (!data && !throwErr) return null;

    if (
      permissionCheck &&
      data[permissionCheck.userIdField || 'userId'] !== permissionCheck.userId
    )
      throw new ErrorResponse({
        statusCode: 403,
        code: PERMISSION_ERROR,
      });
    return data;
  }

  private getModelName() {
    // return the model name in lower case and singular if it's plural
    return this.modelName.toLowerCase().endsWith('s')
      ? this.modelName.slice(0, -1)
      : this.modelName;
  }
}
