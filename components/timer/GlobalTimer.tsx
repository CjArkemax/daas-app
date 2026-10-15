"use client";

import { useState, useEffect, useRef } from 'react';
import { useTimerStore } from '@/lib/timer/store';
import { saveFocusSession } from '@/actions/sessions';
import { formatDuration } from '@/lib/timer/format';
import { playBell } from '@/lib/timer/completion';
import { Button } from '@/components/ui/button';
import TimerMinimized from './TimerMinimized';
import TimerRunning from './TimerRunning';

export default function GlobalTimer() {
    // all HOOKS 
    const [hydrated, setHydrated] = useState(false);
    const [now, setNow] = useState(() => Date.now());
    const [minimized, setMinimized] = useState(false);
    const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    const status = useTimerStore((s) => s.status);
    const startedAt = useTimerStore((s) => s.startedAt);
    const plannedSeconds = useTimerStore((s) => s.plannedSeconds);
    const taskTitle = useTimerStore((s) => s.taskTitle);
    const projectName = useTimerStore((s) => s.projectName);

    const hasFiredRef = useRef(false);

    const remaining = startedAt
        ? Math.max(0, plannedSeconds - Math.floor((now - startedAt) / 1000))
        : 0;

    // all EFFECTS 
    useEffect(() => setHydrated(true), []);

    useEffect(() => {
        if (status !== 'running' || !startedAt) return;
        setNow(Date.now());
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, [status, startedAt]);

    useEffect(() => {
        document.title = status === 'running'
        ? `${formatDuration(remaining)} — DAAS`
        : 'DAAS';
    }, [status, remaining]);

    useEffect(() => {
        if (status !== 'running') return;
        if (remaining > 0) return;
        if (hasFiredRef.current) return;
        hasFiredRef.current = true;
        handleCompletion();
    }, [status, remaining]);

    // HANDLERS 
    function buildPayload() {
        const s = useTimerStore.getState();
        if (!s.startedAt || !s.clientSessionId || !s.projectId || !s.taskId) return null;
        return {
        clientSessionId: s.clientSessionId,
        projectId: s.projectId,
        taskId: s.taskId,
        sessionType: s.sessionType,
        status: 'completed' as const,
        startedAt: new Date(s.startedAt).toISOString(),
        endedAt: new Date().toISOString(),
        plannedSeconds: s.plannedSeconds,
        };
    }

    function handleDone() {
        hasFiredRef.current = false;
        setSaveState('idle');
        setMinimized(false);
        useTimerStore.getState().reset();
    }

    async function handleStop() {
        const confirmed = window.confirm("Stop this session? Time will not be counted.");
        if (!confirmed) return;

        const s = useTimerStore.getState();
        if (s.startedAt && s.clientSessionId && s.projectId && s.taskId) {
            await saveFocusSession({
            clientSessionId: s.clientSessionId,
            projectId: s.projectId,
            taskId: s.taskId,
            sessionType: s.sessionType,
            status: 'cancelled',
            startedAt: new Date(s.startedAt).toISOString(),
            endedAt: new Date().toISOString(),
            plannedSeconds: s.plannedSeconds,
            });
        }

        hasFiredRef.current = false;
        setSaveState('idle');
        setMinimized(false);
        useTimerStore.getState().reset();
    }

    async function handleCompletion() {
        const payload = buildPayload();
        if (!payload) return;

        playBell();
        setSaveState('saving');
        useTimerStore.setState({ status: 'completed' });

        const result = await saveFocusSession(payload);
        setSaveState(result.success ? 'saved' : 'error');
    }

    async function handleRetry() {
        const payload = buildPayload();
        if (!payload) return;

        setSaveState('saving');
        const result = await saveFocusSession(payload);
        setSaveState(result.success ? 'saved' : 'error');
    }

    // EARLY RETURNS (after all hooks) 
    if (!hydrated) return null;
    if (status === 'idle') return null;

    // RENDER 
    if (status === 'running') {
        return minimized
        ? <TimerMinimized remaining={formatDuration(remaining)} taskTitle={taskTitle ?? ''} onExpand={() => setMinimized(false)} />
        : <TimerRunning remaining={formatDuration(remaining)} projectName={projectName ?? ''} taskTitle={taskTitle ?? ''} onMinimize={() => setMinimized(true)} onStop={handleStop} />;
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background">
        <p className="text-5xl font-mono">00:00</p>
        {saveState === 'saving' && <p>Saving session...</p>}
        {saveState === 'saved' && <Button onClick={handleDone}>Done</Button>}
        {saveState === 'error' && (
            <>
            <p className="text-sm text-destructive">Save failed</p>
            <Button variant="secondary" onClick={handleRetry}>Retry</Button>
            <Button variant="ghost" onClick={handleDone}>Discard</Button>
            </>
        )}
        </div>
  );
}