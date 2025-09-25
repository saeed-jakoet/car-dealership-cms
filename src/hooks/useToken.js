'use client';

import { createContext, useContext } from 'react';

const TokenContext = createContext(null);

export function useToken() {
    return useContext(TokenContext);
}

export { TokenContext };