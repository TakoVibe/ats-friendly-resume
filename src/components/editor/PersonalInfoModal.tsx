import { useState } from 'react';
import { X, Upload, Plus, Trash2, Link as LinkIcon, Linkedin, Github, Globe, Twitter, Mail, Smartphone, AtSign } from 'lucide-react';
import type { PersonalInfo } from '../../types/resume';

interface Props {
    data: PersonalInfo;
    onSave: (data: PersonalInfo) => void;
    onClose: () => void;
}

export function PersonalInfoModal({ data, onSave, onClose }: Props) {
    const [formData, setFormData] = useState<PersonalInfo>(data);

    const updateField = (field: keyof PersonalInfo, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateProfile = (index: number, field: string, value: string) => {
        const newProfiles = [...(formData.profiles || [])];
        newProfiles[index] = { ...newProfiles[index], [field]: value } as any;
        updateField('profiles', newProfiles);
    };

    const addProfile = () => {
        const newProfiles = [...(formData.profiles || []), { network: 'Website', username: '', url: '' }];
        updateField('profiles', newProfiles);
    };

    const removeProfile = (index: number) => {
        const newProfiles = [...(formData.profiles || [])];
        newProfiles.splice(index, 1);
        updateField('profiles', newProfiles);
    };

    const getIcon = (network: string) => {
        const n = network.toLowerCase();
        if (n.includes('linkedin')) return <Linkedin size={16} />;
        if (n.includes('github')) return <Github size={16} />;
        if (n.includes('twitter')) return <Twitter size={16} />;
        if (n.includes('phone')) return <Smartphone size={16} />;
        if (n.includes('mail')) return <Mail size={16} />;
        return <Globe size={16} />;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-[var(--bg-card)] rounded-xl shadow-[var(--shadow)] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-[var(--border-color)] animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
                    <h2 className="text-xl font-bold text-[var(--text-main)] tracking-tight">Personal Information</h2>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--bg-input)] rounded-full transition-all active:scale-95 text-[var(--text-muted)]">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-8 flex-1 overflow-y-auto no-scrollbar">

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-1">
                                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5 ml-1">Full Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 outline-none transition-all text-[var(--text-main)] placeholder:text-[var(--text-muted)]/40"
                                    value={formData.fullName}
                                    onChange={(e) => updateField('fullName', e.target.value)}
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5 ml-1">Job Title</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 outline-none transition-all text-[var(--text-main)] placeholder:text-[var(--text-muted)]/40"
                                    value={formData.title || ''}
                                    onChange={(e) => updateField('title', e.target.value)}
                                    placeholder="e.g. Senior Software Engineer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contacts */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] border-b border-[var(--border-color)] pb-2 ml-1">Contacts</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5 ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3 text-[var(--text-muted)]" size={16} />
                                    <input
                                        type="email"
                                        className="w-full pl-11 pr-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 outline-none transition-all text-[var(--text-main)]"
                                        value={formData.email}
                                        onChange={(e) => updateField('email', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5 ml-1">Phone</label>
                                <div className="relative">
                                    <Smartphone className="absolute left-4 top-3 text-[var(--text-muted)]" size={16} />
                                    <input
                                        type="text"
                                        className="w-full pl-11 pr-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 outline-none transition-all text-[var(--text-main)]"
                                        value={formData.phone}
                                        onChange={(e) => updateField('phone', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5 ml-1">Location</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 outline-none transition-all text-[var(--text-main)]"
                                    value={formData.location}
                                    onChange={(e) => updateField('location', e.target.value)}
                                    placeholder="City, Country"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dimensions / Socials */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] border-b border-[var(--border-color)] pb-2 ml-1">Websites & Social Links</h3>
                        <div className="space-y-3">
                            {formData.profiles?.map((profile, idx) => (
                                <div key={idx} className="flex gap-4 items-start bg-[var(--bg-input)] p-4 rounded-xl border border-[var(--border-color)] group">
                                    <div className="pt-2.5 text-[var(--text-muted)] transition-colors group-hover:text-blue-400">
                                        {getIcon(profile.network)}
                                    </div>
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1 block">Network / Label</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:border-blue-500/40 outline-none transition-all"
                                                value={profile.network}
                                                onChange={(e) => updateProfile(idx, 'network', e.target.value)}
                                                placeholder="e.g. LinkedIn"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1 block">Username / Display Text</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:border-blue-500/40 outline-none transition-all"
                                                value={profile.username}
                                                onChange={(e) => updateProfile(idx, 'username', e.target.value)}
                                                placeholder="@username"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1 block">URL</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] focus:border-blue-500/40 outline-none transition-all"
                                                value={profile.url}
                                                onChange={(e) => updateProfile(idx, 'url', e.target.value)}
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeProfile(idx)}
                                        className="p-2 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all active:scale-90 self-start mt-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                            {['LinkedIn', 'GitHub', 'Portfolio', 'Twitter', 'Behance'].map(net => (
                                <button
                                    key={net}
                                    onClick={() => {
                                        updateField('profiles', [...(formData.profiles || []), { network: net, username: '', url: '' }]);
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-input)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] transition-all active:scale-95"
                                >
                                    <Plus size={14} /> {net}
                                </button>
                            ))}
                            <button
                                onClick={() => {
                                    updateField('profiles', [...(formData.profiles || []), { network: 'Website', username: '', url: '' }]);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-xs font-bold uppercase tracking-wider text-blue-400 transition-all active:scale-95"
                            >
                                <Plus size={14} /> Custom
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-main)] flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-input)] rounded-xl transition-all active:scale-95">
                        Cancel
                    </button>
                    <button
                        onClick={() => { onSave(formData); onClose(); }}
                        className="px-10 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-900/40 transition-all active:scale-95"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
