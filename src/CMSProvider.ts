import { createContext, createElement, PropsWithChildren, useEffect, useState } from 'react'
import { PostCMS } from './PostCMS'

export const CMSContext = createContext<{ cms: CMS, sessionTicks: number }>({ cms: new PostCMS(''), sessionTicks: 0 })
CMSContext.displayName = 'CMSContext'

export function CMSProvider({ cms, children }: PropsWithChildren<{ cms: CMS }>) {
    const [sessionTicks, setSessionTicks] = useState(0)

    useEffect(() => {
        const ticker = setInterval(() => cms.updateSession(), 5 * 60 * 1000)
        const sessionupdate = () => setSessionTicks(n => n + 1)
        cms.on('sessionupdate', sessionupdate)
        cms.updateSession()
        return () => {
            clearInterval(ticker)
            cms.off('sessionupdate', sessionupdate)
        }
    }, [cms])

    return createElement(CMSContext.Provider, { value: { cms, sessionTicks } }, children)
}
