import { createContext, createElement, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react'
import { CMSContext } from './CMSProvider'

export const PostContext = createContext<{ post: Post } | { isLoading: true } | { error: APIError }>({ error: { status: 0, message: 'use PostContext outside PostProvider' } })
PostContext.displayName = 'PostContext'

export function PostProvider({ bucket, id, kv, children }: PropsWithChildren<{ bucket: string, id: string, kv?: string[] }>) {
    const { cms } = useContext(CMSContext)
    const [post, setPost] = useState<Post | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<APIError | null>(null)
    const value = useMemo(() => {
        if (isLoading) {
            return { isLoading }
        }
        if (error) {
            return { error }
        }
        return { post: post! }
    }, [post, isLoading, error])

    useEffect(() => {
        const c = new AbortController()
        cms.bucket(bucket).getPost(id, kv, c).then(post => {
            setPost(post)
            setIsLoading(false)
        }).catch(error => {
            setError(error)
            setIsLoading(false)
        })
        return () => c.abort()
    }, [cms, bucket, id, kv])

    return createElement(PostContext.Provider, { value }, children)
}
