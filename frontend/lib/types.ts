export interface Course {
  id: number
  name: string
  degree: string
  duration: string
  fees: number
}

export interface Placement {
  id: number
  year: number
  avgPackage: number
  highestPackage: number
  placementRate: number
}

export interface Review {
  id: number
  author: string
  rating: number
  text: string
}

export interface College {
  id: number
  slug: string
  name: string
  location: string
  state: string
  fees: number
  rating: number
  shortDescription: string
  overview: string
  placementPercent: number
  averagePackage: number
  bannerImage: string
  courses: Course[]
  reviews: Review[]
}

export interface ComparisonCollege {
  id: number
  name: string
  location: string
  fees: number
  rating: number
  avgPlacementPackage: number
  placementRate: number
  topCourses: string[]
}

export interface PaginatedResponse<T> {
  items: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface AuthUser {
  id: number
  name: string
  email: string
  role: 'STUDENT' | 'ADMIN'
}

export interface AdminCollegeForm {
  slug: string
  name: string
  location: string
  city: string
  state: string
  fees: number
  rating: number
  logoUrl: string
  shortDescription: string
  overview: string
  placementPercent: number
  averagePackage: number
  bannerImage: string
  courses: Course[]
  placements: Placement[]
}

export interface SavedComparisonItem {
  id: number
  college: College
  orderIndex: number
}

export interface SavedComparison {
  id: number
  title: string
  createdAt: string
  items: SavedComparisonItem[]
}
