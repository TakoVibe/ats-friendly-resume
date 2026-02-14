import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { ResumeSchema } from '../types/resume';
import { initialResume } from '../data/sample-resume';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const STORAGE_KEY = 'resume-data-v3';

interface ResumeContextType {
    data: ResumeSchema;
    updateResume: (newData: ResumeSchema) => void;
    updateSection: <K extends keyof ResumeSchema>(section: K, value: ResumeSchema[K]) => void;
    resetToDefault: () => void;
    isLoaded: boolean;
    undo: () => void;
    redo: () => void;
    saveToBackend: () => Promise<void>;
    saveVersionToBackend: () => Promise<void>;
    canUndo: boolean;
    canRedo: boolean;
    isSaving: boolean;
    lastSaved: Date | null;
    resumeMetadata: { id?: string, slug: string, name: string, isPublic: boolean } | null;
    setResumeMetadata: (meta: { id?: string, slug: string, name: string, isPublic: boolean } | null) => void;
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

    const { isAuthenticated } = useAuth();
    const [isLoaded, setIsLoaded] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [resumeMetadata, setResumeMetadata] = useState<{ id?: string, slug: string, name: string, isPublic: boolean } | null>(null);
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

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

    const lastSavedDataRef = useRef<string | null>(null);


    const saveToBackend = useCallback(async () => {
        const isTestingResume = history.present.personalInfo?.email === 'johnathan.doe@example.com';
        if (!isAuthenticated || !history.present || isSaving || isTestingResume) return;

        const currentDataString = JSON.stringify(history.present);
        if (currentDataString === lastSavedDataRef.current) {
            return;
        }

        setIsSaving(true);
        try {

            const method = resumeMetadata?.id ? 'put' : 'post';
            // Use the slug for the endpoint in PUT requests to find the record
            const endpoint = resumeMetadata?.id ? `/api/resumes/${resumeMetadata.slug}/` : '/api/resumes/';

            const response = await api[method](endpoint, {
                resume_data: history.present,
                is_public: resumeMetadata?.isPublic || false
            });

            if (response.ok) {
                const responseData = await response.json();
                lastSavedDataRef.current = currentDataString;
                setResumeMetadata({
                    id: responseData.id,
                    slug: responseData.slug,
                    name: responseData.resume_name,
                    isPublic: responseData.is_public
                });
                setLastSaved(new Date());
            }
        } catch (error) {
            console.error("Auto-save failed:", error);
        } finally {
            setIsSaving(false);
        }
    }, [isAuthenticated, history.present, resumeMetadata]);

    const saveVersionToBackend = useCallback(async () => {
        if (!isAuthenticated || !resumeMetadata?.slug) {
            toast.error("Please save the resume first before creating a version.");
            return;
        }

        setIsSaving(true);
        try {
            const response = await api.post(`/api/resumes/${resumeMetadata.slug}/create_version/`, {});
            if (response.ok) {
                toast.success("Version saved successfully!");
            } else {
                toast.error("Failed to save version.");
            }
        } catch (error) {
            console.error("Error creating version:", error);
            toast.error("Error creating version.");
        } finally {
            setIsSaving(false);
        }
    }, [isAuthenticated, resumeMetadata]);

    // Auto-save effect with dirty check
    useEffect(() => {
        const isTestingResume = history.present.personalInfo?.email === 'johnathan.doe@example.com';

        if (isAuthenticated && isLoaded && !isTestingResume) {
            // Compare current with last saved
            const currentDataString = JSON.stringify(history.present);
            if (currentDataString === lastSavedDataRef.current) {
                return;
            }

            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

            autoSaveTimerRef.current = setTimeout(() => {
                saveToBackend();
            }, 5000);
        }
        return () => {
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        };
    }, [history.present, isAuthenticated, isLoaded, saveToBackend]);

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
            saveToBackend,
            saveVersionToBackend,
            canUndo: history.past.length > 0,
            canRedo: history.future.length > 0,
            isSaving,
            lastSaved,
            resumeMetadata,
            setResumeMetadata
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
