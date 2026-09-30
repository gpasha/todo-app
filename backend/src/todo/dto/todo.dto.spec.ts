import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { Priority } from '@prisma/client'
import { CreateTodoDto } from './create-todo.dto'
import { UpdateTodoDto } from './update-todo.dto'

async function validateDto<T extends object>(dtoClass: new () => T, payload: object) {
  const instance = plainToInstance(dtoClass, payload)
  return validate(instance)
}

describe('CreateTodoDto', () => {
  it('принимает title ровно 100 символов (граница)', async () => {
    const errors = await validateDto(CreateTodoDto, { title: 'a'.repeat(100) })
    expect(errors).toHaveLength(0)
  })

  it('отклоняет title из 101 символа', async () => {
    const errors = await validateDto(CreateTodoDto, { title: 'a'.repeat(101) })
    expect(errors.some((error) => error.property === 'title')).toBe(true)
  })

  it('отклоняет пустой title', async () => {
    const errors = await validateDto(CreateTodoDto, { title: '' })
    expect(errors.some((error) => error.property === 'title')).toBe(true)
  })

  it('отклоняет отсутствующий title', async () => {
    const errors = await validateDto(CreateTodoDto, { description: 'no title' })
    expect(errors.some((error) => error.property === 'title')).toBe(true)
  })

  it('отклоняет title не-строку', async () => {
    const errors = await validateDto(CreateTodoDto, { title: 123 })
    expect(errors.some((error) => error.property === 'title')).toBe(true)
  })

  it('принимает все допустимые значения priority', async () => {
    const priorities = [Priority.LOW, Priority.MEDIUM, Priority.HIGH]
    for (const priority of priorities) {
      const errors = await validateDto(CreateTodoDto, { title: 'ok', priority })
      expect(errors).toHaveLength(0)
    }
  })

  it('отклоняет недопустимый priority', async () => {
    const errors = await validateDto(CreateTodoDto, { title: 'ok', priority: 'URGENT' })
    expect(errors.some((error) => error.property === 'priority')).toBe(true)
  })

  it('принимает ISO-строку dueDate', async () => {
    const errors = await validateDto(CreateTodoDto, {
      title: 'ok',
      dueDate: '2030-01-01T00:00:00.000Z',
    })
    expect(errors).toHaveLength(0)
  })

  it('отклоняет мусор в dueDate', async () => {
    const errors = await validateDto(CreateTodoDto, { title: 'ok', dueDate: 'not-a-date' })
    expect(errors.some((error) => error.property === 'dueDate')).toBe(true)
  })

  it('отклоняет completed не-boolean', async () => {
    const errors = await validateDto(CreateTodoDto, { title: 'ok', completed: 'yes' })
    expect(errors.some((error) => error.property === 'completed')).toBe(true)
  })
})

describe('UpdateTodoDto', () => {
  it('принимает пустой объект (все поля необязательны)', async () => {
    const errors = await validateDto(UpdateTodoDto, {})
    expect(errors).toHaveLength(0)
  })

  it('применяет те же ограничения к title', async () => {
    const tooLong = await validateDto(UpdateTodoDto, { title: 'a'.repeat(101) })
    const empty = await validateDto(UpdateTodoDto, { title: '' })
    expect(tooLong.some((error) => error.property === 'title')).toBe(true)
    expect(empty.some((error) => error.property === 'title')).toBe(true)
  })

  it('отклоняет недопустимый priority', async () => {
    const errors = await validateDto(UpdateTodoDto, { priority: 'URGENT' })
    expect(errors.some((error) => error.property === 'priority')).toBe(true)
  })
})
