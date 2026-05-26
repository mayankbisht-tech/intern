import axios from 'axios'
import type {
  AdminCollegeForm,
  AuthUser,
  College,
  ComparisonCollege,
  PaginatedResponse,
  SavedComparison,
} from './types'

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787/api'

export const api = axios.create({
  baseURL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('academialink-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

type BackendCollegeSummary = {
  id: number
  name: string
  city: string
  state: string
  location: string
  fees: number
  rating: number
  logoUrl: string
  shortDescription: string
  bannerImage: string
  createdAt: string
}

type BackendPagination = {
  total: number
  page: number
  limit: number
  totalPages: number
}

type BackendCollegeDetail = {
  college: {
    id: number
    name: string
    location: string
    city: string
    state: string
    fees: number
    rating: number
    logoUrl: string
    shortDescription: string
    overview: string
    bannerImage: string
    createdAt: string
  }
  courses: Array<{
    id: number
    name: string
    degree: string
    duration: string
    fees: number
  }>
  placements: Array<{
    id: number
    year: number
    avgPackage: number
    highestPackage: number
    placementRate: number
  }>
  reviews: Array<{
    id: number
    rating: number
    body: string
    createdAt: string
    reviewerEmail: string
  }>
}

type BackendCompareCollege = ComparisonCollege

type BackendSavedCollege = BackendCollegeSummary

type BackendSavedComparison = SavedComparison

type BackendAdminCollege = AdminCollegeForm & {
  id: number
  createdAt: string
  updatedAt: string
}

function normalizeCollegeSummary(college: BackendCollegeSummary): College {
  return {
    id: college.id,
    slug: String(college.id),
    name: college.name,
    location: college.location,
    state: college.state,
    fees: college.fees,
    rating: college.rating,
    shortDescription: college.shortDescription,
    overview: college.shortDescription,
    placementPercent: 0,
    averagePackage: 0,
    bannerImage: college.bannerImage,
    courses: [],
    reviews: [],
  }
}

function normalizeCollegeDetail(data: BackendCollegeDetail): College {
  return {
    id: data.college.id,
    slug: String(data.college.id),
    name: data.college.name,
    location: data.college.location,
    state: data.college.state,
    fees: data.college.fees,
    rating: data.college.rating,
    shortDescription: data.college.shortDescription,
    overview: data.college.overview,
    placementPercent: data.placements[0]?.placementRate ?? 0,
    averagePackage: data.placements[0]?.avgPackage ?? 0,
    bannerImage: data.college.bannerImage,
    courses: data.courses,
    reviews: data.reviews.map((review) => ({
      id: review.id,
      author: review.reviewerEmail,
      rating: review.rating,
      text: review.body,
    })),
  }
}

export async function listColleges(params: {
  search?: string
  location?: string
  city?: string
  state?: string
  minFees?: number
  maxFees?: number
  sortBy?: 'rating' | 'fees' | 'name'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}) {
  const { data } = await api.get<{ data: BackendCollegeSummary[]; pagination: BackendPagination }>('/colleges', {
    params: {
      ...params,
      state: params.state ?? params.location,
    },
  })

  return {
    items: data.data.map(normalizeCollegeSummary),
    page: data.pagination.page,
    limit: data.pagination.limit,
    total: data.pagination.total,
    totalPages: data.pagination.totalPages,
  }
}

export async function getCollege(id: string | number) {
  const { data } = await api.get<BackendCollegeDetail>(`/colleges/${id}`)
  return normalizeCollegeDetail(data)
}

export async function compareColleges(ids: number[]) {
  const { data } = await api.get<{ colleges: BackendCompareCollege[] }>('/colleges/compare', {
    params: { ids: ids.join(',') },
  })
  return data.colleges
}

export async function login(payload: { email: string; password: string }) {
  const { data } = await api.post<{ token: string; user: AuthUser }>('/auth/login', payload)
  return data
}

export async function register(payload: { name: string; email: string; password: string }) {
  const { data } = await api.post<{ token: string; user: AuthUser }>('/auth/register', payload)
  return data
}

export async function getMe() {
  const { data } = await api.get<{ user: AuthUser }>('/auth/me')
  return data.user
}

export async function getAdminColleges() {
  const { data } = await api.get<{ data: BackendAdminCollege[] }>('/admin/colleges')
  return data.data
}

export async function createAdminCollege(payload: AdminCollegeForm) {
  const { data } = await api.post<{ college: BackendAdminCollege }>('/admin/colleges', payload)
  return data.college
}

export async function updateAdminCollege(id: number, payload: AdminCollegeForm) {
  const { data } = await api.put<{ college: BackendAdminCollege }>(`/admin/colleges/${id}`, payload)
  return data.college
}

export async function deleteAdminCollege(id: number) {
  const { data } = await api.delete<{ message: string }>(`/admin/colleges/${id}`)
  return data
}

export async function saveCollege(collegeId: number) {
  const { data } = await api.post('/user/saved', { collegeId })
  return data
}

export async function saveComparison(collegeIds: number[], title?: string) {
  const { data } = await api.post<BackendSavedComparison>('/user/comparisons', {
    collegeIds,
    title,
  })
  return data
}

export async function getMySaved() {
  const [{ data: savedColleges }, { data: savedComparisons }] = await Promise.all([
    api.get<{ data: BackendSavedCollege[] }>('/user/saved'),
    api.get<{ data: BackendSavedComparison[] }>('/user/comparisons'),
  ])

  return {
    savedColleges: savedColleges.data.map((college) => ({
      college: normalizeCollegeSummary(college),
    })),
    savedComparisons: savedComparisons.data,
  }
}
