import { PostCMSBucket } from './PostCMSBucket'

const host = 'postcms.x-static.io'

export class PostCMS implements CMS {
    private _id: string
    private _events: Map<string, Array<() => void>>
    private _session: Session | null

    constructor(id: string) {
        this._id = id
        this._events = new Map()
        this._session = null
    }

    get session() {
        return this._session
    }

    on(eventName: string, callback: () => void) {
        if (this._events.has(eventName)) {
            this._events.set(eventName, [...this._events.get(eventName)!, callback])
        } else {
            this._events.set(eventName, [callback])
        }
    }

    off(eventName: string, callback?: () => void) {
        if (this._events.has(eventName)) {
            if (callback) {
                const a = this._events.get(eventName)!
                a.splice(a.indexOf(callback), 1)
                if (a.length === 0) {
                    this._events.delete(eventName)
                }
            } else {
                this._events.delete(eventName)
            }
        }
    }

    async query(endpoint: string, params?: Record<string, any>, fc?: FetchController) {
        let url = `https://${this._id}.${host}/${endpoint}`
        const search: string[] = []
        if (params) {
            for (const key in params) {
                const value = params[key]
                if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                    search.push(`${key}=${encodeURIComponent(value)}`)
                } else if (typeof value === 'object' && (Array.isArray(value) || value !== null)) {
                    if (Array.isArray(value)) {
                        search.push(`${key}=${encodeURIComponent(value.join(','))}`)
                    } else if (value !== null) {
                        search.push(`${key}=${encodeURIComponent(JSON.stringify(value))}`)
                    }
                }
            }
        }
        if (search.length > 0) {
            url += '?' + search.join('&')
        }
        const headers = new Headers()
        const token = localStorage.getItem('postcms/session-token')
        if (token) {
            headers.append('X-Session', token)
        }
        return await fetch(url, { method: 'GET', headers, signal: fc?.signal }).then(resp => resp.json())
    }

    async mutation(endpoint: string, data?: Record<string, any>, fc?: FetchController) {
        const url = `https://${this._id}.${host}/${endpoint}`
        const headers = new Headers()
        const token = localStorage.getItem('postcms/session-token')
        if (token) {
            headers.append('X-Session', token)
        }
        const body = new FormData()
        if (data) {
            for (const key in data) {
                const value = data[key]
                if (typeof value === 'string') {
                    body.append(key, value)
                } else if (typeof value === 'number' || typeof value === 'boolean') {
                    body.append(key, value.toString())
                } else if (value instanceof File) {
                    body.append(key, value, value.name)
                } else if (value instanceof Blob) {
                    body.append(key, value)
                } else if (typeof value === 'object' && (Array.isArray(value) || value !== null)) {
                    body.append(key, JSON.stringify(value))
                }
            }
        }
        return await fetch(url, { method: 'POST', headers, body, signal: fc?.signal }).then(resp => resp.json())
    }

    async updateSession() {
        if (localStorage.getItem('postcms/session-token')) {
            const { token, user, error } = await this.query('session')
            if (error) {
                if (error.status === 401) {
                    this._updateSession(null, null)
                } else {
                    alert(error.message)
                }
            }
            this._updateSession(token, user)
        }
    }

    private _updateSession(token: string | null, user: User | null) {
        if (token && user) {
            this._session = { user }
            localStorage.addItem('postcms/session-token', token)
        } else {
            this._session = null
            localStorage.removeItem('postcms/session-token')
        }
        if (this._events.has('updatesession')) {
            this._events.get('updatesession')!.forEach(cb => cb())
        }
    }

    async login(id: string, password: string): Promise<{ user: User }> {
        const { token, user, error } = await this.mutation('login', { id, password })
        if (error) {
            throw error
        }
        this._updateSession(token, user)
        return { user }
    }

    async logout() {
        this._updateSession(null, null)
    }

    async createUser(props: { password: string, email?: string, username?: string, pn?: string, profile?: Record<string, any> }): Promise<User> {
        const { token, user, error } = await this.mutation('create-user', props)
        if (error) {
            throw error
        }
        this._session = { user }
        localStorage.addItem('postcms/session-token', token)
        return user
    }

    bucket(name: string): Bucket {
        return new PostCMSBucket(this, name)
    }

    async createBucket(name: string, acl: BucketACL) {
        // 0 : [private read, private write]
        // 1 : [public read, private write]
        // 2 : [public read, member write]
        // 3 : [public read, public write]
        let aclN = acl.read === 'private' ? 0 : 1
        if (acl.write === 'member') {
            aclN += 1
        } else if (acl.write === 'public') {
            aclN += 2
        }
        const { bucket, error } = await this.mutation('create-bucket', { alias: name, acl: aclN })
        if (error) {
            throw error
        }
        return new PostCMSBucket(this, bucket.alias)
    }

    async deleteBucket(name: string) {
        const { error } = await this.mutation('create-bucket', { id: name })
        if (error) {
            throw error
        }
    }

    async updateBucketACL(name: string, acl: BucketACL) {
        let aclN = acl.read === 'private' ? 0 : 1
        if (acl.write === 'member') {
            aclN += 1
        } else if (acl.write === 'public') {
            aclN += 2
        }
        const { error } = await this.mutation('create-bucket', { id: name, acl: aclN })
        if (error) {
            throw error
        }
    }

    async uploadFile(file: File, path?: string, fc?: FetchController): Promise<SFSObject> {
        const { object, error } = await this.mutation('create-bucket', { file, path }, fc)
        if (error) {
            throw error
        }
        return object
    }
}
