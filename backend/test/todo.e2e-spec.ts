import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { Priority } from '@prisma/client'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/prisma/prisma.service'

describe('Todo API (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleRef.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
    )
    await app.init()
    prisma = app.get(PrismaService)
  })

  beforeEach(async () => {
    await prisma.todo.deleteMany({})
  })

  afterAll(async () => {
    await app.close()
  })

  it('GET /todos/admin/test возвращает статус ok', async () => {
    const response = await request(app.getHttpServer()).get('/todos/admin/test').expect(200)
    expect(response.body.status).toBe('ok')
    expect(typeof response.body.timestamp).toBe('string')
  })

  it('POST /todos создаёт задачу', async () => {
    const response = await request(app.getHttpServer())
      .post('/todos')
      .send({ title: 'e2e create', priority: Priority.HIGH })
      .expect(201)
    expect(response.body.title).toBe('e2e create')
    expect(response.body.priority).toBe(Priority.HIGH)
    expect(response.body.completed).toBe(false)
  })

  it('GET /todos возвращает созданные задачи', async () => {
    await prisma.todo.create({ data: { title: 'listed' } })
    const response = await request(app.getHttpServer()).get('/todos').expect(200)
    expect(response.body).toHaveLength(1)
    expect(response.body[0].title).toBe('listed')
  })

  it('GET /todos/:id возвращает задачу по идентификатору', async () => {
    const todo = await prisma.todo.create({ data: { title: 'fetch me' } })
    const response = await request(app.getHttpServer()).get(`/todos/${todo.id}`).expect(200)
    expect(response.body.id).toBe(todo.id)
  })

  it('GET /todos/:id возвращает 404 для несуществующего id', async () => {
    await request(app.getHttpServer())
      .get('/todos/00000000-0000-4000-8000-000000000000')
      .expect(404)
  })

  it('GET /todos/:id возвращает 400 для не-UUID', async () => {
    await request(app.getHttpServer()).get('/todos/not-a-uuid').expect(400)
  })

  it('PATCH /todos/:id применяет новое значение title', async () => {
    const todo = await prisma.todo.create({ data: { title: 'before' } })
    const response = await request(app.getHttpServer())
      .patch(`/todos/${todo.id}`)
      .send({ title: 'after', completed: true })
      .expect(200)
    expect(response.body.title).toBe('after')
    expect(response.body.completed).toBe(true)
  })

  it('DELETE /todos/:id удаляет задачу и возвращает контракт', async () => {
    const todo = await prisma.todo.create({ data: { title: 'delete me' } })
    const response = await request(app.getHttpServer()).delete(`/todos/${todo.id}`).expect(200)
    expect(response.body).toEqual({ id: todo.id, deleted: true })
    const remaining = await prisma.todo.count()
    expect(remaining).toBe(0)
  })

  it('DELETE /todos/:id возвращает 404 при повторном удалении', async () => {
    const todo = await prisma.todo.create({ data: { title: 'once' } })
    await request(app.getHttpServer()).delete(`/todos/${todo.id}`).expect(200)
    await request(app.getHttpServer()).delete(`/todos/${todo.id}`).expect(404)
  })

  it('POST /todos отклоняет пустой title', async () => {
    await request(app.getHttpServer()).post('/todos').send({ title: '' }).expect(400)
  })

  it('POST /todos отклоняет title из 101 символа', async () => {
    await request(app.getHttpServer())
      .post('/todos')
      .send({ title: 'a'.repeat(101) })
      .expect(400)
  })

  it('POST /todos принимает title ровно 100 символов', async () => {
    await request(app.getHttpServer())
      .post('/todos')
      .send({ title: 'a'.repeat(100) })
      .expect(201)
  })

  it('POST /todos отклоняет запрос без title', async () => {
    await request(app.getHttpServer()).post('/todos').send({ description: 'x' }).expect(400)
  })

  it('POST /todos отклоняет неизвестные поля', async () => {
    await request(app.getHttpServer())
      .post('/todos')
      .send({ title: 'ok', unexpected: 'field' })
      .expect(400)
  })

  it('POST /todos отклоняет недопустимый priority', async () => {
    await request(app.getHttpServer())
      .post('/todos')
      .send({ title: 'ok', priority: 'URGENT' })
      .expect(400)
  })
})
