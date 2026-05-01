export type JobStatus = 'pending' | 'running' | 'completed' | 'failed'
export type JobType = 'url' | 'upload'

export interface Job {
  id: string
  user_id: string
  type: JobType
  input_url?: string
  input_file_url?: string
  status: JobStatus
  session_id?: string
  credits_used: number
  result?: JobResult
  error_message?: string
  created_at: string
  updated_at: string
  archived_at?: string | null
}

export interface JobResult {
  copies?: string[]
  images?: string[]
  videos?: string[]
  report?: string
  raw_output?: string
  kling_request_id?: string
}

export interface Credits {
  user_id: string
  balance: number
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  credits: number
  amount_try: number
  description: string
  status: string
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  created_at: string
}
