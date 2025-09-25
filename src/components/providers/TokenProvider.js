'use client';

import { TokenContext } from '@/src/hooks';

export default function TokenProvider({ token, children }) {
    return (
        <TokenContext.Provider value={token}>
            {children}
        </TokenContext.Provider>
    );
}