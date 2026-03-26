export type StepIcon = 'map-pin' | 'sparkles' | 'handshake'

export interface StepGuideItem {
  step: string
  title: string
  description: string
  hint: string
  icon: StepIcon
}

export const stepGuideItems: StepGuideItem[] = [
  {
    step: 'Step 01',
    title: 'Tell BizNest What You Are Building',
    description:
      'Share your business type, budget range, and ideal customer profile in under 2 minutes.',
    hint: 'No spreadsheets, no manual research needed.',
    icon: 'map-pin',
  },
  {
    step: 'Step 02',
    title: 'Review AI-Ranked Location Matches',
    description:
      'Get a clear shortlist of high-potential areas scored by demand, competition, and growth signals.',
    hint: 'Focus on the top opportunities first.',
    icon: 'sparkles',
  },
  {
    step: 'Step 03',
    title: 'Launch Faster With Local Connections',
    description:
      'Connect with nearby businesses and partners to accelerate your opening and reduce launch friction.',
    hint: 'Move from idea to opening with confidence.',
    icon: 'handshake',
  },
]
