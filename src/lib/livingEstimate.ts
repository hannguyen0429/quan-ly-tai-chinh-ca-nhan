import { findLocation } from '../data/locations'
import { householdAges, type HouseholdProfile } from './household'

export type LivingEstimate = {
  people: number
  locationName: string
  multiplier: number
  living: number
  medical: number
}

function livingByAge(age: number): number {
  if (age <= 5) return 3_200_000
  if (age <= 17) return 3_800_000
  if (age <= 59) return 5_500_000
  return 4_800_000
}

function medicalByAge(age: number): number {
  if (age <= 5) return 450_000
  if (age <= 17) return 300_000
  if (age <= 59) return 400_000
  return 800_000
}

function householdScale(people: number): number {
  if (people <= 1) return 1
  if (people === 2) return 0.9
  if (people === 3) return 0.85
  return 0.8
}

function roundVnd(amount: number): number {
  return Math.round(amount / 10_000) * 10_000
}

export function estimateLiving(
  profile: HouseholdProfile,
): LivingEstimate | null {
  const location = findLocation(profile.locationId)
  const ages = householdAges(profile)
  if (!location || ages.length === 0) return null

  const livingBase = ages.reduce((sum, age) => sum + livingByAge(age), 0)
  const medicalBase = ages.reduce((sum, age) => sum + medicalByAge(age), 0)
  const scale = householdScale(ages.length)

  return {
    people: ages.length,
    locationName: location.name,
    multiplier: location.multiplier,
    living: roundVnd(livingBase * location.multiplier * scale),
    medical: roundVnd(medicalBase * location.multiplier),
  }
}
