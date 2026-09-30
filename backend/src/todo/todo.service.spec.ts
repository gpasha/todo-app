import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { Priority, Todo } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { TodoService } from './todo.service'

function createMockPrisma() {
  return {
    todo: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  }
}

type MockPrisma = ReturnType<typeof createMockPrisma>

function buildTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    title: 'base',
    description: null,
    completed: false,
    priority: Priority.MEDIUM,
    dueDate: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  }
}

describe('TodoService', () => {
  let service: TodoService
  let prisma: MockPrisma

  beforeEach(async () => {
    prisma = createMockPrisma()
    const moduleRef = await Test.createTestingModule({
      providers: [
        TodoService,
        { provide: PrismaService, useValue: prisma as unknown as PrismaService },
      ],
    }).compile()
    service = moduleRef.get(TodoService)
  })

  describe('create', () => {
    it('маппит title, priority и конвертирует dueDate в Date', async () => {
      const created = buildTodo({ title: 'buy milk', priority: Priority.HIGH })
      prisma.todo.create.mockResolvedValue(created)
      const result = await service.create({
        title: 'buy milk',
        priority: Priority.HIGH,
        dueDate: '2030-05-01T10:00:00.000Z',
      })
      const args = prisma.todo.create.mock.calls[0][0]
      expect(args.data.title).toBe('buy milk')
      expect(args.data.priority).toBe(Priority.HIGH)
      expect(args.data.dueDate).toBeInstanceOf(Date)
      expect(args.data.dueDate.toISOString()).toBe('2030-05-01T10:00:00.000Z')
      expect(result).toBe(created)
    })

    it('не записывает отсутствующие необязательные поля', async () => {
      prisma.todo.create.mockResolvedValue(buildTodo())
      await service.create({ title: 'only title' })
      const data = prisma.todo.create.mock.calls[0][0].data
      expect(data).not.toHaveProperty('description')
      expect(data).not.toHaveProperty('completed')
      expect(data).not.toHaveProperty('priority')
      expect(data).not.toHaveProperty('dueDate')
    })
  })

  describe('findAll', () => {
    it('сортирует по createdAt по убыванию', async () => {
      prisma.todo.findMany.mockResolvedValue([])
      await service.findAll()
      expect(prisma.todo.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' } })
    })
  })

  describe('findOne', () => {
    it('возвращает задачу, если найдена', async () => {
      const todo = buildTodo()
      prisma.todo.findUnique.mockResolvedValue(todo)
      await expect(service.findOne(todo.id)).resolves.toBe(todo)
    })

    it('бросает NotFoundException, если задачи нет', async () => {
      prisma.todo.findUnique.mockResolvedValue(null)
      await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException)
    })
  })

  describe('update', () => {
    it('реально применяет новое значение title', async () => {
      const todo = buildTodo()
      prisma.todo.findUnique.mockResolvedValue(todo)
      prisma.todo.update.mockResolvedValue(buildTodo({ title: 'changed' }))
      await service.update(todo.id, { title: 'changed' })
      expect(prisma.todo.update.mock.calls[0][0].data.title).toBe('changed')
    })

    it('конвертирует dueDate и прокидывает completed', async () => {
      const todo = buildTodo()
      prisma.todo.findUnique.mockResolvedValue(todo)
      prisma.todo.update.mockResolvedValue(todo)
      await service.update(todo.id, { completed: true, dueDate: '2031-01-02T00:00:00.000Z' })
      const data = prisma.todo.update.mock.calls[0][0].data
      expect(data.completed).toBe(true)
      expect(data.dueDate).toBeInstanceOf(Date)
    })

    it('не вызывает update, если задачи нет', async () => {
      prisma.todo.findUnique.mockResolvedValue(null)
      await expect(service.update('missing', { title: 'x' })).rejects.toBeInstanceOf(
        NotFoundException,
      )
      expect(prisma.todo.update).not.toHaveBeenCalled()
    })
  })

  describe('remove', () => {
    it('возвращает идентификатор и признак удаления', async () => {
      const todo = buildTodo()
      prisma.todo.findUnique.mockResolvedValue(todo)
      prisma.todo.delete.mockResolvedValue(todo)
      await expect(service.remove(todo.id)).resolves.toEqual({ id: todo.id, deleted: true })
    })

    it('не удаляет, если задачи нет', async () => {
      prisma.todo.findUnique.mockResolvedValue(null)
      await expect(service.remove('missing')).rejects.toBeInstanceOf(NotFoundException)
      expect(prisma.todo.delete).not.toHaveBeenCalled()
    })
  })
})
