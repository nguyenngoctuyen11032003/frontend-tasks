/**
 * Upload Store - Zustand state management for file upload operations
 * 
 * Manages:
 * - File upload state (single, multiple, avatar)
 * - Progress tracking for each file
 * - Error handling and user feedback
 * - Uploaded files list and cache
 * 
 * @example
 * ```tsx
 * const { uploadFile, uploadedFiles, loading } = useUploadStore();
 * await uploadFile(file, 'task', taskId);
 * ```
 */

import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { UploadService } from "@/services/upload.service"
import type { Attachment } from "@/types"

/** Represents a file currently being uploaded */
interface UploadingFile {
  /** Unique identifier for this upload session */
  id: string
  /** Original filename */
  name: string
  /** Upload progress 0-100 (%) */
  progress: number
  /** Error message if upload failed */
  error?: string
}

/** Upload store state and actions */
interface UploadState {
  // --- State ---
  /** Array of successfully uploaded attachments */
  uploadedFiles: Attachment[]
  /** Map of files currently uploading (key: fileId, value: UploadingFile) */
  uploadingFiles: Map<string, UploadingFile>
  /** Global loading state for async operations */
  loading: boolean
  /** Error message from last failed operation */
  error: string | null
  /** Overall progress percentage for batch uploads */
  totalProgress: number
  /** Entity type context for current upload (task, project, note, etc.) */
  currentEntityType?: string
  /** Entity ID context for current upload */
  currentEntityId?: string

  // --- Actions ---
  /**
   * Upload a single file to an entity
   * @param file - File object to upload
   * @param entityType - Type of entity (task, project, note, chat)
   * @param entityId - ID of the entity
   * @throws Error if upload fails
   */
  uploadFile: (
    file: File,
    entityType: string,
    entityId: string
  ) => Promise<void>

  /**
   * Upload multiple files to an entity in batch
   * @param files - Array of files to upload
   * @param entityType - Type of entity
   * @param entityId - ID of the entity
   * @throws Error if all files fail to upload
   */
  uploadMultipleFiles: (
    files: File[],
    entityType: string,
    entityId: string
  ) => Promise<void>

  /**
   * Upload user avatar with image processing
   * @param file - Image file (JPG/PNG, max 10MB)
   * @returns Avatar URL on success
   * @throws Error if upload fails
   */
  uploadAvatar: (file: File) => Promise<string>

  /**
   * Fetch user's uploaded files from server
   * @param limit - Max files to retrieve (default 50)
   */
  getUserFiles: (limit?: number) => Promise<void>

  /**
   * Delete an uploaded file
   * @param fileId - ID of file to delete
   * @throws Error if file not found or unauthorized
   */
  deleteFile: (fileId: string) => Promise<void>

  /** Clear all uploading files from state */
  clearUploads: () => void

  /**
   * Set error message manually
   * @param error - Error message or null to clear
   */
  setError: (error: string | null) => void
}

/** Generate unique file ID for upload session tracking */
const generateFileId = (): string => `${Date.now()}_${Math.random()}`

