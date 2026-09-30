import { Injectable, NotFoundException } from '@nestjs/common'
import { Priority, Prisma, Todo } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreateTodoDto } from './dto/create-todo.dto'
import { UpdateTodoDto } from './dto/update-todo.dto'

interface TodoWritableFields {
  description?: string
  completed?: boolean
  priority?: Priority
  dueDate?: Date
}

@Injectable()
export class TodoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const data: Prisma.TodoCreateInput = {
      title: createTodoDto.title,
      ...this.buildWritableFields(createTodoDto),
    }
    return this.prisma.todo.create({ data })
  }

  async findAll(): Promise<Todo[]> {
    return this.prisma.todo.findMany({ orderBy: { createdAt: 'desc' } })
  }

  async findOne(id: string): Promise<Todo> {
    const todo = await this.prisma.todo.findUnique({ where: { id } })
    if (!todo) {
      throw new NotFoundException(`Todo with id "${id}" not found`)
    }
    return todo
  }

  async update(id: string, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    await this.findOne(id)
    const data: Prisma.TodoUpdateInput = this.buildWritableFields(updateTodoDto)
    if (updateTodoDto.title !== undefined) {
      data.title = updateTodoDto.title
    }
    return this.prisma.todo.update({ where: { id }, data })
  }

  async remove(id: string): Promise<{ id: string; deleted: boolean }> {
    await this.findOne(id)
    await this.prisma.todo.delete({ where: { id } })
    return { id, deleted: true }
  }

  private buildWritableFields(dto: UpdateTodoDto): TodoWritableFields {
    const fields: TodoWritableFields = {}
    if (dto.description !== undefined) {
      fields.description = dto.description
    }
    if (dto.completed !== undefined) {
      fields.completed = dto.completed
    }
    if (dto.priority !== undefined) {
      fields.priority = dto.priority
    }
    if (dto.dueDate !== undefined) {
      fields.dueDate = new Date(dto.dueDate)
    }
    return fields
  }
}
