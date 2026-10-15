"use client";

export default function TimerMinimized({
    remaining,
    taskTitle,
    onExpand
}:{
    remaining: string;     
    taskTitle: string;
    onExpand: () => void;
}){
    return(
    <button onClick={onExpand} className="fixed bottom-4 right-4 border rounded-md px-3 py-2 bg-background text-sm">
        {remaining} · {taskTitle}
    </button>
    )
}