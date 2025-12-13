import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            //color palette
            colors: {
                'text': '#553018',
                'background': '#fbfbfb',
                'primary': '#f98f52',
                'secondary': '#cbe4ff',
                'accent': '#f3c39f',
                },
        },
    },

    plugins: [forms],
};
