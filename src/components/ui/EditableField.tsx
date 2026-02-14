import React, { useState, useRef } from 'react';
import { InlineAIButton } from './InlineAIButton';
import { PromptDialog } from './PromptDialog';

interface Props {
    value: string;
    onSave: (value: string) => void;
    tagName?: keyof React.JSX.IntrinsicElements;
    className?: string;
    isEditable?: boolean;
    placeholder?: string;
    mode?: 'text' | 'html';
    aiProps?: {
        type: 'bullet' | 'summary' | 'role' | 'description';
        context?: {
            role?: string;
            company?: string;
            jobDescription?: string;
            projectName?: string;
            techStack?: string[];
        };
    };
    actions?: React.ReactNode;
    controlsLayout?: 'local' | 'parent';
}

// ... (keep existing imports and interface)

export function EditableField({
    value,
    onSave,
    tagName: Tag = 'span',
    className = '',
    isEditable = true,
    placeholder = 'Click to edit...',
    mode = 'text',
    aiProps,
    actions,
    controlsLayout = 'local'
}: Props) {
    const [isFocused, setIsFocused] = useState(false);
    const [showLinkPrompt, setShowLinkPrompt] = useState(false);
    const contentRef = useRef<HTMLElement>(null);
    const selectionRef = useRef<Range | null>(null);

    const hasAI = isEditable && aiProps;
    const hasActions = isEditable && actions;
    const showToolbar = hasAI || hasActions;

    const containerClasses = [
        className,
        isEditable ? 'rounded-sm transition-[opacity,outline,background-color] duration-200 cursor-text' : '',
        isFocused ? 'outline outline-2 outline-blue-500/30 z-10 relative' : '',
        !value && isEditable ? 'empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400' : ''
    ].join(' ');

    const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
        // Did we blur because of the prompt?
        if (showLinkPrompt) return;

        setIsFocused(false);
        const hasTags = /<[a-z][\s\S]*>/i.test(e.currentTarget.innerHTML);
        const newValue = (mode === 'html' || hasTags) ? e.currentTarget.innerHTML : e.currentTarget.innerText;

        if (newValue !== value) {
            onSave(newValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Enter') {
            if (Tag === 'h1' || Tag === 'h2' || Tag === 'h3' || Tag === 'span') {
                e.preventDefault();
                e.currentTarget.blur();
            }
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();

            // Save selection
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                selectionRef.current = selection.getRangeAt(0);
                setShowLinkPrompt(true);
            }
        }
    };

    const handleLinkConfirm = (url: string) => {
        setShowLinkPrompt(false);

        // Restore selection
        const selection = window.getSelection();
        if (selection && selectionRef.current) {
            selection.removeAllRanges();
            selection.addRange(selectionRef.current);

            if (url) {
                document.execCommand('createLink', false, url);
                if (contentRef.current) {
                    onSave(contentRef.current.innerHTML);
                }
            }
        }
        selectionRef.current = null;
    };

    const isEmpty = !value || value.trim().length === 0;

    // If not editable and empty, hide completely
    if (isEmpty && !isEditable) {
        return null;
    }

    const handleFocus = (e: React.FocusEvent<HTMLElement>) => {
        setIsFocused(true);
        if (isEmpty && isEditable && e.currentTarget.textContent === placeholder) {
            e.currentTarget.textContent = '';
        }
    };

    const commonProps = {
        ref: contentRef,
        className: containerClasses,
        contentEditable: isEditable,
        suppressContentEditableWarning: true,
        onFocus: handleFocus,
        onBlur: handleBlur,
        onKeyDown: handleKeyDown,
        'data-placeholder': placeholder
    };

    const element = (
        <>
            {isEmpty && isEditable ? (
                React.createElement(Tag as string, {
                    ...commonProps,
                    className: `${commonProps.className} min-w-[1ch] inline-block align-bottom empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:italic`
                })
            ) : isEmpty ? (
                React.createElement(Tag as string, commonProps)
            ) : (
                React.createElement(Tag as string, {
                    ...commonProps,
                    dangerouslySetInnerHTML: { __html: value }
                })
            )}

            <PromptDialog
                isOpen={showLinkPrompt}
                title="Enter Link URL"
                placeholder="https://example.com"
                onConfirm={handleLinkConfirm}
                onCancel={() => {
                    setShowLinkPrompt(false);
                    selectionRef.current = null;
                }}
            />
        </>
    );

    if (showToolbar) {
        const isInline = Tag === 'span';
        const Wrapper = isInline ? 'span' : 'div';
        const isParentAnchor = controlsLayout === 'parent';

        // Wrapper is relative unless we intentionally want to anchor controls to a parent container
        const wrapperClasses = `${isParentAnchor ? '' : 'relative'} group/field stop-row-hover ${isInline ? '' : 'w-full'}`;

        // Determine position: Parent anchor forces right-side gutter positioning (left-full of parent)
        // Otherwise, Inline uses right-0 (end of text), Block uses left-full (end of box)
        const positionClass = isParentAnchor || !isInline ? 'left-[100%] pl-2 top-0 h-full' : 'right-0 bottom-full mb-1';

        return (
            <Wrapper className={wrapperClasses}>
                {element}
                <div className={`absolute ${positionClass} flex items-center z-[100] print:hidden`}>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover/field:opacity-100 focus-within:opacity-100 transition-all duration-200">
                        {hasAI && (
                            <InlineAIButton
                                text={value}
                                type={aiProps!.type}
                                context={aiProps!.context}
                                onAccept={onSave}
                                className="shadow-lg shadow-purple-900/10 border border-purple-200"
                            />
                        )}
                        {actions && (
                            <div className="flex items-center gap-1 bg-[var(--bg-card)] shadow-lg border border-[var(--border-color)] rounded-lg p-1">
                                {actions}
                            </div>
                        )}
                    </div>
                </div>
            </Wrapper>
        );
    }

    return element;
}
