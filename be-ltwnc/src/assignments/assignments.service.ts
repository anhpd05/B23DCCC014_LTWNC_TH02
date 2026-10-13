import { Injectable, NotFoundException, PayloadTooLargeException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { SeedAssignmentDto } from './dto/bulk-create-assignments.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { Assignment } from './entities/assignment.entity';
import { createAssignmentsMock } from './mock/assignments.mock';

const MAX_TOTAL_ITEMS = 50_000;

@Injectable()
export class AssignmentsService {
  private items: Assignment[] = createAssignmentsMock();

  create(createAssignmentDto: CreateAssignmentDto): Assignment {
    const assignment: Assignment = {
      id: randomUUID(),
      completed: false,
      ...createAssignmentDto,
    };
    this.items.push(assignment);
    return assignment;
  }

  createMany(dtos: SeedAssignmentDto[]): Assignment[] {
    if (this.items.length + dtos.length > MAX_TOTAL_ITEMS) {
      throw new PayloadTooLargeException('Vượt giới hạn 50.000 bài');
    }
    const created: Assignment[] = dtos.map((dto) => ({
      id: randomUUID(),
      subject: dto.subject,
      title: dto.title,
      dueDate: dto.dueDate,
      priority: dto.priority,
      completed: dto.completed ?? false,
    }));
    this.items.push(...created);
    return created;
  }

  findAll(): Assignment[] {
    return this.items;
  }

  findOne(id: string): Assignment {
    const found = this.items.find((item) => item.id === id);
    if (!found) {
      throw new NotFoundException(`Không tìm thấy assignment với id "${id}"`);
    }
    return found;
  }

  update(id: string, updateAssignmentDto: UpdateAssignmentDto): Assignment {
    const found = this.findOne(id);
    Object.assign(found, updateAssignmentDto);
    return found;
  }

  remove(id: string): Assignment {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundException(`Không tìm thấy assignment với id "${id}"`);
    }
    const [removed] = this.items.splice(index, 1);
    return removed;
  }
}
