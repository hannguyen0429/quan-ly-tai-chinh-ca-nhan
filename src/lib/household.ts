export type Gender = 'nam' | 'nu' | 'khac'

export type Dependent = {
  id: string
  name: string
  age: string
}

export type HouseholdProfile = {
  fullName: string
  gender: Gender | ''
  age: string
  locationId: string
  dependents: Dependent[]
}

export const emptyProfile: HouseholdProfile = {
  fullName: '',
  gender: '',
  age: '',
  locationId: '',
  dependents: [],
}

function parseAge(value: string): number | null {
  const trimmed = value.trim()
  if (trimmed === '') return null
  const age = Number(trimmed)
  if (!Number.isInteger(age) || age < 0 || age > 120) return null
  return age
}

export function isDependentComplete(person: Dependent): boolean {
  return person.name.trim().length > 0 && parseAge(person.age) !== null
}

export function isProfileComplete(profile: HouseholdProfile): boolean {
  if (!profile.fullName.trim()) return false
  if (!profile.gender) return false
  if (parseAge(profile.age) === null) return false
  if (!profile.locationId) return false
  return profile.dependents.every(isDependentComplete)
}

export function householdAges(profile: HouseholdProfile): number[] {
  const self = parseAge(profile.age)
  const ages: number[] = []
  if (self !== null) ages.push(self)
  for (const person of profile.dependents) {
    const age = parseAge(person.age)
    if (age !== null && person.name.trim()) ages.push(age)
  }
  return ages
}
