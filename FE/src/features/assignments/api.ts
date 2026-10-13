import type { AxiosRequestConfig } from 'axios';
import { http } from '../../shared/http';
import { isEnvelope } from '../../shared/guards';
import { ApiError } from '../../shared/ApiError';
import { isAssignment, isAssignmentArray } from './guards';
import type { NewAssignmentDto, SeedAssignmentDto, UpdateAssignmentDto } from './types';

async function request<T>(
  config: AxiosRequestConfig,
  guard: (v: unknown) => v is T,
): Promise<T> {
  const res = await http.request<unknown>(config);
  if (!isEnvelope(res.data, guard)) {
    throw new ApiError(res.status, 'Response sai định dạng hoặc sai schema', 'SCHEMA');
  }
  return res.data.data;
}

export const api = {
  getAll: () => request({ url: '/assignments', method: 'GET' }, isAssignmentArray),
  create: (dto: NewAssignmentDto) =>
    request({ url: '/assignments', method: 'POST', data: dto }, isAssignment),
  bulkCreate: (items: SeedAssignmentDto[]) =>
    request(
      { url: '/assignments/bulk', method: 'POST', data: { items }, timeout: 60_000 },
      isAssignmentArray,
    ),
  update: (id: string, changes: UpdateAssignmentDto) =>
    request({ url: `/assignments/${id}`, method: 'PATCH', data: changes }, isAssignment),
  remove: (id: string) => request({ url: `/assignments/${id}`, method: 'DELETE' }, isAssignment),
};
