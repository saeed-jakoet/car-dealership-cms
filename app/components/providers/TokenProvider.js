'use client';

import { TokenContext } from '@/app/hooks';

export default function TokenProvider({ token, children }) {
    return (
        <TokenContext.Provider value={token}>
            {children}
        </TokenContext.Provider>
    );
}