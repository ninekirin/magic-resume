"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  parseISO,
  isSameDay,
} from "date-fns";
import { zhCN } from "date-fns/locale";
import InterviewEvent from "./InterviewEvent";
import InterviewFormDialog from "./InterviewFormDialog";
import { Interview, InterviewFormData, InterviewStatus } from "../types";
import { useInterviewStore } from "@/store/useInterviewStore";
import { Toaster } from "@/components/ui/sonner";

const demoInterviews: Interview[] = [
  {
    id: "1",
    companyName: "阿里巴巴",
    position: "",
    date: "2025-03-13",
    startTime: "11:00",
    duration: "1小时",
    location: "杭州市余杭区文一西路969号",
    status: "待面试",
    notes: "需要准备React和Vue的相关知识点，以及算法题目",
    color: "#f59e0b",
  },
  {
    id: "2",
    companyName: "腾讯",
    position: "全栈开发工程师",
    date: "2025-03-11",
    startTime: "14:00",
    duration: "1.5小时",
    location: "深圳市南山区科技中一路腾讯大厦",
    status: "待面试",
    notes: "需要准备Node.js和微服务相关知识",
    color: "#3b82f6",
  },
  {
    id: "3",
    companyName: "字节跳动",
    position: "资深前端工程师",
    date: "2025-03-15",
    startTime: "10:00",
    duration: "1.5小时",
    location: "北京市海淀区中关村软件园二期",
    status: "已完成",
    notes: "面试官问了很多关于性能优化的问题，需要加强这方面的知识",
    color: "#10b981",
  },
];

