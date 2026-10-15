"use client";

import { Button } from "../ui/button";

export default function TimerRunning({
    remaining,
    projectName,
    taskTitle,
    onMinimize,
    onStop
}:{
    remaining: string;
    projectName: string;
    taskTitle: string;
    onMinimize: () => void;
    onStop: () => void;
}){
    return(
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-sm">{projectName}</p>
        <p>{taskTitle}</p>
        <p className="text-5xl font-mono">{remaining}</p>
        <div className="flex gap-2">
            <Button variant="secondary" onClick={onMinimize}>Minimize</Button>
            <Button variant="ghost" onClick={onStop}>Stop</Button>
        </div>
    </div>
    )
}