const useUploadStore = create<UploadState>()(
  devtools(
    (set, get) => ({
      // Initial state
      uploadedFiles: [],
      uploadingFiles: new Map(),
      loading: false,
      error: null,
      totalProgress: 0,
      currentEntityType: undefined,
      currentEntityId: undefined,

      // Upload single file
      uploadFile: async (file: File, entityType: string, entityId: string) => {
        const fileId = generateFileId()
        const uploadingFile: UploadingFile = {
          id: fileId,
          name: file.name,
          progress: 0,
        }

        try {
          set((state) => ({
            loading: true,
            error: null,
            currentEntityType: entityType,
            currentEntityId: entityId,
            uploadingFiles: new Map(state.uploadingFiles).set(fileId, uploadingFile),
          }))

          // Simulate progress
          const progressInterval = setInterval(() => {
            set((state) => {
              const uploadingFiles = new Map(state.uploadingFiles)
              const file = uploadingFiles.get(fileId)
              if (file && file.progress < 90) {
                file.progress += Math.random() * 30
                if (file.progress > 90) file.progress = 90
              }
              uploadingFiles.set(fileId, file!)
              return { uploadingFiles }
            })
          }, 200)

          // Upload to API
          const result = await UploadService.uploadFile(file, entityType, entityId)

          clearInterval(progressInterval)

          set((state) => {
            const uploadingFiles = new Map(state.uploadingFiles)
            const uploadingFile = uploadingFiles.get(fileId)
            if (uploadingFile) {
              uploadingFile.progress = 100
              uploadingFiles.set(fileId, uploadingFile)
            }
            return {
              uploadingFiles,
              uploadedFiles: [result, ...state.uploadedFiles],
              loading: false,
            }
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to upload file"
          set((state) => {
            const uploadingFiles = new Map(state.uploadingFiles)
            const uploadingFile = uploadingFiles.get(fileId)
            if (uploadingFile) {
              uploadingFile.error = errorMessage
              uploadingFiles.set(fileId, uploadingFile)
            }
            return {
              uploadingFiles,
              error: errorMessage,
              loading: false,
            }
          })
          throw error
        }
      },

      // Upload multiple files
      uploadMultipleFiles: async (files: File[], entityType: string, entityId: string) => {
        const fileIds = files.map(() => generateFileId())
        const uploadingFiles = new Map(get().uploadingFiles)

        files.forEach((file, index) => {
          uploadingFiles.set(fileIds[index], {
            id: fileIds[index],
            name: file.name,
            progress: 0,
          })
        })

        try {
          set({
            loading: true,
            error: null,
            currentEntityType: entityType,
            currentEntityId: entityId,
            uploadingFiles,
          })

          // Simulate progress
          const progressInterval = setInterval(() => {
            set((state) => {
              const uploadingFiles = new Map(state.uploadingFiles)
              fileIds.forEach((id) => {
                const file = uploadingFiles.get(id)
                if (file && file.progress < 90) {
                  file.progress += Math.random() * 20
                  if (file.progress > 90) file.progress = 90
                  uploadingFiles.set(id, file)
                }
              })
              return { uploadingFiles }
            })
          }, 200)

          // Upload to API
          const results = await UploadService.uploadMultipleFiles(
            files,
            entityType,
            entityId
          )

          clearInterval(progressInterval)

          set((state) => {
            const uploadingFiles = new Map(state.uploadingFiles)
            fileIds.forEach((id) => {
              const file = uploadingFiles.get(id)
              if (file) {
                file.progress = 100
                uploadingFiles.set(id, file)
              }
            })
            return {
              uploadingFiles,
              uploadedFiles: [...results, ...state.uploadedFiles],
              loading: false,
            }
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to upload files"
          set((state) => {
            const uploadingFiles = new Map(state.uploadingFiles)
            fileIds.forEach((id) => {
              const file = uploadingFiles.get(id)
              if (file) {
                file.error = errorMessage
                uploadingFiles.set(id, file)
              }
            })
            return {
              uploadingFiles,
              error: errorMessage,
              loading: false,
            }
          })
          throw error
        }
      },

      // Upload avatar
      uploadAvatar: async (file: File): Promise<string> => {
        const fileId = generateFileId()
        const uploadingFile: UploadingFile = {
          id: fileId,
          name: file.name,
          progress: 0,
        }

        try {
          set((state) => ({
            loading: true,
            error: null,
            uploadingFiles: new Map(state.uploadingFiles).set(fileId, uploadingFile),
          }))

          // Simulate progress
          const progressInterval = setInterval(() => {
            set((state) => {
              const uploadingFiles = new Map(state.uploadingFiles)
              const file = uploadingFiles.get(fileId)
              if (file && file.progress < 90) {
                file.progress += Math.random() * 30
                if (file.progress > 90) file.progress = 90
              }
              uploadingFiles.set(fileId, file!)
              return { uploadingFiles }
            })
          }, 200)

          // Upload to API
          const result = await UploadService.uploadAvatar(file)

          clearInterval(progressInterval)

          set((state) => {
            const uploadingFiles = new Map(state.uploadingFiles)
            const uploadingFile = uploadingFiles.get(fileId)
            if (uploadingFile) {
              uploadingFile.progress = 100
              uploadingFiles.set(fileId, uploadingFile)
            }
            return {
              uploadingFiles,
              loading: false,
            }
          })

          return result.url
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to upload avatar"
          set((state) => {
            const uploadingFiles = new Map(state.uploadingFiles)
            const uploadingFile = uploadingFiles.get(fileId)
            if (uploadingFile) {
              uploadingFile.error = errorMessage
              uploadingFiles.set(fileId, uploadingFile)
            }
            return {
              uploadingFiles,
              error: errorMessage,
              loading: false,
            }
          })
          throw error
        }
      },

      // Get user files
      getUserFiles: async (limit = 50) => {
        try {
          set({ loading: true, error: null })
          const files = await UploadService.getUserFiles(limit)
          set({ uploadedFiles: files, loading: false })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to fetch files"
          set({ error: errorMessage, loading: false })
          throw error
        }
      },

      // Delete file
      deleteFile: async (fileId: string) => {
        try {
          set({ loading: true, error: null })
          await UploadService.deleteFile(fileId)
          set((state) => ({
            uploadedFiles: state.uploadedFiles.filter((f) => f.id !== fileId),
            loading: false,
          }))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to delete file"
          set({ error: errorMessage, loading: false })
          throw error
        }
      },

      // Clear uploads
      clearUploads: () => {
        set({
          uploadingFiles: new Map(),
          error: null,
          totalProgress: 0,
        })
      },

      // Set error
      setError: (error: string | null) => {
        set({ error })
      },
    }),
    { name: "UploadStore" }
  )
)

export default useUploadStore
