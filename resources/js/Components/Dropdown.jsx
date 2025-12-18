import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';

const DropdownContext = createContext();

export default function Dropdown({ align = 'right', width = '48', contentClasses = 'py-1 bg-white', children }) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!dropdownRef.current || dropdownRef.current.contains(event.target)) {
                return;
            }

            setOpen(false);
        };

        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, []);

    const widthClass = {
        48: 'w-48',
    }[width.toString()] ?? width;

    const alignmentClasses = {
        left: 'origin-top-left left-0',
        right: 'origin-top-right right-0',
        top: 'origin-top',
    };

    return (
        <DropdownContext.Provider
            value={{
                open,
                setOpen,
                alignClass: alignmentClasses[align] ?? alignmentClasses.right,
                widthClass,
                contentClasses,
            }}
        >
            <div className="relative" ref={dropdownRef}>
                {children}
            </div>
        </DropdownContext.Provider>
    );
}

Dropdown.Trigger = function DropdownTrigger({ children }) {
    const { open, setOpen } = useContext(DropdownContext);

    return (
        <div onClick={() => setOpen((previous) => !previous)} aria-expanded={open}>
            {children}
        </div>
    );
};

Dropdown.Content = function DropdownContent({ children }) {
    const { open, alignClass, widthClass, contentClasses } = useContext(DropdownContext);

    return (
        <div
            className={`${open ? 'block' : 'hidden'} absolute z-50 mt-2 rounded-md shadow-lg ${alignClass} ${widthClass}`}
            role="menu"
        >
            <div className={`rounded-md ring-1 ring-black/5 ${contentClasses}`}>{children}</div>
        </div>
    );
};

Dropdown.Link = function DropdownLink({ className = '', children, ...props }) {
    return (
        <Link
            {...props}
            className={`block w-full px-4 py-2 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus:bg-gray-100 ${className}`}
        >
            {children}
        </Link>
    );
};
