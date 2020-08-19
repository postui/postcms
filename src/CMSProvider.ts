import { createContext, createElement, PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react'
import { PostCMS } from './PostCMS'

export const CMSContext = createContext<{ cms: CMS }>({ cms: new PostCMS('') })
CMSContext.displayName = 'CMSContext'

export function CMSProvider({ cms, children }: PropsWithChildren<{ cms: CMS }>) {
    const [sessionTicks, setSessionTicks] = useState(0)
    const querySession = useCallback(async () => {
        const { token, user, error } = await cms.query('session')
        if (error) {
            if (error.status === 401) {
                cms.updateSession(null, null)
            } else {
                alert(error.message)
            }
        }
        cms.updateSession(token, user)
    }, [])
    const props = useMemo(() => ({ value: { cms }, sessionTicks }), [cms, sessionTicks])

    useEffect(() => {
        const ticker = setInterval(() => querySession(), 5 * 60 * 1000)
        cms.on('sessionupdate', () => setSessionTicks(n => n + 1))
        querySession()
        return () => {
            cms.off('sessionupdate')
            clearInterval(ticker)
        }
    }, [cms])

    return createElement(CMSContext.Provider, props, children)
}
