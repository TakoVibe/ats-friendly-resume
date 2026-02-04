import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { ResumeSchema } from '../types/resume';
import { initialResume } from '../data/rahul-resume';

const STORAGE_KEY = 'resume-data-v3';

interface ResumeContextType {
    data: ResumeSchema;
    updateResume: (newData: ResumeSchema) => void;
    updateSection: <K extends keyof ResumeSchema>(section: K, value: ResumeSchema[K]) => void;
    resetToDefault: () => void;
    isLoaded: boolean;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: ReactNode }) {
    const [history, setHistory] = useState<{
        past: ResumeSchema[];
        present: ResumeSchema;
        future: ResumeSchema[];
    }>({
        past: [],
        present: initialResume,
        future: []
    });

    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setHistory(prev => ({
                    ...prev,
                    present: parsed
                }));
            } catch (e) {
                console.error("Failed to parse resume data", e);
            }
        }
        setIsLoaded(true);
    }, []);

    const updateResume = useCallback((newData: ResumeSchema) => {
        setHistory(curr => {
            const newHistory = {
                past: [...curr.past, curr.present],
                present: newData,
                future: []
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
            return newHistory;
        });
    }, []);

    const undo = useCallback(() => {
        setHistory(curr => {
            if (curr.past.length === 0) return curr;

            const previous = curr.past[curr.past.length - 1];
            const newPast = curr.past.slice(0, -1);

            const newHistory = {
                past: newPast,
                present: previous,
                future: [curr.present, ...curr.future]
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify(previous));
            return newHistory;
        });
    }, []);

    const redo = useCallback(() => {
        setHistory(curr => {
            if (curr.future.length === 0) return curr;

            const next = curr.future[0];
            const newFuture = curr.future.slice(1);

            const newHistory = {
                past: [...curr.past, curr.present],
                present: next,
                future: newFuture
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return newHistory;
        });
    }, []);

    const updateSection = <K extends keyof ResumeSchema>(section: K, value: ResumeSchema[K]) => {
        const newData = { ...history.present, [section]: value };
        updateResume(newData);
    };

    const resetToDefault = () => {
        updateResume(initialResume);
    };

    return (
        <ResumeContext.Provider value={{
            data: history.present,
            updateResume,
            updateSection,
            resetToDefault,
            isLoaded,
            undo,
            redo,
            canUndo: history.past.length > 0,
            canRedo: history.future.length > 0
        }}>
            {children}
        </ResumeContext.Provider>
    );
}

export function useResumeContext() {
    const context = useContext(ResumeContext);
    if (context === undefined) {
        throw new Error('useResumeContext must be used within a ResumeProvider');
    }
    return context;
}
