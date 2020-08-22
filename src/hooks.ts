import { useContext, useEffect, useState } from 'react'
import { CMSContext } from './CMSProvider'
import { PostContext } from './PostProvider'

export function useCMS(): CMS {
    const { cms } = useContext(CMSContext)
    return cms
}

export function useSession() {
    const { cms } = useContext(CMSContext)
    return cms.session
}

export function usePost(bucket?: string, id?: string, kv?: string[]): { post: Post } | { isLoading: true } | { error: APIError } {
    const cms = useCMS()
    const postContext = useContext(PostContext)
    const [post, setPost] = useState<Post | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<APIError | null>(null)

    useEffect(() => {
        if (bucket && id) {
            const c = new AbortController()
            cms.bucket(bucket).getPost(id, kv, c).then(post => {
                setPost(post)
                setIsLoading(false)
            }).catch(error => {
                setError(error)
                setIsLoading(false)
            })
            return () => c.abort()
        }
        return undefined
    }, [cms, bucket, id, kv])

    if (bucket && id) {
        if (isLoading) {
            return { isLoading }
        }
        if (error) {
            return { error }
        }
        return { post: post! }
    }

    return postContext
}

export function usePosts(bucket: string, filter?: QueryPostsFilter): { posts: Post[] } | { isLoading: true } | { error: APIError } {
    const cms = useCMS()
    const [posts, setPosts] = useState<Post[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<APIError | null>(null)

    useEffect(() => {
        const c = new AbortController()
        cms.bucket(bucket).getPosts(filter).then(posts => {
            setPosts(posts)
            setIsLoading(false)
        }).catch(error => {
            setError(error)
            setIsLoading(false)
        })
        return () => c.abort()
    }, [cms, bucket, filter])

    if (isLoading) {
        return { isLoading }
    }
    if (error) {
        return { error }
    }
    return { posts }
}
