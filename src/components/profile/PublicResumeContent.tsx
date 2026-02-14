import React from 'react';
import { ResumePreview } from '../../components/ResumePreview';
import { Providers } from '../../components/Providers';
import { PublicFooter } from '../ui/PublicFooter';

interface PublicResumeContentProps {
    resumeData: any;
}

export function PublicResumeContent({ resumeData }: PublicResumeContentProps) {
    return (
        <Providers>
            <div className="w-full max-w-4xl animate-in fade-in duration-500">
                <ResumePreview
                    data={resumeData}
                    id="public-resume-view"
                    isEditable={false}
                />

                <div className="mt-4 text-center">
                    <a
                        href="/"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--text-main)] text-[var(--bg-main)] rounded-2xl font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-xl hover:shadow-2xl"
                    >
                        Create Your Own Resume
                    </a>
                </div>

                <PublicFooter />
            </div>
        </Providers>
    );
}
