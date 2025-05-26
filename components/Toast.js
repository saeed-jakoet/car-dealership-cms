'use client';

import { Toaster } from 'react-hot-toast';

export default function CustomToaster() {
    return (
        <Toaster
            position="top-center"
            toastOptions={{
                duration: 4500,
                style: {
                    background: '#ffffff', // clean white
                    color: '#2c3e50', // dark blue-gray text
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    fontWeight: 600,
                    fontSize: '16px',
                    borderRadius: '12px',
                    padding: '16px 20px 16px 14px',
                    boxShadow: '0 6px 18px rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    borderLeft: '6px solid', // accent bar
                    animation: 'slideFadeIn 0.35s ease forwards',
                    maxWidth: '400px',
                    minWidth: '300px',
                },
                success: {
                    style: {
                        borderColor: '#27ae60', // vibrant green accent bar
                    },
                    iconTheme: {
                        primary: '#27ae60',
                        secondary: '#e6f4ea',
                    },
                },
                error: {
                    style: {
                        borderColor: '#e74c3c', // vibrant red accent bar
                    },
                    iconTheme: {
                        primary: '#e74c3c',
                        secondary: '#fcebea',
                    },
                },
            }}
        />
    );
}