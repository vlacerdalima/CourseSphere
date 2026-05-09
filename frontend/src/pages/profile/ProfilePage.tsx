import { useState } from "react";
import { BookOpen, Calendar, Mail, Pencil } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMyCourses } from "@/hooks/useCourses";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { Avatar } from "@/components/shared/Avatar";
import { ProfileFormModal } from "@/components/profile/ProfileFormModal";
import { CourseFormModal } from "@/components/courses/CourseFormModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ProfilePage() {
  const { user } = useAuth();
  const { data: myCourses } = useMyCourses();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);

  if (!user) return null;

  const courseCount = myCourses?.length ?? 0;
  const memberSince = new Date(user.createdAt).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <DashboardLayout onCreateCourse={() => setIsCreateCourseOpen(true)}>
      <div className="p-8 lg:p-12">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-8 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <Avatar name={user.name} src={user.avatarUrl} size="xl" />

                <div className="flex-1 space-y-2 min-w-0">
                  <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="w-4 h-4 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>Membro desde {memberSince}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 shrink-0"
                  onClick={() => setIsEditOpen(true)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Editar perfil
                </Button>
              </div>

              <div className="border-t border-gray-100" />

              {/* Stats */}
              <div>
                <Card className="border-gray-100 bg-gray-50 w-fit">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{courseCount}</p>
                      <p className="text-sm text-gray-500">
                        {courseCount === 1 ? "curso criado" : "cursos criados"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ProfileFormModal open={isEditOpen} onOpenChange={setIsEditOpen} />
      <CourseFormModal open={isCreateCourseOpen} onOpenChange={setIsCreateCourseOpen} />
    </DashboardLayout>
  );
}
