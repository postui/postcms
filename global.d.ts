declare interface APIError {
    status: number
    message: string
}

declare interface API {
    query(endpoint: string, params?: Record<string, any>, fc?: FetchController): Promise<any>
    mutation(endpoint: string, data?: Record<string, any>, fc?: FetchController): Promise<any>
}

declare interface CMS {
    api: API
    session: Session | null
    on(eventName: string, callback: () => void): void
    off(eventName: string, callback?: () => void): void
    verifySession(): Promise<Session | null>
    login(id: string, password: string): Promise<Session>
    logout(): Promise<void>
    getUsers(): Promise<User[]>
    createUser(data: { password: string, username?: string, email?: string, pn?: string, profile?: Record<string, any> }): Promise<User>
    updateUser(uid: string, data: { password?: string, username?: string, email?: string, pn?: string, profile?: Record<string, any> }): Promise<User>
    updateUser(data: { username?: string, email?: string, pn?: string, profile?: Record<string, any> }): Promise<User>
    updateUserPassword(oldPassword: string, newPassword: string): Promise<User>
    forgetUserPassword(data: { email?: string, pn?: string }): Promise<void>
    bucket(name: string): Bucket
    createBucket(name: string, acl: BucketACL): Promise<Bucket>
    deleteBucket(name: string): Promise<void>
    updateBucketACL(name: string, acl: BucketACL): Promise<void>
    uploadFile(file: File, path?: string, fc?: FetchController): Promise<SFSObject>
}

declare interface User {
    id: string
    username?: string
    email?: string
    pn?: string
    role: number
    crtime: number
    profile: Record<string, any>
}

declare interface Session {
    user: User
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

declare interface BucketACL {
    read: 'private' | 'public'
    write: 'private' | 'member' | 'public'
}

declare interface Bucket {
    getPosts(filter?: QueryPostsFilter, fc?: FetchController): Promise<Post[]>
    getPost(id: string, kv?: string[], fc?: FetchController): Promise<Post>
    createPost(data?: Partial<Omit<Post, 'id' | 'crtime' | 'modtime'>>): Promise<Post>
    updatePost(id: string, data: Partial<Omit<Post, 'id' | 'crtime' | 'modtime'>>): Promise<void>
    deletePost(id: string): Promise<void>
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

declare interface QueryPostsFilter {
    tags?: string[]
    kv?: string[]
    offset?: string
    limit?: number
    order?: 'ASC' | 'DESC'
}
