import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';

export default function Navbar() {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <nav className="border-b-2 border-orange-200 bg-gradient-to-r from-[#FFF8F0] to-[#FFFBF5] shadow-sm relative z-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between items-center">
                    {/* Left Side - Logo */}
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 group">
                            <ApplicationLogo className="block h-9 w-auto fill-current text-orange-500 group-hover:text-orange-600 transition duration-200" />
                            <span className="hidden sm:inline text-xl font-bold text-orange-500 group-hover:text-orange-600 transition duration-200" style={{ fontFamily: "'Dancing Script', cursive" }}>
                                Capy & Co.
                            </span>
                        </Link>

                        {/* Navigation Links - Only show Dashboard if logged in */}
                        {user && (
                            <div className="hidden space-x-1 sm:-my-px sm:flex">
                                <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                                    Dashboard
                                </NavLink>
                            </div>
                        )}
                    </div>

                    {/* Right Side - User Dropdown OR Login/Register */}
                    <div className="hidden sm:ms-6 sm:flex sm:items-center">
                        {user ? (
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-lg border border-orange-200 bg-white/60 px-4 py-2 text-sm font-medium text-gray-700 transition duration-150 ease-in-out hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
                                            >
                                                {user.name}
                                                <svg className="-me-0.5 ms-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">Log Out</Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        ) : (
                            <div className="space-x-4 flex items-center">
                                <Link href={route('login')} className="text-gray-600 hover:text-orange-600 font-medium transition">
                                    Log in
                                </Link>
                                <Link href={route('register')} className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition shadow-sm">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="-me-2 flex items-center sm:hidden">
                        <button
                            onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                            className="inline-flex items-center justify-center rounded-md p-2 text-orange-500 hover:bg-orange-50 hover:text-orange-600 focus:bg-orange-50 focus:text-orange-600 focus:outline-none transition duration-150 ease-in-out"
                        >
                            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                <path className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                <path className={showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden border-t border-orange-200 bg-white/50'}>
                <div className="space-y-1 pb-3 pt-2">
                    <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                        Dashboard
                    </ResponsiveNavLink>
                </div>
                <div className="border-t border-orange-200 pb-1 pt-4">
                    {user ? (
                        <>
                            <div className="px-4">
                                <div className="text-base font-medium text-gray-800">{user.name}</div>
                                <div className="text-sm font-medium text-gray-500">{user.email}</div>
                            </div>
                            <div className="mt-3 space-y-1">
                                <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                                <ResponsiveNavLink method="post" href={route('logout')} as="button">Log Out</ResponsiveNavLink>
                            </div>
                        </>
                    ) : (
                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('login')}>Log in</ResponsiveNavLink>
                            <ResponsiveNavLink href={route('register')}>Register</ResponsiveNavLink>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}