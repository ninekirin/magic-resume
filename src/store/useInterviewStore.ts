import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Interview, InterviewFormData } from "@/app/app/dashboard/interviews/types";

interface InterviewStore {
  interviews: Record<string, Interview>;
  selectedDate: Date | undefined;
  
  // 操作方法
  addInterview: (interview: Interview) => void;
  updateInterview: (id: string, interview: Partial<Interview>) => void;
  deleteInterview: (id: string) => void;
  setSelectedDate: (date: Date | undefined) => void;
  
  // 获取方法
  getInterviewsByDate: (date: Date) => Interview[];
  getAllInterviews: () => Interview[];
}

export const useInterviewStore = create<InterviewStore>()(
  persist(
    (set, get) => ({
      interviews: {},
      selectedDate: undefined,

      // 添加面试
      addInterview: (interview: Interview) => 
        set((state) => ({
          interviews: {
            ...state.interviews,
            [interview.id]: interview,
          },
        })),

      // 更新面试
      updateInterview: (id: string, interviewData: Partial<Interview>) =>
        set((state) => {
          const interview = state.interviews[id];
          if (!interview) return state;

          return {
            interviews: {
              ...state.interviews,
              [id]: {
                ...interview,
                ...interviewData,
              },
            },
          };
        }),

      // 删除面试
      deleteInterview: (id: string) =>
        set((state) => {
          const newInterviews = { ...state.interviews };
          delete newInterviews[id];
          return { interviews: newInterviews };
        }),

      // 设置选中日期
      setSelectedDate: (date: Date | undefined) =>
        set({ selectedDate: date }),

      // 获取指定日期的面试
      getInterviewsByDate: (date: Date) => {
        const { interviews } = get();
        const dateString = date.toISOString().split("T")[0];
        
        return Object.values(interviews).filter(
          (interview) => interview.date === dateString
        );
      },

      // 获取所有面试
      getAllInterviews: () => {
        const { interviews } = get();
        return Object.values(interviews);
      },
    }),
    {
      name: "interview-storage",
    }
  )
);
