"use client";

import { useState, useEffect } from "react";
import { CalendarIcon, Clock, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Interview, InterviewFormData } from "../types";
import { useAIConfigStore } from "@/store/useAIConfigStore";
import { AI_MODEL_CONFIGS } from "@/config/ai";
import { toast } from "sonner";

interface InterviewFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: InterviewFormData;
  onFormChange: (name: string, value: string) => void;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSubmit: () => void;
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  mode: "add" | "edit";
}

export default function InterviewFormDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onInputChange,
  onSubmit,
  selectedDate,
  onDateSelect,
  mode,
}: InterviewFormDialogProps) {
  const isAddMode = mode === "add";
  const title = isAddMode ? "添加新面试" : "编辑面试";
  const description = "填写面试信息，帮助您更好地管理面试安排。";
  const submitButtonText = isAddMode ? "添加" : "保存";

  const [showTextParser, setShowTextParser] = useState(false);
  const [parserText, setParserText] = useState("");
  const [isParsingText, setIsParsingText] = useState(false);

  const {
    selectedModel,
    doubaoApiKey,
    doubaoModelId,
    deepseekApiKey,
    deepseekModelId,
  } = useAIConfigStore();

  // 处理文本解析
  const handleParseText = async () => {
    if (!parserText.trim()) return;

    const config = AI_MODEL_CONFIGS[selectedModel];

    const isConfigured =
      selectedModel === "doubao"
        ? doubaoApiKey && doubaoModelId
        : config.requiresModelId
        ? deepseekApiKey && deepseekModelId
        : deepseekApiKey;

    if (!isConfigured) {
      console.log(isConfigured, "isConfigured");
      toast.error("请先选择AI模型");
      return;
    }

    const apiKey = selectedModel === "doubao" ? doubaoApiKey : deepseekApiKey;

    try {
      setIsParsingText(true);

      const response = await fetch("/api/interview-parser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: parserText,
          apiKey,
          model:
            selectedModel === "doubao"
              ? doubaoModelId
              : config.requiresModelId
              ? deepseekModelId
              : config.defaultModel,
          modelType: selectedModel,
        }),
      });

      const result = await response.json();

      if (response.ok && result.data) {
        Object.entries(result.data).forEach(([key, value]) => {
          if (value && key in formData) {
            onFormChange(key, value as string);
          }
        });

        // 如果有日期，更新选中的日期
        if (result.data.date) {
          try {
            const parsedDate = parseISO(result.data.date);
            onDateSelect(parsedDate);
          } catch (e) {
            console.error("日期解析错误:", e);
          }
        }

        setShowTextParser(false);
        setParserText("");
      }
    } catch (error) {
      console.error("解析文本时出错:", error);
    } finally {
      setIsParsingText(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="border p-3 rounded-md bg-muted/30 mb-4">
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="textParser">粘贴面试信息文本</Label>
              <Button
                size="sm"
                onClick={handleParseText}
                disabled={isParsingText || !parserText.trim()}
              >
                {isParsingText ? "解析中..." : "解析文本"}
              </Button>
            </div>
            <Textarea
              id="textParser"
              value={parserText}
              onChange={(e) => setParserText(e.target.value)}
              placeholder="粘贴包含面试信息的文本，例如：\n公司：阿里巴巴\n职位：前端开发工程师\n日期：2025-03-20\n时间：14:30\n地点：杭州市余杭区文一西路969号\n备注：带上简历和作品集"
              className="h-28 mb-2"
            />
            <div className="text-xs text-muted-foreground">
              提示：粘贴文本后点击“解析文本”按钮，系统将自动识别面试信息并填充到表单中
            </div>
          </div>
          {/* 第一行：公司和职位 */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="companyName" className="mb-2 block">
                公司名称
              </Label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={onInputChange}
                placeholder="例如：阿里巴巴"
              />
            </div>
            <div>
              <Label htmlFor="position" className="mb-2 block">
                面试形式
              </Label>
              <Input
                id="position"
                name="position"
                value={formData.position}
                onChange={onInputChange}
                placeholder="例如：远程/现场"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <Label className="mb-2 block">面试日期</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "yyyy年MM月dd日", { locale: zhCN })
                    ) : (
                      <span>选择日期</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={onDateSelect}
                    initialFocus
                    locale={zhCN}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="startTime" className="mb-2 block">
                开始时间
              </Label>
              <Select
                value={formData.startTime}
                onValueChange={(value) => onFormChange("startTime", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择开始时间">
                    {formData.startTime && (
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        {formData.startTime}
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="09:00">09:00</SelectItem>
                  <SelectItem value="09:30">09:30</SelectItem>
                  <SelectItem value="10:00">10:00</SelectItem>
                  <SelectItem value="10:30">10:30</SelectItem>
                  <SelectItem value="11:00">11:00</SelectItem>
                  <SelectItem value="11:30">11:30</SelectItem>
                  <SelectItem value="13:00">13:00</SelectItem>
                  <SelectItem value="13:30">13:30</SelectItem>
                  <SelectItem value="14:00">14:00</SelectItem>
                  <SelectItem value="14:30">14:30</SelectItem>
                  <SelectItem value="15:00">15:00</SelectItem>
                  <SelectItem value="15:30">15:30</SelectItem>
                  <SelectItem value="16:00">16:00</SelectItem>
                  <SelectItem value="16:30">16:30</SelectItem>
                  <SelectItem value="17:00">17:00</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="duration" className="mb-2 block">
                面试时长
              </Label>
              <Select
                value={formData.duration}
                onValueChange={(value) => onFormChange("duration", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择面试时长" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30分钟">30分钟</SelectItem>
                  <SelectItem value="1小时">1小时</SelectItem>
                  <SelectItem value="1.5小时">1.5小时</SelectItem>
                  <SelectItem value="2小时">2小时</SelectItem>
                  <SelectItem value="2.5小时">2.5小时</SelectItem>
                  <SelectItem value="3小时">3小时</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status" className="mb-2 block">
                面试状态
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => onFormChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择面试状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="待面试">待面试</SelectItem>
                  <SelectItem value="已完成">已完成</SelectItem>
                  <SelectItem value="已取消">已取消</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="location" className="mb-2 block">
                面试地点
              </Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={onInputChange}
                placeholder="例如：北京市海淀区中关村软件园"
              />
            </div>
            <div>
              <Label htmlFor="color" className="mb-2 block">
                颜色标记
              </Label>
              <div className="flex gap-2 h-10 items-center">
                {["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"].map(
                  (color) => (
                    <div
                      key={color}
                      className={`w-8 h-8 rounded-full cursor-pointer ${
                        formData.color === color
                          ? "ring-2 ring-offset-2 ring-black"
                          : ""
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => onFormChange("color", color)}
                    />
                  )
                )}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <Label htmlFor="notes" className="mb-2 block">
              备注
            </Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={onInputChange}
              placeholder="添加面试相关的备注信息..."
              className="h-20"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={onSubmit}>{submitButtonText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
