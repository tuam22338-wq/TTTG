import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPrev: () => void;
    onNext: () => void;
    onJump: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ currentPage, totalPages, onPrev, onNext, onJump }) => {
    const [inputValue, setInputValue] = useState(String(currentPage));

    useEffect(() => {
        setInputValue(String(currentPage));
    }, [currentPage]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleJump = () => {
        let pageNum = parseInt(inputValue, 10);
        if (isNaN(pageNum)) {
            setInputValue(String(currentPage)); // Reset if invalid
            return;
        }
        pageNum = Math.max(1, Math.min(totalPages, pageNum));
        onJump(pageNum);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleJump();
            (e.target as HTMLInputElement).blur();
        }
    };

    const isAtFirstPage = currentPage === 1;
    const isAtLastPage = currentPage === totalPages;

    return (
        <div className="flex items-center justify-center gap-2 text-white">
            <button
                onClick={onPrev}
                disabled={isAtFirstPage}
                className="p-2 rounded-md bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Trang trước"
            >
                <ChevronLeftIcon className="h-5 w-5" />
            </button>

            <div className="flex items-baseline gap-1 bg-neutral-800 rounded-md px-3 py-1.5">
                <input
                    type="number"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleJump}
                    onKeyDown={handleKeyDown}
                    className="w-12 bg-transparent text-center font-bold focus:outline-none focus:ring-0 appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    aria-label={`Trang hiện tại, ${currentPage} trên ${totalPages}`}
                />
                <span className="text-neutral-400">/ {totalPages}</span>
            </div>

            <button
                onClick={onNext}
                disabled={isAtLastPage}
                className="p-2 rounded-md bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Trang sau"
            >
                <ChevronRightIcon className="h-5 w-5" />
            </button>
        </div>
    );
};

export default PaginationControls;