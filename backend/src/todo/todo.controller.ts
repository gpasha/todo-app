import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common'
import { Todo } from '@prisma/client'
import { CreateTodoDto } from './dto/create-todo.dto'
import { UpdateTodoDto } from './dto/update-todo.dto'
import { TodoService } from './todo.service'

export interface DeleteTodoResult {
  id: string
  deleted: boolean
}

export interface SmokeTestResult {
  status: string
  message: string
  timestamp: string
}

@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  create(@Body() createTodoDto: CreateTodoDto): Promise<Todo> {
    return this.todoService.create(createTodoDto)
  }

  @Get()
  findAll(): Promise<Todo[]> {
    return this.todoService.findAll()
  }

  @Get('admin/test')
  handleSmokeTest(): SmokeTestResult {
    return {
      status: 'ok',
      message: 'Todo admin smoke test passed',
      timestamp: new Date().toISOString(),
    }
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Todo> {
    return this.todoService.findOne(id)
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTodoDto: UpdateTodoDto,
  ): Promise<Todo> {
    return this.todoService.update(id, updateTodoDto)
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<DeleteTodoResult> {
    return this.todoService.remove(id)
  }
}
