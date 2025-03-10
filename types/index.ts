export interface Item {
  id: string
  type: "text" | "url" | "file"
  content: string
  userId: string
  createdAt: Date
  updatedAt: Date
  fileUrl?: string
  fileName?: string
  fileType?: string
  fileSize?: number
  favorite?: boolean
  filePath?: string
}

