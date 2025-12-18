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
        <nav className="navbar">
            <div className="navbar-inner">
                <div className="navbar-row">
                    {/* Left Side - Logo */}
                    <div className="navbar-brand">
                        <Link href="/" className="navbar-logo-link group">
                            <ApplicationLogo className="navbar-logo" />
                            <span className="navbar-brand-text">
                                Capy & Co.
                            </span>
                        </Link>

                        {/* Navigation Links - Only show Dashboard if logged in */}
                        {user && (
                            <div className="navbar-links">
                                <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                                    Dashboard
                                </NavLink>
                            </div>
                        )}
                    </div>

                    {/* Right Side - User Dropdown OR Login/Register */}
                    <div className="navbar-user">
                        {user ? (
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="navbar-user-button"
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
                            <div className="navbar-auth-links">
                                <Link href={route('login')} className="navbar-auth-login">
                                    Log in
                                </Link>
                                <Link href={route('register')} className="navbar-auth-register">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="navbar-mobile-button">
                        <button
                            onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                            className="navbar-mobile-toggle"
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
            <div className={`${showingNavigationDropdown ? 'block' : 'hidden'} navbar-mobile-menu`}>
                <div className="space-y-1 pb-3 pt-2">
                    <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                        Dashboard
                    </ResponsiveNavLink>
                </div>
                <div className="navbar-mobile-auth">
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