export default function InterviewsClient() {
  const {
    interviews: storeInterviews,
    selectedDate: storeSelectedDate,
    addInterview,
    updateInterview,
    deleteInterview,
    setSelectedDate: setStoreSelectedDate,
    getAllInterviews,
  } = useInterviewStore();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentInterview, setCurrentInterview] = useState<Interview | null>(
    null
  );
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [formData, setFormData] = useState<InterviewFormData>({
    companyName: "",
    position: "",
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    duration: "1小时",
    location: "",
    status: "待面试",
    notes: "",
    color: "#3b82f6",
  });

  const interviews = getAllInterviews();

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      setStoreSelectedDate(date);
      setFormData((prev: InterviewFormData) => ({
        ...prev,
        date: format(date, "yyyy-MM-dd"),
      }));
    }
  };

  useEffect(() => {
    if (interviews.length === 0) {
      demoInterviews.forEach((interview) => {
        addInterview(interview);
      });
    }

    if (storeSelectedDate) {
      setFormData((prev) => ({
        ...prev,
        date: format(storeSelectedDate, "yyyy-MM-dd"),
      }));
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: InterviewFormData) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: InterviewFormData) => ({ ...prev, [name]: value }));
  };

  const handleAddInterview = () => {
    const newInterview: Interview = {
      id: Date.now().toString(),
      ...formData,
    };

    addInterview(newInterview);
    setIsAddDialogOpen(false);
    toast.success("面试已添加");
    resetForm();
  };

  const handleEditInterview = () => {
    if (!currentInterview) return;

    updateInterview(currentInterview.id, formData);
    setIsEditDialogOpen(false);
    toast.success("面试已更新");
    resetForm();
  };

  const handleDeleteInterview = (id: string) => {
    deleteInterview(id);
    toast.success("面试已删除");
  };

  const openEditDialog = (interview: Interview) => {
    setCurrentInterview(interview);
    setFormData({
      companyName: interview.companyName,
      position: interview.position,
      date: interview.date,
      startTime: interview.startTime,
      duration: interview.duration,
      location: interview.location,
      status: interview.status,
      notes: interview.notes,
      color: interview.color,
    });
    setStoreSelectedDate(parseISO(interview.date));
    setIsEditDialogOpen(true);
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      companyName: "",
      position: "",
      date: format(new Date(), "yyyy-MM-dd"),
      startTime: "09:00",
      duration: "1小时",
      location: "",
      status: "待面试",
      notes: "",
      color: "#3b82f6",
    });
    setStoreSelectedDate(new Date());
    setCurrentInterview(null);
  };

  // 处理周导航
  const handlePrevWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  // 生成日期范围
  const weekDates = Array.from({ length: 5 }, (_, i) =>
    addDays(currentWeekStart, i)
  );
  const weekRange = `${format(weekDates[0], "yyyy年MM月dd日")} - ${format(
    weekDates[4],
    "MM月dd日"
  )}`;

  // 时间槽
  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = 9 + i;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  return (
    <div className="container mx-auto py-6">
      <Toaster position="top-center" richColors />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">面试管理</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          添加面试
        </Button>
      </div>

      {/* 日历导航 */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={handlePrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-medium">{weekRange}</h2>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 甘特图视图 */}
      <div className="border rounded-lg overflow-hidden bg-background">
        {/* 日期头部 */}
        <div className="grid grid-cols-6 border-b">
          <div className="p-3 border-r text-center font-medium">时间</div>
          {weekDates.map((date, index) => (
            <div key={index} className="p-3 border-r text-center">
              <div className="font-medium">
                {format(date, "EEE", { locale: zhCN })}
              </div>
              <div className="text-sm text-muted-foreground">
                {format(date, "MM/dd")}
              </div>
            </div>
          ))}
        </div>

        {/* 时间格子 */}
        <div className="relative">
          {/* 时间轴 */}
          {timeSlots.map((time, timeIndex) => (
            <div key={timeIndex} className="grid grid-cols-6 border-b">
              <div className="p-2 border-r text-center text-sm">
                <div className="font-medium">{time}</div>
              </div>
              {weekDates.map((date, dateIndex) => (
                <div key={dateIndex} className="border-r h-20 relative">
                  {/* 这里是空白的时间格子 */}
                </div>
              ))}
            </div>
          ))}

          {/* 面试事件 */}
          {interviews.map((interview) => {
            const interviewDate = parseISO(interview.date);
            const dateIndex = weekDates.findIndex((date) =>
              isSameDay(date, interviewDate)
            );

            if (dateIndex === -1) return null;

            const startHour = parseInt(interview.startTime.split(":")[0]);
            const startMinute = parseInt(interview.startTime.split(":")[1]);

            let durationMinutes = 60;

            if (interview.duration === "30分钟") {
              durationMinutes = 30;
            } else if (interview.duration === "1小时") {
              durationMinutes = 60;
            } else if (interview.duration === "1.5小时") {
              durationMinutes = 90;
            } else if (interview.duration === "2小时") {
              durationMinutes = 120;
            } else if (interview.duration === "2.5小时") {
              durationMinutes = 150;
            } else if (interview.duration === "3小时") {
              durationMinutes = 180;
            }

            // 计算每小时的像素高度 (h-20 = 5rem = 80px)
            const hourHeight = 80;
            const top =
              ((startHour - 9) * 60 + startMinute) * (hourHeight / 60);
            const height = durationMinutes * (hourHeight / 60);

            const minHeight = 24;

            return (
              <InterviewEvent
                key={interview.id}
                interview={interview}
                top={top}
                height={Math.max(height, minHeight)}
                left={dateIndex + 1} // +1 是因为第一列是时间列
                onEdit={() => openEditDialog(interview)}
                onDelete={() => handleDeleteInterview(interview.id)}
              />
            );
          })}
        </div>
      </div>

      <InterviewFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        formData={formData}
        onFormChange={handleSelectChange}
        onInputChange={handleInputChange}
        onSubmit={handleAddInterview}
        selectedDate={storeSelectedDate}
        onDateSelect={handleCalendarSelect}
        mode="add"
      />

      <InterviewFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={formData}
        onFormChange={handleSelectChange}
        onInputChange={handleInputChange}
        onSubmit={handleEditInterview}
        selectedDate={storeSelectedDate}
        onDateSelect={handleCalendarSelect}
        mode="edit"
      />

      {/* 空状态 */}
      {interviews.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            暂无面试安排
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            点击"添加面试"按钮开始记录您的面试安排
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            添加第一个面试
          </Button>
        </div>
      )}
    </div>
  );
}
