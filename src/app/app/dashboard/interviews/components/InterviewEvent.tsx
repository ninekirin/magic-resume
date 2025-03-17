"use client";

import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Interview } from "../types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface InterviewEventProps {
  interview: Interview;
  top: number;
  height: number;
  left: number;
  onEdit: () => void;
  onDelete: () => void;
}

export default function InterviewEvent({
  interview,
  top,
  height,
  left,
  onEdit,
  onDelete,
}: InterviewEventProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // 确保最小高度
  const eventHeight = Math.max(height, 24);

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <div
          className="absolute rounded-md p-2 overflow-hidden cursor-pointer text-white text-xs shadow-md"
          style={{
            top: `${top}px`,
            height: `${eventHeight}px`,
            left: `calc(${(left / 6) * 100}% - ${(left / 6) * 1}px)`,
            width: `calc(${(1 / 6) * 100}% - 8px)`,
            backgroundColor: interview.color,
          }}
          onClick={() => setIsPopoverOpen(true)}
        >
          <div className="font-medium truncate">{interview.companyName}</div>
          {eventHeight > 40 && (
            <div className="truncate">{interview.position}</div>
          )}
          {eventHeight > 60 && (
            <div className="flex items-center mt-1">
              <span>
                {interview.startTime} ({interview.duration})
              </span>
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-4 border-b">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-lg">{interview.companyName}</h3>
              <p className="text-sm text-muted-foreground">
                {interview.position}
              </p>
            </div>
            <div
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${interview.color}20`,
                color: interview.color,
              }}
            >
              {interview.status}
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center text-sm">
              <span className="font-medium mr-2">时间:</span>
              <span>
                {interview.date} {interview.startTime} (时长:{" "}
                {interview.duration})
              </span>
            </div>
            <div className="flex items-center text-sm">
              <span className="font-medium mr-2">地点:</span>
              <span>{interview.location}</span>
            </div>
            {interview.notes && (
              <div className="mt-2 text-sm">
                <span className="font-medium">备注:</span>
                <p className="mt-1 text-muted-foreground">{interview.notes}</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end p-2 bg-muted/50">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4 mr-1" />
            编辑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            删除
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
