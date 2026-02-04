// Clear localStorage script
// Run this in browser console: localStorage.removeItem('resume-data-v1'); location.reload();

// Or add this button to your UI to reset data
export function ResetButton() {
    const handleReset = () => {
        localStorage.removeItem('resume-data-v1');
        location.reload();
    };

    return (
        <button
            onClick={handleReset}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
            Reset to Default Data
        </button>
    );
}
