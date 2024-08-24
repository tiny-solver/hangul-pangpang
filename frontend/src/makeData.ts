import { faker } from '@faker-js/faker'

export type Person = {
  firstName: string
  lastName: string
  age: number
  visits: number
  image: string
  progress: number
  status: 'relationship' | 'complicated' | 'single'
  subRows?: Person[]
}

export type LoRAData = {
  image: string
  src_refer: string
  caption: string
}

export type LoRADataset = {
  title: string
  data: LoRAData[]
}

const range = (len: number) => {
  const arr: number[] = []
  for (let i = 0; i < len; i++) {
    arr.push(i)
  }
  return arr
}

const newPerson = (): Person => {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    age: faker.number.int(40),
    visits: faker.number.int(1000),
    image: faker.image.avatar(),
    progress: faker.number.int(100),
    status: faker.helpers.shuffle<Person['status']>([
      'relationship',
      'complicated',
      'single',
    ])[0]!,
  }
}

export const newLoRAData = (): LoRAData => {
  return {
    image: faker.image.avatar(),
    src_refer: faker.internet.url(),
    caption: faker.lorem.sentence(),
  }
}

export const newLoRADataset = (): LoRADataset => {
  return {
    title: faker.lorem.words(),
    data: range(faker.number.int(10)).map(() => newLoRAData()),
  }
}

export function makeData(...lens: number[]) {
  const makeDataLevel = (depth = 0): Person[] => {
    const len = lens[depth]!
    return range(len).map((): Person => {
      return {
        ...newPerson(),
        subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined,
      }
    })
  }

  return makeDataLevel()
}
