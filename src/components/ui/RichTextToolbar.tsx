import React, { useEffect, useState, useRef } from 'react';
import { Bold, Italic, Link, List } from 'lucide-react';

interface Props {
    targetRef: React.RefObject<HTMLElement>;
}

export function RichTextToolbar({ targetRef }: Props) {
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
    const [show, setShow] = useState(false);
    const toolbarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updatePosition = () => {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
                setShow(false);
                return;
            }

            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;

            // Check if selection is inside our targetRef
            if (targetRef.current && (targetRef.current === container || targetRef.current.contains(container))) {
                const rect = range.getBoundingClientRect();

                // Position above the selection
                // We need to account for scroll, so use window.scrollY
                setPosition({
                    top: rect.top + window.scrollY - 45, // 45px above
                    left: rect.left + window.scrollX + (rect.width / 2) // Centered
                });
                setShow(true);
            } else {
                setShow(false);
            }
        };

        document.addEventListener('selectionchange', updatePosition);
        // Also update on scroll/resize just in case, though selectionchange usually covers text selection updates
        window.addEventListener('resize', updatePosition);

        return () => {
            document.removeEventListener('selectionchange', updatePosition);
            window.removeEventListener('resize', updatePosition);
        };
    }, [targetRef]);

    const execute = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        // Keep focus? browsers usually handle execCommand fine with selection
    };

    const handleLink = () => {
        const url = prompt('Enter URL:');
        if (url) execute('createLink', url);
    };

    if (!show || !position) return null;

    return (
        <div
            ref={toolbarRef}
            className="fixed z-50 flex items-center gap-1 bg-gray-900/90 text-white rounded-lg shadow-lg px-2 py-1.5 backdrop-blur-sm animate-in fade-in zoom-in duration-200"
            style={{
                top: position.top,
                left: position.left,
                transform: 'translate(-50%, 0)'
            }}
            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
        >
            <button
                onClick={() => execute('bold')}
                className="p-1 hover:bg-gray-700/50 rounded transition-colors"
                title="Bold"
            >
                <Bold size={16} />
            </button>
            <button
                onClick={() => execute('italic')}
                className="p-1 hover:bg-gray-700/50 rounded transition-colors"
                title="Italic"
            >
                <Italic size={16} />
            </button>
            <div className="w-[1px] h-4 bg-gray-700/50 mx-1" />
            <button
                onClick={handleLink}
                className="p-1 hover:bg-gray-700/50 rounded transition-colors"
                title="Link"
            >
                <Link size={16} />
            </button>
            {/* List usually requires block level context, so might be tricky in simple spans, 
                but createInsertUnorderedList works nicely in contentEditable divs */}
            <button
                onClick={() => execute('insertUnorderedList')}
                className="p-1 hover:bg-gray-700/50 rounded transition-colors"
                title="Bullet List"
            >
                <List size={16} />
            </button>

            {/* Triangle/Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900/90" />
        </div>
    );
}
