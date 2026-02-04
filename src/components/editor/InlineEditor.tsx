import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Link as LinkIcon, X } from 'lucide-react';
import { useCallback, useState } from 'react';

interface Props {
    content: string;
    onChange: (html: string) => void;
    className?: string;
    placeholder?: string;
}

export function InlineEditor({ content, onChange, className, placeholder }: Props) {
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                // Disable the default link extension from StarterKit to avoid duplicates
                link: false,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 hover:underline cursor-pointer',
                },
            }),
        ],
        content: content,
        editorProps: {
            attributes: {
                class: `prose prose-sm focus:outline-none min-h-[1.5em] ${className || ''}`,
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    const openLinkDialog = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href;
        setLinkUrl(previousUrl || '');
        setShowLinkDialog(true);
    }, [editor]);

    const setLink = useCallback(() => {
        if (!editor) return;

        // cancelled or empty
        if (linkUrl === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            setShowLinkDialog(false);
            return;
        }

        // update link
        editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
        setShowLinkDialog(false);
        setLinkUrl('');
    }, [editor, linkUrl]);

    const cancelLink = useCallback(() => {
        setShowLinkDialog(false);
        setLinkUrl('');
        editor?.commands.focus();
    }, [editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="relative group">
            {editor && (
                <BubbleMenu className="flex bg-gray-900 text-white rounded-lg shadow-xl px-2 py-1 gap-1 -mt-2 z-500" editor={editor}>
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`p-1.5 rounded hover:bg-gray-700 ${editor.isActive('bold') ? 'bg-gray-700 text-blue-400' : ''}`}
                        title="Bold (Cmd+B)"
                    >
                        <Bold size={14} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`p-1.5 rounded hover:bg-gray-700 ${editor.isActive('italic') ? 'bg-gray-700 text-blue-400' : ''}`}
                        title="Italic (Cmd+I)"
                    >
                        <Italic size={14} />
                    </button>
                    <button
                        onClick={openLinkDialog}
                        className={`p-1.5 rounded hover:bg-gray-700 ${editor.isActive('link') ? 'bg-gray-700 text-blue-400' : ''}`}
                        title="Link"
                    >
                        <LinkIcon size={14} />
                    </button>
                    {editor.isActive('link') && (
                        <button
                            onClick={() => editor.chain().focus().unsetLink().run()}
                            className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-red-400"
                            title="Remove Link"
                        >
                            <X size={14} />
                        </button>
                    )}
                </BubbleMenu>
            )}

            <EditorContent editor={editor} />

            {/* Custom Link Dialog */}
            {showLinkDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" onClick={cancelLink}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-96 max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-white text-lg font-semibold mb-4">Add Link</h3>
                        <div className="mb-4">
                            <label className="block text-gray-300 text-sm mb-2">URL</label>
                            <input
                                type="text"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        setLink();
                                    } else if (e.key === 'Escape') {
                                        cancelLink();
                                    }
                                }}
                                placeholder="https://example.com"
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={cancelLink}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={setLink}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded transition-colors"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
