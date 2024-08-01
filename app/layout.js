"use client";


import './globals.css'; // Import your global CSS
import { metadata } from './metadata'; // Import metadata

export default function RootLayout({ children }) {
  return (
 
      <html lang="en">
        <head>
          <title>{metadata.title}</title>
          <meta name="description" content={metadata.description} />
        </head>
        <body>{children}</body>
      </html>
    
  );
}
