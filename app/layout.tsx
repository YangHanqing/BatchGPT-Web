'use client';

import './globals.css';
import { AppProvider } from './contexts/AppContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <title>Excel GPT Assistant</title>
            </head>
            <body>
                <AppProvider>
                    {children}
                </AppProvider>
            </body>
        </html>
    );
}
