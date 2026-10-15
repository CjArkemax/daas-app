"use client"

import { useTimerStore } from "@/lib/timer/store"
import { Button } from "../ui/button";



export default function StartTimerButtons ({
    projectId,
    projectName,
    taskId,
    taskTitle
}:{
    projectId: string;
    projectName: string;
    taskId: string;
    taskTitle: string;  
    }){

    const status = useTimerStore((s)=> s.status);

    function handleClick(minutes: number){
        useTimerStore.getState().start({
            projectId,
            projectName,
            taskId,
            taskTitle,
            plannedSeconds: minutes * 60,
            sessionType: "focus",
        })
    }
      return (
    <div className="flex gap-1">
      <Button variant="ghost" size="sm" disabled={status === "running"} onClick={() => handleClick(0.5)}>
        25
      </Button>
      <Button variant="ghost" size="sm" disabled={status === "running"} onClick={() => handleClick(5)}>
        50
      </Button>
      <Button variant="ghost" size="sm" disabled={status === "running"} onClick={() => handleClick(60)}>
        60
      </Button>
    </div>
  );

}