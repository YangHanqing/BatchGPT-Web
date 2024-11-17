// app/page.tsx

import React from 'react';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
            <div className="container mx-auto px-4 text-center max-w-3xl shadow-lg bg-white rounded-lg p-8">
                <h1 className="text-4xl font-extrabold mb-4 text-blue-700">
                    Welcome to <span className="text-blue-500">Excel GPT Assistant</span>
                </h1>
                <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                    Simplify your workflow by preparing prompt templates, placing variables in Excel, and batch calling GPT to get results effortlessly.
                </p>
                <div className="flex justify-center">
                    <a
                        href="/pages/index"
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform duration-300"
                    >
                        Get Started
                    </a>
                </div>
            </div>
        </div>
    );
}
