declare interface CMS {
    session: { user: User } | null
    query(endpoint: string, params?: Record<string, any>, fc?: FetchController): Promise<any>
    mutation(endpoint: string, data?: Record<string, any>, fc?: FetchController): Promise<any>
    login(id: string, password: string): Promise<{ user: User }>
    logout(): Promise<void>
    updateSession(token: string | null, user: User | null): void
    on(eventName: string, callback: () => void): void
    off(eventName: string, callback?: () => void): void
    createUser(data: { password: string, email?: string, username?: string, pn?: string, profile?: Record<string, any> }): Promise<User>
    bucket(name: string): Bucket
    createBucket(name: string, acl: BucketACL): Promise<Bucket>
    deleteBucket(name: string): Promise<void>
    updateBucketACL(name: string, acl: BucketACL): Promise<void>
    uploadFile(file: File, path?: string, fc?: FetchController): Promise<SFSObject>
}

declare interface PostsFilter {
    tags?: string[]
    kv?: string[]
    offset?: string
    limit?: number
    order?: 'ASC' | 'DESC'
}

declare interface Bucket {
    getPosts(filter?: PostsFilter, fc?: FetchController): Promise<Post[]>
    getPost(id: string, kv?: string[], fc?: FetchController): Promise<Post>
    createPost(data?: Partial<Omit<Post, 'id' | 'crtime' | 'modtime'>>): Promise<Post>
    updatePost(id: string, data: Partial<Omit<Post, 'id' | 'crtime' | 'modtime'>>): Promise<void>
    deletePost(id: string): Promise<void>
}

declare interface BucketACL {
    read: 'private' | 'public'
    write: 'private' | 'member' | 'public'
}

declare interface Post {
    id: string
    alias: string
    owner: string
    status: number
    crtime: number
    modtime: number
    tags: string[]
    kv: Record<string, any>
}

declare interface User {
    cms: string
    id: string
    email: string
    role: number
    crtime: number
    profile: Record<string, any>
}

declare interface SFSObject {
    id: string
    hashname: string
    owner: string
    crtime: number
    meta: Record<string, any>
}

declare interface FetchController {
    signal?: AbortSignal
    onProgress?(loaded: number, total: number): void
    abort(): void
}

declare interface APIError {
    status: number
    message: string
}
