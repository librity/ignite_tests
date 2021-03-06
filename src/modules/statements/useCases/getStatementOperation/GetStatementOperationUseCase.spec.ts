import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository'
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository'
import { GetStatementOperationError } from './GetStatementOperationError'
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase'

let inMemoryStatementsRepository: InMemoryStatementsRepository
let inMemoryUsersRepository: InMemoryUsersRepository
let getStatementOperationUseCase: GetStatementOperationUseCase

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Get Statement Operation', () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    inMemoryUsersRepository = new InMemoryUsersRepository()
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    )
  })

  it('should be able to get a statement operation by ID', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'Nelson Oak',
      email: 'nelson@nelsonoak.dev',
      password: 'nelsonDevJS',
    })

    const statement = await inMemoryStatementsRepository.create({
      user_id: user.id as string,
      description: 'some amount deposit',
      amount: 500,
      type: OperationType.DEPOSIT,
    })

    const statementById = await getStatementOperationUseCase.execute({
      statement_id: statement.id as string,
      user_id: user.id as string,
    })

    expect(statementById).toMatchObject(statement)
  })

  it('should not be able to get a statement of a non-existing user', async () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: 'Nelson Oak',
        email: 'nelson@nelsonoak.dev',
        password: 'nelsonDevJS',
      })

      const statement = await inMemoryStatementsRepository.create({
        user_id: user.id as string,
        description: 'some amount deposit',
        amount: 500,
        type: OperationType.DEPOSIT,
      })

      const statementById = await getStatementOperationUseCase.execute({
        statement_id: statement.id as string,
        user_id: 'non-existing-user',
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  })

  it('should not be able to get a non-existing statement', async () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: 'Nelson Oak',
        email: 'nelson@nelsonoak.dev',
        password: 'nelsonDevJS',
      })

      const statementById = await getStatementOperationUseCase.execute({
        statement_id: 'non-existing-statement',
        user_id: user.id as string,
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })
})
