// 面试状态类型
export type InterviewStatus = "待面试" | "已完成" | "已取消";

// 面试时长选项
export type InterviewDuration = "30分钟" | "1小时" | "1.5小时" | "2小时" | "2.5小时" | "3小时";

// 面试数据类型
export interface Interview {
  id: string;
  companyName: string;
  position: string;
  date: string;
  startTime: string;
  duration: InterviewDuration;
  location: string;
  status: InterviewStatus;
  notes: string;
  color: string;
}

// 表单数据类型
export interface InterviewFormData {
  companyName: string;
  position: string;
  date: string;
  startTime: string;
  duration: InterviewDuration;
  location: string;
  status: InterviewStatus;
  notes: string;
  color: string;
}
