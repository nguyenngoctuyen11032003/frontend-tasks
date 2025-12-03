"use client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useProjectsStore } from "@/stores/projects-store"
import { toast } from "sonner"

interface DeleteProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  projectName: string
  onDeleted?: () => void
}

export function DeleteProjectDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  onDeleted,
}: DeleteProjectDialogProps) {
  const { deleteLoading, deleteProject } = useProjectsStore()

  const handleDelete = async () => {
    try {
      await deleteProject(projectId)
      toast.success(`Đã xóa dự án "${projectName}"`)
      onOpenChange(false)
      onDeleted?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Lỗi xóa dự án"
      toast.error(errorMessage)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa dự án?</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn chắc chắn muốn xóa dự án "{projectName}"? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteLoading}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteLoading ? "Đang xóa..." : "Xóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
