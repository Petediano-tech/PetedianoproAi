
"use client";

import { useState, useEffect } from 'react';

// A simple hook to get window dimensions.
export function useWindowSize() {
    const [size, setSize] = useState({ width: 0, height: 0 });
    
    useEffect(() => {
        // Handler to call on window resize
        const handleResize = () => {
            setSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        // Add event listener
        window.addEventListener('resize', handleResize);
        
        // Call handler right away so state gets updated with initial window size
        handleResize();
        
        // Remove event listener on cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []); // Empty array ensures that effect is only run on mount and unmount

    return size;
}
